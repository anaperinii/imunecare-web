import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthCard } from '@/components/auth-card'
import { Eye, EyeOff, ChevronDown, Smile, CheckCircle, Mail, ShieldCheck, ArrowRight } from 'lucide-react'
import { useEnterReveal } from '@/lib/use-enter-reveal'

const specialties = [
  'Alergologia e Imunologia',
  'Oncologia',
  'Dermatologia',
  'Pneumologia',
  'Reumatologia',
  'Outro',
]

type Step = 'welcome' | 'form' | 'verify' | 'done'

export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('welcome')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState('')
  const [email] = useState('jaque.rod55@gmail.com')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const containerRef = useEnterReveal()

  const maskedEmail = (() => {
    const [local, domain] = email.split('@')
    return `${local.slice(0, 3)}${'*'.repeat(Math.max(local.length - 3, 3))}@${domain}`
  })()

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Nome é obrigatório'
    else if (name.trim().length < 3) e.name = 'Nome deve ter ao menos 3 caracteres'
    if (!password) e.password = 'Senha é obrigatória'
    else if (password.length < 8) e.password = 'Mínimo de 8 caracteres'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) e.password = 'Deve atender todos os requisitos de segurança'
    if (!confirmPassword) e.confirmPassword = 'Confirmação é obrigatória'
    else if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem'
    if (!specialty) e.specialty = 'Selecione uma especialidade'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateCode = () => {
    const e: Record<string, string> = {}
    if (code.join('').length !== 6) e.code = 'Insira o código completo de 6 dígitos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (errors.code) setErrors({})
    if (value && index < 5) {
      const next = document.getElementById(`reg-code-${index + 1}`)
      next?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`reg-code-${index - 1}`)
      prev?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      const last = document.getElementById('reg-code-5')
      last?.focus()
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        {/* Auth card — left side */}
        <AuthCard initialSlide={1} className="reveal" style={{ transitionDelay: '0.1s' }} />

        {/* Steps */}
        <div className="reveal flex flex-col w-full max-w-sm gap-6" style={{ transitionDelay: '0.2s' }}>

          {/* Step: Welcome */}
          {step === 'welcome' && (
            <>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-1">
                  <Smile size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">
                  É um prazer ter você aqui
                </h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Seu acesso ao <span className="font-semibold text-(--text)">ImuneCare</span> chegou! Configure sua conta agora e comece a usar o sistema.
                </p>
              </div>

              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="bg-gray-50/80 px-4 py-2.5 border-b border-(--border-custom)">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted)">Detalhes do convite</span>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] text-(--text-muted)">Convidado por</span>
                    <span className="text-[0.7rem] font-semibold text-(--text)">Tatiana Gonçalves de Abreu</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] text-(--text-muted)">Organização</span>
                    <span className="text-[0.7rem] font-semibold text-(--text)">Clínica ImuneCare</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] text-(--text-muted)">E-mail vinculado</span>
                    <span className="text-[0.7rem] font-semibold text-brand">{maskedEmail}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('form')}
                className="w-full h-10 rounded-xl text-xs font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              >
                Completar meu cadastro
                <ArrowRight size={14} />
              </button>

            </>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <h1 className="font-extrabold text-2xl text-(--text)">
                  Complete seu cadastro
                </h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Preencha os dados abaixo para finalizar a configuração da sua conta e começar a utilizar o ImuneCare.
                </p>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-(--text)/80">Nome completo</label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((er) => { const n = { ...er }; delete n.name; return n }) }}
                    className={`${inputClass} ${errors.name ? 'border-red-400 bg-red-50/30' : ''}`}
                  />
                  {errors.name && <span className="text-[0.6rem] text-red-500">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-(--text)/80">E-mail</label>
                    <span className="text-[0.6rem] text-brand">Definido pelo administrador</span>
                  </div>
                  <input
                    type="email"
                    value={maskedEmail}
                    readOnly
                    className={`${inputClass} text-(--text-muted) cursor-default bg-gray-100/60`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-(--text)/80">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mín. 8 caracteres"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((er) => { const n = { ...er }; delete n.password; return n }) }}
                        className={`${inputClass} pr-9 ${errors.password ? 'border-red-400 bg-red-50/30' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)/60 hover:text-(--text-muted) transition-colors" tabIndex={-1}>
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.password && <span className="text-[0.6rem] text-red-500">{errors.password}</span>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-(--text)/80">Confirmar senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((er) => { const n = { ...er }; delete n.confirmPassword; return n }) }}
                        className={`${inputClass} pr-9 ${errors.confirmPassword ? 'border-red-400 bg-red-50/30' : ''}`}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)/60 hover:text-(--text-muted) transition-colors" tabIndex={-1}>
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="text-[0.6rem] text-red-500">{errors.confirmPassword}</span>}
                  </div>
                </div>

                {/* Password requirements */}
                <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2.5">
                  <div className="flex flex-col gap-1">
                    {[
                      { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
                      { label: 'Letra maiúscula e minúscula', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
                      { label: 'Pelo menos um número', met: /\d/.test(password) },
                      { label: 'Pelo menos um caractere especial', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                          <CheckCircle size={8} className={req.met ? 'text-emerald-600' : 'text-gray-400'} />
                        </div>
                        <span className={`text-[0.6rem] ${req.met ? 'text-emerald-700 font-medium' : 'text-(--text-muted)'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-(--text)/80">Especialidade</label>
                  <div className="relative">
                    <select
                      value={specialty}
                      onChange={(e) => { setSpecialty(e.target.value); if (errors.specialty) setErrors((er) => { const n = { ...er }; delete n.specialty; return n }) }}
                      className={`${inputClass} appearance-none pr-9 cursor-pointer ${errors.specialty ? 'border-red-400 bg-red-50/30' : ''}`}
                    >
                      <option value="" disabled>Selecionar</option>
                      {specialties.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                  {errors.specialty && <span className="text-[0.6rem] text-red-500">{errors.specialty}</span>}
                </div>
              </div>

              <button
                onClick={() => { if (validateForm()) setStep('verify') }}
                className="w-full h-10 rounded-xl text-xs font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
              >
                Criar conta
              </button>

              <p className="text-[0.55rem] text-(--text-muted) text-center leading-relaxed">
                Ao criar sua conta, você concorda com os{' '}
                <a href="#" className="text-brand no-underline hover:underline">Termos de Uso</a> e a{' '}
                <a href="#" className="text-brand no-underline hover:underline">Política de Privacidade</a> do ImuneCare.
              </p>
            </>
          )}

          {/* Step: Verify */}
          {step === 'verify' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-1">
                  <Mail size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Verifique sua conta</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Enviamos um código de 6 dígitos para <span className="font-semibold text-(--text)">{maskedEmail}</span>. Insira-o abaixo para ativar sua conta.
                </p>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <label className="text-xs font-medium text-(--text)/80 self-start">Código de verificação</label>
                <div className="flex gap-2.5" onPaste={handleCodePaste}>
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      id={`reg-code-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className={`w-11 h-12 rounded-xl border text-center text-lg font-bold bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${errors.code ? 'border-red-400 bg-red-50/30' : 'border-(--border-custom)'}`}
                    />
                  ))}
                </div>
                {errors.code && <span className="text-[0.6rem] text-red-500">{errors.code}</span>}
              </div>

              <button
                onClick={() => { if (validateCode()) setStep('done') }}
                className="w-full h-10 rounded-xl text-xs font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
              >
                Verificar e ativar conta
              </button>

              <div className="flex items-center justify-end">
                <button className="text-xs font-medium text-brand hover:underline bg-transparent border-none cursor-pointer">
                  Reenviar código
                </button>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                <ShieldCheck size={14} className="text-amber-600 shrink-0" />
                <p className="text-[0.6rem] text-amber-700 leading-relaxed">
                  O código expira em 10 minutos. Caso não encontre o e-mail, verifique sua pasta de spam ou promoções.
                </p>
              </div>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 mb-1">
                  <CheckCircle size={26} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Conta ativada com sucesso!</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Sua conta foi verificada e está pronta para uso.
                </p>
              </div>

              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="bg-gray-50/80 px-4 py-2.5 border-b border-(--border-custom)">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted)">Resumo da conta</span>
                </div>
                <div className="px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] text-(--text-muted)">Nome</span>
                    <span className="text-[0.7rem] font-semibold text-(--text)">{name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] text-(--text-muted)">E-mail</span>
                    <span className="text-[0.7rem] font-semibold text-brand">{maskedEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] text-(--text-muted)">Especialidade</span>
                    <span className="text-[0.7rem] font-semibold text-(--text)">{specialty}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate({ to: '/login' })}
                className="w-full h-10 rounded-xl text-xs font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              >
                Acessar o ImuneCare
                <ArrowRight size={14} />
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
