import { useCounter, formatCount } from '@/lib/use-counter'

interface NumberItemProps {
  target: number
  suffix: string
  label: string
}

function NumberItem({ target, suffix, label }: NumberItemProps) {
  const { count, ref } = useCounter(target)

  return (
    <div ref={ref} className="text-center">
      <strong className="block text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold leading-none gradient-text mb-1.5">
        {formatCount(count, suffix)}
      </strong>
      <span className="text-[0.9rem] text-(--text-muted) font-medium">{label}</span>
    </div>
  )
}

export function NumbersSection() {
  return (
    <div className="reveal text-center py-20 px-[5%] bg-linear-to-br from-teal-50 via-teal-100/60 to-cyan-50 relative overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-125 h-125 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-0 right-0 w-75 h-75 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="relative">
      <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase text-teal-600 bg-white border border-teal-200 px-4 py-1.5 rounded-full mb-4">
        Nossos números
      </span>
      <h2 className="text-[clamp(1.4rem,2.8vw,2.1rem)] font-extrabold tracking-[-0.5px] leading-[1.15] max-w-160 mx-auto">
        Resultados que falam por si
      </h2>
      <div className="flex gap-8 sm:gap-16 justify-center flex-wrap mt-12">
        <NumberItem target={1200} suffix="+" label="Profissionais ativos" />
        <NumberItem target={18000} suffix="+" label="Pacientes" />
        <NumberItem target={94000} suffix="+" label="Aplicações registradas" />
        <NumberItem target={99} suffix=".9%" label="Disponibilidade" />
      </div>
      </div>
    </div>
  )
}
