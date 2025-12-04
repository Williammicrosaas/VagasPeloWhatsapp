"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { toast } from "sonner"

interface JobFeedbackModalProps {
  open: boolean
  onClose: () => void
  jobId: string
  sentJobId?: string
  jobTitle?: string
  onSuccess?: () => void
}

export function JobFeedbackModal({ open, onClose, jobId, sentJobId, jobTitle, onSuccess }: JobFeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Por favor, selecione uma avaliação")
      return
    }

    try {
      setSubmitting(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Você precisa estar logado para enviar feedback")
        return
      }

      // Verificar se já existe feedback para esta vaga
      const { data: existing } = await supabase
        .from("job_feedback")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", jobId)
        .maybeSingle()

      if (existing) {
        // Atualizar feedback existente
        const { error } = await supabase
          .from("job_feedback")
          .update({
            rating,
            comment: comment || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)

        if (error) throw error
        toast.success("Feedback atualizado com sucesso!")
      } else {
        // Criar novo feedback
        const { error } = await supabase.from("job_feedback").insert({
          user_id: user.id,
          job_id: jobId,
          sent_job_id: sentJobId || null,
          rating,
          comment: comment || null,
        })

        if (error) throw error
        toast.success("Feedback enviado com sucesso! Obrigado pela sua opinião.")
      }

      // Limpar formulário
      setRating(0)
      setComment("")
      onClose()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("[Job Feedback] Erro:", error)
      toast.error("Erro ao enviar feedback. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Avaliar Vaga</DialogTitle>
          <DialogDescription className="text-slate-400">
            {jobTitle ? `Avalie a vaga: ${jobTitle}` : "Sua opinião nos ajuda a melhorar o serviço"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div>
            <Label className="text-slate-300 mb-3 block">Avaliação</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-slate-600 text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-2">
              {rating === 0 && "Selecione uma avaliação"}
              {rating === 1 && "Muito ruim"}
              {rating === 2 && "Ruim"}
              {rating === 3 && "Regular"}
              {rating === 4 && "Bom"}
              {rating === 5 && "Excelente"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-slate-300 mb-2 block">
              Comentário (opcional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe sua experiência com esta vaga..."
              className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">{comment.length}/500 caracteres</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              {submitting ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

