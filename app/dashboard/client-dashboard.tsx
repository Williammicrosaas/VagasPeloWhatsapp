"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Home,
  Briefcase,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Search,
  TrendingUp,
  Heart,
  Eye,
  Settings,
  User,
  Clock,
  BarChart3,
  CreditCard,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { GlassCard } from "@/components/ui/glass-card"
import JobSearchModal from "@/components/job-search-modal"
import SuccessMessage from "@/components/success-message"
// Card components removed - using GlassCard instead
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface UserProfile {
  id: string
  email: string
  full_name: string
  city: string | null
  whatsapp_number: string | null
}

interface JobPreferences {
  id: string
  job_area: string | null
  country: string | null
}

interface DashboardStats {
  activeJobs: number
  receivedJobs: number
  viewedJobs: number
  favoritedJobs: number
  profileCompletion: number
}

interface ChartData {
  name: string
  value: number
}

export function ClientDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<JobPreferences[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    receivedJobs: 0,
    viewedJobs: 0,
    favoritedJobs: 0,
    profileCompletion: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showJobSearch, setShowJobSearch] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [alerts, setAlerts] = useState<{ type: "success" | "warning" | "error"; message: string }[]>([])
  const [weeklyData, setWeeklyData] = useState<ChartData[]>([])
  const [areaData, setAreaData] = useState<ChartData[]>([])

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("[Dashboard] Erro ao obter usuário:", authError)
        return
      }

      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("id, email, full_name, city, whatsapp_number")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("[Dashboard] Erro ao buscar perfil:", profileError)
        addAlert("error", "Erro ao carregar perfil")
      } else if (profileData) {
        setProfile(profileData)
      }

      // Buscar preferências (usuário pode ter múltiplas preferências)
      const { data: preferencesData, error: preferencesError } = await supabase
        .from("job_preferences")
        .select("id, job_area, country")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (preferencesError) {
        // Log detalhado do erro
        const errorDetails = {
          message: preferencesError.message || "Erro desconhecido",
          details: preferencesError.details || null,
          hint: preferencesError.hint || null,
          code: preferencesError.code || null,
        }
        console.error("[Dashboard] Erro ao buscar preferências:", JSON.stringify(errorDetails, null, 2))
        addAlert("error", "Erro ao carregar preferências")
      } else if (preferencesData) {
        setPreferences(preferencesData)
      }

      // Calcular completude do perfil
      let completion = 0
      if (profileData?.full_name) completion += 25
      if (profileData?.city) completion += 25
      if (profileData?.whatsapp_number) completion += 25
      if (preferencesData && preferencesData.length > 0) completion += 25

      // Buscar estatísticas de vagas
      const [sentJobsResult, favoriteJobsResult, viewedJobsResult] = await Promise.all([
        supabase
          .from("sent_jobs")
          .select("id, view_status, sent_at", { count: "exact" })
          .eq("user_id", user.id),
        supabase.from("favorite_jobs").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("sent_jobs").select("id").eq("user_id", user.id).eq("view_status", "viewed"),
      ])

      const receivedJobs = sentJobsResult.count || 0
      const favoritedJobs = favoriteJobsResult.count || 0
      const viewedJobs = viewedJobsResult.data?.length || 0

      // Buscar vagas ativas (últimas 30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: activeJobsData } = await supabase
        .from("sent_jobs")
        .select("sent_at")
        .eq("user_id", user.id)
        .gte("sent_at", thirtyDaysAgo.toISOString())

      const activeJobs = activeJobsData?.length || 0

      setStats({
        activeJobs,
        receivedJobs,
        viewedJobs,
        favoritedJobs,
        profileCompletion: completion,
      })

      // Preparar dados para gráficos
      prepareChartData(sentJobsResult.data || [])

      // Alertas de completude
      if (!profileData?.full_name) {
        addAlert("warning", "Complete seu perfil com seu nome")
      }
      if (!profileData?.whatsapp_number) {
        addAlert("warning", "Adicione seu WhatsApp para receber vagas")
      }
    } catch (error) {
      console.error("[Dashboard] Erro geral:", error)
      addAlert("error", "Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = (sentJobs: any[]) => {
    // Dados semanais (últimas 4 semanas)
    const weeklyCounts: Record<string, number> = {}
    const now = new Date()

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - i * 7)
      const weekKey = `Sem ${i + 1}`
      weeklyCounts[weekKey] = 0
    }

    sentJobs.forEach((job) => {
      const sentDate = new Date(job.sent_at)
      const weeksAgo = Math.floor((now.getTime() - sentDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (weeksAgo >= 0 && weeksAgo < 4) {
        const weekKey = `Sem ${4 - weeksAgo}`
        weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1
      }
    })

    setWeeklyData(
      Object.entries(weeklyCounts).map(([name, value]) => ({
        name,
        value,
      })),
    )

    // Dados por área (se houver preferências)
    if (preferences && preferences.length > 0) {
      const areas = preferences.map((p) => p.job_area).filter(Boolean) as string[]
      if (areas.length > 0) {
        setAreaData([
          { name: areas[0], value: stats.receivedJobs },
          { name: "Outras", value: Math.max(0, stats.receivedJobs - 10) },
        ])
      }
    }
  }

  const addAlert = (type: "success" | "warning" | "error", message: string) => {
    const newAlert = { type, message }
    setAlerts((prev) => [...prev, newAlert])
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a !== newAlert))
    }, 5000)
  }

  const handleJobSearchComplete = () => {
    setShowJobSearch(false)
    setSuccessMessage("Sua busca foi registrada! Você receberá vagas no WhatsApp.")
    setShowSuccess(true)
    addAlert("success", "Busca de vagas enviada com sucesso!")
    fetchUserData() // Recarregar dados

    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1437] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0BBEDB]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#0BBEDB] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#A0AEC0]">Carregando seu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1437]">
      {/* Announcement Bar */}
      {alerts.length > 0 && (
        <div className="sticky top-16 z-40 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  alert.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-200"
                    : alert.type === "warning"
                      ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-200"
                      : "bg-red-500/10 border border-red-500/30 text-red-200"
                }`}
              >
                {alert.type === "success" && <CheckCircle className="w-5 h-5" />}
                {alert.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                {alert.type === "error" && <AlertCircle className="w-5 h-5" />}
                <span className="text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Bem-vindo, {profile?.full_name || "usuário"}!
          </h1>
          <p className="text-[#A0AEC0]">Encontre as melhores oportunidades de emprego adaptadas ao seu perfil</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Button
            onClick={() => setShowJobSearch(true)}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            Procurar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/profile")}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <User className="w-4 h-4 mr-2" />
            Perfil
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/jobs")}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <Clock className="w-4 h-4 mr-2" />
            Histórico
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/settings")}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Config
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/pricing")}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Planos
          </Button>
        </div>

        {/* Stats Cards - Vision UI Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Vagas Ativas"
            value={stats.activeJobs}
            icon={<TrendingUp className="w-5 h-5 text-[#0BBEDB]" />}
            changeLabel="Últimos 30 dias"
          />
          <StatCard
            title="Vagas Recebidas"
            value={stats.receivedJobs}
            icon={<Briefcase className="w-5 h-5 text-[#0BBEDB]" />}
            changeLabel="Total recebidas"
          />
          <StatCard
            title="Visualizações"
            value={stats.viewedJobs}
            icon={<Eye className="w-5 h-5 text-[#0BBEDB]" />}
            changeLabel="Vagas visualizadas"
          />
          <StatCard
            title="Favoritos"
            value={stats.favoritedJobs}
            icon={<Heart className="w-5 h-5 text-[#0BBEDB]" />}
            changeLabel="Vagas favoritadas"
          />
        </div>

        {/* Profile Completion Card - Vision UI Style */}
        <GlassCard className="mb-8">
          <div>
            <h3 className="text-white text-lg font-semibold flex items-center gap-2 mb-2">
              Completude do Perfil
              {stats.profileCompletion === 100 ? (
                <CheckCircle className="w-5 h-5 text-[#0BBEDB]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </h3>
            <p className="text-[#A0AEC0] text-sm mb-4">
              Complete seu perfil para receber vagas mais relevantes
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#A0AEC0]">Progresso</span>
                <span className="text-white font-medium">{stats.profileCompletion}%</span>
              </div>
              <div className="w-full bg-[#0B1437] rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0BBEDB] to-[#7F5CFF] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(11,190,219,0.5)]"
                  style={{ width: `${stats.profileCompletion}%` }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className={`text-center p-2 rounded ${profile?.full_name ? "bg-emerald-500/10" : "bg-slate-700/50"}`}>
                  <p className="text-xs text-slate-400">Nome</p>
                  {profile?.full_name ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 mx-auto mt-1" />
                  )}
                </div>
                <div className={`text-center p-2 rounded ${profile?.city ? "bg-emerald-500/10" : "bg-slate-700/50"}`}>
                  <p className="text-xs text-slate-400">Cidade</p>
                  {profile?.city ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 mx-auto mt-1" />
                  )}
                </div>
                <div className={`text-center p-2 rounded ${profile?.whatsapp_number ? "bg-emerald-500/10" : "bg-slate-700/50"}`}>
                  <p className="text-xs text-slate-400">WhatsApp</p>
                  {profile?.whatsapp_number ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 mx-auto mt-1" />
                  )}
                </div>
                <div className={`text-center p-2 rounded ${preferences && preferences.length > 0 ? "bg-emerald-500/10" : "bg-slate-700/50"}`}>
                  <p className="text-xs text-slate-400">Área</p>
                  {preferences && preferences.length > 0 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-slate-500 mx-auto mt-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart - Vagas por Semana */}
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold">Vagas Recebidas (Últimas 4 Semanas)</h3>
              <p className="text-[#A0AEC0] text-sm">Evolução semanal de vagas enviadas</p>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111C44",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#0BBEDB" strokeWidth={2} dot={{ fill: "#0BBEDB" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Bar Chart - Vagas por Status */}
          <GlassCard>
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold">Status das Vagas</h3>
              <p className="text-[#A0AEC0] text-sm">Distribuição por status</p>
            </div>
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{ name: "Recebidas", value: stats.receivedJobs }, { name: "Visualizadas", value: stats.viewedJobs }, { name: "Favoritadas", value: stats.favoritedJobs }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Next Steps */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold">Próximos Passos</h3>
            <p className="text-[#A0AEC0] text-sm">Ações recomendadas para melhorar sua experiência</p>
          </div>
          <div>
            <div className="space-y-3">
              {!profile?.full_name && (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Complete seu perfil</p>
                    <p className="text-slate-400 text-sm">Adicione seu nome completo para melhorar o matching</p>
                  </div>
                </div>
              )}
              {!profile?.whatsapp_number && (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Configure seu WhatsApp</p>
                    <p className="text-slate-400 text-sm">Receba vagas diretamente no seu WhatsApp</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Procure vagas agora</p>
                  <p className="text-slate-400 text-sm">Clique no botão acima para encontrar sua próxima oportunidade</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Job Search Modal */}
      {showJobSearch && <JobSearchModal onClose={() => setShowJobSearch(false)} onSuccess={handleJobSearchComplete} />}

      {/* Success Message */}
      {showSuccess && <SuccessMessage message={successMessage} />}
    </div>
  )
}
