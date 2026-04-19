const testimonials = [
  { quote: 'O ImuneCare transformou a gestão da nossa clínica. Antes dependíamos de planilhas — agora temos controle total dos protocolos.', name: 'Dra. Sofia Andrade', handle: '@sofia.alergista', initials: 'SA' },
  { quote: 'O cálculo automático de doses eliminou os erros manuais. Minha equipe confia muito mais no processo agora.', name: 'Dr. Marcos Rezende', handle: '@mrezende_imuno', initials: 'MR' },
  { quote: 'Consigo acompanhar cada paciente em diferentes fases do protocolo sem perder nenhum detalhe. Ferramenta essencial.', name: 'Dra. Camila Alves', handle: '@camilaalergol', initials: 'CA' },
  { quote: 'A rastreabilidade das aplicações e reações adversas nos deu uma segurança clínica que não tínhamos antes.', name: 'Dr. Rodrigo Figueiredo', handle: '@rodrifig', initials: 'RF' },
  { quote: 'Os dashboards analíticos me ajudam a tomar decisões clínicas mais informadas sobre a progressão dos pacientes.', name: 'Dra. Larissa Pinheiro', handle: '@larissapin', initials: 'LP' },
  { quote: 'Implementação foi simples e a equipe toda adotou rápido. O suporte é excelente.', name: 'Dr. Bruno Nascimento', handle: '@brunon_med', initials: 'BN' },
]

function TestimonialCard({ quote, name, handle, initials }: typeof testimonials[number]) {
  return (
    <div className="w-75 shrink-0 bg-(--card) border-[1.5px] border-(--border-custom) rounded-(--radius) p-6">
      <blockquote className="text-[0.875rem] text-(--text-muted) leading-[1.6] mb-4">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-[0.75rem] font-bold text-white">
          {initials}
        </div>
        <div>
          <div className="text-[0.85rem] font-bold">{name}</div>
          <div className="text-[0.75rem] text-(--text-muted)">{handle}</div>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="overflow-hidden py-20 relative">
      {/* Top seam (from PricingSection bottom) */}
      <div className="pointer-events-none absolute -top-32 -left-16 w-95 h-95 rounded-full bg-cyan-100/25 blur-3xl" />
      <div className="pointer-events-none absolute -top-28 -right-24 w-105 h-105 rounded-full bg-teal-200/20 blur-3xl" />
      {/* Mid decorative */}
      <div className="pointer-events-none absolute top-1/2 right-1/4 w-75 h-75 rounded-full bg-teal-200/20 blur-3xl" />
      {/* Bottom seam (continues into TabsSection) */}
      <div className="pointer-events-none absolute -bottom-28 -left-20 w-95 h-95 rounded-full bg-teal-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 w-100 h-100 rounded-full bg-cyan-100/25 blur-3xl" />
      <div className="reveal px-[5%] pb-12 relative">
        <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase text-teal-600 bg-teal-50 border border-teal-200 px-4 py-1.5 rounded-full mb-4">
          Depoimentos
        </span>
        <h2 className="text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-[-0.5px] leading-[1.15] max-w-160">
          Quem usa, recomenda
        </h2>
      </div>

      <div
        className="flex gap-6 hover:paused"
        style={{
          animation: 'scroll-left 30s linear infinite',
          width: 'max-content',
        }}
      >
        {[...testimonials, ...testimonials].map((t, i) => (
          <TestimonialCard key={`${t.initials}-${i}`} {...t} />
        ))}
      </div>
    </section>
  )
}
