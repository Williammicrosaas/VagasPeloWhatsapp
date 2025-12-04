"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader, Upload, Bell, Lock, LogOut, CheckCircle2, AlertTriangle } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  notifications_enabled: boolean
  last_active_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [warningMessage, setWarningMessage] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [notificationsToggle, setNotificationsToggle] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          router.push("/auth/login")
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (userError) throw userError

        if (userData) {
          setProfile(userData)
          setNotificationsToggle(userData.notifications_enabled)
          setPreviewUrl(userData.avatar_url || "")
        }

        setLoading(false)
      } catch (err) {
        console.error("[v0] Erro ao buscar perfil:", err)
        setErrorMessage("Erro ao carregar perfil")
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setWarningMessage("Arquivo muito grande. Máximo 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAvatar = async () => {
    if (!profile || !previewUrl) return

    setSaving(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const supabase = createClient()

      const { error } = await supabase.from("users").update({ avatar_url: previewUrl }).eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, avatar_url: previewUrl })
      setSuccessMessage("Avatar atualizado com sucesso!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error("[v0] Erro ao salvar avatar:", err)
      setErrorMessage("Erro ao salvar avatar")
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationsToggle = async () => {
    if (!profile) return

    setSaving(true)
    setErrorMessage("")

    try {
      const supabase = createClient()
      const newValue = !notificationsToggle

      const { error } = await supabase.from("users").update({ notifications_enabled: newValue }).eq("id", profile.id)

      if (error) throw error

      setNotificationsToggle(newValue)
      setProfile({ ...profile, notifications_enabled: newValue })
      setSuccessMessage(newValue ? "Notificações ativadas" : "Notificações desativadas")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      console.error("[v0] Erro ao atualizar notificações:", err)
      setErrorMessage("Erro ao atualizar preferências")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-white">Erro ao carregar perfil</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {successMessage && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300 text-sm">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300 text-sm">{errorMessage}</p>
        </div>
      )}

      {warningMessage && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <p className="text-yellow-300 text-sm">{warningMessage}</p>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Configurações</h1>
            <p className="text-slate-400 mt-2">Gerencie seu perfil e preferências</p>
          </div>

          {/* Avatar Card */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Foto de Perfil
              </CardTitle>
              <CardDescription className="text-slate-400">
                Escolha uma imagem para seu avatar (máximo 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar Preview */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden border-2 border-slate-700">
                      {previewUrl ? (
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile.full_name?.charAt(0) || profile.email.charAt(0)
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                  </div>
                  <p className="text-slate-400 text-sm mt-2">Online</p>
                </div>

                {/* Upload Section */}
                <div className="flex-1 space-y-4">
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-input"
                    />
                    <label htmlFor="avatar-input" className="cursor-pointer">
                      <div className="text-slate-400 space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-blue-400" />
                        <p className="text-sm">Clique para selecionar uma imagem</p>
                        <p className="text-xs text-slate-500">PNG, JPG até 5MB</p>
                      </div>
                    </label>
                  </div>
                  {previewUrl && (
                    <Button
                      onClick={handleSaveAvatar}
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                    >
                      {saving ? "Salvando..." : "Salvar Avatar"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
              <CardDescription className="text-slate-400">Controle as notificações que você recebe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Receber notificações de vagas</p>
                  <p className="text-slate-400 text-sm">Ative para receber alertas de novas oportunidades</p>
                </div>
                <button
                  onClick={handleNotificationsToggle}
                  disabled={saving}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    notificationsToggle ? "bg-emerald-500/20" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      notificationsToggle ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-slate-400 text-sm">Email</Label>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Nome</Label>
                  <p className="text-white font-medium">{profile.full_name || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Membro desde</Label>
                  <p className="text-white font-medium">
                    {new Date(profile.last_active_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/20 bg-red-500/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Zona de Perigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <LogOut className="w-4 h-4" />
                {saving ? "Saindo..." : "Sair da Conta"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
