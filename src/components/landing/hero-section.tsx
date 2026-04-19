import { Link } from '@tanstack/react-router'
import patientImg from '@/assets/patient-hero-section.png'

export function HeroSection() {
  return (
    <section className="min-h-screen pt-30 pb-20 px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-125 h-125 rounded-full bg-linear-to-br from-teal-200/30 to-cyan-200/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-112.5 h-112.5 rounded-full bg-linear-to-br from-cyan-200/20 to-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 w-95 h-95 rounded-full bg-linear-to-br from-teal-200/25 to-cyan-100/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-75 h-75 rounded-full bg-teal-100/40 blur-3xl" />
      {/* Left content */}
      <div className="reveal">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-4 py-1.5 rounded-full text-[0.8rem] font-semibold mb-6">
          <span className="bg-teal-500 text-white px-2 py-0.5 rounded-full text-[0.7rem]">Beta</span>
          Versão beta em 2026
        </div>

        <h1 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-extrabold leading-tight tracking-[-1px] mb-5 bg-[linear-gradient(150deg,var(--text)_0%,var(--color-teal-800)_60%,var(--color-cyan-600)_100%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
          Centralize e otimize a gestão de imunoterapias alérgicas
        </h1>

        <p className="text-[1.05rem] text-(--text-muted) leading-[1.7] max-w-120 mb-8">
          Plataforma completa para clínicas e profissionais de saúde acompanharem, gerenciarem e otimizarem protocolos de imunoterapia alérgica em um único lugar.
        </p>

        <div className="flex gap-3 flex-wrap">
          <Link
            to="/trial"
            className="px-6 py-2.5 rounded-full border-none bg-linear-to-br from-brand to-teal-400 text-white font-semibold text-[0.9rem] cursor-pointer transition-all duration-250 shadow-[0_4px_20px_rgba(24,193,203,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(24,193,203,0.4)] no-underline"
          >
            Solicitar demonstração
          </Link>
        </div>
      </div>

      {/* Right: Tablet mockup with patient chart */}
      <div className="hidden lg:flex items-center justify-center reveal overflow-visible" style={{ animationDelay: '0.1s', perspective: '1400px', perspectiveOrigin: '70% 50%' }}>
        <div className="relative w-full max-w-5xl">
          {/* Tablet frame with 3D depth effect */}
          <div
            className="bg-gray-900 rounded-4xl p-3 shadow-[0_40px_100px_rgba(0,70,40,0.35),0_16px_40px_rgba(20,184,166,0.25)] relative transition-transform"
            style={{ transform: 'rotateY(-22deg) rotateX(4deg) translateX(40px)', transformStyle: 'preserve-3d' }}
          >
            {/* Depth gradient overlay — darker on the left side (further back) */}
            <div className="absolute inset-0 rounded-4xl pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.04) 40%, transparent 70%)', zIndex: 5 }} />
            {/* Subtle top speaker */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gray-700" />
            {/* Front camera */}
            <div className="absolute top-4.5 right-6 w-1.5 h-1.5 rounded-full bg-gray-700 ring-1 ring-gray-600" />

            {/* Screen */}
            <div className="bg-white rounded-[1.4rem] overflow-hidden border border-gray-800 aspect-2/1">
              <img src={patientImg} alt="Prontuário do paciente" className="w-full h-full object-cover object-top-left" />
            </div>

            {/* Bottom home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-gray-700" />
          </div>

          {/* Floating badge on top-left */}
          <div className="absolute -top-4 -left-6 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,70,40,0.12)] px-3 py-2 flex items-center gap-2 border border-(--border-custom) z-10">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-[0.65rem] font-extrabold text-brand flex items-center justify-center shrink-0">CF</div>
            <div>
              <div className="text-[0.7rem] font-bold text-(--text) leading-tight">Caroline Ferreira</div>
              <div className="text-[0.55rem] text-(--text-muted)">Próxima · Hoje 14h30</div>
            </div>
          </div>

          {/* Floating card on bottom-right — Progressão */}
          <div className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-[0_8px_24px_rgba(0,70,40,0.12)] px-3.5 py-2.5 border border-(--border-custom) z-10 w-52">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider">Progressão</span>
              <span className="text-[0.55rem] font-bold text-brand">75%</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { conc: '1:10.000', color: '#B6F2EC', active: true },
                { conc: '1:1.000', color: '#2CD3C1', active: true },
                { conc: '1:100', color: '#18C1CB', active: true },
                { conc: '1:10', color: '#0E99A3', active: false },
              ].map((s) => (
                <div key={s.conc} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: s.active ? s.color : '#E5E7EB' }} />
              ))}
            </div>
            <div className="text-[0.5rem] text-(--text-muted) mt-1.5 font-medium">Próxima dose: <span className="font-bold text-(--text)">1:10 — 0,5ml</span></div>
          </div>

        </div>
      </div>
    </section>
  )
}
