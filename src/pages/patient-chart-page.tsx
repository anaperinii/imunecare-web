import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { usePatientStore, type Application } from '@/store/patient-store'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { addDays, format, differenceInDays, parse } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Clock,
  CalendarDays,
  Droplet,
  ChevronUp,
  ChevronDown,
  Pencil,
} from 'lucide-react'

const INTERVAL_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  7: { bg: '#FDECF0', text: '#E8768E', dot: '#E8768E' },
  14: { bg: '#FDEEE8', text: '#E8766A', dot: '#E8766A' },
  21: { bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB' },
  28: { bg: '#EDE9FE', text: '#7C3AED', dot: '#7C3AED' },
}
const DEFAULT_COLOR = { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' }

export function PatientChartPage() {
  const navigate = useNavigate()
  const { patientId } = useParams({ from: '/patient/$patientId' })
  const { selectedPatient, applications, setSelectedPatient } = usePatientStore()
  const [showPersonal, setShowPersonal] = useState(true)
  const [showImmuno, setShowImmuno] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [modalTab, setModalTab] = useState<'pre' | 'pos'>('pre')
  const [monthFilter, setMonthFilter] = useState('all')

  // Load patient if navigated directly
  useEffect(() => {
    if (!selectedPatient && patientId) {
      const { immunotherapies } = useImmunotherapiesStore.getState()
      const imm = immunotherapies.find((i) => i.id === patientId)
      if (imm) {
        setSelectedPatient({
          id: imm.id, nome: imm.nome, dataNascimento: '02/07/2000', idade: 25,
          telefone: '(62) 99557-1423', peso: '89.7 kg', cpf: '711.905.744-89',
          medicoResponsavel: 'Dra. Karina Martins', status: imm.status === 'ativo' ? 'ativo' as const : 'inativo' as const,
          tipoImunoterapia: imm.tipo, inicioInducao: '01/01/2020', inicioManutencao: null,
          viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
          concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
          intervaloAtual: imm.cicloIntervalo.dias, dataProximaAplicacao: '21/05/2025',
          concentracaoDoseAtuais: imm.doseConcentracao,
        })
      } else {
        navigate({ to: '/immunotherapies' })
      }
    }
  }, [patientId, selectedPatient, navigate, setSelectedPatient])

  const patientApps = useMemo(() => {
    if (!selectedPatient) return []
    return applications.filter((a) => a.patientId === selectedPatient.id)
  }, [applications, selectedPatient])

  const lastRealized = useMemo(() => {
    const realized = patientApps.filter((a) => a.status === 'realizada')
    if (!realized.length) return null
    return [...realized].sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })[0]
  }, [patientApps])

  const currentInterval = lastRealized?.ciclo.dias ?? selectedPatient?.intervaloAtual ?? 7
  const currentDose = lastRealized
    ? `${lastRealized.concentracaoExtrato || lastRealized.dose.split(' - ')[0]} - ${lastRealized.volumeAplicado || lastRealized.dose.split(' - ')[1]}`
    : selectedPatient?.concentracaoDoseAtuais ?? '-'

  const nextDate = useMemo(() => {
    if (!lastRealized) return selectedPatient?.dataProximaAplicacao ?? '-'
    try {
      const [d, m, y] = lastRealized.data.split('/')
      return format(addDays(new Date(+y, +m - 1, +d), currentInterval), 'dd/MM/yyyy')
    } catch { return '-' }
  }, [lastRealized, currentInterval, selectedPatient])

  const treatmentTime = useMemo(() => {
    if (!selectedPatient?.inicioInducao) return null
    try {
      const start = parse(selectedPatient.inicioInducao, 'dd/MM/yyyy', new Date())
      const days = differenceInDays(new Date(), start)
      const months = Math.floor(days / 30)
      const years = Math.floor(months / 12)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      if (months > 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
      return `${days} ${days === 1 ? 'dia' : 'dias'}`
    } catch { return null }
  }, [selectedPatient])

  const sortedApps = useMemo(() => {
    return [...patientApps].sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })
  }, [patientApps])

  // Available months for filter
  const availableMonths = useMemo(() => {
    const set = new Map<string, string>()
    sortedApps.forEach((a) => {
      const key = `${a.ano}-${a.mes}`
      if (!set.has(key)) set.set(key, `${a.mes} ${a.ano}`)
    })
    return Array.from(set.entries()).map(([key, label]) => ({ key, label }))
  }, [sortedApps])

  const filteredApps = useMemo(() => {
    if (monthFilter === 'all') return sortedApps
    return sortedApps.filter((a) => `${a.ano}-${a.mes}` === monthFilter)
  }, [sortedApps, monthFilter])

  // Group by month/year
  const grouped = useMemo(() => {
    const g: Record<string, Application[]> = {}
    filteredApps.forEach((a) => {
      const key = `${a.mes} ${a.ano}`
      if (!g[key]) g[key] = []
      g[key].push(a)
    })
    return g
  }, [filteredApps])

  // Progress — protocolo SCIT (RNE-006/007/009)
  // Indução: 1:10.000 (0,1→0,2→0,4→0,8) → 1:1.000 (0,1→0,2→0,4→0,8) → 1:100 (0,1→0,2→0,4→0,8) → 1:10 (0,1→0,2→0,4→0,5=meta)
  // Manutenção: 1:10 — 0,5ml — intervalos 14→21→28 dias
  const inductionSteps = [
    { conc: '1:10.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
    { conc: '1:1.000', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
    { conc: '1:100', vols: ['0,1ml', '0,2ml', '0,4ml', '0,8ml'] },
    { conc: '1:10', vols: ['0,1ml', '0,2ml', '0,4ml', '0,5ml'] },
  ]
  const allSteps = inductionSteps.flatMap((s) => s.vols.map((v) => `${s.conc} - ${v}`))
  const currentDoseStr = lastRealized?.dose || selectedPatient?.concentracaoDoseAtuais || '1:10.000 - 0,1ml'
  const currentStepIndex = useMemo(() => {
    const parts = currentDoseStr.split(' - ')
    const conc = parts[0]?.trim() || ''
    const vol = parts[1]?.trim() || ''
    return allSteps.findIndex((s) => {
      const sc = s.split(' - ')[0].trim()
      const sv = s.split(' - ')[1].trim()
      return conc === sc && vol === sv
    })
  }, [currentDoseStr, allSteps])
  // Se paciente em manutenção (intervalo > 7), progressão é 100%
  const isMaintenance = currentInterval > 7
  const progressPct = isMaintenance ? 100 : Math.round(((currentStepIndex >= 0 ? currentStepIndex : 0) + 1) / allSteps.length * 100)

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-(--text-muted)">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="mx-4 my-4 flex flex-1 gap-4 min-h-0">
        {/* Left — Patient info */}
        <div className="flex w-[320px] shrink-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Header */}
          <div className="border-b border-(--border-custom) px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-base font-bold text-white shrink-0">
                {getInitials(selectedPatient.nome)}
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-(--text) leading-tight">{selectedPatient.nome}</h1>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {selectedPatient.status === 'ativo' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[0.6rem] font-semibold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Tratamento Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-(--text-muted) text-[0.6rem] font-semibold border border-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Tratamento Inativo
                    </span>
                  )}
                  {treatmentTime && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[0.6rem] font-medium border border-gray-200">
                      {treatmentTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selectedPatient.status === 'inativo' && (
              <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <div className="text-[0.6rem] font-semibold text-amber-700 mb-0.5">Justificativa da inativação</div>
                <div className="text-[0.6rem] text-amber-600 leading-relaxed">Paciente solicitou interrupção temporária do tratamento por motivos pessoais. Última aplicação em 15/02/2026. Retorno previsto para avaliação em 3 meses.</div>
              </div>
            )}
            <div className="mt-3 flex gap-1.5">
              <button
                disabled={selectedPatient.status === 'inativo'}
                onClick={() => navigate({ to: '/patient-evolution', search: { patientId: selectedPatient.id } })}
                className={cn("flex-1 h-8 rounded-lg text-xs font-semibold transition-all", selectedPatient.status === 'inativo' ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-linear-to-br from-brand to-teal-400 text-white hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)]")}
              >
                Evoluir Paciente
              </button>
              <button className="flex-1 h-8 rounded-lg border border-(--border-custom) text-xs font-medium text-(--text-muted) hover:border-teal-300 hover:text-teal-600 transition-all">
                Emitir Relatório
              </button>
              <button className="h-8 w-8 shrink-0 rounded-lg border border-(--border-custom) flex items-center justify-center text-(--text-muted) hover:border-teal-300 hover:text-teal-600 transition-all">
                <Pencil size={13} />
              </button>
            </div>
          </div>

          {/* Collapsible sections */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {/* Dados Pessoais */}
            <div className="border border-(--border-custom) rounded-lg overflow-hidden">
              <button
                onClick={() => setShowPersonal(!showPersonal)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-(--text) hover:bg-gray-50 transition-colors"
              >
                Dados Pessoais
                {showPersonal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", showPersonal ? "max-h-60 opacity-100" : "max-h-0 opacity-0")}>
                <div className="px-3.5 pb-3 space-y-2">
                  {[
                    ['Data de Nascimento', selectedPatient.dataNascimento],
                    ['Idade', `${selectedPatient.idade} anos`],
                    ['CPF', selectedPatient.cpf],
                    ['Telefone', selectedPatient.telefone],
                    ['Peso', selectedPatient.peso],
                    ['Médico Responsável', selectedPatient.medicoResponsavel],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-[0.7rem]">
                      <span className="text-(--text-muted)">{label}:</span>
                      <span className="font-medium text-(--text)">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dados da Imunoterapia */}
            <div className="border border-(--border-custom) rounded-lg overflow-hidden">
              <button
                onClick={() => setShowImmuno(!showImmuno)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-(--text) hover:bg-gray-50 transition-colors"
              >
                Dados da Imunoterapia
                {showImmuno ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", showImmuno ? "max-h-60 opacity-100" : "max-h-0 opacity-0")}>
                <div className="px-3.5 pb-3 space-y-2">
                  {[
                    ['Tipo', selectedPatient.tipoImunoterapia],
                    ['Via de Administração', selectedPatient.viaAdministracao],
                    ['Início Indução', selectedPatient.inicioInducao],
                    ['Início Manutenção', selectedPatient.inicioManutencao || '-'],
                    ['Meta Concentração e Volume', selectedPatient.concentracaoVolumeMeta],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-[0.7rem]">
                      <span className="text-(--text-muted)">{label}:</span>
                      <span className="font-medium text-(--text) text-right max-w-[55%] truncate">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[0.7rem]">
                    <span className="text-(--text-muted) shrink-0">Extrato:</span>
                    <span className="font-medium text-(--text) text-right max-w-[55%] wrap-break-word leading-relaxed">{selectedPatient.extrato}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Summary cards + Progress + Applications */}
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, label: 'Intervalo Atual', value: `${currentInterval} dias` },
              { icon: CalendarDays, label: 'Próxima Aplicação', value: nextDate },
              { icon: Droplet, label: 'Última Concentração e Volume', value: currentDose },
            ].map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="border border-(--border-custom) rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden bg-white"
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(to right, #18C1CB, #18C1CB40)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #18C1CB18, transparent 50%)' }} />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 relative z-10 bg-[#B6F2EC]/70">
                    <Icon size={18} className="text-brand" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <div className="text-xs font-medium text-(--text-muted)">{card.label}</div>
                    <div className="text-sm font-extrabold text-(--text) truncate">{card.value}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 py-3.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[0.65rem] font-bold uppercase tracking-wider text-(--text-muted)">Progressão da indução</span>
              <span className="text-xs font-bold text-teal-700">{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-linear-to-r from-teal-400 to-teal-700 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[0.6rem] text-(--text-muted) mb-2.5">
              <span>Início · 1:10.000 – 0,1ml</span>
              <span>Meta · 1:10 – 0,5ml (manutenção)</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {allSteps.map((step, i) => {
                const safeIdx = currentStepIndex >= 0 ? currentStepIndex : 0
                const isCurrent = i === safeIdx
                const isFuture = i > safeIdx
                const isLast = i === allSteps.length - 1
                const conc = step.split(' - ')[0].trim()
                const concColors: Record<string, { bg: string; text: string; border: string }> = {
                  '1:10.000': { bg: '#ccfbf5', text: '#0d9488', border: '#5eead6' },
                  '1:1.000':  { bg: '#99f6ec', text: '#0f766e', border: '#2dd4bf' },
                  '1:100':    { bg: '#5eead6', text: '#115e59', border: '#14b8a6' },
                  '1:10':     { bg: '#2dd4bf', text: '#134e4a', border: '#0d9488' },
                }
                const cc = concColors[conc] || { bg: '#F3F4F6', text: '#374151', border: '#6B7280' }
                const vol = step.split(' - ')[1].trim()
                return (
                  <span
                    key={i}
                    className={cn(
                      "text-[0.55rem] px-1.5 py-px rounded-full font-semibold border transition-all",
                      isCurrent && "ring-1 ring-offset-1",
                      isFuture && "opacity-40",
                    )}
                    style={{
                      backgroundColor: cc.bg,
                      color: cc.text,
                      borderColor: isCurrent ? cc.border : `${cc.border}40`,
                      ...(isCurrent ? { ringColor: cc.border } : {}),
                    }}
                  >
                    {vol}{isLast ? ' ★' : ''}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Applications card */}
          <div className="flex-1 flex flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden min-h-0">
            {/* Header + Filters */}
            <div className="px-5 py-3 border-b border-(--border-custom)">
              <h2 className="text-sm font-bold text-(--text) mb-2.5">Aplicações</h2>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setMonthFilter('all')}
                  className={cn(
                    "shrink-0 px-3 py-1 rounded-full text-[0.65rem] font-semibold border transition-all",
                    monthFilter === 'all'
                      ? "bg-linear-to-br from-brand to-teal-400 text-white border-transparent"
                      : "bg-white text-(--text-muted) border-(--border-custom) hover:border-teal-300 hover:text-teal-600"
                  )}
                >
                  Todas
                </button>
                {availableMonths.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMonthFilter(m.key)}
                    className={cn(
                      "shrink-0 px-3 py-1 rounded-full text-[0.65rem] font-semibold border transition-all",
                      monthFilter === m.key
                        ? "bg-linear-to-br from-brand to-teal-400 text-white border-transparent"
                        : "bg-white text-(--text-muted) border-(--border-custom) hover:border-teal-300 hover:text-teal-600"
                    )}
                  >
                    {m.label.charAt(0) + m.label.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {filteredApps.length === 0 ? (
                <div className="text-center text-xs text-(--text-muted) py-10">Nenhuma aplicação encontrada neste período.</div>
              ) : (
                <div className="relative pl-5">
                  {/* Vertical line */}
                  <div className="absolute left-1 top-0 bottom-0 w-[1.5px] bg-gray-200" />

                  {Object.entries(grouped).map(([monthYear, apps]) => {
                    const hasPending = apps.some((a) => a.status === 'agendada')
                    return (
                      <div key={monthYear} className="mb-7 last:mb-0">
                        {/* Month header */}
                        <div className="relative flex items-center gap-2.5 mb-3.5 -ml-5">
                          <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", hasPending ? "bg-teal-500" : "bg-gray-300")} />
                          <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.8px] text-(--text-muted)">{monthYear}</span>
                          <span className="text-[0.55rem] bg-gray-100 text-(--text-muted) border border-(--border-custom) px-1.5 py-px rounded-full">
                            {apps.length} aplicaç{apps.length === 1 ? 'ão' : 'ões'}
                          </span>
                        </div>

                        {apps.map((app, idx) => {
                          const color = INTERVAL_COLORS[app.ciclo.dias] || DEFAULT_COLOR
                          const isRealized = app.status === 'realizada'
                          const isNext = app.status === 'agendada'
                          const nodeColor = isNext ? '#0d9488' : '#2dd4bf'
                          return (
                            <div
                              key={app.id}
                              className="relative mb-2.5 last:mb-0"
                              style={{ animationDelay: `${idx * 0.06}s` }}
                            >
                              {/* Timeline node */}
                              <div
                                className={cn(
                                  "absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white z-10",
                                  isNext && "animate-pulse"
                                )}
                                style={{
                                  backgroundColor: isNext ? 'white' : nodeColor,
                                  borderColor: isNext ? '#0d9488' : 'white',
                                  boxShadow: isNext ? '0 0 0 3px rgba(13,148,136,0.2)' : `0 0 0 2px ${nodeColor}20`,
                                }}
                              />

                              {/* Card */}
                              <div
                                onClick={() => isRealized && setSelectedApp(app)}
                                className={cn(
                                  "rounded-lg border p-3 ml-1 transition-all",
                                  isNext
                                    ? "border-teal-400 bg-teal-50/60"
                                    : "border-(--border-custom) bg-white hover:translate-x-0.5 hover:shadow-[0_2px_8px_rgba(20,184,166,0.1)]",
                                  isRealized && "cursor-pointer hover:border-teal-300"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-xs font-bold text-(--text)">{app.dose}</div>
                                    <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
                                      {app.data} · {app.horaInicio}–{app.horaFim}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {isNext && <span className="text-[0.6rem] font-bold text-teal-700">PRÓXIMA</span>}
                                    <span
                                      className="inline-flex items-center gap-1.5 px-2 py-px rounded-full text-[0.65rem] font-semibold border"
                                      style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                                      {app.ciclo.dias} dias
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application details modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => { setSelectedApp(null); setModalTab('pre') }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-140 mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom)">
              <h3 className="text-sm font-bold text-(--text)">Dados da aplicação</h3>
              <button onClick={() => { setSelectedApp(null); setModalTab('pre') }} className="text-(--text-muted) hover:text-(--text) transition-colors text-lg leading-none">&times;</button>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Tab toggle */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setModalTab('pre')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                    modalTab === 'pre'
                      ? "bg-linear-to-br from-brand to-teal-400 text-white shadow-sm"
                      : "bg-teal-50 text-teal-600 hover:bg-teal-100"
                  )}
                >
                  Pré-Aplicação
                </button>
                <button
                  onClick={() => setModalTab('pos')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                    modalTab === 'pos'
                      ? "bg-linear-to-br from-brand to-teal-400 text-white shadow-sm"
                      : "bg-teal-50 text-teal-600 hover:bg-teal-100"
                  )}
                >
                  Pós-Aplicação
                </button>
              </div>

              {/* Content */}
              {modalTab === 'pre' ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-2">
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-1">Como o paciente passou durante o intervalo da última aplicação?</div>
                    <div className="text-xs text-(--text) leading-relaxed">Paciente relatou leves efeitos colaterais durante as 2 primeiras semanas após a última aplicação, incluindo dor de cabeça e tontura leve. Os sintomas foram resolvidos espontaneamente.</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Presença de efeito colateral</div>
                    <div className="text-xs text-(--text)">{selectedApp.efeitoColateral || 'Não'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Necessidade de medicação</div>
                    <div className="text-xs text-(--text)">{selectedApp.necessidadeMedicacao || 'Não'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Efeitos colaterais relatados</div>
                    <div className="text-xs text-(--text)">Dor de cabeça e tontura</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Medicações administradas</div>
                    <div className="text-xs text-(--text)">Dipirona 500mg</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Notas do responsável</div>
                    <div className="text-xs text-(--text)">{selectedApp.notaResponsavel || '-'}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Horário</div>
                    <div className="text-xs text-(--text)">{selectedApp.horaInicio} – {selectedApp.horaFim}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Data</div>
                    <div className="text-xs text-(--text)">{selectedApp.data}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Volume aplicado</div>
                    <div className="text-xs text-(--text)">{selectedApp.volumeAplicado || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Concentração aplicada</div>
                    <div className="text-xs text-(--text)">{selectedApp.concentracaoExtrato || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Intervalo associado da dose</div>
                    <div className="text-xs text-(--text)">{selectedApp.ciclo.dias} dias</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Responsável</div>
                    <div className="text-xs text-(--text)">{selectedApp.responsavel || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Presença de efeito colateral</div>
                    <div className="text-xs text-(--text)">{selectedApp.efeitoColateral || 'Não'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Necessidade de medicação</div>
                    <div className="text-xs text-(--text)">{selectedApp.necessidadeMedicacao || 'Não'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Notas do responsável</div>
                    <div className="text-xs text-(--text)">{selectedApp.notaResponsavel || '-'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
