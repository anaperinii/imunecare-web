import { useState } from 'react'
import { validateEmail as sharedValidateEmail, validatePassword, validatePasswordConfirm } from '@/shared/lib/validators'
import { Link } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/auth-card'
import { ArrowLeft, Mail, ShieldCheck, Clock, CheckCircle, KeyRound } from 'lucide-react'
import { useEnterReveal } from '@/shared/hooks/use-enter-reveal'

type Step = 'request' | 'code' | 'reset' | 'done'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const containerRef = useEnterReveal()

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"

  const validateEmail = () => {
    const e: Record<string, string> = {}
    const err = sharedValidateEmail(email)
    if (err) e.email = err
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateCode = () => {
    const e: Record<string, string> = {}
    const full = code.join('')
    if (full.length !== 6) e.code = 'Insira o código completo de 6 dígitos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePasswordFields = () => {
    const e: Record<string, string> = {}
    const pwErr = validatePassword(password)
    if (pwErr) e.password = pwErr
    const confirmErr = validatePasswordConfirm(password, confirmPassword)
    if (confirmErr) e.confirmPassword = confirmErr
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
      const next = document.getElementById(`code-${index + 1}`)
      next?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`)
      prev?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      const last = document.getElementById('code-5')
      last?.focus()
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        {/* Form */}
        <div className="reveal flex flex-col w-full max-w-sm gap-6" style={{ transitionDelay: '0.1s' }}>

          {/* Step: Request */}
          {step === 'request' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <KeyRound size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Redefinição de senha</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Informe o e-mail associado à sua conta. Enviaremos um código de verificação para confirmar sua identidade.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-(--text)/80">E-mail cadastrado</label>
                  <input
                    type="email"
                    placeholder="seu@email.com.br"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}) }}
                    className={`${inputClass} ${errors.email ? 'border-red-400 bg-red-50/30' : ''}`}
                  />
                  {errors.email && <span className="text-[0.65rem] text-red-500">{errors.email}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { if (validateEmail()) setStep('code') }}
                  className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
                >
                  Enviar código de verificação
                </button>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5">
                <ShieldCheck size={14} className="text-brand shrink-0" />
                <p className="text-[0.6rem] text-(--text-muted) leading-relaxed">
                  Este processo é protegido por criptografia de ponta a ponta. Nenhum dado sensível é armazenado durante a verificação.
                </p>
              </div>

              <Link to="/login" className="flex items-center justify-end gap-1.5 text-xs font-medium text-(--text-muted) hover:text-brand no-underline transition-colors">
                <ArrowLeft size={13} />
                Voltar ao login
              </Link>
            </>
          )}

          {/* Step: Code Verification */}
          {step === 'code' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <Mail size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Verificação de identidade</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Enviamos um código de 6 dígitos para <span className="font-semibold text-(--text)">{email}</span>. Insira-o abaixo para continuar.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-xs font-medium text-(--text)/80 self-start">Código de verificação</label>
                  <div className="flex gap-2.5" onPaste={handleCodePaste}>
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        id={`code-${i}`}
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
                  {errors.code && <span className="text-[0.65rem] text-red-500">{errors.code}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { if (validateCode()) setStep('reset') }}
                  className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
                >
                  Verificar código
                </button>
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep('request')} className="flex items-center gap-1.5 text-xs font-medium text-(--text-muted) hover:text-brand transition-colors bg-transparent border-none cursor-pointer">
                    <ArrowLeft size={13} />
                    Voltar
                  </button>
                  <button className="text-xs font-medium text-brand hover:underline bg-transparent border-none cursor-pointer">
                    Reenviar código
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                <Clock size={14} className="text-amber-600 shrink-0" />
                <p className="text-[0.6rem] text-amber-700 leading-relaxed">
                  O código expira em 10 minutos. Verifique também sua pasta de spam caso não encontre o e-mail.
                </p>
              </div>
            </>
          )}

          {/* Step: Reset Password */}
          {step === 'reset' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <ShieldCheck size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Criar nova senha</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Defina uma nova senha segura para sua conta. Ela deve atender aos requisitos mínimos de segurança.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-(--text)/80">Nova senha</label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((er) => { const n = { ...er }; delete n.password; return n }) }}
                    className={`${inputClass} ${errors.password ? 'border-red-400 bg-red-50/30' : ''}`}
                  />
                  {errors.password && <span className="text-[0.65rem] text-red-500">{errors.password}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-(--text)/80">Confirmar nova senha</label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((er) => { const n = { ...er }; delete n.confirmPassword; return n }) }}
                    className={`${inputClass} ${errors.confirmPassword ? 'border-red-400 bg-red-50/30' : ''}`}
                  />
                  {errors.confirmPassword && <span className="text-[0.65rem] text-red-500">{errors.confirmPassword}</span>}
                </div>

                {/* Password requirements */}
                <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-3">
                  <p className="text-[0.65rem] font-semibold text-(--text-muted) mb-2">Requisitos da senha:</p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
                      { label: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(password) },
                      { label: 'Pelo menos uma letra minúscula', met: /[a-z]/.test(password) },
                      { label: 'Pelo menos um número', met: /\d/.test(password) },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                          <CheckCircle size={9} className={req.met ? 'text-emerald-600' : 'text-gray-400'} />
                        </div>
                        <span className={`text-[0.65rem] ${req.met ? 'text-emerald-700 font-medium' : 'text-(--text-muted)'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { if (validatePasswordFields()) setStep('done') }}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
              >
                Redefinir senha
              </button>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <CheckCircle size={26} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Senha redefinida</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Sua senha foi atualizada com sucesso. Agora você pode acessar sua conta com a nova senha. Por segurança, todas as sessões anteriores foram encerradas.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all no-underline flex items-center justify-center"
              >
                Acessar minha conta
              </Link>

              <div className="flex items-center gap-2 bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5">
                <ShieldCheck size={14} className="text-brand shrink-0" />
                <p className="text-[0.6rem] text-(--text-muted) leading-relaxed">
                  Caso não tenha solicitado esta alteração, entre em contato imediatamente com nosso suporte pelo e-mail seguranca@imunecare.com.br.
                </p>
              </div>
            </>
          )}
        </div>

        <AuthCard initialSlide={0} className="reveal" style={{ transitionDelay: '0.2s' }} />
      </div>
    </div>
  )
}
