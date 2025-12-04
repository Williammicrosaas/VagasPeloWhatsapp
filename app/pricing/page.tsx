"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Check, X, Zap, Loader2, ArrowLeft, LogIn } from "lucide-react"
import { toast } from "sonner"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  max_daily_jobs: number
  priority: boolean
  analytics: boolean
}

export default function PricingPage() {
  const router = useRouter()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [userSubscription, setUserSubscription] = useState<any>(null)

  useEffect(() => {
    fetchPlans()
    checkUserSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price", { ascending: true })

      if (error) throw error

      // Converter features de JSONB para array
      const plansWithFeatures = (data || []).map((plan) => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features : [],
      }))

      setPlans(plansWithFeatures)
    } catch (error) {
      console.error("[Pricing] Erro ao buscar planos:", error)
      toast.error("Erro ao carregar planos")
    } finally {
      setLoading(false)
    }
  }

  const checkUserSubscription = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select(
          `
          *,
          subscription_plans (
            id,
            name,
            price
          )
        `,
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      if (subscription) {
        setUserSubscription(subscription)
      }
    } catch (error) {
      console.error("[Pricing] Erro ao verificar assinatura:", error)
    }
  }

  const getPrice = (basePrice: number) => {
    if (billingPeriod === "yearly" && basePrice > 0) {
      return (basePrice * 12 * 0.85).toFixed(2) // 15% desconto
    }
    return basePrice.toFixed(2)
  }

  const handleCheckout = async (planId: string) => {
    try {
      setCheckoutLoading(planId)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Faça login para continuar")
        router.push("/auth/signin")
        return
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar checkout")
      }

      if (data.url) {
        // Redirecionar para checkout do Stripe
        window.location.href = data.url
      } else {
        toast.error("URL de checkout não disponível")
      }
    } catch (error) {
      console.error("[Pricing] Erro no checkout:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar checkout"
      toast.error(errorMessage)
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Login Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Link href="/auth/signin">
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-white">
              Planos e
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Preços
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Escolha o plano perfeito para suas necessidades. Sempre com a melhor relação custo-benefício.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  billingPeriod === "monthly"
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative ${
                  billingPeriod === "yearly"
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Anual
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -15%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Subscription Info */}
      {userSubscription && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="pt-6">
              <p className="text-emerald-200 text-center">
                Você está no plano <strong>{userSubscription.subscription_plans?.name}</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrentPlan = userSubscription?.plan_id === plan.id
              const isFree = plan.price === 0

              return (
                <Card
                  key={plan.id}
                  className={`border-slate-700 bg-slate-900 transition-all duration-300 flex flex-col ${
                    plan.priority ? "ring-2 ring-emerald-500 scale-105 md:scale-110" : ""
                  } ${isCurrentPlan ? "ring-2 ring-blue-500" : ""}`}
                >
                  {plan.priority && (
                    <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-center py-2 text-sm font-bold">
                      MAIS POPULAR
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-bold">
                      SEU PLANO ATUAL
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Price */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">R$ {getPrice(plan.price)}</span>
                        {plan.price > 0 && (
                          <span className="text-slate-400">/ {billingPeriod === "monthly" ? "mês" : "ano"}</span>
                        )}
                      </div>
                      {plan.price === 0 && <p className="text-slate-400 text-sm mt-2">Sempre grátis</p>}
                      {billingPeriod === "yearly" && plan.price > 0 && (
                        <p className="text-emerald-400 text-sm mt-1">
                          Economize {((plan.price * 12 - Number(getPrice(plan.price))) / (plan.price * 12) * 100).toFixed(0)}% com plano anual
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    {isCurrentPlan ? (
                      <Button
                        disabled
                        className="w-full mb-8 bg-slate-700 text-slate-300 cursor-not-allowed"
                      >
                        Plano Atual
                      </Button>
                    ) : isFree ? (
                      <Link href="/auth/sign-up" className="mb-8 w-full">
                        <Button className="w-full bg-slate-700 text-white hover:bg-slate-600">
                          Começar Grátis
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleCheckout(plan.id)}
                        disabled={checkoutLoading === plan.id}
                        className="w-full mb-8 bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600"
                      >
                        {checkoutLoading === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          "Assinar Agora"
                        )}
                      </Button>
                    )}

                    {/* Features */}
                    <div className="space-y-3 flex-1">
                      <p className="text-sm font-semibold text-slate-300 uppercase">Incluso:</p>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </div>
                      ))}
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">
                          {plan.max_daily_jobs === 999 || plan.max_daily_jobs === 9999
                            ? "Vagas ilimitadas"
                            : `${plan.max_daily_jobs} vagas por dia`}
                        </span>
                      </div>
                      {plan.analytics && (
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">Analytics avançada</span>
                        </div>
                      )}
                      {plan.priority && (
                        <div className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">Recomendações prioritárias</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Comparação Completa</h2>

          <Card className="border-slate-700 bg-slate-900 overflow-x-auto">
            <CardContent className="pt-6 pb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Recurso</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="text-center py-3 px-4 text-slate-300 font-semibold">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-slate-300">Vagas por dia</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-3 px-4 text-slate-300">
                        {plan.max_daily_jobs === 999 || plan.max_daily_jobs === 9999 ? "Ilimitado" : plan.max_daily_jobs}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-slate-300">Recomendações prioritárias</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.priority ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-4 text-slate-300">Analytics</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-3 px-4">
                        {plan.analytics ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-red-400 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Dúvidas sobre os Planos?</h2>

          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-900">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-semibold text-white mb-2">Posso mudar de plano a qualquer momento?</h3>
                <p className="text-slate-400">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas
                  no próximo ciclo de faturamento.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-semibold text-white mb-2">Qual é a política de cancelamento?</h3>
                <p className="text-slate-400">
                  Você pode cancelar sua assinatura a qualquer momento. Não há cobranças adicionais ou penalidades. O
                  acesso continua até o fim do período de faturamento.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardContent className="pt-6 pb-6">
                <h3 className="font-semibold text-white mb-2">Vocês oferecem desconto para pagamento anual?</h3>
                <p className="text-slate-400">
                  Sim! O plano anual oferece 15% de desconto em relação ao preço mensal. É uma ótima forma de economizar
                  se você planeja usar nosso serviço por um longo período.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Comece Agora!</h2>
            <p className="text-slate-300 mb-8">
              Junte-se a milhares de profissionais que já estão encontrando as melhores oportunidades
            </p>
            <Link href="/auth/sign-up">
              <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600 gap-2 px-8 py-4">
                <Zap className="w-5 h-5" />
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
