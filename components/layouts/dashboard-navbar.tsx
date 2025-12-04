"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Search, Bell, Settings, LogOut, Menu, X } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { VisionButton } from "@/components/ui/vision-button"

interface UserProfile {
  email: string
  full_name: string
  avatar_url: string | null
}

export function DashboardNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

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
      console.error("[Navbar] Erro:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: sentJobs } = await supabase
        .from("sent_jobs")
        .select("id, sent_at, jobs(title, company_name)")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(5)

      const allNotifications = (sentJobs || []).map((item: any) => ({
        id: item.id,
        title: "Nova vaga recebida",
        message: `${item.jobs?.title} - ${item.jobs?.company_name}`,
        time: item.sent_at,
        read: false,
      }))

      setNotifications(allNotifications)
    } catch (error) {
      console.error("[Navbar] Erro ao buscar notificações:", error)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Get page title from pathname
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/jobs": "Vagas",
      "/dashboard/profile": "Perfil",
      "/dashboard/settings": "Configurações",
      "/dashboard/billing": "Billing",
      "/pricing": "Planos",
    }
    return titles[pathname] || "Dashboard"
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0B1437]/95 backdrop-blur-md border-b border-white/10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-[#A0AEC0] text-sm">Pages /</span>
            <span className="text-white font-medium">{getPageTitle()}</span>
          </div>

          {/* Right: Search, Notifications, Settings, Profile */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-[#A0AEC0]" />
              <input
                type="text"
                placeholder="Type here..."
                className="bg-[#111C44] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder:text-[#A0AEC0] focus:outline-none focus:ring-2 focus:ring-[#0BBEDB] focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Bell className="w-5 h-5 text-[#A0AEC0] hover:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#0BBEDB] rounded-full shadow-[0_0_5px_rgba(11,190,219,0.6)]"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#111C44]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_20px_rgba(11,190,219,0.3)] overflow-hidden">
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-white font-semibold text-sm">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5"
                          onClick={() => {
                            router.push("/dashboard/jobs")
                            setNotificationsOpen(false)
                          }}
                        >
                          <p className="text-white text-sm font-medium">{notification.title}</p>
                          <p className="text-[#A0AEC0] text-xs mt-1">{notification.message}</p>
                          <p className="text-[#A0AEC0] text-xs mt-1 opacity-70">
                            {new Date(notification.time).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[#A0AEC0] text-sm">Nenhuma notificação</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Settings className="w-5 h-5 text-[#A0AEC0] hover:text-white" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0BBEDB] to-[#7F5CFF] flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-[0_0_10px_rgba(11,190,219,0.4)]">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile?.full_name?.charAt(0) || profile?.email.charAt(0) || "U"
                  )}
                </div>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#111C44]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_20px_rgba(11,190,219,0.3)] overflow-hidden">
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white text-sm font-medium">{profile?.full_name || "Usuário"}</p>
                    <p className="text-[#A0AEC0] text-xs">{profile?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => {
                        router.push("/dashboard/profile")
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#A0AEC0] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Meu Perfil
                    </button>
                    <button
                      onClick={() => {
                        router.push("/dashboard/settings")
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#A0AEC0] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Configurações
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

