"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  Briefcase,
  Eye,
  Heart,
  CheckCircle,
  AlertTriangle,
  Search,
  User,
  Clock,
  Settings,
  CreditCard,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { GlassCard } from "@/components/ui/glass-card"
import { VisionButton } from "@/components/ui/vision-button"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface UserProfile {
  id: string
  email: string
  full_name: string
  city: string | null
  whatsapp_number: string | null
}

interface DashboardStats {
  activeJobs: number
  receivedJobs: number
  viewedJobs: number
  favoritedJobs: number
  profileCompletion: number
}

export function ClientDashboardVision() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    receivedJobs: 0,
    viewedJobs: 0,
    favoritedJobs: 0,
    profileCompletion: 0,
  })
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      // Buscar perfil
      const { data: profileData } = await supabase
        .from("users")
        .select("id, email, full_name, city, whatsapp_number")
        .eq("id", user.id)
        .maybeSingle()

      if (profileData) {
        setProfile(profileData)
      }

      // Buscar estatísticas
      const [sentJobsResult, favoriteJobsResult, viewedJobsResult] = await Promise.all([
        supabase
          .from("sent_jobs")
          .select("id, sent_at")
          .eq("user_id", user.id)
          .gte("sent_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("favorite_jobs").select("id").eq("user_id", user.id),
        supabase
          .from("sent_jobs")
          .select("id")
          .eq("user_id", user.id)
          .eq("view_status", "viewed"),
      ])

      const activeJobs = sentJobsResult.data?.length || 0
      const receivedJobs = sentJobsResult.data?.length || 0
      const viewedJobs = viewedJobsResult.data?.length || 0
      const favoritedJobs = favoriteJobsResult.data?.length || 0

      // Calcular completude
      let completion = 0
      if (profileData?.full_name) completion += 25
      if (profileData?.city) completion += 25
      if (profileData?.whatsapp_number) completion += 25
      completion += 25 // Assumindo que tem preferências

      setStats({
        activeJobs,
        receivedJobs,
        viewedJobs,
        favoritedJobs,
        profileCompletion: completion,
      })

      // Dados semanais
      const weekly = []
      for (let i = 3; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i * 7)
        weekly.push({
          name: date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
          value: Math.floor(Math.random() * 20) + 5,
        })
      }
      setWeeklyData(weekly)
    } catch (error) {
      console.error("[Dashboard] Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1437] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0BBEDB]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#0BBEDB] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#A0AEC0]">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1437]">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Money"
          value={`R$ ${(stats.receivedJobs * 1000).toLocaleString()}`}
          change={55}
          icon={<TrendingUp className="w-5 h-5 text-[#0BBEDB]" />}
        />
        <StatCard
          title="Today's Users"
          value={stats.activeJobs.toLocaleString()}
          change={5}
          icon={<Briefcase className="w-5 h-5 text-[#0BBEDB]" />}
        />
        <StatCard
          title="New Clients"
          value={`+${stats.viewedJobs}`}
          change={-14}
          icon={<Eye className="w-5 h-5 text-[#0BBEDB]" />}
        />
        <StatCard
          title="Total Sales"
          value={`R$ ${(stats.favoritedJobs * 500).toLocaleString()}`}
          change={8}
          icon={<Heart className="w-5 h-5 text-[#0BBEDB]" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Overview */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white text-lg font-semibold">Sales Overview</h3>
              <p className="text-[#A0AEC0] text-sm">(+5%) more in 2021</p>
            </div>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111C44",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0BBEDB"
                  strokeWidth={2}
                  dot={{ fill: "#0BBEDB", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Active Users */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white text-lg font-semibold">Active Users</h3>
              <p className="text-[#A0AEC0] text-sm">(+23%) than last week</p>
            </div>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111C44",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                  }}
                />
                <Bar dataKey="value" fill="#0BBEDB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="w-10 h-10 bg-[#0BBEDB]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <User className="w-5 h-5 text-[#0BBEDB]" />
              </div>
              <p className="text-white text-sm font-medium">32,984</p>
              <p className="text-[#A0AEC0] text-xs">Users</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-[#0BBEDB]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-[#0BBEDB]" />
              </div>
              <p className="text-white text-sm font-medium">2.42m</p>
              <p className="text-[#A0AEC0] text-xs">Clicks</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-[#0BBEDB]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-5 h-5 text-[#0BBEDB]" />
              </div>
              <p className="text-white text-sm font-medium">2,400$</p>
              <p className="text-[#A0AEC0] text-xs">Sales</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-[#0BBEDB]/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Briefcase className="w-5 h-5 text-[#0BBEDB]" />
              </div>
              <p className="text-white text-sm font-medium">320</p>
              <p className="text-[#A0AEC0] text-xs">Items</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Profile Completion & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Completude do Perfil</h3>
            {stats.profileCompletion === 100 ? (
              <CheckCircle className="w-5 h-5 text-[#0BBEDB]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <div className="space-y-4">
            <div>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${profile?.full_name ? "bg-[#0BBEDB]/10" : "bg-[#0B1437]"}`}>
                <p className="text-[#A0AEC0] text-xs mb-1">Nome</p>
                {profile?.full_name ? (
                  <CheckCircle className="w-4 h-4 text-[#0BBEDB]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${profile?.whatsapp_number ? "bg-[#0BBEDB]/10" : "bg-[#0B1437]"}`}>
                <p className="text-[#A0AEC0] text-xs mb-1">WhatsApp</p>
                {profile?.whatsapp_number ? (
                  <CheckCircle className="w-4 h-4 text-[#0BBEDB]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard>
          <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <VisionButton
              variant="secondary"
              onClick={() => router.push("/dashboard/jobs")}
              className="flex flex-col items-center gap-2 py-4"
            >
              <Briefcase className="w-5 h-5" />
              <span>Vagas</span>
            </VisionButton>
            <VisionButton
              variant="secondary"
              onClick={() => router.push("/dashboard/profile")}
              className="flex flex-col items-center gap-2 py-4"
            >
              <User className="w-5 h-5" />
              <span>Perfil</span>
            </VisionButton>
            <VisionButton
              variant="secondary"
              onClick={() => router.push("/pricing")}
              className="flex flex-col items-center gap-2 py-4"
            >
              <CreditCard className="w-5 h-5" />
              <span>Planos</span>
            </VisionButton>
            <VisionButton
              variant="secondary"
              onClick={() => router.push("/dashboard/settings")}
              className="flex flex-col items-center gap-2 py-4"
            >
              <Settings className="w-5 h-5" />
              <span>Config</span>
            </VisionButton>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

