import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, MessageCircle, Zap, Shield, Globe, Users, ArrowRight } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Crie sua Conta",
      description: "Faça seu cadastro gratuito em menos de 2 minutos",
      icon: Users,
    },
    {
      number: 2,
      title: "Configure Preferências",
      description: "Defina sua área, país e localização desejada",
      icon: Zap,
    },
    {
      number: 3,
      title: "Receba Oportunidades",
      description: "Receba vagas selecionadas direto no WhatsApp",
      icon: MessageCircle,
    },
    {
      number: 4,
      title: "Aplique e Conquiste",
      description: "Acesse as vagas e envie sua candidatura",
      icon: CheckCircle,
    },
  ]

  const features = [
    {
      title: "100% Transparente",
      description: "Sem cobranças ocultas. Você sabe exatamente o que está recebendo.",
      icon: Shield,
    },
    {
      title: "Alcance Global",
      description: "Acesse oportunidades em 150+ países. Mundo é sua tela.",
      icon: Globe,
    },
    {
      title: "Personalizado",
      description: "Cada vaga é selecionada especificamente para seu perfil.",
      icon: Zap,
    },
    {
      title: "24/7 Suporte",
      description: "Nossa equipe está sempre disponível para ajudar.",
      icon: MessageCircle,
    },
  ]

  const benefits = [
    "Economize tempo procurando em dezenas de sites",
    "Receba apenas vagas relevantes ao seu perfil",
    "Sem spam ou conteúdo não relacionado",
    "Controle total sobre suas preferências",
    "Privacidade garantida - nunca compartilhamos seus dados",
    "Acesso 24/7 às oportunidades",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold text-white">
              Como
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Funciona
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Entenda como nosso sistema revolucionário encontra as melhores oportunidades de emprego para você
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">4 Passos Simples</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  <Card className="border-slate-700 bg-slate-900 h-full hover:border-blue-500/50 transition-all duration-300">
                    <CardContent className="pt-8 pb-8">
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-white font-bold">{step.number}</span>
                        </div>
                        <Icon className="w-8 h-8 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        <p className="text-slate-400 text-sm">{step.description}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Características Principais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="border-slate-700 bg-slate-900 hover:border-emerald-500/50 transition-all duration-300"
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Icon className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-slate-400 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Por Que Escolher a Gente?</h2>

          <Card className="border-slate-700 bg-slate-900">
            <CardContent className="pt-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <p className="text-slate-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transparency Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Transparência Total</h2>

          <div className="space-y-6">
            <Card className="border-slate-700 bg-slate-900">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Como Nos Mantemos</h3>
                <p className="text-slate-300">
                  Oferecemos um serviço básico 100% gratuito para todos. Nossos planos premium oferecem recursos
                  adicionais como histórico completo de vagas, análise de mercado e prioridade no suporte.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Proteção de Dados</h3>
                <p className="text-slate-300">
                  Sua privacidade é nossa prioridade máxima. Todos os dados são criptografados e nunca são
                  compartilhados com terceiros sem sua permissão explícita. Estamos totalmente em conformidade com LGPD
                  e GDPR.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900">
              <CardContent className="pt-6 pb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Garantia de Qualidade</h3>
                <p className="text-slate-300">
                  Toda vaga é verificada e validada antes de ser enviada. Não trabalhamos com recrutadores maliciosos ou
                  ofertas de fraude. Sua segurança é garantida.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Pronto para Começar?</h2>
            <p className="text-slate-300 mb-8">
              Junte-se a milhares de profissionais que já estão recebendo oportunidades incríveis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600 px-8 py-4">
                  Criar Conta Gratuita
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-800 px-8 py-4 bg-transparent"
                >
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
