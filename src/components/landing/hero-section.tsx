import { Link } from '@tanstack/react-router'
import { TrendingUp, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="min-h-screen pt-30 pb-20 px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-[5%] items-center relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_70%_50%,rgba(20,184,166,0.07)_0%,transparent_70%),radial-gradient(ellipse_40%_40%_at_10%_80%,rgba(6,182,212,0.05)_0%,transparent_60%)]">
      {/* Left content */}
      <div className="reveal">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-1.5 rounded-full text-[0.8rem] font-semibold mb-6">
          <span className="bg-teal-500 text-white px-2 py-0.5 rounded-full text-[0.7rem]">
            Novo
          </span>
          Apresentando ImuneCare 2.0
        </div>

        {/* Heading */}
        <h1 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-extrabold leading-[1.1] tracking-[-1.5px] mb-5 bg-[linear-gradient(150deg,var(--text)_0%,var(--color-teal-800)_60%,var(--color-cyan-600)_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
          Centralize e otimize a gestão de imunoterapias alérgicas
        </h1>

        {/* Subtitle */}
        <p className="text-[1.05rem] text-(--text-muted) leading-[1.7] max-w-120 mb-8">
          Plataforma completa para clínicas e profissionais de saúde acompanharem, gerenciarem e otimizarem protocolos de imunoterapia alérgica em um único lugar.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap mb-10">
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-full border-none bg-linear-to-br from-teal-500 to-cyan-500 text-white font-semibold text-[0.9rem] cursor-pointer transition-all duration-250 shadow-[0_4px_20px_rgba(20,184,166,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(20,184,166,0.4)] no-underline"
          >
            Começar gratuitamente
          </Link>
          <button className="px-6 py-2.5 rounded-full border-[1.5px] border-teal-300 bg-transparent text-teal-700 font-semibold text-[0.9rem] cursor-pointer transition-all duration-250 hover:bg-teal-50">
            Ver demonstração
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-8 flex-wrap">
          <div className="text-left">
            <strong className="block text-[1.3rem] font-extrabold text-teal-600">1.2k+</strong>
            <span className="text-[0.8rem] text-(--text-muted)">Profissionais ativos</span>
          </div>
          <div className="text-left">
            <strong className="block text-[1.3rem] font-extrabold text-teal-600">18k+</strong>
            <span className="text-[0.8rem] text-(--text-muted)">Pacientes cadastrados</span>
          </div>
          <div className="text-left">
            <strong className="block text-[1.3rem] font-extrabold text-teal-600">98%</strong>
            <span className="text-[0.8rem] text-(--text-muted)">Satisfação</span>
          </div>
        </div>
      </div>

      {/* Right visual */}
      <div className="relative hidden lg:flex items-center justify-center min-h-100 xl:min-h-120 2xl:min-h-140">
        {/* Main card */}
        <div
          className="w-full max-w-125 xl:max-w-145 2xl:max-w-165 relative z-1"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          <div className="w-full bg-linear-to-br from-teal-500 via-cyan-500 to-teal-400 rounded-[28px] 2xl:rounded-[36px] p-10 pb-14 xl:p-12 xl:pb-16 2xl:p-16 2xl:pb-20 relative overflow-hidden shadow-[0_32px_80px_rgba(20,184,166,0.35)]">
            {/* Swirl decorations */}
            <svg className="absolute -right-15 -top-15 w-70 h-70 2xl:w-90 2xl:h-90 opacity-25" viewBox="0 0 280 280" fill="none">
              <path d="M240 40 C200 20 120 60 100 120 C80 180 140 220 180 200 C220 180 240 120 200 100 C160 80 100 120 120 160" stroke="white" strokeWidth="18" strokeLinecap="round" fill="none" />
              <path d="M200 20 C160 0 80 40 60 100 C40 160 100 200 140 180" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none" opacity=".6" />
            </svg>
            <svg className="absolute -left-10 -bottom-12.5 w-50 h-50 2xl:w-65 2xl:h-65 opacity-20" viewBox="0 0 200 200" fill="none">
              <path d="M160 160 C120 140 40 160 20 120 C0 80 40 40 80 60 C120 80 140 140 100 160" stroke="white" strokeWidth="14" strokeLinecap="round" fill="none" />
            </svg>

            <h2 className="text-[1.6rem] xl:text-[1.8rem] 2xl:text-[2.2rem] font-extrabold text-white leading-tight relative z-1 max-w-65 xl:max-w-70 2xl:max-w-85">
              Acompanhe e otimize o tratamento dos seus pacientes.
            </h2>

            {/* Dots */}
            <div className="absolute bottom-5 right-7 xl:bottom-6 xl:right-8 2xl:bottom-8 2xl:right-10 flex gap-2 z-1">
              <div className="w-8 xl:w-9 2xl:w-11 h-2 rounded bg-white" />
              <div className="w-6 xl:w-7 2xl:w-9 h-2 rounded bg-white/40" />
              <div className="w-6 xl:w-7 2xl:w-9 h-2 rounded bg-white/40" />
            </div>
          </div>
        </div>

        {/* Mini card: Adesão ao tratamento — top left */}
        <div
          className="absolute z-10 bg-white rounded-[14px] 2xl:rounded-[18px] px-4 py-3 xl:px-5 xl:py-3.5 2xl:px-6 2xl:py-4 shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex items-center gap-3 2xl:gap-4 text-[0.8rem] xl:text-[0.85rem] 2xl:text-[0.95rem] font-semibold top-2 -left-10 xl:top-1 xl:-left-5 2xl:top-0 2xl:-left-2.5"
          style={{ animation: 'float 4s ease-in-out infinite 1s' }}
        >
          <div className="w-9 h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-[10px] 2xl:rounded-[14px] bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
            <TrendingUp size={18} className="xl:hidden" />
            <TrendingUp size={20} className="hidden xl:block 2xl:hidden" />
            <TrendingUp size={24} className="hidden 2xl:block" />
          </div>
          <div>
            <div className="text-(--text) whitespace-nowrap">Adesão ao tratamento</div>
            <div className="text-teal-500 font-bold">+94%</div>
          </div>
        </div>

        {/* Mini card: Alertas em tempo real — bottom right */}
        <div
          className="absolute z-10 bg-white rounded-[14px] 2xl:rounded-[18px] px-4 py-3 xl:px-5 xl:py-3.5 2xl:px-6 2xl:py-4 shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex items-center gap-3 2xl:gap-4 text-[0.8rem] xl:text-[0.85rem] 2xl:text-[0.95rem] font-semibold bottom-8 -right-10 xl:bottom-9 xl:-right-7 2xl:bottom-10 2xl:-right-5"
          style={{ animation: 'float 4s ease-in-out infinite 2.5s' }}
        >
          <div className="w-9 h-9 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-[10px] 2xl:rounded-[14px] bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white shrink-0">
            <Zap size={18} className="xl:hidden" />
            <Zap size={20} className="hidden xl:block 2xl:hidden" />
            <Zap size={24} className="hidden 2xl:block" />
          </div>
          <div>
            <div className="text-(--text) whitespace-nowrap">Alertas em tempo real</div>
            <div className="text-teal-500 font-bold">Ativo</div>
          </div>
        </div>
      </div>
    </section>
  )
}
