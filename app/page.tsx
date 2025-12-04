"use client"

import { useState } from "react"
import { JobSearchModal } from "@/components/job-search-modal"
import { SuccessMessage } from "@/components/success-message"
import { Briefcase, Zap, MessageCircle, Globe } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSuccess = () => {
    setShowModal(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header with Login Button */}
      <header className="relative z-50 px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">BuscaVagas</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <button className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                Planos
              </button>
            </Link>
            <Link href="/auth/signin">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                Entrar
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo/Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400">
              <Briefcase className="w-4 h-4" />
              <span>Encontre seu Emprego Ideal Instantaneamente</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-tight">
              Receba As melhores Vagas de Empregos
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Direto no WhatsApp
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Diga-nos o que você procura e receba oportunidades de emprego selecionadas diretamente no WhatsApp. Sem
              spam, apenas oportunidades relevantes.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold text-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5" />
              Encontre Vagas Agora
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-slate-800/80">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Super Rápido</h3>
              <p className="text-slate-400">Receba oportunidades em tempo real, não horas depois</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-slate-800/80">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Direto no WhatsApp</h3>
              <p className="text-slate-400">Conecte-se no seu app de mensagens preferido</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:bg-slate-800/80">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Alcance Global</h3>
              <p className="text-slate-400">Procure vagas em qualquer país que lhe interessa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                10K+
              </p>
              <p className="text-slate-400 mt-2">Vagas Anunciadas</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                5K+
              </p>
              <p className="text-slate-400 mt-2">Profissionais Contratados</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                150+
              </p>
              <p className="text-slate-400 mt-2">Países</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                24/7
              </p>
              <p className="text-slate-400 mt-2">Suporte</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Pronto para Encontrar seu Emprego Ideal?</h2>
            <p className="text-slate-300 mb-8">Complete seu perfil e comece a receber oportunidades selecionadas</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/how-it-works">
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-slate-700 text-white font-semibold text-lg hover:bg-slate-600 transition-all duration-300">
                  Saiba Como Funciona
                </button>
              </Link>
              <Link href="/pricing">
                <button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-slate-700 text-white font-semibold text-lg hover:bg-slate-600 transition-all duration-300">
                  Ver Planos
                </button>
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold text-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Zap className="w-5 h-5" />
                Comece Agora Gratuitamente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <JobSearchModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      <SuccessMessage isVisible={showSuccess} />
    </main>
  )
}
