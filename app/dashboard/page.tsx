import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ClientDashboardVision } from "./client-dashboard-vision"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar se completou o onboarding
  const { data: onboardingProgress } = await supabase
    .from("onboarding_progress")
    .select("completed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!onboardingProgress?.completed_at) {
    redirect("/onboarding")
  }

  return <ClientDashboardVision />
}
