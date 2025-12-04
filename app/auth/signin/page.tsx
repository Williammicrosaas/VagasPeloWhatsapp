"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { VisionInput } from "@/components/ui/vision-input"
import { VisionButton } from "@/components/ui/vision-button"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success("Login realizado com sucesso!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login")
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
            <p className="text-sm uppercase tracking-wider text-white/80 mb-4">Bem-vindo de volta!</p>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#0BBEDB] to-[#7F5CFF] bg-clip-text text-transparent">
              Acesse Sua Conta
            </h1>
            <p className="text-white/70 text-lg">
              Continue sua jornada em busca do emprego ideal. Acesse suas vagas personalizadas e oportunidades exclusivas.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#0B1437]">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0BBEDB] to-[#7F5CFF] rounded-xl mb-4 shadow-[0_0_20px_rgba(11,190,219,0.6)]">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Que bom te ver novamente!</h2>
            <p className="text-[#A0AEC0] mb-8">Digite seu email e senha para entrar</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0AEC0]" />
                  <VisionInput
                    type="email"
                    placeholder="Seu endereço de email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-[#0B1437] text-[#0BBEDB] focus:ring-[#0BBEDB] focus:ring-offset-0"
                  />
                  <span className="text-sm text-[#A0AEC0]">Lembrar-me</span>
                </label>
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-[#0BBEDB] hover:text-[#0BBEDB]/80 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Submit Button */}
              <VisionButton
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "ENTRANDO..." : "ENTRAR"}
              </VisionButton>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-[#A0AEC0] text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/auth/signup"
                  className="text-[#0BBEDB] hover:text-[#0BBEDB]/80 font-medium transition-colors"
                >
                  Criar Conta
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
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
