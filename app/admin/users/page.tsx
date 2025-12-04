"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { UsersIcon } from "lucide-react"

interface User {
  id: string
  email: string
  full_name?: string
  whatsapp_number?: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      try {
        const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false })

        setUsers(data || [])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
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
            <div>
              <h1 className="text-3xl font-bold text-white">Gerenciar Usuários</h1>
              <p className="text-slate-400 mt-1">Total: {users.length} usuários</p>
            </div>
            <Link href="/admin">
              <Button className="bg-slate-700 text-white hover:bg-slate-600">Voltar</Button>
            </Link>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="border-slate-700 bg-slate-900">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{user.full_name || user.email}</h3>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                      <div className="flex gap-4 mt-1 text-sm text-slate-400">
                        {user.whatsapp_number && <span>WhatsApp: {user.whatsapp_number}</span>}
                        <span>Cadastrado: {new Date(user.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
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
