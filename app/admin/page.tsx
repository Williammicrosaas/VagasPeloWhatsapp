import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, BarChart3, MessageSquare, LogOut } from "lucide-react"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Buscar estatísticas
  const [{ count: totalUsers }, { count: totalJobs }, { count: totalFeedback }] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("user_feedback").select("*", { count: "exact", head: true }),
  ])

  const handleLogout = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-slate-400 mt-1">Admin: {user?.email}</p>
            </div>
            <form action={handleLogout}>
              <Button type="submit" className="bg-slate-700 text-white hover:bg-slate-600 gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </form>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-700 bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Total de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalUsers || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Total de Vagas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalJobs || 0}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-yellow-400" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{totalFeedback || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-700 bg-slate-900 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
              <Link href="/admin/jobs">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    Gerenciar Vagas
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Adicionar, editar e remover oportunidades de emprego
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="border-slate-700 bg-slate-900 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
              <Link href="/admin/users">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Gerenciar Usuários
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Visualizar e gerenciar contas de usuários
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="border-slate-700 bg-slate-900 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
              <Link href="/admin/feedback">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-yellow-400" />
                    Feedback de Usuários
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Visualizar e responder feedback dos usuários
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="border-slate-700 bg-slate-900 hover:border-blue-500/50 transition-all duration-300 cursor-pointer">
              <Link href="/admin/analytics">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Analytics
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Visualizar métricas e estatísticas da plataforma
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
