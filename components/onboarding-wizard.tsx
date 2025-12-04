"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, CheckCircle, ArrowRight, ArrowLeft, User, Briefcase, MapPin, MessageSquare, Search, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface OnboardingData {
  step1: {
    full_name: string
    profession: string
    city: string
  }
  step2: {
    job_area: string
    level: string
    employment_type: string
    remote: boolean
  }
  step3: {
    whatsapp_number: string
    country_code: string
  }
  step4: {
    job_area: string
    country: string
  }
}

interface OnboardingProgress {
  current_step: number
  completed_steps: number[]
}

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [formData, setFormData] = useState<OnboardingData>({
    step1: { full_name: "", profession: "", city: "" },
    step2: { job_area: "", level: "", employment_type: "", remote: false },
    step3: { whatsapp_number: "", country_code: "+55" },
    step4: { job_area: "", country: "" },
  })

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Buscar progresso existente
      const { data: progressData } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (progressData) {
        setCurrentStep(progressData.current_step)
        setProgress({
          current_step: progressData.current_step,
          completed_steps: progressData.completed_steps || [],
        })
      }

      // Carregar dados do perfil existente
      const { data: profile } = await supabase
        .from("users")
        .select("full_name, city, whatsapp_number, country_code")
        .eq("id", user.id)
        .maybeSingle()

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          step1: {
            full_name: profile.full_name || "",
            profession: "",
            city: profile.city || "",
          },
          step3: {
            whatsapp_number: profile.whatsapp_number || "",
            country_code: profile.country_code || "+55",
          },
        }))
      }

      // Carregar preferências existentes
      const { data: preferences } = await supabase
        .from("job_preferences")
        .select("job_area, country")
        .eq("user_id", user.id)
        .maybeSingle()

      if (preferences) {
        setFormData((prev) => ({
          ...prev,
          step2: {
            ...prev.step2,
            job_area: preferences.job_area || "",
          },
          step4: {
            job_area: preferences.job_area || "",
            country: preferences.country || "",
          },
        }))
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (step: number, markCompleted = false) => {
    try {
      setSaving(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const completedSteps = markCompleted
        ? [...(progress?.completed_steps || []), step].filter((s, i, arr) => arr.indexOf(s) === i)
        : progress?.completed_steps || []

      const { error } = await supabase.from("onboarding_progress").upsert(
        {
          user_id: user.id,
          current_step: step,
          completed_steps: completedSteps,
          completed_at: markCompleted && step === 5 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (error) throw error

      setProgress({
        current_step: step,
        completed_steps: completedSteps,
      })
    } catch (error) {
      console.error("Erro ao salvar progresso:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    if (currentStep < 5) {
      await saveProgress(currentStep, true)
      setCurrentStep(currentStep + 1)
      await saveProgress(currentStep + 1, false)
    } else {
      await handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      saveProgress(currentStep - 1, false)
    }
  }

  const handleStep1Save = async () => {
    try {
      setSaving(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Sessão expirada. Por favor, faça login novamente.")
        return
      }

      if (!user.email) {
        alert("Email não encontrado. Por favor, faça login novamente.")
        return
      }

      // Validar dados antes de enviar
      if (!formData.step1.full_name || formData.step1.full_name.trim() === "") {
        alert("Por favor, preencha seu nome completo")
        return
      }

      const { error, data } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: formData.step1.full_name.trim(),
          city: formData.step1.city?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (error) {
        console.error("Erro ao salvar perfil:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(error.message || "Erro ao salvar perfil")
      }

      await handleNext()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar perfil"
      console.error("Erro ao salvar perfil:", {
        error,
        message: errorMessage,
        formData: formData.step1,
      })
      alert(`Erro ao salvar dados: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleStep2Save = async () => {
    // Preferências serão salvas no step 4
    await handleNext()
  }

  const handleStep3Save = async () => {
    try {
      setSaving(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Sessão expirada. Por favor, faça login novamente.")
        return
      }

      // Validar dados antes de enviar
      if (!formData.step3.whatsapp_number || formData.step3.whatsapp_number.trim() === "") {
        alert("Por favor, preencha o número do WhatsApp")
        return
      }

      // Usar UPDATE ao invés de UPSERT, pois o registro já deve existir do step 1
      const { error, data } = await supabase
        .from("users")
        .update({
          whatsapp_number: formData.step3.whatsapp_number.trim(),
          country_code: formData.step3.country_code || "+55",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()

      if (error) {
        console.error("Erro ao salvar WhatsApp:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(error.message || "Erro ao salvar WhatsApp")
      }

      await handleNext()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar WhatsApp"
      console.error("Erro ao salvar WhatsApp:", {
        error,
        message: errorMessage,
        formData: formData.step3,
      })
      alert(`Erro ao salvar WhatsApp: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleStep4Save = async () => {
    try {
      setSaving(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Sessão expirada. Por favor, faça login novamente.")
        return
      }

      // Validar dados antes de enviar
      if (!formData.step4.job_area || formData.step4.job_area.trim() === "") {
        alert("Por favor, selecione uma área de trabalho")
        return
      }

      if (!formData.step4.country || formData.step4.country.trim() === "") {
        alert("Por favor, selecione um país")
        return
      }

      const { error, data } = await supabase.from("job_preferences").upsert(
        {
          user_id: user.id,
          job_area: formData.step4.job_area.trim(),
          country: formData.step4.country.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,job_area,country" },
      )

      if (error) {
        console.error("Erro ao salvar preferências:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error(error.message || "Erro ao salvar preferências")
      }

      await handleNext()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao salvar preferências"
      console.error("Erro ao salvar preferências:", {
        error,
        message: errorMessage,
        formData: formData.step4,
      })
      alert(`Erro ao salvar preferências: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    try {
      setSaving(true)
      await saveProgress(5, true)

      // Enviar email de boas-vindas via API
      const response = await fetch("/api/send-welcome-email", {
        method: "POST",
      })

      if (!response.ok) {
        console.error("Erro ao enviar email de boas-vindas")
      }

      // Redirecionar para dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Erro ao completar onboarding:", error)
    } finally {
      setSaving(false)
    }
  }

  const progressPercentage = (currentStep / 5) * 100
  const steps = [
    { number: 1, title: "Perfil Básico", icon: User },
    { number: 2, title: "Preferências", icon: Briefcase },
    { number: 3, title: "WhatsApp", icon: MessageSquare },
    { number: 4, title: "Primeira Busca", icon: Search },
    { number: 5, title: "Concluído", icon: Sparkles },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400">Carregando onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Configuração Inicial</h2>
            <span className="text-slate-400 text-sm">
              Passo {currentStep} de {steps.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-4">
            {steps.map((step) => {
              const Icon = step.icon
              const isCompleted = progress?.completed_steps.includes(step.number) || false
              const isCurrent = currentStep === step.number

              return (
                <div key={step.number} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isCurrent
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs ${isCurrent ? "text-white font-medium" : "text-slate-400"}`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {steps[currentStep - 1].title}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {currentStep === 1 &&
                        "Preencha suas informações básicas para personalizar sua experiência"}
                      {currentStep === 2 &&
                        "Configure suas preferências de trabalho para receber vagas mais relevantes"}
                      {currentStep === 3 &&
                        "Adicione seu WhatsApp para receber vagas diretamente no seu celular"}
                      {currentStep === 4 && "Configure sua primeira busca de vagas"}
                      {currentStep === 5 && "Parabéns! Você completou o onboarding"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription className="text-slate-400">
              {currentStep === 1 && "Conte-nos um pouco sobre você"}
              {currentStep === 2 && "Defina suas preferências de trabalho"}
              {currentStep === 3 && "Configure seu WhatsApp para receber vagas"}
              {currentStep === 4 && "Configure sua primeira busca de vagas"}
              {currentStep === 5 && "Tudo pronto! Você está configurado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Perfil Básico */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name" className="text-white flex items-center gap-2">
                    Nome Completo
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Seu nome completo será usado para personalizar as mensagens</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.step1.full_name}
                    onChange={(e) => setFormData({ ...formData, step1: { ...formData.step1, full_name: e.target.value } })}
                    placeholder="Ex: João Silva"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="profession" className="text-white">Profissão/Área</Label>
                  <Input
                    id="profession"
                    value={formData.step1.profession}
                    onChange={(e) => setFormData({ ...formData, step1: { ...formData.step1, profession: e.target.value } })}
                    placeholder="Ex: Desenvolvedor Full Stack"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-white flex items-center gap-2">
                    Cidade
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Usaremos sua cidade para encontrar vagas próximas a você</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="city"
                    value={formData.step1.city}
                    onChange={(e) => setFormData({ ...formData, step1: { ...formData.step1, city: e.target.value } })}
                    placeholder="Ex: São Paulo"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preferências */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job_area" className="text-white">Área de Trabalho</Label>
                  <Select
                    value={formData.step2.job_area}
                    onValueChange={(value) => setFormData({ ...formData, step2: { ...formData.step2, job_area: value } })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="RH">Recursos Humanos</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Operações">Operações</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level" className="text-white">Nível</Label>
                  <Select
                    value={formData.step2.level}
                    onValueChange={(value) => setFormData({ ...formData, step2: { ...formData.step2, level: value } })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione seu nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Júnior">Júnior</SelectItem>
                      <SelectItem value="Pleno">Pleno</SelectItem>
                      <SelectItem value="Sênior">Sênior</SelectItem>
                      <SelectItem value="Especialista">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employment_type" className="text-white">Tipo de Contrato</Label>
                  <Select
                    value={formData.step2.employment_type}
                    onValueChange={(value) => setFormData({ ...formData, step2: { ...formData.step2, employment_type: value } })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Estágio">Estágio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: WhatsApp */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="country_code" className="text-white">Código do País</Label>
                  <Select
                    value={formData.step3.country_code}
                    onValueChange={(value) => setFormData({ ...formData, step3: { ...formData.step3, country_code: value } })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+55">+55 (Brasil)</SelectItem>
                      <SelectItem value="+1">+1 (EUA/Canadá)</SelectItem>
                      <SelectItem value="+44">+44 (Reino Unido)</SelectItem>
                      <SelectItem value="+34">+34 (Espanha)</SelectItem>
                      <SelectItem value="+33">+33 (França)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="whatsapp_number" className="text-white flex items-center gap-2">
                    Número do WhatsApp
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Você receberá vagas diretamente neste número via WhatsApp</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="whatsapp_number"
                    value={formData.step3.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, step3: { ...formData.step3, whatsapp_number: e.target.value } })}
                    placeholder="11987654321"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Primeira Busca */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search_job_area" className="text-white">Área de Busca</Label>
                  <Select
                    value={formData.step4.job_area}
                    onValueChange={(value) => setFormData({ ...formData, step4: { ...formData.step4, job_area: value } })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione uma área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="RH">Recursos Humanos</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Operações">Operações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="country" className="text-white">País</Label>
                  <Select
                    value={formData.step4.country}
                    onValueChange={(value) => setFormData({ ...formData, step4: { ...formData.step4, country: value } })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Selecione um país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brasil">Brasil</SelectItem>
                      <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                      <SelectItem value="Reino Unido">Reino Unido</SelectItem>
                      <SelectItem value="Espanha">Espanha</SelectItem>
                      <SelectItem value="França">França</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 5: Concluído */}
            {currentStep === 5 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Parabéns! 🎉</h3>
                <p className="text-slate-400 mb-6">
                  Você completou a configuração inicial. Agora você receberá vagas personalizadas no seu WhatsApp!
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || saving}
                className="border-slate-700 text-slate-300 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={() => {
                  if (currentStep === 1) handleStep1Save()
                  else if (currentStep === 2) handleStep2Save()
                  else if (currentStep === 3) handleStep3Save()
                  else if (currentStep === 4) handleStep4Save()
                  else if (currentStep === 5) handleComplete()
                }}
                disabled={saving}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
              >
                {saving ? (
                  "Salvando..."
                ) : currentStep === 5 ? (
                  "Ir para Dashboard"
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

