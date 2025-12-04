import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { checkHighMatchJob, recordPriorityAlert } from "@/lib/matching-engine-v2"

/**
 * API Route para integração com N8N
 * Envia alertas prioritários para vagas com match alto (≥80%)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, jobId, sentJobId, matchScore } = body

    if (!userId || !jobId || !sentJobId || !matchScore) {
      return NextResponse.json({ error: "Parâmetros obrigatórios faltando" }, { status: 400 })
    }

    // Verificar se é match alto
    if (matchScore < 80) {
      return NextResponse.json({ error: "Match score abaixo do threshold" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar dados do usuário e da vaga
    const [userResult, jobResult] = await Promise.all([
      supabase.from("users").select("full_name, whatsapp_number, email").eq("id", userId).maybeSingle(),
      supabase.from("jobs").select("*").eq("id", jobId).maybeSingle(),
    ])

    if (!userResult.data || !jobResult.data) {
      return NextResponse.json({ error: "Usuário ou vaga não encontrados" }, { status: 404 })
    }

    const user = userResult.data
    const job = jobResult.data

    // Preparar payload para N8N
    const n8nPayload = {
      userId,
      userName: user.full_name || "Usuário",
      userWhatsApp: user.whatsapp_number,
      userEmail: user.email,
      jobId,
      jobTitle: job.title,
      companyName: job.company_name,
      jobArea: job.job_area,
      matchScore,
      sentJobId,
      priority: true,
      badge: "⭐ VAGA RECOMENDADA",
      message: `⭐ *VAGA RECOMENDADA* ⭐\n\n🎯 Match: ${matchScore}%\n\n${job.title}\n${job.company_name}\n\nEsta vaga tem alta compatibilidade com seu perfil!`,
    }

    // Enviar para N8N webhook (configurar URL no .env)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (n8nWebhookUrl) {
      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(n8nPayload),
        })

        if (!n8nResponse.ok) {
          console.error("[N8N] Erro ao enviar para webhook:", await n8nResponse.text())
        }
      } catch (error) {
        console.error("[N8N] Erro na requisição:", error)
        // Não falhar a requisição se N8N estiver offline
      }
    }

    // Registrar alerta prioritário no banco
    await recordPriorityAlert(userId, jobId, sentJobId, matchScore, "whatsapp")

    return NextResponse.json({
      success: true,
      message: "Alerta prioritário enviado",
      data: n8nPayload,
    })
  } catch (error) {
    console.error("[N8N Priority Alert] Erro:", error)
    return NextResponse.json({ error: "Erro ao processar alerta prioritário" }, { status: 500 })
  }
}

