import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * API Route para enviar email de boas-vindas
 * Pode ser integrado com Resend, SendGrid ou outro serviço de email
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Buscar dados do usuário
    const { data: profile } = await supabase.from("users").select("full_name, email").eq("id", user.id).maybeSingle()

    const userName = profile?.full_name || "usuário"
    const userEmail = user.email || ""

    // TODO: Integrar com serviço de email (Resend, SendGrid, etc)
    // Por enquanto, apenas logamos
    console.log(`[Welcome Email] Enviando para ${userEmail}`)
    console.log(`[Welcome Email] Conteúdo: Olá ${userName}, bem-vindo ao BuscaVagasWhats!`)

    // Exemplo de integração com Resend (descomente quando configurar):
    /*
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'onboarding@buscavagaswhats.com',
      to: userEmail,
      subject: 'Bem-vindo ao BuscaVagasWhats! 🎉',
      html: `
        <h1>Olá ${userName}!</h1>
        <p>Bem-vindo ao BuscaVagasWhats. Você está pronto para receber as melhores oportunidades de emprego diretamente no seu WhatsApp.</p>
        <p>Configure suas preferências no dashboard para começar a receber vagas personalizadas.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Acessar Dashboard</a>
      `
    })
    */

    return NextResponse.json({ success: true, message: "Email de boas-vindas enviado" })
  } catch (error) {
    console.error("[Welcome Email] Erro:", error)
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 })
  }
}

