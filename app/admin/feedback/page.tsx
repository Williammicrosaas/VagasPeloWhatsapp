"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Star } from "lucide-react"

interface Feedback {
  id: string
  user_id: string
  rating: number
  message: string
  category: string
  status: string
  created_at: string
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeedback = async () => {
      const supabase = createClient()
      try {
        const { data } = await supabase.from("user_feedback").select("*").order("created_at", { ascending: false })

        setFeedback(data || [])
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  const handleUpdateStatus = async (feedbackId: string, newStatus: string) => {
    const supabase = createClient()
    await supabase.from("user_feedback").update({ status: newStatus }).eq("id", feedbackId)

    setFeedback(feedback.map((f) => (f.id === feedbackId ? { ...f, status: newStatus } : f)))
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Feedback de Usuários</h1>
              <p className="text-slate-400 mt-1">Total: {feedback.length} mensagens</p>
            </div>
            <Link href="/admin">
              <Button className="bg-slate-700 text-white hover:bg-slate-600">Voltar</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id} className="border-slate-700 bg-slate-900">
                <CardContent className="pt-6 pb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-400 text-sm">{item.category}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === "open"
                            ? "bg-blue-500/20 text-blue-400"
                            : item.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-300">{item.message}</p>
                    <div className="flex gap-2 pt-2">
                      {item.status !== "resolved" && (
                        <Button
                          onClick={() => handleUpdateStatus(item.id, "resolved")}
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs"
                        >
                          Resolver
                        </Button>
                      )}
                      <span className="text-slate-500 text-xs ml-auto">
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </span>
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
