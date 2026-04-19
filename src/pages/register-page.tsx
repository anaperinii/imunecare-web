import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AuthCard } from '@/components/auth-card'
import { Eye, EyeOff, ChevronDown } from 'lucide-react'
import { useEnterReveal } from '@/lib/use-enter-reveal'

const specialties = [
  'Alergologia e Imunologia',
  'Oncologia',
  'Dermatologia',
  'Pneumologia',
  'Reumatologia',
  'Outro',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState('')
  const [email] = useState('jaque.rod55@gmail.com')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [specialty, setSpecialty] = useState('')

  const containerRef = useEnterReveal()

  function handleRegister() {
    navigate({ to: '/login' })
  }

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        {/* Auth card — left side */}
        <AuthCard initialSlide={1} className="reveal" style={{ transitionDelay: '0.1s' }} />

        {/* Form */}
        <div className="reveal flex flex-col w-full max-w-sm gap-6" style={{ transitionDelay: '0.2s' }}>
          <div className="flex flex-col items-center text-center gap-1.5">
            <h1 className="font-extrabold text-3xl text-(--text)">
              Começar agora
            </h1>
            <p className="text-sm text-(--text-muted)">
              Já possui uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-teal-500 hover:underline no-underline"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-(--text)/80">Nome Completo</label>
              <input
                type="text"
                placeholder="Insira aqui"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-xl border border-(--border-custom) bg-gray-50/60 px-4 text-sm placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-(--text)/80">Email</label>
                <span className="text-[10px] text-teal-500">
                  Definido pelo administrador*
                </span>
              </div>
              <input
                type="email"
                value={email}
                readOnly
                className="h-11 rounded-xl border border-(--border-custom) bg-gray-50/60 px-4 text-sm text-(--text-muted) cursor-default focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-(--text)/80">Senha</label>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-(--text)/80">Confirmação</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Insira aqui"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 rounded-xl border border-(--border-custom) bg-gray-50/60 px-4 pr-10 text-sm placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)/60 hover:text-(--text-muted) transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-(--text)/80">Especialidade</label>
              <div className="relative">
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full h-11 rounded-xl border border-(--border-custom) bg-gray-50/60 px-4 pr-10 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="" disabled>Selecionar</option>
                  {specialties.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            onClick={handleRegister}
            className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
          >
            Começar agora
          </button>
        </div>
      </div>
    </div>
  )
}
