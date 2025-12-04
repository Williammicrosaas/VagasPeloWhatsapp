import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Webhook handler do Stripe
 * Processa eventos de pagamento e atualiza assinaturas no Supabase
 */
export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 400 })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    console.error("[Stripe Webhook] Stripe não configurado")
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 500 })
  }

  let event

  try {
    // Importar Stripe dinamicamente
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    })

    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const error = err instanceof Error ? err.message : "Erro desconhecido"
    console.error("[Stripe Webhook] Erro ao verificar assinatura:", error)
    return NextResponse.json({ error: `Webhook error: ${error}` }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const userId = session.metadata?.userId || session.subscription_details?.metadata?.userId
        const planId = session.metadata?.planId || session.subscription_details?.metadata?.planId

        if (!userId || !planId) {
          console.error("[Stripe Webhook] Metadata faltando:", { session })
          return NextResponse.json({ error: "Metadata faltando" }, { status: 400 })
        }

        // Buscar subscription do Stripe para obter customer_id
        const Stripe = (await import("stripe")).default
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: "2024-12-18.acacia",
        })

        const subscriptionId = session.subscription as string
        let customerId = session.customer as string
        let priceId = ""

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          customerId = subscription.customer as string
          priceId = subscription.items.data[0]?.price?.id || ""
        }

        // Criar ou atualizar assinatura no Supabase
        const { data: subscription, error: subError } = await supabase
          .from("user_subscriptions")
          .upsert(
            {
              user_id: userId,
              plan_id: planId,
              status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              started_at: new Date().toISOString(),
              expires_at: subscriptionId
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .select()
          .single()

        if (subError) {
          console.error("[Stripe Webhook] Erro ao criar assinatura:", subError)
          throw subError
        }

        // Criar transação de pagamento
        await supabase.from("payment_transactions").insert({
          user_id: userId,
          subscription_id: subscription.id,
          amount: (session.amount_total || 0) / 100, // Converter de centavos
          currency: session.currency || "brl",
          status: "completed",
          payment_method: "credit_card",
          external_id: session.id,
        })

        console.log("[Stripe Webhook] Assinatura criada/atualizada:", { userId, planId, subscriptionId })
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.warn("[Stripe Webhook] userId não encontrado no metadata")
          break
        }

        const status = subscription.status === "active" ? "active" : subscription.status === "canceled" ? "cancelled" : "expired"

        await supabase
          .from("user_subscriptions")
          .update({
            status,
            stripe_price_id: subscription.items?.data[0]?.price?.id || null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        console.log("[Stripe Webhook] Assinatura atualizada:", { userId, status })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.userId

        if (!userId) break

        await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)

        console.log("[Stripe Webhook] Assinatura cancelada:", { userId })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        // Buscar assinatura no Supabase pelo stripe_subscription_id
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle()

        if (subscription) {
          // Atualizar data de expiração
          await supabase
            .from("user_subscriptions")
            .update({
              expires_at: invoice.period_end
                ? new Date(invoice.period_end * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("id", subscription.id)

          // Criar transação de pagamento recorrente
          await supabase.from("payment_transactions").insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            amount: (invoice.amount_paid || 0) / 100,
            currency: invoice.currency || "brl",
            status: "completed",
            payment_method: "credit_card",
            external_id: invoice.id,
          })

          console.log("[Stripe Webhook] Pagamento recorrente processado:", { subscriptionId })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const { data: subscription } = await supabase
            .from("user_subscriptions")
            .select("id, user_id")
            .eq("stripe_subscription_id", subscriptionId)
            .maybeSingle()

          if (subscription) {
            // Criar transação de pagamento falhado
            await supabase.from("payment_transactions").insert({
              user_id: subscription.user_id,
              subscription_id: subscription.id,
              amount: (invoice.amount_due || 0) / 100,
              currency: invoice.currency || "brl",
              status: "failed",
              payment_method: "credit_card",
              external_id: invoice.id,
            })

            console.log("[Stripe Webhook] Pagamento falhou:", { subscriptionId })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Stripe Webhook] Erro ao processar evento:", error)
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 })
  }
}
