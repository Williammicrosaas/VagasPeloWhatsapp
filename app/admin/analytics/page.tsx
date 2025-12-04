"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { TrendingUp, Users, Briefcase, MessageSquare } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalFeedback: 0,
    averageRating: 0,
    jobsByArea: {} as Record<string, number>,
    jobsByCountry: {} as Record<string, number>,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient()

      try {
        const [{ count: users }, { count: jobs }, { count: feedback }, { data: jobsData }, { data: feedbackData }] =
          await Promise.all([
            supabase.from("users").select("*", { count: "exact", head: true }),
            supabase.from("jobs").select("*", { count: "exact", head: true }),
            supabase.from("user_feedback").select("*", { count: "exact", head: true }),
            supabase.from("jobs").select("job_area, country"),
            supabase.from("user_feedback").select("rating"),
          ])

        // Processar dados
        const jobsByArea: Record<string, number> = {}
        const jobsByCountry: Record<string, number> = {}

        jobsData?.forEach((job) => {
          jobsByArea[job.job_area] = (jobsByArea[job.job_area] || 0) + 1
          jobsByCountry[job.country] = (jobsByCountry[job.country] || 0) + 1
        })

        const avgRating =
          feedbackData && feedbackData.length > 0
            ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
            : 0

        setStats({
          totalUsers: users || 0,
          totalJobs: jobs || 0,
          totalFeedback: feedback || 0,
          averageRating: Number(avgRating.toFixed(1)),
          jobsByArea,
          jobsByCountry,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <Link href="/admin">
              <Button className="bg-slate-700 text-white hover:bg-slate-600">Voltar</Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-slate-700 bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Vagas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalFeedback}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Avaliação Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.averageRating}/5</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Areas and Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-white">Top Áreas</CardTitle>
                <CardDescription className="text-slate-400">Áreas com mais vagas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.jobsByArea)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([area, count]) => (
                      <div key={area} className="flex justify-between text-sm">
                        <span className="text-slate-300">{area}</span>
                        <span className="font-semibold text-white">{count} vagas</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-white">Top Países</CardTitle>
                <CardDescription className="text-slate-400">Países com mais vagas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.jobsByCountry)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div key={country} className="flex justify-between text-sm">
                        <span className="text-slate-300">{country}</span>
                        <span className="font-semibold text-white">{count} vagas</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
