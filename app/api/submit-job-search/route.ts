export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Dados recebidos:", body)

    // URL de produção não tem limite de uma chamada única
    const webhookUrl = "https://marcucci-n8n.uom7qi.easypanel.host/webhook/vagadeemprego"
    console.log("[v0] URL do webhook:", webhookUrl)

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] Status da resposta:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Erro do webhook:", errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro ao processar webhook:", error)
    return Response.json({ error: "Erro ao processar requisição" }, { status: 500 })
  }
}
