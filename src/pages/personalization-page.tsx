import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Type, Layout } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PersonalizationPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState('light')
  const [density, setDensity] = useState('comfortable')

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Personalização do Sistema</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Tema */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Tema</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Claro', preview: 'bg-white border-2' },
                    { id: 'dark', label: 'Escuro', preview: 'bg-gray-900 border-2' },
                    { id: 'auto', label: 'Automático', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={cn("rounded-lg border p-3 text-center transition-all cursor-pointer", theme === t.id ? "border-[#18C1CB] shadow-[0_0_0_1px_#18C1CB]" : "border-(--border-custom) hover:border-gray-300")}
                    >
                      <div className={cn("h-12 rounded-md mb-2 mx-auto w-full", t.preview, theme === t.id ? "border-[#18C1CB]" : "border-(--border-custom)")} />
                      <span className="text-xs font-medium text-(--text)">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Densidade */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center gap-2">
                <Layout size={14} className="text-(--text-muted)" />
                <h2 className="text-xs font-bold text-(--text)">Densidade da interface</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'compact', label: 'Compacta', desc: 'Mais informação por tela' },
                    { id: 'comfortable', label: 'Confortável', desc: 'Equilíbrio padrão' },
                    { id: 'spacious', label: 'Espaçosa', desc: 'Mais espaço de respiro' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDensity(d.id)}
                      className={cn("rounded-lg border p-3 text-left transition-all cursor-pointer", density === d.id ? "border-[#18C1CB] bg-[#E6F9FA]/30" : "border-(--border-custom) hover:border-gray-300")}
                    >
                      <div className="text-xs font-semibold text-(--text)">{d.label}</div>
                      <div className="text-[0.6rem] text-(--text-muted) mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fonte */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center gap-2">
                <Type size={14} className="text-(--text-muted)" />
                <h2 className="text-xs font-bold text-(--text)">Tamanho da fonte</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-[0.7rem] text-(--text-muted)">A</span>
                  <input type="range" min="12" max="18" defaultValue="14" className="flex-1 accent-[#18C1CB] cursor-pointer" />
                  <span className="text-base text-(--text-muted)">A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
