import type { LucideIcon } from 'lucide-react'
import { Eye, Dna, Zap, Map } from 'lucide-react'

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
    <div id="about" className="reveal grid grid-cols-1 lg:grid-cols-2 gap-[5%] items-center bg-(--bg2) rounded-4xl p-6 sm:p-8 lg:p-16 mx-[5%]">
      {/* Visual panel */}
      <div className="bg-linear-to-br from-teal-500 to-cyan-400 rounded-3xl p-8 sm:p-10 min-h-70 sm:min-h-80 flex flex-col justify-between relative overflow-hidden">
        <h3 className="text-xl sm:text-[1.5rem] font-extrabold text-white max-w-65 leading-[1.3]">
          Controle total do ciclo imunoterápico com segurança e clareza
        </h3>
        <div className="flex gap-4 flex-wrap mt-6">
          <div className="bg-white/20 rounded-xl px-5 py-3 text-white backdrop-blur-lg">
            <strong className="block text-[1.4rem] font-extrabold">3.6k+</strong>
            <span className="text-[0.75rem] opacity-85">Ciclos registrados</span>
          </div>
          <div className="bg-white/20 rounded-xl px-5 py-3 text-white backdrop-blur-lg">
            <strong className="block text-[1.4rem] font-extrabold">99.9%</strong>
            <span className="text-[0.75rem] opacity-85">Uptime</span>
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
  )
}
