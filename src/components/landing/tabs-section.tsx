import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { FileText, CalendarDays, LayoutDashboard, User } from 'lucide-react'
import dashboardImg from '@/assets/dashboard-landing.png'
import reportImg from '@/assets/report-landing.png'
import appointmentsImg from '@/assets/appointments-landing.png'
import patientImg from '@/assets/patient-landing.png'

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
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Visão geral em tempo real',
    description: 'Acompanhe os principais indicadores da sua clínica em um só lugar: pacientes ativos, distribuição por concentração, fases do protocolo e status de imunoterapias.',
    link: 'Ver dashboard completo',
    icon: LayoutDashboard,
  },
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
    id: 'patient',
    label: 'Prontuário',
    title: 'Prontuário eletrônico completo',
    description: 'Acompanhe a evolução de cada paciente em detalhes: histórico de aplicações, progressão de doses, reações adversas, calendário e timeline completa do tratamento.',
    link: 'Explorar prontuário',
    icon: User,
  },
]

export function TabsSection() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const active = tabs.find((t) => t.id === activeTab)!

  return (
    <section className="py-24 px-[5%] relative overflow-hidden">
      {/* Top seam (from TestimonialsSection bottom) */}
      <div className="pointer-events-none absolute -top-28 -left-20 w-95 h-95 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-32 -right-20 w-100 h-100 rounded-full bg-cyan-100/25 blur-3xl" />
      {/* Mid decorative */}
      <div className="pointer-events-none absolute top-1/2 left-1/3 w-75 h-75 rounded-full bg-teal-100/20 blur-3xl" />
      {/* Bottom seam (continues into CtaSection) */}
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-100 h-100 rounded-full bg-linear-to-br from-teal-200/25 to-cyan-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 w-95 h-95 rounded-full bg-teal-100/25 blur-3xl" />
      <div className="reveal text-center max-w-150 mx-auto mb-12 relative">
        <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase text-teal-600 bg-white border border-teal-200 px-4 py-1.5 rounded-full mb-4">
          Aprofunde-se
        </span>
        <h2 className="text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-[-0.5px] leading-[1.15] mx-auto">
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
        <div className="reveal bg-gray-50/80 border border-(--border-custom) rounded-2xl p-3 relative overflow-hidden shadow-[0_8px_40px_rgba(0,70,40,0.08)]">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="ml-2 flex-1 bg-white border border-(--border-custom) rounded-md h-4 flex items-center px-2">
              <span className="text-[0.5rem] text-(--text-muted) font-medium">
                imunecare.com.br/{activeTab === 'dashboard' ? 'dashboard' : activeTab === 'reports' ? 'export-report' : activeTab === 'scheduling' ? 'appointments' : 'patient'}
              </span>
            </div>
          </div>
          {/* Screenshot container with crossfade */}
          <div className="bg-white rounded-xl border border-(--border-custom) shadow-[0_2px_12px_rgba(0,70,40,0.05)] overflow-hidden relative">
            {[
              { id: 'dashboard', src: dashboardImg, alt: 'Dashboard' },
              { id: 'reports', src: reportImg, alt: 'Relatório' },
              { id: 'scheduling', src: appointmentsImg, alt: 'Agendamentos' },
              { id: 'patient', src: patientImg, alt: 'Prontuário' },
            ].map((tab, i) => (
              <img
                key={tab.id}
                src={tab.src}
                alt={tab.alt}
                className={cn(
                  "w-full block transition-opacity duration-500 ease-out",
                  i === 0 ? "relative" : "absolute inset-0",
                  activeTab === tab.id ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
