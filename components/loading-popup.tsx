"use client"

import { useState, useEffect } from "react"

export function LoadingPopup() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 30
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 90) {
      const timeout = setTimeout(() => {
        setProgress(100)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-blue-500/10 animate-pulse" />

        {/* Content */}
        <div className="relative p-8 flex flex-col items-center justify-center gap-6">
          {/* Animated Spinner */}
          <div className="relative w-20 h-20">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-emerald-500 animate-spin" />
            {/* Middle Ring */}
            <div
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 border-l-emerald-500 animate-spin"
              style={{ animationDirection: "reverse" }}
            />
            {/* Inner Pulse */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 animate-pulse" />
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Buscando vagas...</h3>
            <p className="text-slate-400 text-sm">Conectando com as melhores oportunidades</p>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full max-w-xs">
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer Effect */}
                <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </div>
            </div>
            {/* Progress Percentage */}
            <p className="text-center text-xs text-slate-400 mt-3 font-medium">{Math.round(progress)}%</p>
          </div>

          {/* Status Dots */}
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
