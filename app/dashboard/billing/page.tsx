"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { StatCard } from "@/components/ui/stat-card"
import { VisionButton } from "@/components/ui/vision-button"
import { CreditCard, Calendar, Download, Check, X, AlertCircle, ArrowRight, Edit, Trash2, Plus, TrendingUp, TrendingDown } from "lucide-react"
import { toast } from "sonner"

interface Subscription {
  id: string
  status: string
  started_at: string
  expires_at: string
  subscription_plans: {
    name: string
    price: number
  }
}

interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
  payment_method: string
}

export default function BillingPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      // Buscar assinatura
      const { data: subData } = await supabase
        .from("user_subscriptions")
        .select(
          `
          *,
          subscription_plans (
            name,
            price
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .maybeSingle()

      if (subData) {
        setSubscription(subData as any)
      }

      // Buscar transações
      const { data: transData } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (transData) {
        setTransactions(transData as any)
        // Criar invoices a partir de transações
        const invoiceList = transData.map((t: any) => ({
          date: new Date(t.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          id: `#MS-${t.id.slice(0, 6).toUpperCase()}`,
          amount: t.amount,
          status: t.status,
        }))
        setInvoices(invoiceList)
      }
    } catch (error) {
      console.error("[Billing] Erro:", error)
      toast.error("Erro ao carregar dados de faturamento")
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      active: {
        label: "Active",
        className: "bg-[#0BBEDB]/20 text-[#0BBEDB] border border-[#0BBEDB]/30",
        icon: Check,
      },
      cancelled: {
        label: "Cancelled",
        className: "bg-red-500/20 text-red-400 border border-red-500/30",
        icon: X,
      },
      expired: {
        label: "Expired",
        className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        icon: AlertCircle,
      },
    }

    const statusInfo = statusMap[status] || statusMap.active
    const Icon = statusInfo.icon

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${statusInfo.className}`}
      >
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </span>
    )
  }

  const getTransactionIcon = (status: string) => {
    if (status === "completed") {
      return <TrendingUp className="w-4 h-4 text-[#0BBEDB]" />
    }
    if (status === "failed") {
      return <TrendingDown className="w-4 h-4 text-red-400" />
    }
    return <AlertCircle className="w-4 h-4 text-yellow-400" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1437] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0BBEDB]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#0BBEDB] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#A0AEC0]">Carregando...</p>
        </div>
      </div>
    )
  }

  const totalPaid = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const recentTransaction = transactions[0]

  return (
    <div className="min-h-screen bg-[#0B1437]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credit Card Display */}
            <GlassCard>
              <div className="relative bg-gradient-to-br from-[#0BBEDB] to-[#7F5CFF] rounded-xl p-6 min-h-[200px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-2">VISION UI</p>
                    <p className="text-white text-2xl font-mono tracking-wider">7812 2139 0823 XXXX</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <div>
                    <p className="text-white/60 text-xs mb-1">VALID THRU</p>
                    <p className="text-white font-medium">05/24</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">CVV</p>
                    <p className="text-white font-medium">09X</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Payment Method */}
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Payment Method</h2>
                <VisionButton size="sm" variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  ADD A NEW CARD
                </VisionButton>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#0B1437] rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">MC</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">7812 2139 0823 XXXX</p>
                      <p className="text-[#A0AEC0] text-xs">Mastercard</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-[#A0AEC0]" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-[#A0AEC0]" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#0B1437] rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">V</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">7812 2139 0823 XXXX</p>
                      <p className="text-[#A0AEC0] text-xs">Visa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-[#A0AEC0]" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <X className="w-4 h-4 text-[#A0AEC0]" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Billing Information */}
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Billing Information</h2>
              <div className="space-y-4">
                {subscription ? (
                  <div className="p-4 bg-[#0B1437] rounded-lg border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">
                          {subscription.subscription_plans?.name || "Plano Ativo"}
                        </p>
                        <p className="text-[#A0AEC0] text-sm mb-1">
                          R$ {subscription.subscription_plans?.price?.toFixed(2) || "0.00"} / mês
                        </p>
                        <p className="text-[#A0AEC0] text-xs">
                          Iniciado em {new Date(subscription.started_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subscription.status)}
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-[#A0AEC0]" />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#A0AEC0] mb-4">Nenhuma informação de faturamento</p>
                    <VisionButton onClick={handleUpgrade}>
                      Adicionar Plano
                    </VisionButton>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Credit Balance */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Credit Balance</h3>
                <TrendingUp className="w-5 h-5 text-[#0BBEDB]" />
              </div>
              <p className="text-3xl font-bold text-white mb-6">R$ {totalPaid.toFixed(2)}</p>
              {recentTransaction && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-[#A0AEC0] mb-2">NEWEST</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0BBEDB]/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#0BBEDB]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Assinatura</p>
                      <p className="text-[#A0AEC0] text-xs">
                        {new Date(recentTransaction.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <p className="text-[#0BBEDB] font-medium">
                      -R$ {Number(recentTransaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Invoices */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Invoices</h3>
                <button className="text-[#0BBEDB] text-sm hover:text-[#0BBEDB]/80 transition-colors">
                  VIEW ALL
                </button>
              </div>
              <div className="space-y-3">
                {invoices.length > 0 ? (
                  invoices.slice(0, 5).map((invoice, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0B1437] rounded-lg hover:bg-white/5 transition-colors">
                      <div>
                        <p className="text-white text-sm font-medium">{invoice.date}</p>
                        <p className="text-[#A0AEC0] text-xs">{invoice.id}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-white font-medium">R$ {Number(invoice.amount).toFixed(2)}</p>
                        <button className="text-[#0BBEDB] hover:text-[#0BBEDB]/80">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#A0AEC0] text-sm text-center py-4">Nenhuma invoice</p>
                )}
              </div>
            </GlassCard>

            {/* Your Transactions */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Transactions</h3>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 text-[#A0AEC0]" />
                </button>
              </div>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  <>
                    <div>
                      <p className="text-xs text-[#A0AEC0] mb-3 uppercase">Newest</p>
                      <div className="space-y-3">
                        {transactions.slice(0, 2).map((transaction) => (
                          <div key={transaction.id} className="flex items-center gap-3">
                            {getTransactionIcon(transaction.status)}
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">Assinatura</p>
                              <p className="text-[#A0AEC0] text-xs">
                                {new Date(transaction.created_at).toLocaleDateString("pt-BR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <p
                              className={`font-medium ${
                                transaction.status === "completed"
                                  ? "text-[#0BBEDB]"
                                  : transaction.status === "failed"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                              }`}
                            >
                              {transaction.status === "completed" ? "-" : transaction.status === "failed" ? "-" : ""}
                              R$ {Number(transaction.amount).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {transactions.length > 2 && (
                      <div>
                        <p className="text-xs text-[#A0AEC0] mb-3 uppercase">Older</p>
                        <div className="space-y-3">
                          {transactions.slice(2, 5).map((transaction) => (
                            <div key={transaction.id} className="flex items-center gap-3">
                              {getTransactionIcon(transaction.status)}
                              <div className="flex-1">
                                <p className="text-white text-sm font-medium">Assinatura</p>
                                <p className="text-[#A0AEC0] text-xs">
                                  {new Date(transaction.created_at).toLocaleDateString("pt-BR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <p
                                className={`font-medium ${
                                  transaction.status === "completed"
                                    ? "text-[#0BBEDB]"
                                    : transaction.status === "failed"
                                      ? "text-red-400"
                                      : "text-yellow-400"
                                }`}
                              >
                                {transaction.status === "completed" ? "-" : transaction.status === "failed" ? "-" : ""}
                                R$ {Number(transaction.amount).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[#A0AEC0] text-sm text-center py-4">Nenhuma transação</p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
