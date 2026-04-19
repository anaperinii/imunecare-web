import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Book, MessageCircle, Mail, ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  { q: 'Como cadastrar um novo paciente?', a: 'Acesse Imunoterapias > Adicionar Imunoterapia. O cadastro do paciente é feito na primeira etapa do fluxo, seguido da prescrição do protocolo.' },
  { q: 'Como funciona o cálculo automático de doses?', a: 'O sistema segue o protocolo SCIT padrão: progressão de volume (0,1 → 0,2 → 0,4 → 0,8ml) dentro de cada concentração (1:10.000 → 1:1.000 → 1:100 → 1:10), com intervalo de 7 dias na indução.' },
  { q: 'Posso ajustar o protocolo manualmente?', a: 'Sim. O médico responsável pode alterar concentração, volume e intervalo a qualquer momento, mediante justificativa clínica obrigatória.' },
  { q: 'Como exportar relatórios?', a: 'Acesse Dashboard > Exportar Relatório. Você pode escolher o formato (PDF, Excel, CSV), período e quais gráficos incluir.' },
  { q: 'O que acontece quando o paciente não comparece?', a: 'A aplicação é marcada como "Ausente" no agendamento. O sistema alerta para avaliação sobre necessidade de retroceder doses antes de prosseguir.' },
]

export function HelpPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Ajuda</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Quick links */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Book, label: 'Documentação', desc: 'Guias e tutoriais', color: '#18C1CB' },
                { icon: MessageCircle, label: 'Chat de suporte', desc: 'Fale com a equipe', color: '#6366F1' },
                { icon: Mail, label: 'E-mail', desc: 'suporte@imunecare.com', color: '#F4845F' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.label} className="border border-(--border-custom) rounded-xl p-4 text-left hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg mb-2.5" style={{ backgroundColor: item.color + '15' }}>
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <div className="text-xs font-semibold text-(--text) flex items-center gap-1">
                      {item.label}
                      <ExternalLink size={10} className="text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[0.6rem] text-(--text-muted) mt-0.5">{item.desc}</div>
                  </button>
                )
              })}
            </div>

            {/* FAQ */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Perguntas frequentes</h2>
              </div>
              <div className="divide-y divide-(--border-custom)">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-medium text-(--text) pr-4">{faq.q}</span>
                      <ChevronDown size={14} className={cn("text-(--text-muted) shrink-0 transition-transform", openFaq === i && "rotate-180")} />
                    </button>
                    <div className={cn("overflow-hidden transition-all duration-300", openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0")}>
                      <div className="px-4 pb-3 text-xs text-(--text-muted) leading-relaxed">{faq.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Version */}
            <div className="text-center text-[0.65rem] text-(--text-muted) py-2">
              ImuneCare v2.0.0-beta · Precisa de ajuda? Entre em contato pelo chat.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
