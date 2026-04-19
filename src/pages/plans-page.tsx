import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, Zap, Building, Crown, CreditCard, Calendar, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Gratuito',
    period: '',
    desc: 'Para clínicas iniciando com imunoterapia',
    icon: Zap,
    features: ['Até 50 pacientes', 'Protocolo SCIT básico', '1 profissional', 'Dashboard básico', 'Suporte por e-mail'],
    current: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 'R$ 197',
    period: '/mês',
    desc: 'Para clínicas em crescimento',
    icon: Building,
    features: ['Até 500 pacientes', 'Protocolos SCIT e SLIT', 'Até 10 profissionais', 'Dashboard completo', 'Relatórios exportáveis', 'Agendamentos', 'Suporte prioritário'],
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    desc: 'Para redes de clínicas e hospitais',
    icon: Crown,
    features: ['Pacientes ilimitados', 'Todos os protocolos', 'Profissionais ilimitados', 'Multi-unidade', 'API de integração', 'Auditoria avançada', 'Gerente de conta dedicado', 'SLA 99.9%'],
    current: false,
  },
]

const maxFeatures = Math.max(...plans.map((p) => p.features.length))

export function PlansPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Planos e Serviços</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Current plan info */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Seu plano atual</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 shrink-0">
                      <Building size={18} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-(--text)">Professional</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Ativo desde Março 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-(--text)">R$ 197<span className="text-xs font-medium text-(--text-muted)">/mês</span></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: CreditCard, label: 'Método de pagamento', value: 'Visa •••• 4242' },
                    { icon: Calendar, label: 'Próxima cobrança', value: '01/05/2026' },
                    { icon: Receipt, label: 'Último pagamento', value: '01/04/2026 — R$ 197,00' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={11} className="text-(--text-muted)" />
                          <span className="text-[0.6rem] text-(--text-muted)">{item.label}</span>
                        </div>
                        <div className="text-xs font-medium text-(--text)">{item.value}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="h-8 px-3 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer">
                    Alterar método de pagamento
                  </button>
                  <button className="h-8 px-3 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer">
                    Ver faturas
                  </button>
                  <button className="h-8 px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer">
                    Cancelar assinatura
                  </button>
                </div>
              </div>
            </div>

            {/* Plans comparison */}
            <div>
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold text-(--text)">Comparar planos</h2>
                <p className="text-[0.65rem] text-(--text-muted) mt-0.5">Escolha o plano ideal para sua clínica</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const Icon = plan.icon
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "border rounded-xl overflow-hidden transition-all flex flex-col",
                        plan.current ? "border-brand shadow-[0_0_0_1px_#18C1CB,0_8px_24px_rgba(24,193,203,0.1)]" : "border-(--border-custom) hover:border-gray-300"
                      )}
                    >
                      {plan.current && (
                        <div className="bg-linear-to-r from-brand to-teal-400 text-center py-1.5 text-[0.6rem] font-bold text-white uppercase tracking-wider">
                          Plano atual
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-brand/10">
                            <Icon size={16} className="text-brand" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-(--text)">{plan.name}</div>
                            <div className="text-[0.6rem] text-(--text-muted)">{plan.desc}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-xl font-extrabold text-(--text)">{plan.price}</span>
                          {plan.period && <span className="text-xs text-(--text-muted)">{plan.period}</span>}
                        </div>

                        <div className="space-y-2 flex-1">
                          {plan.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-xs text-(--text-muted)">
                              <Check size={12} className="text-brand shrink-0" />
                              {f}
                            </div>
                          ))}
                          {/* Spacers para igualar altura */}
                          {Array.from({ length: maxFeatures - plan.features.length }).map((_, i) => (
                            <div key={`spacer-${i}`} className="h-5" />
                          ))}
                        </div>

                        <div className="mt-5">
                          {plan.current ? (
                            <button className="w-full h-9 rounded-lg border border-brand text-xs font-semibold text-brand cursor-default">
                              Plano atual
                            </button>
                          ) : (
                            <button className="w-full h-9 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold transition-all cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,193,203,0.3)]">
                              {plan.price === 'Sob consulta' ? 'Falar com vendas' : 'Fazer upgrade'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
