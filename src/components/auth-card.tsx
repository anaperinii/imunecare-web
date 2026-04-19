import { useState } from 'react'
import { cn } from '@/lib/utils'

const SLIDES = [
  'Centralize, acompanhe e otimize o tratamento imunoterápico dos seus pacientes.',
  'Tecnologia que cuida para você se concentrar no que realmente transforma vidas.',
  'Mais clareza nos ciclos, mais confiança nas decisões. Imunoterapia conduzida com excelência.',
]

interface AuthCardProps {
  initialSlide?: number
  className?: string
  style?: React.CSSProperties
}

export function AuthCard({ initialSlide = 0, className, style }: AuthCardProps) {
  const [current, setCurrent] = useState(initialSlide)
  const [fading, setFading] = useState(false)

  function goTo(index: number) {
    if (index === current || fading) return
    setFading(true)
    setTimeout(() => {
      setCurrent(index)
      setFading(false)
    }, 220)
  }

  return (
    <div className={cn("hidden md:flex flex-1 min-h-120 max-h-140 relative rounded-3xl overflow-hidden bg-linear-to-br from-teal-500 via-cyan-500 to-teal-400 p-10", className)} style={style}>
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-cyan-600/40 blur-3xl" />
      </div>

      {/* Swirl SVG — same as hero card */}
      <svg className="absolute -right-15 -top-15 w-70 h-70 opacity-25" viewBox="0 0 280 280" fill="none">
        <path d="M240 40 C200 20 120 60 100 120 C80 180 140 220 180 200 C220 180 240 120 200 100 C160 80 100 120 120 160" stroke="white" strokeWidth="18" strokeLinecap="round" fill="none" />
        <path d="M200 20 C160 0 80 40 60 100 C40 160 100 200 140 180" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none" opacity=".6" />
      </svg>
      <svg className="absolute -left-10 -bottom-12.5 w-50 h-50 opacity-20" viewBox="0 0 200 200" fill="none">
        <path d="M160 160 C120 140 40 160 20 120 C0 80 40 40 80 60 C120 80 140 140 100 160" stroke="white" strokeWidth="14" strokeLinecap="round" fill="none" />
      </svg>

      {/* Slide text */}
      <div
        className="relative z-10 max-w-sm flex items-end"
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        <p className="text-white font-medium text-[clamp(1.6rem,2.5vw,2.1rem)] leading-[1.35]">
          {SLIDES[current]}
        </p>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full transition-all duration-300 focus:outline-none"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              backgroundColor: i === current ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: i === current ? 'default' : 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}
