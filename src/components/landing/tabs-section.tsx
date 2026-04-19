import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { FileText, CalendarDays, Zap } from 'lucide-react'

interface Tab {
  id: string
  label: string
  title: string
  description: string
  link: string
  icon: LucideIcon
}

const tabs: Tab[] = [
  {
    id: 'reports',
    label: 'Relatórios Clínicos',
    title: 'Relatórios detalhados e exportáveis',
    description: 'Gere relatórios completos com histórico de aplicações, progressão de doses e reações adversas. Exporte em PDF, Excel ou CSV para auditoria e acompanhamento.',
    link: 'Explorar ferramentas de relatório',
    icon: FileText,
  },
  {
    id: 'scheduling',
    label: 'Agendamentos',
    title: 'Gestão inteligente de agendamentos',
    description: 'Visualize e gerencie aplicações agendadas em visão semanal ou mensal. Intervalos calculados automaticamente com base no protocolo de cada paciente.',
    link: 'Ver funcionalidades de agenda',
    icon: CalendarDays,
  },
  {
    id: 'automation',
    label: 'Automações',
    title: 'Automações de protocolo',
    description: 'Configure alertas, progressão automática de doses e notificações adaptadas ao protocolo da sua clínica. Menos trabalho manual, mais segurança.',
    link: 'Criar primeira automação',
    icon: Zap,
  },
]

export function TabsSection() {
  const [activeTab, setActiveTab] = useState('reports')
  const active = tabs.find((t) => t.id === activeTab)!
  const ActiveIcon = active.icon

  return (
    <section className="py-24 px-[5%] bg-(--bg2)">
      <div className="reveal text-center max-w-150 mx-auto mb-12">
        <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase text-teal-600 bg-white border border-teal-200 px-4 py-1.5 rounded-full mb-4">
          Aprofunde-se
        </span>
        <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-[-1px] leading-[1.15] mx-auto">
          Projetado para o fluxo clínico real
        </h2>
        <p className="text-base text-(--text-muted) mt-3 mx-auto leading-[1.7]">
          Cada funcionalidade reflete as necessidades reais de clínicas de imunoterapia alérgica.
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 justify-center flex-wrap mb-12">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2 rounded-full border-[1.5px] font-semibold text-[0.875rem] cursor-pointer transition-all duration-200",
              activeTab === tab.id
                ? "bg-linear-to-br from-brand to-teal-400 border-transparent text-white shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
                : "border-(--border-custom) bg-transparent text-(--text-muted) hover:border-teal-300 hover:text-teal-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[4%] items-center">
        <div className="reveal">
          <h3 className="text-[1.4rem] font-extrabold mb-4">{active.title}</h3>
          <p className="text-[0.95rem] text-(--text-muted) leading-[1.7] mb-6">{active.description}</p>
          <a href="#" className="text-teal-600 font-semibold text-[0.9rem] no-underline hover:underline">
            {active.link} →
          </a>
        </div>
        <div className="reveal bg-[linear-gradient(135deg,var(--color-teal-50),var(--color-teal-100))] border-[1.5px] border-teal-200 rounded-3xl min-h-70 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(20,184,166,0.15)_0%,transparent_60%)]" />
          <ActiveIcon size={64} className="relative z-10 text-teal-400" strokeWidth={1.5} />
        </div>
      </div>
    </section>
  )
}
