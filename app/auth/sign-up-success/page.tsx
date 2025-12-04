import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccess() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-slate-700 bg-slate-900">
          <CardContent className="pt-12 pb-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-emerald-500/10 p-4">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Conta Criada com Sucesso!</h2>
                <p className="text-slate-400">
                  Verifique seu email para confirmar sua conta. Após verificar, você poderá fazer login e começar a
                  receber oportunidades.
                </p>
              </div>

              <Link href="/auth/login" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600">
                  Ir para Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
