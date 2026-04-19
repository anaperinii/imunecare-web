import type { LucideIcon } from 'lucide-react'
import { Eye, Dna, Zap, Map } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SplitFeature {
  icon: LucideIcon
  title: string
  description: string
}

const splitFeatures: SplitFeature[] = [
  { icon: Eye, title: 'Veja tudo de relance', description: 'Monitore o status de cada paciente, fase do protocolo e próxima aplicação em tempo real.' },
  { icon: Dna, title: 'Protocolos como você pensa', description: 'Configure fases de indução e manutenção com concentrações, volumes e intervalos que refletem sua lógica clínica.' },
  { icon: Zap, title: 'Progressão automática de doses', description: 'O sistema calcula a próxima dose com base no protocolo validado, eliminando erros manuais.' },
  { icon: Map, title: 'Rastreabilidade completa', description: 'Cada decisão terapêutica é registrada — da prescrição à aplicação, com histórico auditável.' },
]

export function SplitSection() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Top seam (from FeaturesGrid bottom) */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-105 h-105 rounded-full bg-linear-to-br from-teal-200/20 to-cyan-200/15 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 -right-20 w-90 h-90 rounded-full bg-cyan-200/20 blur-3xl" />
      {/* Bottom seam (continues into AiSection) */}
      <div className="pointer-events-none absolute -bottom-28 -left-16 w-95 h-95 rounded-full bg-linear-to-br from-cyan-200/20 to-teal-300/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-100 h-100 rounded-full bg-teal-200/20 blur-3xl" />
    <div id="about" className="reveal grid grid-cols-1 lg:grid-cols-2 gap-[5%] items-center bg-(--bg2) rounded-4xl p-6 sm:p-8 lg:p-16 mx-[5%] relative">
      {/* Visual panel */}
      <div className="bg-linear-to-br from-teal-500 to-cyan-400 rounded-3xl p-8 sm:p-10 min-h-70 sm:min-h-80 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative waves */}
        <svg className="absolute -right-10 -top-10 w-60 h-60 opacity-20" viewBox="0 0 280 280" fill="none">
          <path d="M240 40 C200 20, 120 60, 100 120 C80 180, 140 220, 180 200 C220 180, 240 120, 200 100 C160 80, 100 120, 120 160" stroke="white" strokeWidth="16" strokeLinecap="round" fill="none" />
          <path d="M200 20 C160 0, 80 40, 60 100 C40 160, 100 200, 140 180" stroke="white" strokeWidth="10" strokeLinecap="round" fill="none" opacity=".6" />
        </svg>
        <svg className="absolute -left-8 -bottom-10 w-44 h-44 opacity-15" viewBox="0 0 200 200" fill="none">
          <path d="M160 160 C120 140, 40 160, 20 120 C0 80, 40 40, 80 60 C120 80, 140 140, 100 160" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none" />
        </svg>

        <h3 className="text-xl sm:text-[1.5rem] font-extrabold text-white max-w-65 leading-[1.3] relative z-1">
          Controle total do ciclo imunoterápico com segurança e clareza
        </h3>

        {/* Mini protocol visualization */}
        <div className="relative z-1 mt-8">
          <div className="text-[0.65rem] text-white/70 font-semibold uppercase tracking-wider mb-2.5">Progressão do protocolo</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['1:10.000', '1:1.000', '1:100', '1:10'].map((conc, i) => (
              <div key={conc} className="flex items-center gap-1.5">
                <div className={cn("px-2.5 py-1 rounded-full text-[0.65rem] font-bold backdrop-blur-md border", i <= 1 ? "bg-white text-teal-700 border-white" : "bg-white/15 text-white border-white/25")}>
                  {conc}
                </div>
                {i < 3 && <span className="text-white/50 text-xs">→</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
            </div>
            <span className="text-[0.7rem] font-bold text-white">60%</span>
          </div>
        </div>
      </div>

      {/* Features list */}
      <div className="py-4">
        {splitFeatures.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="flex gap-4 mb-7 last:mb-0">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <Icon size={20} className="text-teal-600" />
              </div>
              <div>
                <h4 className="text-[0.95rem] font-bold mb-1">{feature.title}</h4>
                <p className="text-[0.85rem] text-(--text-muted) leading-normal">{feature.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </section>
  )
}
