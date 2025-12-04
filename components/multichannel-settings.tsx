"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mail, Send, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface MultichannelSettings {
  preferred_channel: "whatsapp" | "email" | "telegram"
  email_enabled: boolean
  telegram_enabled: boolean
  whatsapp_enabled: boolean
}

export function MultichannelSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<MultichannelSettings>({
    preferred_channel: "whatsapp",
    email_enabled: true,
    telegram_enabled: false,
    whatsapp_enabled: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Buscar configurações do usuário (adicionar campos na tabela users se necessário)
      const { data: userData } = await supabase
        .from("users")
        .select("preferred_channel, email_enabled, telegram_enabled, whatsapp_enabled")
        .eq("id", user.id)
        .maybeSingle()

      if (userData) {
        setSettings({
          preferred_channel: (userData.preferred_channel as any) || "whatsapp",
          email_enabled: userData.email_enabled ?? true,
          telegram_enabled: userData.telegram_enabled ?? false,
          whatsapp_enabled: userData.whatsapp_enabled ?? true,
        })
      }
    } catch (error) {
      console.error("[Multichannel Settings] Erro:", error)
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
        toast.error("Sessão expirada")
        return
      }

      // Atualizar configurações (requer adicionar campos na tabela users)
      const { error } = await supabase
        .from("users")
        .update({
          preferred_channel: settings.preferred_channel,
          email_enabled: settings.email_enabled,
          telegram_enabled: settings.telegram_enabled,
          whatsapp_enabled: settings.whatsapp_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        // Se campos não existem, criar migration
        if (error.message.includes("column") && error.message.includes("does not exist")) {
          toast.error("Campos não configurados. Execute a migration SQL primeiro.")
          console.error("Execute: ALTER TABLE users ADD COLUMN preferred_channel TEXT DEFAULT 'whatsapp', ADD COLUMN email_enabled BOOLEAN DEFAULT true, ADD COLUMN telegram_enabled BOOLEAN DEFAULT false, ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT true;")
          return
        }
        throw error
      }

      toast.success("Configurações salvas com sucesso!")
    } catch (error) {
      console.error("[Multichannel Settings] Erro:", error)
      toast.error("Erro ao salvar configurações")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 mb-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400">Carregando configurações...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Configurações Multicanal
        </CardTitle>
        <CardDescription className="text-slate-400">
          Escolha como deseja receber suas vagas e configure canais de comunicação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canal Preferido */}
        <div>
          <Label className="text-white mb-2 block">Canal Preferido</Label>
          <Select
            value={settings.preferred_channel}
            onValueChange={(value: any) => setSettings({ ...settings, preferred_channel: value })}
          >
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  WhatsApp
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
              </SelectItem>
              <SelectItem value="telegram">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Telegram
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-slate-400 text-sm mt-2">
            Este será o canal principal usado para enviar vagas quando todos os canais estiverem ativos
          </p>
        </div>

        {/* Canais Disponíveis */}
        <div className="space-y-4">
          <Label className="text-white">Canais Ativos</Label>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              <div>
                <Label htmlFor="whatsapp" className="text-white cursor-pointer">
                  WhatsApp
                </Label>
                <p className="text-slate-400 text-sm">Receber vagas via WhatsApp</p>
              </div>
            </div>
            <Switch
              id="whatsapp"
              checked={settings.whatsapp_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <div>
                <Label htmlFor="email" className="text-white cursor-pointer">
                  Email
                </Label>
                <p className="text-slate-400 text-sm">Receber vagas via email (fallback)</p>
              </div>
            </div>
            <Switch
              id="email"
              checked={settings.email_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, email_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-cyan-500" />
              <div>
                <Label htmlFor="telegram" className="text-white cursor-pointer">
                  Telegram
                </Label>
                <p className="text-slate-400 text-sm">Receber vagas via Telegram (opcional)</p>
              </div>
            </div>
            <Switch
              id="telegram"
              checked={settings.telegram_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, telegram_enabled: checked })}
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200 text-sm">
            💡 <strong>Dica:</strong> Ative múltiplos canais para garantir que você nunca perca uma oportunidade. O sistema
            usará o canal preferido primeiro e fará fallback para outros canais se necessário.
          </p>
        </div>

        {/* Actions */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
        >
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardContent>
    </Card>
  )
}

