import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FileText, FileSpreadsheet, FileDown, ChevronDown, Check, Settings, ShieldCheck, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { useCan, useDoctorFilter } from '@/store/user-store'

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

// Mesmas cores e dados do dashboard
const CONC_COLORS: Record<string, string> = { '1:10.000': '#B6F2EC', '1:1.000': '#2CD3C1', '1:100': '#18C1CB', '1:10': '#0E99A3' }
const PHASE_COLORS = { 'Indução': '#18C1CB', 'Manutenção': '#A78BFA' }
const STATUS_COLORS = { 'Ativas': '#2CD3C1', 'Interrompidas': '#F4845F', 'Concluídas': '#22DD44' }
const TYPE_COLORS = ['#0E99A3', '#18C1CB', '#2CD3C1', '#B6F2EC', '#3F98AF']
const VOL_LEGEND = [
  { label: '0,1ml', color: '#B6F2EC' }, { label: '0,2ml', color: '#2CD3C1' },
  { label: '0,4ml', color: '#18C1CB' }, { label: '0,8ml', color: '#0E99A3' }, { label: '0,5ml', color: '#A78BFA' },
]

const VOLUME_KEYS = ['0,1ml', '0,2ml', '0,4ml', '0,5ml', '0,8ml'] as const
const ALL_TYPES = ['Gramíneas', 'Ácaros', 'Cão e Gato', 'Cândida', 'Herpes']

export function ExportReportPage() {
  const navigate = useNavigate()
  const { immunotherapies: allImmunotherapies } = useImmunotherapiesStore()
  const canViewDashboard = useCan('view_dashboard')
  const doctorFilter = useDoctorFilter()

  useEffect(() => { if (!canViewDashboard) navigate({ to: '/immunotherapies' }) }, [canViewDashboard, navigate])

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
  const [anonimizar, setAnonimizar] = useState(false)
  const [justificativa, setJustificativa] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Escopo: aplica modalidade + filtro de médico (mesma regra do dashboard)
  const filtered = useMemo(() => {
    const mod = modality === 'sub' ? 'subcutânea' : 'sublingual'
    return allImmunotherapies.filter((i) => {
      const matchDoctor = !doctorFilter || i.medicoResponsavel === doctorFilter
      return matchDoctor && i.modalidade === mod
    })
  }, [allImmunotherapies, modality, doctorFilter])

  const activeFiltered = useMemo(() => filtered.filter((i) => i.status === 'ativo'), [filtered])
  const inactiveFiltered = useMemo(() => filtered.filter((i) => i.status === 'inativo'), [filtered])
  const totalActive = activeFiltered.length
  const inductionCount = activeFiltered.filter((i) => i.cicloIntervalo.dias === 7).length
  const maintenanceCount = totalActive - inductionCount

  const concData = useMemo(() => {
    const counts: Record<string, number> = {}
    activeFiltered.forEach((i) => {
      const conc = i.doseConcentracao.split(' - ')[0].trim()
      counts[conc] = (counts[conc] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [activeFiltered])

  const phaseData = useMemo(() => [
    { month: 'Jan', Indução: Math.max(0, inductionCount - 2), Manutenção: Math.max(0, maintenanceCount - 1) },
    { month: 'Fev', Indução: Math.max(0, inductionCount - 1), Manutenção: Math.max(0, maintenanceCount - 1) },
    { month: 'Mar', Indução: inductionCount, Manutenção: maintenanceCount },
    { month: 'Abr', Indução: inductionCount, Manutenção: maintenanceCount },
  ], [inductionCount, maintenanceCount])

  const statusData = useMemo(() => [
    { month: 'Jan', Ativas: Math.max(0, totalActive - 2), Interrompidas: Math.max(0, inactiveFiltered.length - 1), Concluídas: 0 },
    { month: 'Fev', Ativas: Math.max(0, totalActive - 1), Interrompidas: Math.max(0, inactiveFiltered.length - 1), Concluídas: 0 },
    { month: 'Mar', Ativas: totalActive, Interrompidas: inactiveFiltered.length, Concluídas: 0 },
    { month: 'Abr', Ativas: totalActive, Interrompidas: inactiveFiltered.length, Concluídas: 0 },
  ], [totalActive, inactiveFiltered.length])

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    ALL_TYPES.forEach((t) => { counts[t] = 0 })
    activeFiltered.forEach((i) => { counts[i.tipo] = (counts[i.tipo] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, pct: totalActive > 0 ? Math.round((value / totalActive) * 100) : 0 }))
  }, [activeFiltered, totalActive])

  const volumeChartData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {}
    activeFiltered.forEach((i) => {
      const [conc, vol] = i.doseConcentracao.split(' - ').map((s) => s.trim())
      if (!conc || !vol) return
      if (!matrix[conc]) matrix[conc] = {}
      matrix[conc][vol] = (matrix[conc][vol] || 0) + 1
    })
    return Object.entries(matrix).map(([conc, vols]) => {
      const row: Record<string, string | number> = { conc }
      VOLUME_KEYS.forEach((v) => { row[v] = vols[v] || 0 })
      return row
    })
  }, [activeFiltered])

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
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => setShowCancelModal(true)} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-red-50 hover:text-red-500 transition-all">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Exportar Relatório</h1>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left — Config */}
          <div className="w-88 shrink-0 border-r border-(--border-custom) overflow-y-auto">
            {/* Config header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-2">
              <div className="flex h-8 rounded-lg border border-(--border-custom) overflow-hidden flex-1">
                {[{ key: 'sub', label: 'Subcutânea' }, { key: 'sbl', label: 'Sublingual' }].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setModality(m.key as 'sub' | 'sbl')}
                    className={cn("flex-1 px-3 text-xs font-semibold transition-all", modality === m.key ? "bg-linear-to-br from-brand to-teal-400 text-white" : "text-(--text-muted) hover:bg-gray-50")}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <button
                className="h-8 w-8 flex items-center justify-center rounded-lg border-[1.5px] border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand hover:bg-teal-50 transition-all shrink-0"
                title="Configurações avançadas"
              >
                <Settings size={14} />
              </button>
            </div>
            <div className="px-5 pb-5 space-y-5">
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

            {/* LGPD & Privacy */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">
                Privacidade e LGPD
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setAnonimizar(!anonimizar)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                    anonimizar ? "border-brand bg-brand/5" : "border-(--border-custom) hover:border-brand/40"
                  )}
                >
                  <div className={cn(
                    "flex h-4.5 w-4.5 items-center justify-center rounded border transition-all",
                    anonimizar ? "bg-brand border-brand" : "border-gray-300"
                  )}>
                    {anonimizar && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-medium text-(--text) block">Anonimizar dados pessoais</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Nomes, CPFs e telefones serão mascarados</span>
                  </div>
                </button>
                <button
                  onClick={() => setConsentimento(!consentimento)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all",
                    consentimento ? "border-brand bg-brand/5" : "border-(--border-custom) hover:border-brand/40"
                  )}
                >
                  <div className={cn(
                    "flex h-4.5 w-4.5 items-center justify-center rounded border transition-all",
                    consentimento ? "bg-brand border-brand" : "border-gray-300"
                  )}>
                    {consentimento && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-medium text-(--text) block">Declaro ciência da LGPD</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Responsabilizo-me pelo uso dos dados exportados</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Justificativa da exportação <span className="text-red-400">*</span></label>
              <textarea
                rows={2}
                placeholder="Ex: Relatório para acompanhamento clínico do paciente"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                className="w-full rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Export button */}
            <button
              disabled={!consentimento || !justificativa.trim()}
              onClick={() => setShowExportModal(true)}
              className={cn(
                "w-full h-9 rounded-lg text-xs font-semibold transition-all",
                consentimento && justificativa.trim()
                  ? "bg-linear-to-br from-brand to-teal-400 text-white hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,193,203,0.3)] cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              Exportar {format.toUpperCase()}
            </button>

            {!consentimento && (
              <p className="text-[0.55rem] text-amber-600 text-center">Aceite a declaração LGPD para habilitar a exportação</p>
            )}
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
                    {anonimizar && (
                      <div className="flex items-center gap-1 text-brand font-semibold mt-0.5 justify-end">
                        <EyeOff size={10} />
                        Dados anonimizados
                      </div>
                    )}
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
                    const tooltipStyle = { fontSize: 11, borderRadius: 8, border: '1px solid #e2f0ef', background: 'rgba(255,255,255,0.95)' }
                    return (
                      <div key={chartId} className="border border-(--border-custom) rounded-lg p-4 relative z-20">
                        <h3 className="text-xs font-bold text-(--text) mb-3">{chart?.label}</h3>

                        {chartId === 'cycles' && (
                          <>
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={concData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                                    {concData.map((entry) => <Cell key={entry.name} fill={CONC_COLORS[entry.name] || '#94a3b8'} />)}
                                  </Pie>
                                  <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-3 mt-2">
                              {concData.map((d) => (
                                <div key={d.name} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CONC_COLORS[d.name] }} />
                                  {d.name} <span className="font-semibold text-(--text)">({d.value})</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {chartId === 'phases' && (
                          <>
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={phaseData} barGap={2}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip contentStyle={tooltipStyle} />
                                  <Bar dataKey="Indução" fill={PHASE_COLORS['Indução']} radius={[3, 3, 0, 0]} label={{ position: 'top', fontSize: 9, fill: '#6b7280' }} />
                                  <Bar dataKey="Manutenção" fill={PHASE_COLORS['Manutenção']} radius={[3, 3, 0, 0]} label={{ position: 'top', fontSize: 9, fill: '#6b7280' }} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                              {Object.entries(PHASE_COLORS).map(([k, v]) => {
                                const total = phaseData.reduce((sum, d) => sum + (d[k as keyof typeof d] as number || 0), 0)
                                return (
                                  <div key={k} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v }} />
                                    {k} <span className="font-semibold text-(--text)">({total})</span>
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )}

                        {chartId === 'status' && (
                          <>
                            <div className="h-40">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={statusData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                  <YAxis tick={{ fontSize: 10 }} />
                                  <Tooltip contentStyle={tooltipStyle} />
                                  <Line type="monotone" dataKey="Ativas" stroke={STATUS_COLORS['Ativas']} strokeWidth={2} dot={{ r: 3 }} />
                                  <Line type="monotone" dataKey="Interrompidas" stroke={STATUS_COLORS['Interrompidas']} strokeWidth={2} dot={{ r: 3 }} />
                                  <Line type="monotone" dataKey="Concluídas" stroke={STATUS_COLORS['Concluídas']} strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-2">
                              {Object.entries(STATUS_COLORS).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v }} />
                                  {k}
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              {statusData.map((d) => (
                                <div key={d.month} className="bg-gray-50 rounded-lg px-2.5 py-2 text-center">
                                  <div className="text-[0.6rem] font-semibold text-(--text-muted) mb-1">{d.month}</div>
                                  <div className="flex justify-center gap-2">
                                    <span className="text-[0.55rem] font-bold" style={{ color: STATUS_COLORS['Ativas'] }}>{d.Ativas}</span>
                                    <span className="text-[0.55rem] font-bold" style={{ color: STATUS_COLORS['Interrompidas'] }}>{d.Interrompidas}</span>
                                    <span className="text-[0.55rem] font-bold" style={{ color: STATUS_COLORS['Concluídas'] }}>{d.Concluídas}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {chartId === 'types' && (
                          <div className="space-y-3 mt-1">
                            {typeData.map((t, i) => (
                              <div key={t.name}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-(--text)">{t.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[0.6rem] text-(--text-muted)">{t.value} pacientes</span>
                                    <span className="text-xs font-bold" style={{ color: TYPE_COLORS[i % TYPE_COLORS.length] }}>{t.pct}%</span>
                                  </div>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.pct}%`, backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {chartId === 'volume' && (
                          <>
                            <div className="h-44">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={volumeChartData} layout="vertical">
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                  <XAxis type="number" tick={{ fontSize: 10 }} />
                                  <YAxis type="category" dataKey="conc" tick={{ fontSize: 10 }} width={60} />
                                  <Tooltip contentStyle={tooltipStyle} />
                                  <Bar dataKey="0,1ml" stackId="a" fill="#B6F2EC" radius={0} label={{ position: 'center', fontSize: 9, fill: '#374151' }} />
                                  <Bar dataKey="0,2ml" stackId="a" fill="#2CD3C1" radius={0} label={{ position: 'center', fontSize: 9, fill: '#374151' }} />
                                  <Bar dataKey="0,4ml" stackId="a" fill="#18C1CB" radius={0} label={{ position: 'center', fontSize: 9, fill: '#fff' }} />
                                  <Bar dataKey="0,8ml" stackId="a" fill="#0E99A3" radius={0} label={{ position: 'center', fontSize: 9, fill: '#fff' }} />
                                  <Bar dataKey="0,5ml" stackId="a" fill="#A78BFA" radius={[0, 3, 3, 0]} label={{ position: 'center', fontSize: 9, fill: '#fff' }} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-3 mt-2">
                              {VOL_LEGEND.map((d) => (
                                <div key={d.label} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                                  {d.label}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Report footer */}
              <div className="px-6 py-3 border-t border-(--border-custom)">
                <div className="flex justify-between mb-2">
                  <span className="text-[0.6rem] text-(--text-muted)">ImuneCare © 2026</span>
                  <span className="text-[0.6rem] text-(--text-muted)">Página 1 de 1</span>
                </div>
                <p className="text-[0.5rem] text-(--text-muted)/60 leading-relaxed mb-2">
                  Este documento contém dados protegidos pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é estritamente proibido. O responsável pela exportação assume total responsabilidade pelo uso adequado das informações contidas neste relatório.
                </p>
                <div className="text-center py-1.5 bg-gray-50 rounded-md border border-(--border-custom)">
                  <span className="text-[0.7rem] font-bold text-gray-300 uppercase tracking-[0.2em]">Confidencial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export confirmation modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3">
              <div className="h-11 w-11 rounded-full bg-brand/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-brand" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-(--text) mb-1.5 text-center">Confirmar exportação</h3>
            <p className="text-[0.7rem] text-(--text-muted) mb-4 text-center leading-relaxed">
              Ao confirmar, um registro desta exportação será salvo no log de auditoria do sistema, incluindo data, hora, responsável e justificativa informada.
            </p>

            <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 mb-4 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Formato</span>
                <span className="text-[0.6rem] font-semibold text-(--text)">{format.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Dados anonimizados</span>
                <span className={cn("text-[0.6rem] font-semibold", anonimizar ? "text-brand" : "text-amber-600")}>{anonimizar ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Justificativa</span>
                <span className="text-[0.6rem] font-semibold text-(--text) text-right max-w-[60%] truncate">{justificativa}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowExportModal(false)} className="flex-1 h-8 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button
                onClick={() => { setShowExportModal(false); navigate({ to: '/dashboard' }) }}
                className="flex-1 h-8 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all"
              >
                Confirmar e exportar
              </button>
            </div>
          </div>
        </div>
      )}

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
