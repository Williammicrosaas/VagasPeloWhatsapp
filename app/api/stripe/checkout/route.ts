import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * API Route para criar sessão de checkout do Stripe
 * Integração completa com Stripe SDK
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { planId, billingPeriod = "monthly" } = body

    if (!planId) {
      return NextResponse.json({ error: "Plan ID é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Buscar plano no banco
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle()

    if (planError || !plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    // Verificar se Stripe está configurado
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error: "Stripe não configurado",
          message: "Configure STRIPE_SECRET_KEY no .env",
          planId: plan.id,
          planName: plan.name,
        },
        { status: 500 },
      )
    }

    // Importar Stripe dinamicamente
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    })

    // Determinar price_id baseado no período
    const stripePriceId =
      billingPeriod === "yearly" ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly

    // Se não tiver price_id configurado, criar dinamicamente
    if (!stripePriceId) {
      // Calcular preço (anual tem 15% desconto)
      let price = Number(plan.price)
      if (billingPeriod === "yearly" && price > 0) {
        price = price * 12 * 0.85 // 15% desconto
      }

      // Criar produto no Stripe se não existir
      let productId = plan.stripe_product_id
      if (!productId) {
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description || "",
        })
        productId = product.id

        // Atualizar plano no banco com product_id
        await supabase
          .from("subscription_plans")
          .update({ stripe_product_id: productId })
          .eq("id", plan.id)
      }

      // Criar price no Stripe
      const priceObj = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(price * 100), // Stripe usa centavos
        currency: "brl",
        recurring: {
          interval: billingPeriod === "yearly" ? "year" : "month",
        },
      })

      // Atualizar plano no banco com price_id
      const updateField =
        billingPeriod === "yearly" ? "stripe_price_id_yearly" : "stripe_price_id_monthly"
      await supabase.from("subscription_plans").update({ [updateField]: priceObj.id }).eq("id", plan.id)

      // Usar o price_id criado
      const finalPriceId = priceObj.id

      // Criar sessão de checkout
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email || undefined,
        payment_method_types: ["card"],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
        metadata: {
          userId: user.id,
          planId: plan.id,
          billingPeriod,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            planId: plan.id,
          },
        },
      })

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      })
    } else {
      // Usar price_id existente
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email || undefined,
        payment_method_types: ["card"],
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
        metadata: {
          userId: user.id,
          planId: plan.id,
          billingPeriod,
        },
        subscription_data: {
          metadata: {
            userId: user.id,
            planId: plan.id,
          },
        },
      })

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      })
    }
  } catch (error) {
    console.error("[Stripe Checkout] Erro:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.json({ error: "Erro ao criar checkout", details: errorMessage }, { status: 500 })
  }
}
