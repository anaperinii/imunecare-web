import { Link } from '@tanstack/react-router'
import { Check, Zap, Building, Crown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const plans = [
  {
    name: 'Starter',
    price: 'Gratuito',
    period: '',
    desc: 'Para clínicas iniciando com imunoterapia alérgica',
    icon: Zap,
    features: ['Até 50 pacientes', 'Protocolo SCIT básico', '1 profissional', 'Dashboard básico', 'Suporte por e-mail'],
    highlighted: false,
    cta: 'Começar grátis',
  },
  {
    name: 'Professional',
    price: 'R$ 197',
    period: '/mês',
    desc: 'Para clínicas em crescimento',
    icon: Building,
    features: ['Até 500 pacientes', 'Protocolos SCIT e SLIT', 'Até 10 profissionais', 'Dashboard completo', 'Relatórios exportáveis', 'Agendamentos', 'Suporte prioritário'],
    highlighted: true,
    cta: 'Começar agora',
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    desc: 'Para redes de clínicas e hospitais',
    icon: Crown,
    features: ['Pacientes ilimitados', 'Todos os protocolos', 'Profissionais ilimitados', 'Multi-unidade', 'API de integração', 'Auditoria avançada', 'Gerente de conta dedicado', 'SLA 99.9%'],
    highlighted: false,
    cta: 'Falar com vendas',
  },
]

const maxFeatures = Math.max(...plans.map((p) => p.features.length))

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-[5%] relative overflow-hidden">
      {/* Top seam (from AiSection bottom) */}
      <div className="pointer-events-none absolute -top-32 -left-20 w-100 h-100 rounded-full bg-linear-to-br from-teal-200/20 to-cyan-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 -right-20 w-95 h-95 rounded-full bg-cyan-200/20 blur-3xl" />
      {/* Mid decorative */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-125 h-87.5 rounded-full bg-teal-100/25 blur-3xl" />
      {/* Bottom seam (continues into TestimonialsSection) */}
      <div className="pointer-events-none absolute -bottom-32 -left-16 w-95 h-95 rounded-full bg-cyan-100/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 w-105 h-105 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="reveal mb-14 relative">
        <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase text-teal-600 bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full mb-4">
          Preços
        </span>
        <h2 className="text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-[-0.5px] leading-[1.15] max-w-160">
          Planos para cada fase da sua clínica
        </h2>
        <p className="text-base text-(--text-muted) max-w-130 leading-[1.7] mt-3">
          Comece gratuitamente e escale conforme sua demanda cresce. Sem surpresas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              className={cn(
                "reveal rounded-2xl overflow-hidden flex flex-col transition-all",
                plan.highlighted
                  ? "border-2 border-brand shadow-[0_8px_32px_rgba(24,193,203,0.15)] scale-[1.02]"
                  : "border border-(--border-custom)"
              )}
            >
              {plan.highlighted && (
                <div className="bg-linear-to-r from-brand to-teal-400 text-center py-2 text-[0.7rem] font-bold text-white uppercase tracking-wider">
                  Mais popular
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 shrink-0">
                    <Icon size={20} className="text-brand" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-(--text)">{plan.name}</div>
                    <div className="text-[0.7rem] text-(--text-muted)">{plan.desc}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-(--text)">{plan.price}</span>
                  {plan.period && <span className="text-sm text-(--text-muted)">{plan.period}</span>}
                </div>

                {/* Features */}
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 shrink-0 mt-px">
                        <Check size={11} className="text-brand" />
                      </div>
                      <span className="text-[0.85rem] text-(--text-muted) leading-[1.4]">{f}</span>
                    </div>
                  ))}
                  {Array.from({ length: maxFeatures - plan.features.length }).map((_, i) => (
                    <div key={`s-${i}`} className="h-6.5" />
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-7">
                  <Link
                    to="/trial"
                    className={cn(
                      "block w-full py-3 rounded-xl text-center text-sm font-semibold transition-all no-underline cursor-pointer",
                      plan.highlighted
                        ? "bg-linear-to-br from-brand to-teal-400 text-white shadow-[0_4px_20px_rgba(24,193,203,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(24,193,203,0.4)]"
                        : "border-[1.5px] border-brand text-brand hover:bg-brand-50"
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom note */}
      <div className="reveal text-center mt-10 text-sm text-(--text-muted)">
        Todos os planos incluem criptografia end-to-end e conformidade com a LGPD.
      </div>
    </section>
  )
}
