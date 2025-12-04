"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { VisionInput } from "@/components/ui/vision-input"
import { VisionButton } from "@/components/ui/vision-button"
import { Mail, Lock, Eye, EyeOff, User, Facebook, Apple } from "lucide-react"
import { toast } from "sonner"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      })

      if (error) throw error

      // Criar registro na tabela users
      if (data.user) {
        const { error: userError } = await supabase.from("users").insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.name,
        })

        if (userError) {
          console.error("Erro ao criar usuário:", userError)
        }
      }

      toast.success("Conta criada com sucesso! Verifique seu email.")
      router.push("/auth/sign-up-success")
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1437] flex">
      {/* Left Side - Background with Text */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7F5CFF]/20 via-[#0BBEDB]/20 to-[#7F5CFF]/20">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md">
            <p className="text-sm uppercase tracking-wider text-white/80 mb-4">Comece Agora!</p>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#0BBEDB] to-[#7F5CFF] bg-clip-text text-transparent">
              Crie Sua Conta Grátis
            </h1>
            <p className="text-white/70 text-lg">
              Junte-se a milhares de profissionais que já estão encontrando as melhores oportunidades de emprego direto no WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#0B1437]">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0BBEDB] to-[#7F5CFF] rounded-xl mb-4 shadow-[0_0_20px_rgba(11,190,219,0.6)]">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-[#111C44]/70 backdrop-blur-md rounded-xl border border-white/10 p-8 shadow-[0_0_15px_rgba(11,190,219,0.3)]">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h2>
            <p className="text-[#A0AEC0] mb-6">Crie sua conta gratuitamente e comece a receber as melhores vagas de emprego direto no seu WhatsApp.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Social Login */}
              <div>
                <p className="text-sm text-[#A0AEC0] mb-3">Cadastre-se com</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0B1437] border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0B1437] border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Apple className="w-5 h-5 text-white" />
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0B1437] border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-bold">G</span>
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#111C44] text-[#A0AEC0]">ou</span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                  <VisionInput
                    type="text"
                    name="name"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                  <VisionInput
                    type="email"
                    name="email"
                    placeholder="Seu endereço de email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                  <VisionInput
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                  <VisionInput
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-[#0B1437] text-[#0BBEDB] focus:ring-[#0BBEDB] focus:ring-offset-0"
                />
                <span className="text-sm text-[#A0AEC0]">Lembrar-me</span>
              </label>

              {/* Submit Button */}
              <VisionButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "CRIANDO CONTA..." : "CRIAR CONTA"}
              </VisionButton>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-[#A0AEC0] text-sm">
                Já tem uma conta?{" "}
                <Link
                  href="/auth/signin"
                  className="text-[#0BBEDB] hover:text-[#0BBEDB]/80 font-medium transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[#A0AEC0] text-xs mb-2">
              © 2025, Made with ❤️ by Simmmple & Simmmple for a better web
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-[#A0AEC0]">
              <Link href="#" className="hover:text-white transition-colors">Simmmple</Link>
              <Link href="#" className="hover:text-white transition-colors">Blog</Link>
              <Link href="#" className="hover:text-white transition-colors">License</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
