import { createClient } from "@/lib/supabase/server"

/**
 * Verifica se usuário tem limite de vagas disponível
 */
export async function checkJobLimit(userId: string): Promise<{ allowed: boolean; limit: number; used: number }> {
  const supabase = await createClient()

  // Buscar assinatura do usuário
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("plan_id, status, subscription_plans(max_daily_jobs)")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  // Se não tem assinatura ativa, usar plano gratuito
  const limit = subscription?.subscription_plans?.max_daily_jobs || 5

  // Contar vagas enviadas hoje
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from("sent_jobs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("sent_at", today.toISOString())

  const used = count || 0
  const allowed = used < limit

  return { allowed, limit, used }
}

/**
 * Verifica se usuário tem acesso a feature premium
 */
export async function hasFeatureAccess(userId: string, feature: "priority" | "analytics" | "api"): Promise<boolean> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("subscription_plans(priority, analytics)")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  if (!subscription) return false

  const plan = subscription.subscription_plans as any

  switch (feature) {
    case "priority":
      return plan?.priority || false
    case "analytics":
      return plan?.analytics || false
    case "api":
      // API só no Enterprise
      return false // TODO: adicionar campo api_access no plano
    default:
      return false
  }
}

/**
 * Obtém informações da assinatura do usuário
 */
export async function getUserSubscription(userId: string) {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select(
      `
      *,
      subscription_plans (
        id,
        name,
        description,
        price,
        features,
        max_daily_jobs,
        priority,
        analytics
      )
    `,
    )
    .eq("user_id", userId)
    .maybeSingle()

  return subscription
}

