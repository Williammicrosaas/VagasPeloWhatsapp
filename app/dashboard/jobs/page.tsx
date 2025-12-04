"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { VisionButton } from "@/components/ui/vision-button"
import { VisionInput } from "@/components/ui/vision-input"
import { VisionTable, VisionTableHeader, VisionTableBody, VisionTableRow, VisionTableHead, VisionTableCell } from "@/components/ui/vision-table"
import { Search, Filter, Heart, Eye, X, Calendar, Briefcase, MapPin, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { JobFeedbackModal } from "@/components/job-feedback-modal"

interface Job {
  id: string
  sent_at: string
  view_status: string
  jobs: {
    id: string
    title: string
    company_name: string
    location: string
    job_area: string
    salary_min: number
    salary_max: number
    apply_url: string
  }
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [search, jobs])

  const fetchJobs = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/signin")
        return
      }

      const { data, error } = await supabase
        .from("sent_jobs")
        .select(
          `
          id,
          sent_at,
          view_status,
          jobs (
            id,
            title,
            company_name,
            location,
            job_area,
            salary_min,
            salary_max,
            apply_url
          )
        `
        )
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })

      if (error) throw error

      setJobs(data as any)
      setFilteredJobs(data as any)
    } catch (error) {
      console.error("[Jobs] Erro:", error)
      toast.error("Erro ao carregar vagas")
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    if (!search) {
      setFilteredJobs(jobs)
      return
    }

    const filtered = jobs.filter((job) => {
      const searchLower = search.toLowerCase()
      return (
        job.jobs?.title?.toLowerCase().includes(searchLower) ||
        job.jobs?.company_name?.toLowerCase().includes(searchLower) ||
        job.jobs?.job_area?.toLowerCase().includes(searchLower)
      )
    })

    setFilteredJobs(filtered)
  }

  const handleFavorite = async (jobId: string) => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: existing } = await supabase
        .from("favorite_jobs")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", jobId)
        .maybeSingle()

      if (existing) {
        await supabase.from("favorite_jobs").delete().eq("user_id", user.id).eq("job_id", jobId)
        toast.success("Removido dos favoritos")
      } else {
        await supabase.from("favorite_jobs").insert({
          user_id: user.id,
          job_id: jobId,
        })
        toast.success("Adicionado aos favoritos")
      }

      fetchJobs()
    } catch (error) {
      console.error("[Jobs] Erro ao favoritar:", error)
      toast.error("Erro ao favoritar vaga")
    }
  }

  const handleApply = (applyUrl: string) => {
    window.open(applyUrl, "_blank")
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      new: { label: "Nova", className: "bg-[#0BBEDB]/20 text-[#0BBEDB]" },
      viewed: { label: "Visualizada", className: "bg-blue-500/20 text-blue-400" },
      favorited: { label: "Favoritada", className: "bg-purple-500/20 text-purple-400" },
      dismissed: { label: "Descartada", className: "bg-gray-500/20 text-gray-400" },
    }

    const statusInfo = statusMap[status] || statusMap.new

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1437] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0BBEDB]/20 mb-4">
            <div className="w-8 h-8 border-2 border-[#0BBEDB] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[#A0AEC0]">Carregando vagas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1437]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vagas Recebidas</h1>
          <p className="text-[#A0AEC0]">Gerencie todas as vagas que você recebeu</p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
              <VisionInput
                type="text"
                placeholder="Buscar por título, empresa ou área..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <VisionButton variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </VisionButton>
          </div>
        </GlassCard>

        {/* Jobs Table */}
        <GlassCard>
          <VisionTable>
            <VisionTableHeader>
              <VisionTableRow>
                <VisionTableHead>Vaga</VisionTableHead>
                <VisionTableHead>Empresa</VisionTableHead>
                <VisionTableHead>Localização</VisionTableHead>
                <VisionTableHead>Salário</VisionTableHead>
                <VisionTableHead>Data</VisionTableHead>
                <VisionTableHead>Status</VisionTableHead>
                <VisionTableHead className="text-right">Ações</VisionTableHead>
              </VisionTableRow>
            </VisionTableHeader>
            <VisionTableBody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <VisionTableRow key={job.id}>
                    <VisionTableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0BBEDB]/20 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-[#0BBEDB]" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{job.jobs?.title || "N/A"}</p>
                          <p className="text-[#A0AEC0] text-xs">{job.jobs?.job_area || "N/A"}</p>
                        </div>
                      </div>
                    </VisionTableCell>
                    <VisionTableCell>
                      <p className="text-white">{job.jobs?.company_name || "N/A"}</p>
                    </VisionTableCell>
                    <VisionTableCell>
                      <div className="flex items-center gap-1 text-[#A0AEC0]">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{job.jobs?.location || "N/A"}</span>
                      </div>
                    </VisionTableCell>
                    <VisionTableCell>
                      {job.jobs?.salary_min && job.jobs?.salary_max ? (
                        <p className="text-white">
                          R$ {job.jobs.salary_min.toLocaleString()} - R$ {job.jobs.salary_max.toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-[#A0AEC0]">A combinar</p>
                      )}
                    </VisionTableCell>
                    <VisionTableCell>
                      <div className="flex items-center gap-1 text-[#A0AEC0]">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(job.sent_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </VisionTableCell>
                    <VisionTableCell>{getStatusBadge(job.view_status)}</VisionTableCell>
                    <VisionTableCell>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleFavorite(job.jobs?.id || "")}
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          title="Favoritar"
                        >
                          <Heart className="w-4 h-4 text-[#A0AEC0] hover:text-red-400" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job.jobs?.id || null)
                            setFeedbackModalOpen(true)
                          }}
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          title="Feedback"
                        >
                          <Eye className="w-4 h-4 text-[#A0AEC0] hover:text-[#0BBEDB]" />
                        </button>
                        {job.jobs?.apply_url && (
                          <button
                            onClick={() => handleApply(job.jobs.apply_url)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="Candidatar-se"
                          >
                            <ExternalLink className="w-4 h-4 text-[#A0AEC0] hover:text-[#0BBEDB]" />
                          </button>
                        )}
                      </div>
                    </VisionTableCell>
                  </VisionTableRow>
                ))
              ) : (
                <VisionTableRow>
                  <VisionTableCell colSpan={7} className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-[#A0AEC0] mx-auto mb-4 opacity-50" />
                    <p className="text-[#A0AEC0]">Nenhuma vaga encontrada</p>
                  </VisionTableCell>
                </VisionTableRow>
              )}
            </VisionTableBody>
          </VisionTable>
        </GlassCard>

        {/* Feedback Modal */}
        {feedbackModalOpen && selectedJob && (
          <JobFeedbackModal
            jobId={selectedJob}
            onClose={() => {
              setFeedbackModalOpen(false)
              setSelectedJob(null)
            }}
            onSuccess={() => {
              fetchJobs()
            }}
          />
        )}
      </div>
    </div>
  )
}
