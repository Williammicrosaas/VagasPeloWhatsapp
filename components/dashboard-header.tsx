"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Home, Briefcase, User, Settings, Bell, LogOut, ChevronDown, CreditCard } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface UserProfile {
  email: string
  full_name: string
  avatar_url: string | null
  notifications_enabled: boolean
}

export default function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (!authError && user) {
          const { data: userData } = await supabase
            .from("users")
            .select("email, full_name, avatar_url, notifications_enabled")
            .eq("id", user.id)
            .maybeSingle()

          if (userData) {
            setProfile(userData)
          }
        }
      } catch (err) {
        console.error("[v0] Erro ao buscar perfil:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-700/50 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">Vagas</span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive("/dashboard")
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/jobs"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive("/dashboard/jobs")
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Vagas
            </Link>

            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive("/dashboard/profile")
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              Perfil
            </Link>

            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive("/dashboard/settings")
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>

            <Link
              href="/pricing"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive("/pricing")
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Planos
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            {profile && !loading && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url || "/placeholder.svg"}
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile.full_name?.charAt(0) || profile.email.charAt(0)
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-white text-sm font-medium">{profile.full_name || "Usuário"}</p>
                      <p className="text-slate-400 text-xs">{profile.email}</p>
                    </div>

                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Meu Perfil
                    </Link>

                    <Link
                      href="/pricing"
                      className="block px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Planos e Preços
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2 border-t border-slate-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
