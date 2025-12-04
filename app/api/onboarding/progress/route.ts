import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * API Route para buscar e atualizar progresso do onboarding
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("onboarding_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ data: data || null })
  } catch (error) {
    console.error("[Onboarding Progress] Erro:", error)
    return NextResponse.json({ error: "Erro ao buscar progresso" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { current_step, completed_steps } = body

    const { data, error } = await supabase
      .from("onboarding_progress")
      .upsert(
        {
          user_id: user.id,
          current_step,
          completed_steps: completed_steps || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[Onboarding Progress] Erro:", error)
    return NextResponse.json({ error: "Erro ao salvar progresso" }, { status: 500 })
  }
}

