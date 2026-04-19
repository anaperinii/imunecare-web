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
    <div className="reveal text-center py-20 px-[5%] bg-teal-50">
      <span className="inline-block text-[0.75rem] font-bold tracking-[2px] uppercase text-teal-600 bg-white border border-teal-200 px-4 py-1.5 rounded-full mb-4">
        Nossos números
      </span>
      <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold tracking-[-1px] leading-[1.15] max-w-160 mx-auto">
        Resultados que falam por si
      </h2>
      <div className="flex gap-8 sm:gap-16 justify-center flex-wrap mt-12">
        <NumberItem target={1200} suffix="+" label="Profissionais ativos" />
        <NumberItem target={18000} suffix="+" label="Pacientes" />
        <NumberItem target={94000} suffix="+" label="Aplicações registradas" />
        <NumberItem target={99} suffix=".9%" label="Disponibilidade" />
      </div>
    </div>
  )
}
