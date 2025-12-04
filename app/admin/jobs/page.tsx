"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AlertCircle, Plus, Trash2 } from "lucide-react"

interface Job {
  id: string
  title: string
  company_name: string
  job_area: string
  country: string
  posted_at: string
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_name: "",
    job_area: "",
    country: "",
    city: "",
    apply_url: "",
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    const supabase = createClient()
    try {
      const { data, error: queryError } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_at", { ascending: false })
        .limit(50)

      if (queryError) throw queryError
      setJobs(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar vagas")
    } finally {
      setLoading(false)
    }
  }

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from("jobs").insert({
        ...formData,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

      if (insertError) throw insertError

      setFormData({
        title: "",
        description: "",
        company_name: "",
        job_area: "",
        country: "",
        city: "",
        apply_url: "",
      })
      setShowForm(false)
      fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar vaga")
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta vaga?")) return

    const supabase = createClient()
    try {
      const { error: deleteError } = await supabase.from("jobs").delete().eq("id", jobId)

      if (deleteError) throw deleteError
      fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar vaga")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Gerenciar Vagas</h1>
              <p className="text-slate-400 mt-1">Total: {jobs.length} vagas</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button className="bg-slate-700 text-white hover:bg-slate-600">Voltar</Button>
              </Link>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600 gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Vaga
              </Button>
            </div>
          </div>

          {/* Add Job Form */}
          {showForm && (
            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-white">Adicionar Nova Vaga</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddJob} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-200">Título</Label>
                      <Input
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="border-slate-600 bg-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Empresa</Label>
                      <Input
                        required
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="border-slate-600 bg-slate-800 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-200">Área</Label>
                      <Input
                        required
                        value={formData.job_area}
                        onChange={(e) => setFormData({ ...formData, job_area: e.target.value })}
                        className="border-slate-600 bg-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">País</Label>
                      <Input
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="border-slate-600 bg-slate-800 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-200">Descrição</Label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-slate-200">URL para Candidatura</Label>
                    <Input
                      required
                      type="url"
                      value={formData.apply_url}
                      onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                      className="border-slate-600 bg-slate-800 text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-emerald-500 text-white hover:bg-emerald-600">
                      Adicionar Vaga
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-slate-700 text-white hover:bg-slate-600"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="flex gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Jobs List */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="border-slate-700 bg-slate-900">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <p className="text-slate-400">{job.company_name}</p>
                      <div className="flex gap-4 mt-2 text-sm text-slate-400">
                        <span>{job.job_area}</span>
                        <span>{job.country}</span>
                        <span>{new Date(job.posted_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDeleteJob(job.id)}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
