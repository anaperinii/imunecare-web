import { useNavigate } from '@tanstack/react-router'
import {
  Shield,
  Settings,
  Monitor,
  Info,
  Users,
  CreditCard,
  Accessibility,
  HelpCircle,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SettingsOption {
  icon: LucideIcon
  label: string
  description: string
  route?: string
}

const settingsOptions: SettingsOption[] = [
  { icon: Shield, label: 'Segurança e Privacidade', description: 'Autenticação, sessões e políticas de acesso', route: '/security' },
  { icon: Settings, label: 'Configurações Avançadas', description: 'Parâmetros técnicos e integrações', route: '/advanced-settings' },
  { icon: Monitor, label: 'Personalização do Sistema', description: 'Temas, idioma e preferências visuais', route: '/personalization' },
  { icon: Info, label: 'Sobre o Sistema', description: 'Versão, licença e informações técnicas', route: '/about' },
  { icon: Users, label: 'Gerenciar Equipes e Convites', description: 'Membros, permissões e convites pendentes', route: '/teams' },
  { icon: CreditCard, label: 'Planos e Serviços', description: 'Assinatura, faturamento e limites', route: '/plans' },
  { icon: Accessibility, label: 'Acessibilidade', description: 'Contraste, tamanho de fonte e navegação', route: '/accessibility' },
  { icon: HelpCircle, label: 'Ajuda', description: 'Central de ajuda, documentação e suporte', route: '/help' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="flex flex-1 gap-6 p-5 min-h-0 overflow-y-auto">
          {/* Left — Profile */}
          <div className="w-56 shrink-0">
            <h1 className="text-2xl font-bold text-(--text) mb-4">Configurações</h1>

            <div className="border border-(--border-custom) rounded-xl p-4">
              <div className="flex justify-center mb-2.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-400">
                  <span className="text-lg font-bold text-white">DU</span>
                </div>
              </div>

              <div className="text-center mb-3">
                <div className="text-xs font-semibold text-(--text)">Dr. Usuário</div>
                <div className="text-[0.65rem] text-(--text-muted)">Administrador</div>
              </div>

              <button onClick={() => navigate({ to: '/profile' })} className="w-full h-7 rounded-lg bg-linear-to-br from-[#18C1CB] to-teal-400 text-white text-[0.7rem] font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,193,203,0.3)] transition-all cursor-pointer">
                Seu Perfil
              </button>
            </div>
          </div>

          {/* Right — Options */}
          <div className="flex-1 pt-4">
            <div className="space-y-1.5">
              {settingsOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.label}
                    onClick={() => option.route && navigate({ to: option.route })}
                    className="flex w-full items-center gap-3.5 rounded-lg border border-(--border-custom) bg-white p-3 text-left transition-all hover:border-teal-300 hover:shadow-[0_2px_8px_rgba(20,184,166,0.08)] group cursor-pointer"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-teal-50 transition-colors shrink-0">
                      <Icon size={17} className="text-(--text-muted) group-hover:text-teal-600 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-(--text)">{option.label}</div>
                      <div className="text-[0.65rem] text-(--text-muted)">{option.description}</div>
                    </div>
                    <ChevronRight size={14} className="text-(--text-muted)/30 group-hover:text-teal-500 transition-colors shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
