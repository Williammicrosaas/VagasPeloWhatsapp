"use client"

import { CheckCircle, X } from "lucide-react"
import { useState, useEffect } from "react"

interface SuccessMessageProps {
  isVisible: boolean
}

export function SuccessMessage({ isVisible }: SuccessMessageProps) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 px-6 py-4 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg border border-emerald-400/20">
        <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
        <div className="text-white">
          <p className="font-semibold">Sucesso!</p>
          <p className="text-sm opacity-90">Você receberá vagas no seu WhatsApp em breve</p>
        </div>
        <button
          onClick={() => setShow(false)}
          className="ml-4 p-1 hover:bg-white/20 rounded transition-colors text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default SuccessMessage
