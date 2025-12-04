"use client"

import type React from "react"
import { LoadingPopup } from "./loading-popup"
import { useState, useRef, useEffect } from "react"
import { X, MapPin, Briefcase, Globe, User, MessageCircle, Check, ChevronDown } from "lucide-react"

interface JobSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const POPULAR_CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Salvador",
  "Fortaleza",
  "Curitiba",
  "Recife",
  "Manaus",
  "Belém",
  "New York",
  "Los Angeles",
  "Chicago",
  "Toronto",
  "Vancouver",
  "London",
  "Berlin",
  "Madrid",
  "Paris",
  "Amsterdam",
]

const ISO_COUNTRIES = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "CA", name: "Canadá" },
  { code: "UK", name: "Reino Unido" },
  { code: "DE", name: "Alemanha" },
  { code: "FR", name: "França" },
  { code: "ES", name: "Espanha" },
  { code: "IT", name: "Itália" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Holanda" },
  { code: "AU", name: "Austrália" },
  { code: "NZ", name: "Nova Zelândia" },
  { code: "JP", name: "Japão" },
  { code: "IN", name: "Índia" },
  { code: "SG", name: "Singapura" },
  { code: "MX", name: "México" },
  { code: "AR", name: "Argentina" },
]

function JobSearchModal({ isOpen, onClose, onSuccess }: JobSearchModalProps) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [step, setStep] = useState(1)
  const cityInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    cidade_ou_pais: "",
    area_ou_cargo: "",
    pais_codigo: "",
    nome_completo: "",
    whatsapp: "",
  })

  useEffect(() => {
    if (!isOpen) {
      setErrors({})
      setStep(1)
      setFormData({
        cidade_ou_pais: "",
        area_ou_cargo: "",
        pais_codigo: "",
        nome_completo: "",
        whatsapp: "",
      })
    }
  }, [isOpen])

  const handleCityChange = (value: string) => {
    setFormData({ ...formData, cidade_ou_pais: value })
    setErrors({ ...errors, cidade_ou_pais: "" })

    if (value.length > 0) {
      const filtered = POPULAR_CITIES.filter((city) => city.toLowerCase().includes(value.toLowerCase()))
      setCitySuggestions(filtered)
      setShowCitySuggestions(true)
    } else {
      setCitySuggestions([])
      setShowCitySuggestions(false)
    }
  }

  const handleCitySuggestionClick = (city: string) => {
    setFormData({ ...formData, cidade_ou_pais: city })
    setShowCitySuggestions(false)
    setCitySuggestions([])
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.cidade_ou_pais.trim()) {
      newErrors.cidade_ou_pais = "Cidade ou país é obrigatório"
    }
    if (!formData.area_ou_cargo.trim()) {
      newErrors.area_ou_cargo = "Área de trabalho é obrigatória"
    }
    if (!formData.pais_codigo.trim()) {
      newErrors.pais_codigo = "Código do país é obrigatório"
    }
    if (!formData.nome_completo.trim()) {
      newErrors.nome_completo = "Nome completo é obrigatório"
    }
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "Número de WhatsApp é obrigatório"
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Formato de telefone inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/submit-job-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      onSuccess()
      window.location.href = "/auth/sign-up"
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      setErrors({
        submit: "Erro ao enviar formulário. Por favor, tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  if (!isOpen) return null

  return (
    <>
      {loading && <LoadingPopup />}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-blue-600/10 to-emerald-600/10 border-b border-slate-700/50 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-emerald-500/5 opacity-50"></div>
            <div className="relative flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Encontre seu Emprego Ideal
                </h2>
                <p className="text-sm text-slate-400 mt-1">Preencha os dados abaixo para receber vagas no WhatsApp</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-all text-slate-400 hover:text-white hover:scale-110 duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Step 1: Location & Job */}
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* City/Country Field with icon */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Cidade ou País
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={cityInputRef}
                    type="text"
                    placeholder="ex: São Paulo"
                    value={formData.cidade_ou_pais}
                    onChange={(e) => handleCityChange(e.target.value)}
                    onFocus={() => formData.cidade_ou_pais && setShowCitySuggestions(true)}
                    className={`w-full px-4 py-3 rounded-lg bg-slate-800/60 border-2 transition-all text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-blue-400 group-hover:border-slate-600 ${
                      errors.cidade_ou_pais ? "border-red-500" : "border-slate-700"
                    }`}
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                      {citySuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySuggestionClick(city)}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-500/20 transition-all text-slate-200 hover:text-blue-300 first:rounded-t-lg last:rounded-b-lg border-b border-slate-700/30 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {city}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.cidade_ou_pais && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <span className="inline-block">⚠</span> {errors.cidade_ou_pais}
                  </p>
                )}
              </div>

              {/* Job Area Field with icon */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Área de Trabalho ou Cargo
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Desenvolvedor Full Stack"
                  value={formData.area_ou_cargo}
                  onChange={(e) => handleInputChange("area_ou_cargo", e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/60 border-2 transition-all text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-emerald-400 group-hover:border-slate-600 ${
                    errors.area_ou_cargo ? "border-red-500" : "border-slate-700"
                  }`}
                />
                {errors.area_ou_cargo && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <span className="inline-block">⚠</span> {errors.area_ou_cargo}
                  </p>
                )}
              </div>

              {/* Country Code Field with icon */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Código do País (ISO)
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.pais_codigo}
                    onChange={(e) => handleInputChange("pais_codigo", e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg bg-slate-800/60 border-2 transition-all text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-cyan-400 group-hover:border-slate-600 appearance-none ${
                      errors.pais_codigo ? "border-red-500" : "border-slate-700"
                    }`}
                  >
                    <option value="">Selecione um país</option>
                    {ISO_COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.pais_codigo && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <span className="inline-block">⚠</span> {errors.pais_codigo}
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-6"></div>

            {/* Step 2: Personal Info */}
            <div className="space-y-5 animate-in fade-in duration-300 delay-75">
              {/* Full Name Field with icon */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Nome Completo
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/60 border-2 transition-all text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-purple-400 group-hover:border-slate-600 ${
                    errors.nome_completo ? "border-red-500" : "border-slate-700"
                  }`}
                />
                {errors.nome_completo && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <span className="inline-block">⚠</span> {errors.nome_completo}
                  </p>
                )}
              </div>

              {/* WhatsApp Field with icon */}
              <div className="relative group">
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                  Número de WhatsApp
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+55 11 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/60 border-2 transition-all text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-green-400 group-hover:border-slate-600 ${
                    errors.whatsapp ? "border-red-500" : "border-slate-700"
                  }`}
                />
                {errors.whatsapp && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <span className="inline-block">⚠</span> {errors.whatsapp}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-in fade-in duration-300">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠</span>
                  <div>{errors.submit}</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procurando vagas...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Receber Vagas no WhatsApp
                </>
              )}
            </button>

            {/* Footer text */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
              <Check className="w-3 h-3 text-green-400" />
              Enviaremos oportunidades de emprego diretamente no seu WhatsApp
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default JobSearchModal
export { JobSearchModal }
