import {
  Shield,
  Settings,
  Monitor,
  Info,
  Users,
  CreditCard,
  Accessibility,
  HelpCircle,
  Pencil,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SettingsOption {
  icon: LucideIcon
  label: string
  description: string
}

const settingsOptions: SettingsOption[] = [
  { icon: Shield, label: 'Segurança e Privacidade', description: 'Autenticação, sessões e políticas de acesso' },
  { icon: Settings, label: 'Configurações Avançadas', description: 'Parâmetros técnicos e integrações' },
  { icon: Monitor, label: 'Personalização do Sistema', description: 'Temas, idioma e preferências visuais' },
  { icon: Info, label: 'Sobre o Sistema', description: 'Versão, licença e informações técnicas' },
  { icon: Users, label: 'Gerenciar Equipes e Convites', description: 'Membros, permissões e convites pendentes' },
  { icon: CreditCard, label: 'Planos e Serviços', description: 'Assinatura, faturamento e limites' },
  { icon: Accessibility, label: 'Acessibilidade', description: 'Contraste, tamanho de fonte e navegação' },
  { icon: HelpCircle, label: 'Ajuda', description: 'Central de ajuda, documentação e suporte' },
]

export function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="flex flex-1 gap-6 p-5 min-h-0 overflow-y-auto">
          {/* Left — Profile */}
          <div className="w-64 shrink-0">
            <h1 className="text-2xl font-bold text-(--text) mb-5">Configurações</h1>

            <div className="border border-(--border-custom) rounded-xl p-5">
              {/* Avatar */}
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="flex h-18 w-18 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-400">
                    <span className="text-xl font-bold text-white">DU</span>
                  </div>
                  <button className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-(--border-custom) shadow-sm hover:bg-teal-50 transition-all">
                    <Pencil size={11} className="text-teal-600" />
                  </button>
                </div>
              </div>

              {/* Name */}
              <div className="text-center mb-4">
                <div className="text-sm font-semibold text-(--text)">Dr. Usuário</div>
                <div className="text-[0.7rem] text-(--text-muted)">Administrador</div>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button className="w-full h-8 rounded-lg bg-linear-to-br from-teal-500 to-cyan-500 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
                  Seu Perfil
                </button>
              </div>
            </div>
          </div>

          {/* Right — Options */}
          <div className="flex-1 space-y-1.5 pt-12">
            {settingsOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.label}
                  className="flex w-full items-center gap-3.5 rounded-lg border border-(--border-custom) bg-white p-3 text-left transition-all hover:border-teal-300 hover:shadow-[0_2px_8px_rgba(20,184,166,0.08)] group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-teal-50 transition-colors shrink-0">
                    <Icon size={17} className="text-(--text-muted) group-hover:text-teal-600 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-(--text)">{option.label}</div>
                    <div className="text-[0.65rem] text-(--text-muted)">{option.description}</div>
                  </div>
                  <ChevronRight size={14} className="text-(--text-muted)/40 group-hover:text-teal-500 transition-colors shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
