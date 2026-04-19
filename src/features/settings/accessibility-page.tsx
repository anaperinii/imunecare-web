import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Contrast, MousePointer, Eye } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function AccessibilityPage() {
  const navigate = useNavigate()
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [focusIndicators, setFocusIndicators] = useState(true)

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Acessibilidade</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Visual */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Visual</h2>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Alto contraste', desc: 'Aumenta o contraste entre texto e fundo', icon: Contrast, value: highContrast, set: setHighContrast },
                  { label: 'Texto ampliado', desc: 'Aumenta o tamanho base da fonte em 20%', icon: Eye, value: largeText, set: setLargeText },
                ].map((item, i) => (
                  <div key={item.label}>
                    {i > 0 && <div className="border-t border-(--border-custom) mb-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                          <item.icon size={14} className="text-brand" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-(--text)">{item.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => item.set(!item.value)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", item.value ? "bg-brand" : "bg-gray-300")}>
                        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", item.value ? "left-5.5" : "left-0.5")} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Movimento e navegação */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Movimento e Navegação</h2>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Reduzir animações', desc: 'Minimiza transições e efeitos de movimento', icon: MousePointer, value: reducedMotion, set: setReducedMotion },
                  { label: 'Indicadores de foco visíveis', desc: 'Destaca o elemento selecionado ao navegar por teclado', icon: Eye, value: focusIndicators, set: setFocusIndicators },
                ].map((item, i) => (
                  <div key={item.label}>
                    {i > 0 && <div className="border-t border-(--border-custom) mb-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                          <item.icon size={14} className="text-brand" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-(--text)">{item.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => item.set(!item.value)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", item.value ? "bg-brand" : "bg-gray-300")}>
                        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", item.value ? "left-5.5" : "left-0.5")} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
