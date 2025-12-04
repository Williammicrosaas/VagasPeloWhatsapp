"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { VisionInput } from "@/components/ui/vision-input"
import { VisionButton } from "@/components/ui/vision-button"
import { User, Mail, Phone, MapPin, Briefcase, Globe, Save, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const COUNTRIES = [
  "Brasil",
  "Portugal",
  "EUA",
  "Canadá",
  "Argentina",
  "Chile",
  "Colômbia",
  "México",
  "Espanha",
  "Reino Unido",
  "Alemanha",
  "França",
  "Outros",
]

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    whatsapp_number: "",
    country_code: "+55",
    city: "",
  })

  const [preferences, setPreferences] = useState({
    job_area: "",
    country: "",
  })

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

      // Buscar dados do usuário
      const { data: userData } = await supabase
        .from("users")
        .select("full_name, email, whatsapp_number, country_code, city")
        .eq("id", user.id)
        .maybeSingle()

      if (userData) {
        setFormData({
          full_name: userData.full_name || "",
          email: userData.email || user.email || "",
          whatsapp_number: userData.whatsapp_number || "",
          country_code: userData.country_code || "+55",
          city: userData.city || "",
        })
      }

      // Buscar preferências
      const { data: prefData } = await supabase
        .from("job_preferences")
        .select("job_area, country")
        .eq("user_id", user.id)
        .maybeSingle()

      if (prefData) {
        setPreferences({
          job_area: prefData.job_area || "",
          country: prefData.country || "",
        })
      }
    } catch (error) {
      console.error("[Profile] Erro:", error)
      toast.error("Erro ao carregar dados do perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Atualizar usuário
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          whatsapp_number: formData.whatsapp_number,
          country_code: formData.country_code,
          city: formData.city,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (userError) throw userError

      // Salvar/atualizar preferências
      if (preferences.job_area && preferences.country) {
        await supabase
          .from("job_preferences")
          .upsert(
            {
              user_id: user.id,
              job_area: preferences.job_area,
              country: preferences.country,
            },
            { onConflict: "user_id, job_area, country" }
          )
      }

      toast.success("Perfil atualizado com sucesso!")
    } catch (error: any) {
      console.error("[Profile] Erro:", error)
      toast.error(error.message || "Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1437] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0BBEDB]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#0BBEDB] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#A0AEC0]">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1437]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-[#A0AEC0]">Gerencie suas informações pessoais e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                    <VisionInput
                      type="text"
                      placeholder="Your full name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                    <VisionInput
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-[#0B1437]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">WhatsApp Number</label>
                  <div className="flex gap-2">
                    <div className="relative w-24">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                      <VisionInput
                        type="text"
                        value={formData.country_code}
                        onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                      <VisionInput
                        type="tel"
                        placeholder="Your WhatsApp number"
                        value={formData.whatsapp_number}
                        onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                    <VisionInput
                      type="text"
                      placeholder="Your city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Job Preferences */}
            <GlassCard>
              <h2 className="text-xl font-semibold text-white mb-6">Job Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Job Area</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                    <VisionInput
                      type="text"
                      placeholder="e.g., Desenvolvimento, Design, Marketing"
                      value={preferences.job_area}
                      onChange={(e) => setPreferences({ ...preferences, job_area: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Country</label>
                  <select
                    value={preferences.country}
                    onChange={(e) => setPreferences({ ...preferences, country: e.target.value })}
                    className="w-full bg-[#0B1437] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#0BBEDB] focus:border-transparent"
                  >
                    <option value="">Select a country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </GlassCard>

            {/* Save Button */}
            <div className="flex justify-end">
              <VisionButton onClick={handleSave} disabled={saving} className="min-w-[120px]">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </VisionButton>
            </div>
          </div>

          {/* Right Column - Profile Summary */}
          <div className="space-y-6">
            {/* Profile Card */}
            <GlassCard>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0BBEDB] to-[#7F5CFF] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-[0_0_20px_rgba(11,190,219,0.4)]">
                  {formData.full_name?.charAt(0) || formData.email.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-white text-xl font-semibold mb-1">{formData.full_name || "Usuário"}</h3>
                <p className="text-[#A0AEC0] text-sm mb-4">{formData.email}</p>
                <div className="space-y-2">
                  {formData.city && (
                    <div className="flex items-center justify-center gap-2 text-[#A0AEC0] text-sm">
                      <MapPin className="w-4 h-4" />
                      {formData.city}
                    </div>
                  )}
                  {formData.whatsapp_number && (
                    <div className="flex items-center justify-center gap-2 text-[#A0AEC0] text-sm">
                      <Phone className="w-4 h-4" />
                      {formData.country_code} {formData.whatsapp_number}
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Status Card */}
            <GlassCard>
              <h3 className="text-white font-semibold mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0B1437] rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0BBEDB]" />
                    <span className="text-white text-sm">Email Verified</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0B1437] rounded-lg">
                  <div className="flex items-center gap-2">
                    {formData.whatsapp_number ? (
                      <CheckCircle className="w-4 h-4 text-[#0BBEDB]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-white text-sm">WhatsApp</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0B1437] rounded-lg">
                  <div className="flex items-center gap-2">
                    {preferences.job_area ? (
                      <CheckCircle className="w-4 h-4 text-[#0BBEDB]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className="text-white text-sm">Preferences</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
