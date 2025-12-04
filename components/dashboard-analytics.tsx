"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Target, Award, Briefcase } from "lucide-react"

interface AnalyticsData {
  acceptanceRateByArea: Array<{ area: string; rate: number; total: number; applied: number }>
  weeklyMatches: Array<{ week: string; matches: number; highMatches: number }>
  topJobsByScore: Array<{ title: string; company: string; score: number; area: string }>
  bestMatchAreas: string[]
}

export function DashboardAnalytics() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    acceptanceRateByArea: [],
    weeklyMatches: [],
    topJobsByScore: [],
    bestMatchAreas: [],
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Buscar dados de sent_jobs com status
      const { data: sentJobs } = await supabase
        .from("sent_jobs")
        .select(
          `
          view_status,
          sent_at,
          jobs (
            job_area,
            title,
            company_name
          )
        `,
        )
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(1000)

      // Buscar match scores
      const { data: matchScores } = await supabase
        .from("job_match_scores")
        .select(
          `
          match_score,
          calculated_at,
          jobs (
            title,
            company_name,
            job_area
          )
        `,
        )
        .eq("user_id", user.id)
        .order("match_score", { ascending: false })
        .limit(20)

      // Processar dados
      const areaStats: Record<string, { total: number; applied: number }> = {}

      sentJobs?.forEach((item: any) => {
        const area = item.jobs?.job_area || "Outras"
        if (!areaStats[area]) {
          areaStats[area] = { total: 0, applied: 0 }
        }
        areaStats[area].total++
        if (item.view_status === "applied") {
          areaStats[area].applied++
        }
      })

      const acceptanceRateByArea = Object.entries(areaStats).map(([area, stats]) => ({
        area,
        total: stats.total,
        applied: stats.applied,
        rate: stats.total > 0 ? Math.round((stats.applied / stats.total) * 100) : 0,
      }))

      // Dados semanais
      const weeklyData: Record<string, { matches: number; highMatches: number }> = {}
      const now = new Date()

      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - i * 7)
        const weekKey = `Sem ${4 - i}`
        weeklyData[weekKey] = { matches: 0, highMatches: 0 }
      }

      matchScores?.forEach((item: any) => {
        const date = new Date(item.calculated_at)
        const weeksAgo = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (weeksAgo >= 0 && weeksAgo < 4) {
          const weekKey = `Sem ${4 - weeksAgo}`
          weeklyData[weekKey].matches++
          if (item.match_score >= 80) {
            weeklyData[weekKey].highMatches++
          }
        }
      })

      const weeklyMatches = Object.entries(weeklyData).map(([week, data]) => ({
        week,
        matches: data.matches,
        highMatches: data.highMatches,
      }))

      // Top jobs por score
      const topJobsByScore = (matchScores || [])
        .slice(0, 10)
        .map((item: any) => ({
          title: item.jobs?.title || "N/A",
          company: item.jobs?.company_name || "N/A",
          score: item.match_score,
          area: item.jobs?.job_area || "N/A",
        }))

      // Melhores áreas de match
      const areaScores: Record<string, number[]> = {}
      matchScores?.forEach((item: any) => {
        const area = item.jobs?.job_area || "Outras"
        if (!areaScores[area]) {
          areaScores[area] = []
        }
        areaScores[area].push(item.match_score)
      })

      const bestMatchAreas = Object.entries(areaScores)
        .map(([area, scores]) => ({
          area,
          avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 3)
        .map((item) => item.area)

      setAnalytics({
        acceptanceRateByArea,
        weeklyMatches,
        topJobsByScore,
        bestMatchAreas,
      })
    } catch (error) {
      console.error("[Dashboard Analytics] Erro:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 mb-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400">Carregando analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Insights */}
      {analytics.bestMatchAreas.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Insights de Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-2">
              Você tem melhor match nas áreas: <span className="font-bold text-emerald-400">{analytics.bestMatchAreas.join(", ")}</span>
            </p>
            <p className="text-slate-400 text-sm">Foque suas buscas nessas áreas para melhores resultados!</p>
          </CardContent>
        </Card>
      )}

      {/* Taxa de Aceitação por Área */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Taxa de Aceitação por Área</CardTitle>
          <CardDescription className="text-slate-400">Percentual de vagas candidatadas por área de trabalho</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.acceptanceRateByArea}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="area" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="rate" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Histórico de Matches */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Matches (Últimas 4 Semanas)</CardTitle>
          <CardDescription className="text-slate-400">Evolução de matches e matches altos (≥80%)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.weeklyMatches}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="matches" stroke="#3b82f6" strokeWidth={2} name="Total Matches" />
              <Line type="monotone" dataKey="highMatches" stroke="#10b981" strokeWidth={2} name="Matches Altos (≥80%)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Vagas por Score */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Vagas por Score de Match
          </CardTitle>
          <CardDescription className="text-slate-400">Vagas com maior compatibilidade com seu perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topJobsByScore.length > 0 ? (
              analytics.topJobsByScore.map((job, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex-1">
                    <p className="text-white font-medium">{job.title}</p>
                    <p className="text-slate-400 text-sm">{job.company} • {job.area}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">{job.score}%</div>
                    <div className="text-xs text-slate-400">match</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4">Nenhum dado disponível ainda</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

