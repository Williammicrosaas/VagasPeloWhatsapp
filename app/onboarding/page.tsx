import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding-wizard"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar se já completou o onboarding
  const { data: progress } = await supabase
    .from("onboarding_progress")
    .select("completed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  if (progress?.completed_at) {
    redirect("/dashboard")
  }

  return <OnboardingWizard />
}

