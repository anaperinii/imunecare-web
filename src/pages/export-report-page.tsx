import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { X, FileText, FileSpreadsheet, FileDown, ChevronDown, Check, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const formats = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV', icon: FileDown },
]

const intervals = ['Este Mês', 'Este Trimestre', 'Este Semestre', 'Este Ano', 'Personalizado']

const chartOptions = [
  { id: 'cycles', label: 'Ciclos de Tratamento por Concentração' },
  { id: 'phases', label: 'Distribuição de Fases' },
  { id: 'status', label: 'Status de Imunoterapias' },
  { id: 'types', label: 'Imunoterapias Ativas por Tipo' },
  { id: 'volume', label: 'Volume vs Concentração' },
]

export function ExportReportPage() {
  const navigate = useNavigate()
  const [fileName, setFileName] = useState('relatorio-imunecare')
  const [format, setFormat] = useState('pdf')
  const [interval, setInterval] = useState('Este Mês')
  const [modality, setModality] = useState<'sub' | 'sbl'>('sub')
  const [mesFilter, setMesFilter] = useState('Todos')
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear().toString())
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['cycles', 'phases', 'status'])
  const [showCancelModal, setShowCancelModal] = useState(false)

  const toggleChart = (id: string) => {
    setSelectedCharts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-(--text)">Exportar Relatório</h1>
          <button onClick={() => setShowCancelModal(true)} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left — Config */}
          <div className="w-88 shrink-0 border-r border-(--border-custom) overflow-y-auto">
            {/* Config header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <span className="text-xs font-bold text-(--text)">Configurações do Relatório</span>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-brand-50 hover:text-brand transition-all">
                <Settings size={14} />
              </button>
            </div>
            <div className="px-5 pb-5 space-y-5">
            {/* Modality toggle */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Modalidade</label>
              <div className="flex h-9 rounded-lg border border-(--border-custom) overflow-hidden">
                {[{ key: 'sub', label: 'Subcutânea' }, { key: 'sbl', label: 'Sublingual' }].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setModality(m.key as 'sub' | 'sbl')}
                    className={cn("flex-1 text-xs font-semibold transition-all", modality === m.key ? "bg-linear-to-br from-brand to-teal-400 text-white" : "text-(--text-muted) hover:bg-gray-50")}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File name */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nome do arquivo</label>
              <input value={fileName} onChange={(e) => setFileName(e.target.value)} className={inputClass} />
            </div>

            {/* Format */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Formato</label>
              <div className="flex gap-2">
                {formats.map((f) => {
                  const Icon = f.icon
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id)}
                      className={cn(
                        "flex-1 h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                        format === f.id
                          ? "border-brand bg-brand-50 text-brand-dark"
                          : "border-(--border-custom) text-(--text-muted) hover:border-brand-light"
                      )}
                    >
                      <Icon size={13} />
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Interval */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Período</label>
              <div className="relative mb-2">
                <select value={interval} onChange={(e) => setInterval(e.target.value)} className={cn(inputClass, "appearance-none pr-8 cursor-pointer")}>
                  {intervals.map((i) => <option key={i}>{i}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
              {interval === 'Personalizado' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[0.6rem] text-(--text-muted) mb-1 block">Data início</label>
                    <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[0.6rem] text-(--text-muted) mb-1 block">Data fim</label>
                    <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={inputClass} />
                  </div>
                </div>
              ) : interval !== 'Personalizado' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select value={mesFilter} onChange={(e) => setMesFilter(e.target.value)} className={cn(inputClass, "appearance-none pr-7 cursor-pointer")}>
                      <option value="Todos">Mês</option>
                      {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={anoFilter} onChange={(e) => setAnoFilter(e.target.value)} className={cn(inputClass, "appearance-none pr-7 cursor-pointer")}>
                      {['2024','2025','2026'].map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Chart selection */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Gráficos incluídos</label>
              <div className="space-y-1.5">
                {chartOptions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => toggleChart(c.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                      selectedCharts.includes(c.id)
                        ? "border-brand bg-brand-50/50"
                        : "border-(--border-custom) hover:border-brand-light"
                    )}
                  >
                    <div className={cn(
                      "flex h-4.5 w-4.5 items-center justify-center rounded border transition-all",
                      selectedCharts.includes(c.id)
                        ? "bg-brand border-brand"
                        : "border-gray-300"
                    )}>
                      {selectedCharts.includes(c.id) && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-[0.7rem] font-medium text-(--text)">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Export button */}
            <button className="w-full h-9 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,193,203,0.3)] transition-all">
              Exportar {format.toUpperCase()}
            </button>
            </div>
          </div>

          {/* Right — Preview */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
            <div className="bg-white rounded-xl border border-(--border-custom) shadow-sm max-w-2xl mx-auto">
              {/* Report header */}
              <div className="px-6 py-5 border-b border-(--border-custom)">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-(--text)">ImuneCare — Relatório Clínico</h2>
                    <p className="text-[0.65rem] text-(--text-muted) mt-0.5">
                      {interval === 'Personalizado' && dataInicio && dataFim ? `${dataInicio} a ${dataFim}` : mesFilter !== 'Todos' ? `${mesFilter} ${anoFilter}` : `${interval} · ${anoFilter}`} · Gerado em {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-[0.6rem] text-(--text-muted) text-right">
                    <div>Modalidade: {modality === 'sub' ? 'Subcutânea' : 'Sublingual'}</div>
                    <div>Formato: {format.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {/* Preview content */}
              <div className="px-6 py-5 space-y-6">
                {selectedCharts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-(--text-muted)">
                    Selecione pelo menos um gráfico para visualizar a prévia.
                  </div>
                ) : (
                  selectedCharts.map((chartId) => {
                    const chart = chartOptions.find((c) => c.id === chartId)
                    return (
                      <div key={chartId} className="border border-(--border-custom) rounded-lg p-4 relative">
                        <h3 className="text-xs font-bold text-(--text) mb-3">{chart?.label}</h3>
                        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center mx-auto mb-2">
                              <FileText size={18} className="text-brand" />
                            </div>
                            <span className="text-[0.65rem] text-(--text-muted)">Prévia do gráfico</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Report footer */}
              <div className="px-6 py-3 border-t border-(--border-custom) flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">ImuneCare © 2026</span>
                <span className="text-[0.6rem] text-(--text-muted)">Página 1 de 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-(--text) mb-2">Cancelar exportação?</h3>
            <p className="text-xs text-(--text-muted) mb-5">As configurações do relatório serão perdidas.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCancelModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all">
                Continuar editando
              </button>
              <button onClick={() => navigate({ to: '/dashboard' })} className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
