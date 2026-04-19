import type { LucideIcon } from 'lucide-react'
import { Crosshair, RefreshCw, Sparkles, FolderKanban } from 'lucide-react'

interface AiFeature {
  icon: LucideIcon
  title: string
  description: string
}

const aiFeatures: AiFeature[] = [
  { icon: Crosshair, title: 'Rastreamento de Desempenho', description: 'Monitore adesão, intervalos e resultados sem precisar revisar registros manualmente.' },
  { icon: RefreshCw, title: 'Sincronização em Tempo Real', description: 'Dados do paciente, fases do protocolo e status de aplicações sempre atualizados.' },
  { icon: Sparkles, title: 'Automação Inteligente', description: 'Cálculo automático de doses e progressão de protocolo baseado em regras clínicas validadas.' },
  { icon: FolderKanban, title: 'Gestão de Protocolos', description: 'Organize e visualize protocolos de indução e manutenção como um blueprint clínico executável.' },
]

export function AiSection() {
  return (
    <section id="ai" className="py-24 px-[5%] relative overflow-hidden">
      {/* Top seam (from SplitSection bottom) */}
      <div className="pointer-events-none absolute -top-28 -left-16 w-95 h-95 rounded-full bg-linear-to-br from-cyan-200/20 to-teal-300/15 blur-3xl" />
      <div className="pointer-events-none absolute -top-32 -right-24 w-100 h-100 rounded-full bg-teal-200/20 blur-3xl" />
      {/* Bottom seam (continues into PricingSection) */}
      <div className="pointer-events-none absolute -bottom-32 -left-20 w-100 h-100 rounded-full bg-linear-to-br from-teal-200/20 to-cyan-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 w-95 h-95 rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="reveal bg-linear-to-br from-teal-800 via-teal-700 to-cyan-600 rounded-4xl p-8 sm:p-12 lg:p-16 mx-0 overflow-hidden relative">
        {/* Radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(255,255,255,0.05)_0%,transparent_60%)]" />

        <div className="relative z-10">
          <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase bg-white/15 border border-white/20 text-white px-4 py-1.5 rounded-full mb-4">
            Automação Clínica
          </span>
          <h2 className="text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-[-0.5px] leading-[1.15] max-w-130 mb-4 text-white">
            Automação inteligente para alergistas
          </h2>
          <p className="text-base text-white/70 max-w-130 leading-[1.7] mb-10">
            Do cadastro ao relatório em segundos. Defina o protocolo e o ImuneCare gerencia a progressão de doses, alertas e agendamentos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {aiFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-lg text-white transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.75"
                >
                  <div className="mb-3">
                    <Icon size={28} className="text-white/90" />
                  </div>
                  <h4 className="text-[0.9rem] font-bold mb-1.5">{feature.title}</h4>
                  <p className="text-[0.8rem] opacity-75 leading-normal">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
