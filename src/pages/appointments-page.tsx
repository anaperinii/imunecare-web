import { useMemo, useState } from 'react'
import { usePatientStore } from '@/store/patient-store'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { Plus, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

const INTERVAL_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  7: { bg: '#FDECF0', text: '#E8768E', dot: '#E8768E' },
  14: { bg: '#FDEEE8', text: '#E8766A', dot: '#E8766A' },
  21: { bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB' },
  28: { bg: '#EDE9FE', text: '#7C3AED', dot: '#7C3AED' },
}
const DEFAULT_COLOR = { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' }

export function AppointmentsPage() {
  const { applications } = usePatientStore()
  const { immunotherapies } = useImmunotherapiesStore()
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)

  const scheduled = useMemo(() => applications.filter((a) => a.status === 'agendada' || a.status === 'ausente'), [applications])

  // Cores por modalidade/status para os eventos no calendário
  const getEventColor = (app: typeof applications[0]) => {
    if (app.status === 'ausente') return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' }
    if (app.modalidade === 'sublingual') return { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6' }
    return { bg: '#CCFBF1', text: '#115E59', border: '#14B8A6' } // subcutânea default
  }

  const getAppsForDate = (date: Date) => {
    const str = format(date, 'dd/MM/yyyy')
    return scheduled.filter((a) => a.data === str)
  }

  const getPatientName = (patientId?: string) => {
    if (!patientId) return ''
    return immunotherapies.find((i) => i.id === patientId)?.nome.split(' ').slice(0, 2).join(' ') || ''
  }

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { locale: ptBR })
    const end = endOfWeek(currentDate, { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: ptBR })
    const end = endOfWeek(endOfMonth(currentDate), { locale: ptBR })
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const goToPrev = () => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : subMonths(currentDate, 1))
  const goToNext = () => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addMonths(currentDate, 1))
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()) }

  const monthLabel = (() => {
    const m = format(currentDate, 'MMMM yyyy', { locale: ptBR })
    return m.charAt(0).toUpperCase() + m.slice(1)
  })()

  const selectedDayApps = useMemo(() => getAppsForDate(selectedDate), [selectedDate, scheduled])

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-(--text)">Agendamentos</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all">
              <Plus size={14} />
              Adicionar Agendamento
            </button>
          </div>
        </div>

        {/* Nav bar */}
        <div className="border-b border-(--border-custom) px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goToPrev} className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) hover:border-teal-300 hover:text-teal-600 transition-all">
              <ChevronLeft size={14} />
            </button>
            <button onClick={goToNext} className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) hover:border-teal-300 hover:text-teal-600 transition-all">
              <ChevronRight size={14} />
            </button>
            <button onClick={goToToday} className="h-7 px-2.5 rounded-md border border-(--border-custom) text-xs font-medium text-(--text-muted) hover:border-teal-300 hover:text-teal-600 transition-all">
              Hoje
            </button>
            <span className="text-sm font-semibold text-(--text) ml-1">{monthLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            {(['week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "h-7 px-3 rounded-md text-xs font-semibold transition-all",
                  viewMode === mode
                    ? "bg-linear-to-br from-brand to-teal-400 text-white"
                    : "border border-(--border-custom) text-(--text-muted) hover:border-teal-300 hover:text-teal-600"
                )}
              >
                {mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'week' ? (
            /* Week view */
            <div className="grid grid-cols-7 h-full">
              {weekDays.map((day) => {
                const apps = getAppsForDate(day)
                const today = isToday(day)
                const selected = isSameDay(day, selectedDate)
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "border-r border-(--border-custom) last:border-r-0 p-2.5 cursor-pointer hover:bg-teal-50/30 transition-colors flex flex-col min-h-0",
                      selected && "bg-teal-50/50"
                    )}
                  >
                    <div className="text-center mb-2">
                      <div className="text-[0.6rem] font-semibold text-(--text-muted) uppercase">
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={cn(
                        "text-lg font-bold mt-0.5",
                        today ? "text-teal-600" : "text-(--text)"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className={cn("w-1.5 h-1.5 rounded-full mx-auto mt-0.5", today ? "bg-teal-500" : "bg-transparent")} />
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {apps.map((app) => {
                        const ec = getEventColor(app)
                        return (
                          <div
                            key={app.id}
                            className={cn("rounded-md px-2 py-1.5 text-[0.6rem] border-l-2", app.status === 'ausente' && "line-through opacity-70")}
                            style={{ backgroundColor: ec.bg, color: ec.text, borderLeftColor: ec.border }}
                          >
                            <div className="font-semibold truncate">{getPatientName(app.patientId)}</div>
                            <div className="opacity-75">{app.horaInicio} · {app.dose.split(' - ')[1]}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Month view */
            <div>
              <div className="grid grid-cols-7 border-b border-(--border-custom)">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                  <div key={d} className="text-center py-2 text-[0.6rem] font-semibold text-(--text-muted) uppercase">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const apps = getAppsForDate(day)
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const today = isToday(day)
                  const selected = isSameDay(day, selectedDate)
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "border-r border-b border-(--border-custom) last:border-r-0 p-1.5 min-h-20 cursor-pointer hover:bg-teal-50/30 transition-colors",
                        !isCurrentMonth && "opacity-40 bg-gray-50",
                        selected && "ring-2 ring-teal-400 ring-inset"
                      )}
                    >
                      <div className={cn(
                        "text-[0.65rem] font-semibold mb-1",
                        today ? "text-teal-600 font-bold" : "text-(--text-muted)"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {apps.slice(0, 2).map((app) => {
                          const ec = getEventColor(app)
                          return (
                            <div
                              key={app.id}
                              className={cn("rounded px-1 py-0.5 text-[0.55rem] font-medium truncate border-l-[1.5px]", app.status === 'ausente' && "line-through opacity-70")}
                              style={{ backgroundColor: ec.bg, color: ec.text, borderLeftColor: ec.border }}
                            >
                              {app.horaInicio} · {getPatientName(app.patientId)}
                            </div>
                          )
                        })}
                        {apps.length > 2 && (
                          <div className="text-[0.55rem] text-(--text-muted) px-1">+{apps.length - 2} mais</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected day sidebar */}
        {selectedDayApps.length > 0 && (
          <div className="border-t border-(--border-custom) px-5 py-3">
            <div className="text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-2">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedDayApps.map((app) => {
                const color = INTERVAL_COLORS[app.ciclo.dias] || DEFAULT_COLOR
                return (
                  <div key={app.id} className="shrink-0 border border-(--border-custom) rounded-lg p-2.5 min-w-45">
                    <div className="text-xs font-semibold text-(--text)">{getPatientName(app.patientId)}</div>
                    <div className="text-[0.65rem] text-(--text-muted) mt-0.5">{app.horaInicio} – {app.horaFim}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[0.6rem] font-medium text-(--text-muted)">{app.dose}</span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[0.55rem] font-semibold border"
                        style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                      >
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: color.dot }} />
                        {app.ciclo.dias}d
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add appointment modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom)">
              <h3 className="text-sm font-bold text-(--text)">Adicionar Agendamento</h3>
              <button onClick={() => setShowAddModal(false)} className="text-(--text-muted) hover:text-(--text) transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data</label>
                <input type="date" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora início</label>
                  <input type="time" className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora fim</label>
                  <input type="time" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Paciente</label>
                <div className="relative">
                  <select className={cn(inputClass, "appearance-none pr-8 cursor-pointer")}>
                    <option value="" disabled selected>Selecione</option>
                    {immunotherapies.map((i) => (
                      <option key={i.id} value={i.id}>{i.nome}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Intervalo</label>
                <div className="relative">
                  <select className={cn(inputClass, "appearance-none pr-8 cursor-pointer")}>
                    <option value="7">7 dias</option>
                    <option value="14">14 dias</option>
                    <option value="21">21 dias</option>
                    <option value="28">28 dias</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Dose / Concentração</label>
                <div className="relative">
                  <select className={cn(inputClass, "appearance-none pr-8 cursor-pointer")}>
                    <option value="" disabled selected>Selecione</option>
                    <option value="1:10.000 - 0,1ml">1:10.000 - 0,1ml</option>
                    <option value="1:10.000 - 0,2ml">1:10.000 - 0,2ml</option>
                    <option value="1:10.000 - 0,4ml">1:10.000 - 0,4ml</option>
                    <option value="1:10.000 - 0,8ml">1:10.000 - 0,8ml</option>
                    <option value="1:1.000 - 0,1ml">1:1.000 - 0,1ml</option>
                    <option value="1:1.000 - 0,2ml">1:1.000 - 0,2ml</option>
                    <option value="1:1.000 - 0,4ml">1:1.000 - 0,4ml</option>
                    <option value="1:1.000 - 0,8ml">1:1.000 - 0,8ml</option>
                    <option value="1:100 - 0,1ml">1:100 - 0,1ml</option>
                    <option value="1:100 - 0,2ml">1:100 - 0,2ml</option>
                    <option value="1:100 - 0,4ml">1:100 - 0,4ml</option>
                    <option value="1:100 - 0,8ml">1:100 - 0,8ml</option>
                    <option value="1:10 - 0,1ml">1:10 - 0,1ml</option>
                    <option value="1:10 - 0,2ml">1:10 - 0,2ml</option>
                    <option value="1:10 - 0,4ml">1:10 - 0,4ml</option>
                    <option value="1:10 - 0,5ml">1:10 - 0,5ml</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={() => setShowAddModal(false)} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
