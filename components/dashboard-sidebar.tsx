"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Home,
  Briefcase,
  User,
  Settings,
  Bell,
  LogOut,
  CreditCard,
  Menu,
  X,
  Clock,
  TrendingUp,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  email: string
  full_name: string
  avatar_url: string | null
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchNotifications()
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("email, full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle()

        if (userData) {
          setProfile(userData)
        }
      }
    } catch (error) {
      console.error("[Sidebar] Erro ao buscar perfil:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Buscar notificações (vagas recentes, alertas, etc)
      const { data: sentJobs } = await supabase
        .from("sent_jobs")
        .select("id, sent_at, jobs(title, company_name)")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(5)

      // Buscar alertas prioritários (se a tabela existir)
      let priorityAlerts: any[] = []
      try {
        const { data } = await supabase
          .from("priority_job_alerts")
          .select("id, sent_at, jobs(title, company_name)")
          .eq("user_id", user.id)
          .order("sent_at", { ascending: false })
          .limit(5)
        priorityAlerts = data || []
      } catch (error) {
        // Tabela pode não existir ainda, usar sent_jobs com priority
        const { data } = await supabase
          .from("sent_jobs")
          .select("id, sent_at, jobs(title, company_name)")
          .eq("user_id", user.id)
          .not("priority", "is", null)
          .order("sent_at", { ascending: false })
          .limit(5)
        priorityAlerts = data || []
      }

      const allNotifications = [
        ...(sentJobs || []).map((item: any) => ({
          id: item.id,
          type: "job",
          title: "Nova vaga recebida",
          message: `${item.jobs?.title} - ${item.jobs?.company_name}`,
          time: item.sent_at,
          read: false,
        })),
        ...(priorityAlerts || []).map((item: any) => ({
          id: item.id,
          type: "priority",
          title: "⭐ Vaga Recomendada",
          message: `${item.jobs?.title} - ${item.jobs?.company_name}`,
          time: item.sent_at,
          read: false,
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      setNotifications(allNotifications.slice(0, 10))
    } catch (error) {
      console.error("[Sidebar] Erro ao buscar notificações:", error)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/jobs", icon: Briefcase, label: "Vagas" },
    { href: "/dashboard/profile", icon: User, label: "Perfil" },
    { href: "/pricing", icon: CreditCard, label: "Planos" },
    { href: "/dashboard/settings", icon: Settings, label: "Configurações" },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-700 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-700">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                V
              </div>
              <span className="text-white font-bold text-lg">Vagas</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Notifications */}
          <div className="border-t border-slate-700 p-4">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="flex-1 text-left">Notificações</span>
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-slate-700">
                    <h3 className="text-white font-semibold text-sm">Notificações</h3>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-slate-700/50 cursor-pointer"
                          onClick={() => {
                            if (notification.type === "job" || notification.type === "priority") {
                              router.push("/dashboard/jobs")
                              setNotificationsOpen(false)
                            }
                          }}
                        >
                          <p className="text-white text-sm font-medium">{notification.title}</p>
                          <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
                          <p className="text-slate-500 text-xs mt-1">
                            {new Date(notification.time).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm">Nenhuma notificação</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t border-slate-700 p-4">
            {profile && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile.full_name?.charAt(0) || profile.email.charAt(0)
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{profile.full_name || "Usuário"}</p>
                  <p className="text-slate-400 text-xs truncate">{profile.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay para mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  )
}

