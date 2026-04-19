import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/auth-card'
import { Eye, EyeOff } from 'lucide-react'
import { useEnterReveal } from '@/shared/hooks/use-enter-reveal'
import { validateEmail } from '@/shared/lib/validators'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const containerRef = useEnterReveal()

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }))

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    const emailErr = validateEmail(email)
    if (emailErr) e.email = emailErr
    if (!password) e.password = 'Senha é obrigatória'
    else if (password.length < 8) e.password = 'A senha deve ter no mínimo 8 caracteres'
    setErrors(e)
    setTouched({ email: true, password: true })
    return Object.keys(e).length === 0
  }

  function handleLogin() {
    if (!validate()) return
    navigate({ to: '/immunotherapies' })
  }

  const inputBase = 'w-full rounded-lg border bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all'
  const fieldClass = (field: string, extra = '') =>
    `${inputBase} ${errors[field] && touched[field] ? 'border-red-400 bg-red-50/30' : 'border-(--border-custom)'} ${extra}`
  const ErrMsg = ({ field }: { field: string }) =>
    errors[field] && touched[field] ? <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors[field]}</span> : null

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        <div className="reveal flex flex-col w-full max-w-sm gap-7" style={{ transitionDelay: '0.1s' }}>
          <div className="flex flex-col items-center text-center gap-1.5">
            <h1 className="font-extrabold text-3xl text-(--text)">Bem-vindo(a) de volta</h1>
            <p className="text-sm text-(--text-muted)">
              Não possui uma conta?{' '}
              <Link to="/trial" className="font-medium text-brand hover:underline no-underline">Começar agora</Link>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--text)/80">Email</label>
              <input
                type="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                onBlur={() => {
                  touch('email')
                  const err = validateEmail(email)
                  if (err) setErrors((p) => ({ ...p, email: err }))
                }}
                className={fieldClass('email', 'h-9')}
                autoComplete="email"
                maxLength={254}
              />
              <ErrMsg field="email" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--text)/80">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Insira aqui"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password') }}
                  onBlur={() => touch('password')}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
                  className={fieldClass('password', 'h-11 pr-10 text-sm')}
                  autoComplete="current-password"
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)/60 hover:text-(--text-muted) transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <ErrMsg field="password" />
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
              <Link to="/forgot-password" className="text-xs font-medium text-brand hover:underline no-underline">Esqueceu a senha?</Link>
            </div>
          </div>
        </div>

        <AuthCard initialSlide={0} className="reveal" style={{ transitionDelay: '0.2s' }} />
      </div>
    </div>
  )
}
