import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AuthCard } from '@/components/auth-card'
import { Eye, EyeOff } from 'lucide-react'
import { useEnterReveal } from '@/lib/use-enter-reveal'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin() {
    navigate({ to: '/immunotherapies' })
  }

  const containerRef = useEnterReveal()

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        {/* Form */}
        <div className="reveal flex flex-col w-full max-w-sm gap-7" style={{ transitionDelay: '0.1s' }}>
          <div className="flex flex-col items-center text-center gap-1.5">
            <h1 className="font-extrabold text-3xl text-(--text)">
              Bem-vindo(a) de volta
            </h1>
            <p className="text-sm text-(--text-muted)">
              Não possui uma conta?{' '}
              <Link
                to="/trial"
                className="font-medium text-brand hover:underline no-underline"
              >
                Começar agora
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--text)/80">Email</label>
              <input
                type="email"
                placeholder="Insira aqui"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--text)/80">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Insira aqui"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-(--border-custom) bg-gray-50/60 px-4 pr-10 text-sm placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)/60 hover:text-(--text-muted) transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
            >
              Log in
            </button>
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-brand hover:underline no-underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>
        </div>

        <AuthCard initialSlide={0} className="reveal" style={{ transitionDelay: '0.2s' }} />
      </div>
    </div>
  )
}
