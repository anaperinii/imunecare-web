import type { LucideIcon } from 'lucide-react'
import {
  ClipboardList,
  Bell,
  BarChart3,
  BotMessageSquare,
  Syringe,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  large: boolean
}

const features: Feature[] = [
  { icon: ClipboardList, title: 'Prontuário Centralizado', description: 'Todos os dados do paciente, histórico de ciclos, doses aplicadas e reações adversas em um único painel intuitivo.', large: false },
  { icon: Bell, title: 'Alertas de Reações Adversas', description: 'Registro e rastreabilidade de reações adversas com notificações em tempo real para a equipe clínica.', large: false },
  { icon: BarChart3, title: 'Dashboards Analíticos', description: 'Visualize a evolução do tratamento com gráficos de progressão de doses, fases e métricas de adesão.', large: false },
  { icon: BotMessageSquare, title: 'Cálculo Automático de Doses', description: 'Motor inteligente que calcula automaticamente a próxima concentração, volume e intervalo com base em protocolos clínicos validados, reduzindo erros manuais.', large: true },
  { icon: Syringe, title: 'Gestão de Protocolos', description: 'Controle completo das fases de indução e manutenção de cada imunoterapia alérgica.', large: false },
  { icon: ShieldCheck, title: 'Segurança LGPD', description: 'Dados criptografados end-to-end e conformidade total com a Lei Geral de Proteção de Dados.', large: false },
  { icon: Smartphone, title: 'Acesso Mobile', description: 'Acompanhe seus pacientes de qualquer lugar, pelo celular ou tablet.', large: false },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-[5%] relative overflow-hidden">
      {/* Top seam (continuation from Hero bottom blobs) */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full bg-linear-to-br from-cyan-200/20 to-teal-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-32 -right-20 w-[380px] h-[380px] rounded-full bg-linear-to-br from-teal-200/25 to-cyan-100/15 blur-3xl" />
      {/* Bottom seam (continues into SplitSection) */}
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full bg-linear-to-br from-teal-200/20 to-cyan-200/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 w-[360px] h-[360px] rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="reveal relative">
        <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase text-teal-600 bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full mb-4">
          Funcionalidades
        </span>
        <h2 className="text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-[-0.5px] leading-[1.15] max-w-160 mb-4">
          Projetado para especialistas em imunoterapia alérgica
        </h2>
        <p className="text-base text-(--text-muted) max-w-130 leading-[1.7] mb-12">
          Cada detalhe foi pensado para facilitar o dia a dia do alergista — do cadastro do paciente ao acompanhamento longitudinal do protocolo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className={`reveal bg-(--card) border-[1.5px] border-(--border-custom) rounded-(--radius) p-7 transition-all duration-250 cursor-default hover:border-teal-300 hover:shadow-[0_8px_32px_rgba(20,184,166,0.1)] hover:-translate-y-0.75 ${
                feature.large ? 'sm:col-span-2' : ''
              }`}
              style={{ transitionDelay: `${0.05 * (i + 1)}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,var(--color-teal-50),var(--color-teal-100))] border border-teal-200 flex items-center justify-center mb-4">
                <Icon size={22} className="text-teal-600" />
              </div>
              <h3 className="text-base font-bold mb-2">{feature.title}</h3>
              <p className="text-[0.875rem] text-(--text-muted) leading-[1.6]">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
