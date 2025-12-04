"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ChevronDown, Mail, MessageSquare, HelpCircle, Check } from "lucide-react"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "Como faço para criar uma conta?",
    answer:
      "Criar uma conta é simples e gratuito! Clique no botão 'Encontre Vagas Agora' na página inicial, preencha seus dados (email, nome e senha) e confirme seu email. Pronto! Sua conta está criada.",
    category: "Conta",
  },
  {
    id: "2",
    question: "Quanto custa usar o serviço?",
    answer:
      "O serviço básico é 100% gratuito. Você pode receber vagas ilimitadas, configurar preferências e acompanhar suas candidaturas sem pagar nada. Oferecemos planos premium com recursos adicionais, mas são totalmente opcionais.",
    category: "Planos",
  },
  {
    id: "3",
    question: "Como recebo as vagas no WhatsApp?",
    answer:
      "Após configurar seu perfil e preferências, adicione seu número de WhatsApp no seu perfil. Nossas vagas recomendadas serão enviadas diretamente para você via WhatsApp. Você pode gerenciar com que frequência recebe as notificações.",
    category: "WhatsApp",
  },
  {
    id: "4",
    question: "Meus dados são seguros?",
    answer:
      "Sim! Sua privacidade é nossa prioridade máxima. Todos os dados são criptografados e armazenados com segurança. Estamos em conformidade total com LGPD (Lei Geral de Proteção de Dados) e GDPR. Nunca compartilhamos seus dados com terceiros sem sua permissão.",
    category: "Segurança",
  },
  {
    id: "5",
    question: "Como funciona o matching de vagas?",
    answer:
      "Usamos um algoritmo inteligente que analisa suas preferências (área, país, localização) e encontra as melhores vagas disponíveis. Quanto mais informações você fornecer, melhores serão as recomendações. O sistema aprende com o tempo!",
    category: "Vagas",
  },
  {
    id: "6",
    question: "Posso mudar minhas preferências?",
    answer:
      "Claro! Você pode alterar suas preferências a qualquer momento no seu perfil. Adicione novas áreas de interesse, mude de país ou atualize seu número de WhatsApp. As mudanças são refletidas imediatamente.",
    category: "Conta",
  },
  {
    id: "7",
    question: "Como cancelo minha conta?",
    answer:
      "Você pode cancelar sua conta a qualquer momento. Entre em contato conosco via email support@vagadeemprego.com ou pelo formulário de suporte. Seus dados serão removidos conforme a legislação exigir.",
    category: "Conta",
  },
  {
    id: "8",
    question: "O que é considerado vaga de qualidade?",
    answer:
      "Todas as vagas em nossa plataforma são verificadas e validadas. Nós removemos ofertas de fraude, esquemas de pirâmide e qualquer coisa maliciosa. Apenas recrutadores legítimos podem postar vagas.",
    category: "Vagas",
  },
  {
    id: "9",
    question: "Posso aplicar para múltiplas vagas?",
    answer:
      "Sim! Você pode aplicar para quantas vagas quiser. Não há limite de candidaturas. Recomendamos aplicar apenas para vagas que correspondam ao seu perfil para aumentar as chances de sucesso.",
    category: "Vagas",
  },
  {
    id: "10",
    question: "Como faço para entrar em contato com suporte?",
    answer:
      "Você pode entrar em contato conosco de três formas: 1) Preenchendo o formulário de suporte nesta página, 2) Enviando um email para support@vagadeemprego.com, 3) Enviando uma mensagem via WhatsApp para +55 11 98765-4321.",
    category: "Suporte",
  },
]

const categories = ["Todos", "Conta", "Planos", "WhatsApp", "Segurança", "Vagas", "Suporte"]

export default function SupportPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    category: "geral",
    message: "",
  })
  const [feedbackSent, setFeedbackSent] = useState(false)

  const filteredFAQs = selectedCategory === "Todos" ? faqs : faqs.filter((faq) => faq.category === selectedCategory)

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simular envio
    setFeedbackSent(true)
    setTimeout(() => {
      setFeedbackSent(false)
      setFeedbackForm({ name: "", email: "", category: "geral", message: "" })
    }, 3000)
  }

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
              Central de
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Ajuda e Suporte
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Encontre respostas para suas dúvidas e entre em contato com nosso suporte
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <Card className="border-slate-700 bg-slate-900 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Mail className="w-8 h-8 text-blue-400" />
                  <h3 className="font-semibold text-white">Email</h3>
                  <p className="text-slate-400 text-sm">support@vagadeemprego.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900 hover:border-emerald-500/50 transition-all duration-300">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <MessageSquare className="w-8 h-8 text-emerald-400" />
                  <h3 className="font-semibold text-white">WhatsApp</h3>
                  <p className="text-slate-400 text-sm">+55 11 98765-4321</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-900 hover:border-yellow-500/50 transition-all duration-300">
              <CardContent className="pt-6 pb-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <HelpCircle className="w-8 h-8 text-yellow-400" />
                  <h3 className="font-semibold text-white">FAQ</h3>
                  <p className="text-slate-400 text-sm">Perguntas frequentes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Perguntas Frequentes</h2>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card
                  key={faq.id}
                  className="border-slate-700 bg-slate-900 cursor-pointer hover:border-blue-500/50 transition-all duration-300"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                        {expandedId === faq.id && <p className="text-slate-300 mt-4">{faq.answer}</p>}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-blue-400 flex-shrink-0 transition-transform duration-300 ${
                          expandedId === faq.id ? "transform rotate-180" : ""
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="mt-20 pt-20 border-t border-slate-700">
            <h2 className="text-3xl font-bold text-white mb-8">Envie-nos uma Mensagem</h2>

            <Card className="border-slate-700 bg-slate-900">
              <CardContent className="pt-8 pb-8">
                {feedbackSent ? (
                  <div className="flex flex-col items-center text-center space-y-4 py-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Mensagem Enviada!</h3>
                    <p className="text-slate-400">Obrigado por sua mensagem. Nossa equipe responderá em breve.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-200">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          required
                          value={feedbackForm.name}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                          className="border-slate-600 bg-slate-800 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={feedbackForm.email}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                          className="border-slate-600 bg-slate-800 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-200">
                        Categoria
                      </Label>
                      <select
                        id="category"
                        value={feedbackForm.category}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
                      >
                        <option value="geral">Geral</option>
                        <option value="problema">Problema Técnico</option>
                        <option value="sugestao">Sugestão</option>
                        <option value="reclamacao">Reclamação</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-200">
                        Mensagem
                      </Label>
                      <textarea
                        id="message"
                        required
                        rows={4}
                        value={feedbackForm.message}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white resize-none"
                        placeholder="Conte-nos como podemos ajudar..."
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600"
                    >
                      Enviar Mensagem
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <Link href="/">
              <Button className="bg-slate-700 text-white hover:bg-slate-600">Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
