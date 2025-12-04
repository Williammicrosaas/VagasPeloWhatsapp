"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { DollarSign, Briefcase, MapPin, TrendingUp, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface AdvancedFilters {
  min_salary?: number
  max_salary?: number
  salary_currency?: string
  level?: string
  employment_type?: string
  remote?: boolean
  match_score_threshold?: number
}

interface AdvancedFiltersFormProps {
  preferenceId: string
  onSave?: () => void
}

export function AdvancedFiltersForm({ preferenceId, onSave }: AdvancedFiltersFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState<AdvancedFilters>({
    min_salary: undefined,
    max_salary: undefined,
    salary_currency: "BRL",
    level: undefined,
    employment_type: undefined,
    remote: false,
    match_score_threshold: 60,
  })

  useEffect(() => {
    loadFilters()
  }, [preferenceId])

  const loadFilters = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("job_preferences")
        .select("min_salary, max_salary, salary_currency, level, employment_type, remote, match_score_threshold")
        .eq("id", preferenceId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setFilters({
          min_salary: data.min_salary || undefined,
          max_salary: data.max_salary || undefined,
          salary_currency: data.salary_currency || "BRL",
          level: data.level || undefined,
          employment_type: data.employment_type || undefined,
          remote: data.remote || false,
          match_score_threshold: data.match_score_threshold || 60,
        })
      }
    } catch (error) {
      console.error("[Advanced Filters] Erro ao carregar:", error)
      toast.error("Erro ao carregar filtros")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Sessão expirada. Faça login novamente.")
        return
      }

      const { error } = await supabase
        .from("job_preferences")
        .update({
          min_salary: filters.min_salary || null,
          max_salary: filters.max_salary || null,
          salary_currency: filters.salary_currency || "BRL",
          level: filters.level || null,
          employment_type: filters.employment_type || null,
          remote: filters.remote || false,
          match_score_threshold: filters.match_score_threshold || 60,
          updated_at: new Date().toISOString(),
        })
        .eq("id", preferenceId)

      if (error) throw error

      toast.success("Filtros salvos com sucesso!")
      if (onSave) onSave()
    } catch (error) {
      console.error("[Advanced Filters] Erro ao salvar:", error)
      toast.error("Erro ao salvar filtros. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setFilters({
      min_salary: undefined,
      max_salary: undefined,
      salary_currency: "BRL",
      level: undefined,
      employment_type: undefined,
      remote: false,
      match_score_threshold: 60,
    })
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 mb-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400">Carregando filtros...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Filtros Avançados
        </CardTitle>
        <CardDescription className="text-slate-400">
          Configure critérios detalhados para receber vagas mais relevantes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Salário */}
        <div className="space-y-4">
          <Label className="text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Faixa Salarial
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="min_salary" className="text-slate-400 text-sm">
                Salário Mínimo
              </Label>
              <Input
                id="min_salary"
                type="number"
                value={filters.min_salary || ""}
                onChange={(e) => setFilters({ ...filters, min_salary: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 5000"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="max_salary" className="text-slate-400 text-sm">
                Salário Máximo (opcional)
              </Label>
              <Input
                id="max_salary"
                type="number"
                value={filters.max_salary || ""}
                onChange={(e) => setFilters({ ...filters, max_salary: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Ex: 15000"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="salary_currency" className="text-slate-400 text-sm">
                Moeda
              </Label>
              <Select
                value={filters.salary_currency}
                onValueChange={(value) => setFilters({ ...filters, salary_currency: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Nível */}
        <div>
          <Label htmlFor="level" className="text-white flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4" />
            Nível Profissional
          </Label>
          <Select value={filters.level || "any"} onValueChange={(value) => setFilters({ ...filters, level: value === "any" ? undefined : value })}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Qualquer nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer nível</SelectItem>
              <SelectItem value="Júnior">Júnior</SelectItem>
              <SelectItem value="Pleno">Pleno</SelectItem>
              <SelectItem value="Sênior">Sênior</SelectItem>
              <SelectItem value="Especialista">Especialista</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Contrato */}
        <div>
          <Label htmlFor="employment_type" className="text-white mb-2 block">
            Tipo de Contrato
          </Label>
          <Select
            value={filters.employment_type || "any"}
            onValueChange={(value) => setFilters({ ...filters, employment_type: value === "any" ? undefined : value })}
          >
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Qualquer tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Qualquer tipo</SelectItem>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
              <SelectItem value="Estágio">Estágio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Modalidade */}
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <div>
            <Label htmlFor="remote" className="text-white flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Apenas Vagas Remotas
            </Label>
            <p className="text-slate-400 text-sm mt-1">Receber apenas vagas que permitem trabalho remoto</p>
          </div>
          <Switch
            id="remote"
            checked={filters.remote}
            onCheckedChange={(checked) => setFilters({ ...filters, remote: checked })}
          />
        </div>

        {/* Threshold de Match Score */}
        <div className="space-y-2">
          <Label className="text-white">
            Score Mínimo de Match: {filters.match_score_threshold}%
          </Label>
          <p className="text-slate-400 text-sm">
            Apenas vagas com score de compatibilidade acima deste valor serão enviadas
          </p>
          <Slider
            value={[filters.match_score_threshold || 60]}
            onValueChange={([value]) => setFilters({ ...filters, match_score_threshold: value })}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0% (Todas)</span>
            <span>50% (Moderado)</span>
            <span>80% (Alto)</span>
            <span>100% (Perfeito)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-700 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 flex-1"
          >
            {saving ? "Salvando..." : "Salvar Filtros"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

