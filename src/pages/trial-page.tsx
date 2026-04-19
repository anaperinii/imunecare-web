import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Shield, Check, Clock } from 'lucide-react'
import imunecareLogo from '@/assets/imunecare-logo.png'
import imunecareWhiteLogo from '@/assets/imunecare-white-logo.png'

export function TrialPage() {
  const [form, setForm] = useState({
    nome: '', sobrenome: '', email: '', telefone: '',
    atuacao: '', solucao: '', especialidade: '', profissionais: '',
  })
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  const inputClassRight = "w-full h-10 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3.5 text-sm placeholder:text-(--text-muted)/50 focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all"
  const selectClass = "w-full h-10 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3.5 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all pr-9"

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[52%] bg-linear-to-br from-[#0d8e6e] via-brand to-teal-400 relative overflow-hidden p-10 xl:p-14">
        {/* Decorative circles */}
        <div className="absolute -top-30 -right-35 w-130 h-130 rounded-full border-2 border-white/20 pointer-events-none" />
        <div className="absolute top-50 right-5 w-80 h-80 rounded-full border-2 border-white/15 pointer-events-none" />
        <div className="absolute -bottom-20 -left-30 w-95 h-95 rounded-full border-2 border-white/15 pointer-events-none" />
        <div className="absolute bottom-[35%] left-[35%] w-50 h-50 rounded-full border-2 border-white/12 pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline mb-12 relative z-10">
          <img src={imunecareWhiteLogo} alt="ImuneCare" className="w-9 h-9 rounded-lg" />
          <span className="text-xl font-bold text-white">ImuneCare</span>
        </Link>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 w-fit relative z-10">
          <span className="w-1.5 h-1.5 bg-[#7FFFD4] rounded-full animate-pulse" />
          Solicite acesso · 14 dias grátis
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(1.75rem,3vw,2.6rem)] font-extrabold text-white leading-[1.15] tracking-tight mb-5 max-w-120 relative z-10">
          A plataforma <span className="text-[#7FFFD4]">100% dedicada</span> à gestão de imunoterapias
        </h1>

        {/* Sub */}
        <p className="text-[0.95rem] text-white/75 leading-[1.65] max-w-105 mb-10 relative z-10">
          Cálculos automáticos. Histórico unificado. Rastreabilidade total.
          Transforme complexidade em clareza e recupere o tempo que você merece dedicar aos seus pacientes.
        </p>

        {/* Stats */}
        <div className="flex gap-4 mb-10 relative z-10">
          {[
            { value: '+94%', label: 'Adesão ao tratamento' },
            { value: '3x', label: 'Mais eficiência clínica' },
            { value: '100%', label: 'Rastreabilidade' },
          ].map((s) => (
            <div key={s.label} className="flex-1 bg-white/12 border border-white/18 backdrop-blur-md rounded-xl px-4 py-3.5">
              <div className="text-xl font-extrabold text-white tracking-tight">{s.value}</div>
              <div className="text-[0.68rem] text-white/65 font-medium mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Photo placeholder */}
        <div className="flex-1 relative z-10 flex items-end">
          <div className="relative w-full">
            <div className="absolute -top-4 right-7 bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)] z-20">
              <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-[#0d8e6e]">Alertas em tempo real · Ativo</span>
            </div>
            <div className="bg-white/12 border border-white/18 backdrop-blur-md rounded-t-3xl w-full h-60 flex items-center justify-center">
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="opacity-50">
                <rect x="20" y="30" width="120" height="75" rx="8" fill="white" fillOpacity="0.3" />
                <rect x="30" y="42" width="60" height="6" rx="3" fill="white" fillOpacity="0.7" />
                <rect x="30" y="54" width="40" height="4" rx="2" fill="white" fillOpacity="0.5" />
                <rect x="30" y="66" width="50" height="4" rx="2" fill="white" fillOpacity="0.4" />
                <circle cx="118" cy="55" r="16" fill="white" fillOpacity="0.2" />
                <rect x="30" y="80" width="100" height="18" rx="5" fill="white" fillOpacity="0.18" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-start justify-center bg-gray-50/80 px-6 pt-10 pb-10 min-h-screen overflow-y-auto">
        <div className="bg-white rounded-2xl border border-(--border-custom) shadow-[0_2px_40px_rgba(24,193,203,0.07)] p-8 xl:p-10 w-full max-w-120">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <img src={imunecareLogo} alt="ImuneCare" className="w-7 h-7 rounded-md" />
            <span className="text-base font-bold gradient-text">ImuneCare</span>
          </div>

          <p className="text-[0.65rem] font-bold uppercase tracking-[1.2px] text-brand mb-1.5">Sem cartão de crédito · 14 dias grátis</p>
          <h2 className="text-xl font-extrabold text-(--text) tracking-tight mb-1">Solicite seu acesso gratuito</h2>
          <p className="text-xs text-(--text-muted) mb-6 leading-relaxed">Preencha os dados abaixo e nossa equipe libera seu acesso em até 1 dia útil.</p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nome</label>
              <input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Insira aqui" className={inputClassRight} />
            </div>
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Sobrenome</label>
              <input value={form.sobrenome} onChange={(e) => set('sobrenome', e.target.value)} placeholder="Insira aqui" className={inputClassRight} />
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">E-mail profissional</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="voce@clinica.com.br" className={inputClassRight} />
          </div>

          <div className="mb-3">
            <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Telefone / WhatsApp</label>
            <input type="tel" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} placeholder="(00) 00000-0000" className={inputClassRight} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Qual é a sua atuação?</label>
              <select value={form.atuacao} onChange={(e) => set('atuacao', e.target.value)} className={selectClass}>
                <option value="" disabled>Selecionar</option>
                <option>Médico(a)</option>
                <option>Gestor(a) de clínica</option>
                <option>Farmacêutico(a)</option>
                <option>Enfermeiro(a)</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Solução digital para quem?</label>
              <select value={form.solucao} onChange={(e) => set('solucao', e.target.value)} className={selectClass}>
                <option value="" disabled>Selecionar</option>
                <option>Para mim (uso próprio)</option>
                <option>Para minha clínica</option>
                <option>Para uma rede de clínicas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Especialidade da clínica</label>
              <input value={form.especialidade} onChange={(e) => set('especialidade', e.target.value)} placeholder="Ex.: Alergia e Imunologia" className={inputClassRight} />
            </div>
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nº de profissionais</label>
              <input type="number" min="1" value={form.profissionais} onChange={(e) => set('profissionais', e.target.value)} placeholder="Ex.: 5" className={inputClassRight} />
            </div>
          </div>

          <button className="w-full h-11 rounded-xl bg-linear-to-br from-brand to-teal-400 text-white text-sm font-bold flex items-center justify-center gap-2 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(24,193,203,0.35)] transition-all cursor-pointer">
            Quero testar gratuitamente
            <ArrowRight size={16} />
          </button>

          <p className="text-[0.6rem] text-(--text-muted) text-center mt-3 leading-relaxed">
            Ao enviar, você concorda com os <a href="#" className="text-brand no-underline hover:underline">Termos de Uso</a> e a <a href="#" className="text-brand no-underline hover:underline">Política de Privacidade</a>.
          </p>

          <hr className="border-t border-(--border-custom) my-5" />

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
    </div>
  )
}
