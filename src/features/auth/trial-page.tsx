import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Shield, Check, Clock, Mail, X } from 'lucide-react'
import imunecareLogo from '@/assets/imunecare-logo.png'
import imunecareWhiteLogo from '@/assets/imunecare-white-logo.png'
import { validateEmail, formatPhone } from '@/shared/lib/validators'

interface TrialForm {
  nome: string
  sobrenome: string
  email: string
  telefone: string
  atuacao: string
  solucao: string
  especialidade: string
  profissionais: string
}

export function TrialPage() {
  const [form, setForm] = useState<TrialForm>({
    nome: '', sobrenome: '', email: '', telefone: '',
    atuacao: '', solucao: '', especialidade: '', profissionais: '',
  })
  const [errors, setErrors] = useState<Partial<TrialForm>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof TrialForm, boolean>>>({})
  const [showModal, setShowModal] = useState(false)

  const set = (f: keyof TrialForm, v: string) => {
    setForm((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => { const n = { ...p }; delete n[f]; return n })
  }
  const touch = (f: keyof TrialForm) => setTouched((p) => ({ ...p, [f]: true }))

  const validate = (): boolean => {
    const e: Partial<TrialForm> = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    else if (form.nome.trim().length < 2) e.nome = 'Nome muito curto'
    if (!form.sobrenome.trim()) e.sobrenome = 'Sobrenome é obrigatório'
    const emailErr = validateEmail(form.email)
    if (emailErr) e.email = emailErr
    const digits = form.telefone.replace(/\D/g, '')
    if (!digits) e.telefone = 'Telefone é obrigatório'
    else if (digits.length < 10 || digits.length > 11) e.telefone = 'Telefone inválido'
    if (!form.atuacao) e.atuacao = 'Selecione sua atuação'
    if (!form.solucao) e.solucao = 'Selecione uma opção'
    if (!form.especialidade.trim()) e.especialidade = 'Especialidade é obrigatória'
    const prof = parseInt(form.profissionais)
    if (!form.profissionais) e.profissionais = 'Informe o número'
    else if (isNaN(prof) || prof < 1 || prof > 9999) e.profissionais = 'Número inválido'
    setErrors(e)
    setTouched({ nome: true, sobrenome: true, email: true, telefone: true, atuacao: true, solucao: true, especialidade: true, profissionais: true })
    return Object.keys(e).length === 0
  }

  const inputCls = (f: keyof TrialForm) =>
    `w-full h-8 rounded-lg border bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/50 focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all ${
      errors[f] && touched[f] ? 'border-red-400 bg-red-50/30' : 'border-(--border-custom)'
    }`
  const selectCls = (f: keyof TrialForm) =>
    `w-full h-8 rounded-lg border bg-gray-50/60 px-3 text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all pr-8 ${
      errors[f] && touched[f] ? 'border-red-400 bg-red-50/30' : 'border-(--border-custom)'
    }`
  const Err = ({ f }: { f: keyof TrialForm }) =>
    errors[f] && touched[f] ? <span className="text-[0.55rem] text-red-500 mt-0.5 block">{errors[f]}</span> : null

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center w-[52%] bg-linear-to-br from-[#0d8e6e] via-brand to-teal-400 relative overflow-hidden p-10 xl:p-14">
        <div className="absolute -top-30 -right-35 w-130 h-130 rounded-full border-2 border-white/20 pointer-events-none" />
        <div className="absolute top-50 right-5 w-80 h-80 rounded-full border-2 border-white/15 pointer-events-none" />
        <div className="absolute -bottom-20 -left-30 w-95 h-95 rounded-full border-2 border-white/15 pointer-events-none" />
        <div className="absolute bottom-[35%] left-[35%] w-50 h-50 rounded-full border-2 border-white/12 pointer-events-none" />
        <Link to="/" className="flex items-center gap-2.5 no-underline mb-8 relative z-10">
          <img src={imunecareWhiteLogo} alt="ImuneCare" className="w-9 h-9 rounded-lg" />
          <span className="text-xl font-bold text-white">ImuneCare</span>
        </Link>
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 w-fit relative z-10">
          <span className="w-1.5 h-1.5 bg-[#7FFFD4] rounded-full animate-pulse" />
          Solicite acesso · 14 dias grátis
        </div>
        <h1 className="text-[clamp(1.75rem,3vw,2.6rem)] font-extrabold text-white leading-[1.15] tracking-tight mb-4 max-w-120 relative z-10">
          A plataforma <span className="text-[#7FFFD4]">100% dedicada</span> à gestão de imunoterapias
        </h1>
        <p className="text-[0.95rem] text-white/75 leading-[1.65] max-w-105 mb-8 relative z-10">
          Cálculos automáticos. Histórico unificado. Rastreabilidade total.
          Transforme complexidade em clareza e recupere o tempo que você merece dedicar aos seus pacientes.
        </p>
        <div className="flex gap-3 relative z-10">
          {[
            { value: '+94%', label: 'Adesão ao tratamento' },
            { value: '3x', label: 'Mais eficiência clínica' },
            { value: '100%', label: 'Rastreabilidade' },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white/12 border border-white/18 backdrop-blur-md rounded-xl px-4 py-3">
              <div className="text-lg font-extrabold text-white tracking-tight">{s.value}</div>
              <div className="text-[0.65rem] text-white/65 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50/80 px-6 py-8 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-(--border-custom) shadow-[0_2px_40px_rgba(24,193,203,0.07)] p-6 xl:p-8 w-full max-w-110">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <img src={imunecareLogo} alt="ImuneCare" className="w-7 h-7 rounded-md" />
            <span className="text-base font-bold gradient-text">ImuneCare</span>
          </div>

          <p className="text-[0.65rem] font-bold uppercase tracking-[1.2px] text-brand mb-1.5">Sem cartão de crédito · 14 dias grátis</p>
          <h2 className="text-lg font-extrabold text-(--text) tracking-tight mb-1">Solicite seu acesso gratuito</h2>
          <p className="text-[0.7rem] text-(--text-muted) mb-5 leading-relaxed">Preencha os dados abaixo e nossa equipe libera seu acesso em até 1 dia útil.</p>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Nome <span className="text-red-400">*</span></label>
              <input value={form.nome} onChange={(e) => set('nome', e.target.value)} onBlur={() => touch('nome')} placeholder="Insira aqui" className={inputCls('nome')} maxLength={60} />
              <Err f="nome" />
            </div>
            <div>
              <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Sobrenome <span className="text-red-400">*</span></label>
              <input value={form.sobrenome} onChange={(e) => set('sobrenome', e.target.value)} onBlur={() => touch('sobrenome')} placeholder="Insira aqui" className={inputCls('sobrenome')} maxLength={80} />
              <Err f="sobrenome" />
            </div>
          </div>

          <div className="mb-2.5">
            <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">E-mail profissional <span className="text-red-400">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={() => touch('email')} placeholder="voce@clinica.com.br" className={inputCls('email')} maxLength={254} autoComplete="email" />
            <Err f="email" />
          </div>

          <div className="mb-2.5">
            <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Telefone / WhatsApp <span className="text-red-400">*</span></label>
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => set('telefone', formatPhone(e.target.value))}
              onBlur={() => touch('telefone')}
              placeholder="(00) 00000-0000"
              className={inputCls('telefone')}
              maxLength={16}
            />
            <Err f="telefone" />
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div>
              <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Qual é a sua atuação? <span className="text-red-400">*</span></label>
              <select value={form.atuacao} onChange={(e) => set('atuacao', e.target.value)} onBlur={() => touch('atuacao')} className={selectCls('atuacao')}>
                <option value="" disabled>Selecionar</option>
                <option>Médico(a)</option>
                <option>Gestor(a) de clínica</option>
                <option>Farmacêutico(a)</option>
                <option>Enfermeiro(a)</option>
                <option>Outro</option>
              </select>
              <Err f="atuacao" />
            </div>
            <div>
              <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Solução digital para quem? <span className="text-red-400">*</span></label>
              <select value={form.solucao} onChange={(e) => set('solucao', e.target.value)} onBlur={() => touch('solucao')} className={selectCls('solucao')}>
                <option value="" disabled>Selecionar</option>
                <option>Para mim (uso próprio)</option>
                <option>Para minha clínica</option>
                <option>Para uma rede de clínicas</option>
              </select>
              <Err f="solucao" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div>
              <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Especialidade da clínica <span className="text-red-400">*</span></label>
              <input value={form.especialidade} onChange={(e) => set('especialidade', e.target.value)} onBlur={() => touch('especialidade')} placeholder="Ex.: Alergia e Imunologia" className={inputCls('especialidade')} maxLength={80} />
              <Err f="especialidade" />
            </div>
            <div>
              <label className="text-[0.7rem] font-semibold text-(--text-muted) mb-1 block">Nº de profissionais <span className="text-red-400">*</span></label>
              <input
                type="number"
                min="1"
                max="9999"
                value={form.profissionais}
                onChange={(e) => set('profissionais', e.target.value)}
                onBlur={() => touch('profissionais')}
                placeholder="Ex.: 5"
                className={inputCls('profissionais')}
              />
              <Err f="profissionais" />
            </div>
          </div>

          <button
            onClick={() => { if (validate()) setShowModal(true) }}
            className="w-full h-9 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-bold flex items-center justify-center gap-2 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(24,193,203,0.35)] transition-all cursor-pointer"
          >
            Quero testar gratuitamente
            <ArrowRight size={16} />
          </button>

          <p className="text-[0.6rem] text-(--text-muted) text-center mt-3 leading-relaxed">
            Ao enviar, você concorda com os{' '}
            <a href="#" className="text-brand no-underline hover:underline">Termos de Uso</a> e a{' '}
            <a href="#" className="text-brand no-underline hover:underline">Política de Privacidade</a>.
          </p>

          <hr className="border-t border-(--border-custom) my-4" />

          <div className="flex items-center justify-center gap-5">
            {[
              { icon: Shield, label: 'Dados seguros' },
              { icon: Check, label: 'Sem compromisso' },
              { icon: Clock, label: 'Ativação imediata' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <span key={t.label} className="flex items-center gap-1.5 text-[0.65rem] text-(--text-muted) font-medium">
                  <Icon size={13} className="text-brand" />
                  {t.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="relative bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] w-full max-w-md mx-4 p-7 text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-100 transition-all">
              <X size={16} />
            </button>
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail size={24} className="text-emerald-600" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-(--text) mb-2">Solicitação enviada com sucesso!</h3>
            <p className="text-xs text-(--text-muted) leading-relaxed mb-4">
              Recebemos sua solicitação de acesso e nossa equipe já está analisando seus dados.
              Você receberá uma confirmação com as instruções de ativação diretamente no e-mail informado.
            </p>
            <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-4 py-3 mb-4">
              <p className="text-[0.65rem] text-(--text-muted) font-medium mb-1">Fique atento à sua caixa de entrada</p>
              <p className="text-sm font-semibold text-brand">contato@imunecare.com.br</p>
              <p className="text-[0.6rem] text-(--text-muted) mt-1">Prazo de retorno: até 1 dia útil</p>
            </div>
            <Link to="/" className="inline-flex items-center justify-center w-full h-9 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-bold hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(24,193,203,0.35)] transition-all no-underline">
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
