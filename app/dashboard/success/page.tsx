"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (sessionId) {
      verifyPayment(sessionId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Verificar se assinatura foi criada
      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      if (subscription) {
        setVerified(true)
      }
    } catch (error) {
      console.error("[Success Page] Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verificando pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <Card className="bg-slate-800/50 border-slate-700/50 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl text-white">Pagamento Confirmado! 🎉</CardTitle>
          <CardDescription className="text-slate-400">
            {verified
              ? "Sua assinatura foi ativada com sucesso. Aproveite todos os benefícios do seu plano!"
              : "Obrigado pelo seu pagamento. Estamos processando sua assinatura."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm text-center">
              Você receberá um email de confirmação em breve com os detalhes da sua assinatura.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              Ir para Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/settings")}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Ver Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

