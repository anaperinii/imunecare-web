import { useMemo, useState } from 'react'
import { usePatientStore } from '@/store/patient-store'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { useCan, useDoctorFilter } from '@/store/user-store'
import { Plus, ChevronLeft, ChevronRight, ChevronDown, X, ExternalLink, CheckCircle, Calendar, Phone, Clock, Syringe, User } from 'lucide-react'
import type { Application } from '@/store/patient-store'
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
  const { applications: allApplications } = usePatientStore()
  const { immunotherapies } = useImmunotherapiesStore()
  const canNewAppointment = useCan('new_appointment')
  const doctorFilter = useDoctorFilter()

  const applications = useMemo(() => {
    if (!doctorFilter) return allApplications
    const ownedIds = new Set(immunotherapies.filter((i) => i.medicoResponsavel === doctorFilter).map((i) => i.id))
    return allApplications.filter((a) => ownedIds.has(a.patientId))
  }, [allApplications, immunotherapies, doctorFilter])
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  // In production, this would come from a settings store
  const googleConnected = true
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const scheduled = useMemo(() => applications.filter((a) => a.status === 'agendada' || a.status === 'ausente'), [applications])

  const getEventColor = (app: typeof applications[0]) => {
    if (app.status === 'ausente') return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' }
    if (app.modalidade === 'sublingual') return { bg: '#EDE9FE', text: '#5B21B6', border: '#8B5CF6' }
    return { bg: '#CCFBF1', text: '#115E59', border: '#14B8A6' }
  }

  const getAppsForDate = (date: Date) => {
    const str = format(date, 'dd/MM/yyyy')
    return scheduled.filter((a) => a.data === str)
  }

  const getPatientName = (patientId?: string) => {
    if (!patientId) return ''
    return immunotherapies.find((i) => i.id === patientId)?.nome.split(' ').slice(0, 2).join(' ') || ''
  }

  const getPatientFullName = (patientId?: string) => {
    if (!patientId) return ''
    return immunotherapies.find((i) => i.id === patientId)?.nome || ''
  }

  const getPatientPhone = () => '(62) 99557-1423'

  const openWhatsApp = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    window.open(`https://wa.me/55${digits}`, '_blank')
  }

  const sendReminder = (phone: string, patientName: string, date: string, time: string) => {
    const digits = phone.replace(/\D/g, '')
    const msg = encodeURIComponent(`Olá ${patientName}, este é um lembrete do seu agendamento de imunoterapia no dia ${date} às ${time}. Caso precise reagendar, entre em contato conosco. — ImuneCare`)
    window.open(`https://wa.me/55${digits}?text=${msg}`, '_blank')
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

  const inputClass = 'w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all'

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-(--text)">Agendamentos</h1>
          {canNewAppointment && (
            <button onClick={() => setShowAddModal(true)} className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all">
              <Plus size={14} />
              Novo Agendamento
            </button>
          )}
        </div>

        {/* Nav bar */}
        <div className="border-b border-(--border-custom) px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goToPrev} className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all">
              <ChevronLeft size={14} />
            </button>
            <button onClick={goToNext} className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all">
              <ChevronRight size={14} />
            </button>
            <button onClick={goToToday} className="h-7 px-2.5 rounded-md border border-(--border-custom) text-xs font-medium text-(--text-muted) hover:border-brand hover:text-brand transition-all">
              Hoje
            </button>
            <span className="text-sm font-semibold text-(--text) ml-1">{monthLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            {(['week', 'month'] as const).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} className={cn('h-7 px-3 rounded-md text-xs font-semibold transition-all', viewMode === mode ? 'bg-linear-to-br from-brand to-teal-400 text-white' : 'border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand')}>
                {mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'week' ? (
            <div className="grid grid-cols-7 h-full">
              {weekDays.map((day) => {
                const apps = getAppsForDate(day)
                const today = isToday(day)
                const selected = isSameDay(day, selectedDate)
                return (
                  <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className={cn('border-r border-(--border-custom) last:border-r-0 p-2.5 cursor-pointer hover:bg-teal-50/30 transition-colors flex flex-col min-h-0', selected && 'bg-teal-50/50')}>
                    <div className="text-center mb-2">
                      <div className="text-[0.6rem] font-semibold text-(--text-muted) uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
                      <div className={cn('text-lg font-bold mt-0.5', today ? 'text-brand' : 'text-(--text)')}>{format(day, 'd')}</div>
                      <div className={cn('w-1.5 h-1.5 rounded-full mx-auto mt-0.5', today ? 'bg-brand' : 'bg-transparent')} />
                    </div>
                    <div className="flex-1 space-y-1 overflow-y-auto">
                      {apps.map((app) => {
                        const ec = getEventColor(app)
                        return (
                          <div key={app.id} onClick={(e) => { e.stopPropagation(); setSelectedApp(app) }} className={cn('rounded-md px-2 py-1.5 text-[0.6rem] border-l-2 cursor-pointer hover:opacity-80 transition-opacity', app.status === 'ausente' && 'line-through opacity-70')} style={{ backgroundColor: ec.bg, color: ec.text, borderLeftColor: ec.border }}>
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
                    <div key={day.toISOString()} onClick={() => setSelectedDate(day)} className={cn('border-r border-b border-(--border-custom) last:border-r-0 p-1.5 min-h-20 cursor-pointer hover:bg-teal-50/30 transition-colors', !isCurrentMonth && 'opacity-40 bg-gray-50', selected && 'ring-2 ring-brand ring-inset')}>
                      <div className={cn('text-[0.65rem] font-semibold mb-1', today ? 'text-brand font-bold' : 'text-(--text-muted)')}>{format(day, 'd')}</div>
                      <div className="space-y-0.5">
                        {apps.slice(0, 2).map((app) => {
                          const ec = getEventColor(app)
                          return (
                            <div key={app.id} onClick={(e) => { e.stopPropagation(); setSelectedApp(app) }} className={cn('rounded px-1 py-0.5 text-[0.55rem] font-medium truncate border-l-[1.5px] cursor-pointer hover:opacity-80 transition-opacity', app.status === 'ausente' && 'line-through opacity-70')} style={{ backgroundColor: ec.bg, color: ec.text, borderLeftColor: ec.border }}>
                              {app.horaInicio} · {getPatientName(app.patientId)}
                            </div>
                          )
                        })}
                        {apps.length > 2 && <div className="text-[0.55rem] text-(--text-muted) px-1">+{apps.length - 2} mais</div>}
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </div>
              {googleConnected && (
                <span className="text-[0.5rem] text-(--text-muted) flex items-center gap-1">
                  <Calendar size={9} />
                  Sincronizado com Google Agenda
                </span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {selectedDayApps.map((app) => {
                const color = INTERVAL_COLORS[app.ciclo.dias] || DEFAULT_COLOR
                return (
                  <div key={app.id} onClick={() => setSelectedApp(app)} className="shrink-0 border border-(--border-custom) rounded-lg p-2.5 min-w-45 cursor-pointer hover:border-brand/50 hover:shadow-sm transition-all">
                    <div className="text-xs font-semibold text-(--text)">{getPatientName(app.patientId)}</div>
                    <div className="text-[0.65rem] text-(--text-muted) mt-0.5">{app.horaInicio} – {app.horaFim}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[0.6rem] font-medium text-(--text-muted)">{app.dose}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[0.55rem] font-semibold border" style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}>
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

      {/* Appointment detail modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom)">
              <h3 className="text-sm font-bold text-(--text)">Detalhes do Agendamento</h3>
              <button onClick={() => setSelectedApp(null)} className="text-(--text-muted) hover:text-(--text) transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Patient info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-sm font-bold text-white shrink-0">
                  {getPatientFullName(selectedApp.patientId).split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-(--text)">{getPatientFullName(selectedApp.patientId)}</div>
                  <div className="text-[0.65rem] text-(--text-muted)">{getPatientPhone()}</div>
                </div>
                <button
                  onClick={() => openWhatsApp(getPatientPhone())}
                  className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white text-[0.65rem] font-semibold hover:bg-[#20BD5A] transition-all shrink-0"
                >
                  <Phone size={12} />
                  WhatsApp
                </button>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                <div className="bg-white px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                    <Calendar size={9} />
                    Data
                  </div>
                  <div className="text-xs font-medium text-(--text)">{selectedApp.data}</div>
                </div>
                <div className="bg-white px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                    <Clock size={9} />
                    Horário
                  </div>
                  <div className="text-xs font-medium text-(--text)">{selectedApp.horaInicio} – {selectedApp.horaFim}</div>
                </div>
                <div className="bg-white px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                    <Syringe size={9} />
                    Dose
                  </div>
                  <div className="text-xs font-medium text-(--text)">{selectedApp.dose}</div>
                </div>
                <div className="bg-white px-3.5 py-2.5">
                  <div className="text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">Intervalo</div>
                  <div className="text-xs font-medium text-(--text)">
                    <span className="inline-flex items-center gap-1 px-2 py-px rounded-full text-[0.6rem] font-semibold border" style={{ backgroundColor: (INTERVAL_COLORS[selectedApp.ciclo.dias] || DEFAULT_COLOR).bg, color: (INTERVAL_COLORS[selectedApp.ciclo.dias] || DEFAULT_COLOR).text, borderColor: (INTERVAL_COLORS[selectedApp.ciclo.dias] || DEFAULT_COLOR).dot + '30' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: (INTERVAL_COLORS[selectedApp.ciclo.dias] || DEFAULT_COLOR).dot }} />
                      {selectedApp.ciclo.dias} dias
                    </span>
                  </div>
                </div>
                <div className="bg-white px-3.5 py-2.5">
                  <div className="text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">Status</div>
                  <div className="text-xs font-medium">
                    <span className={cn("px-2 py-0.5 rounded-full text-[0.6rem] font-semibold", selectedApp.status === 'agendada' ? "bg-brand/10 text-brand" : "bg-red-100 text-red-600")}>
                      {selectedApp.status === 'agendada' ? 'Agendada' : 'Ausente'}
                    </span>
                  </div>
                </div>
                <div className="bg-white px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">
                    <User size={9} />
                    Modalidade
                  </div>
                  <div className="text-xs font-medium text-(--text)">{selectedApp.modalidade === 'sublingual' ? 'Sublingual' : 'Subcutânea'}</div>
                </div>
              </div>

              {/* Google Calendar sync status */}
              {googleConnected && (
                <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
                  <Calendar size={13} className="text-brand shrink-0" />
                  <div className="flex-1">
                    <p className="text-[0.6rem] text-brand font-medium">Sincronizado com Google Agenda</p>
                    <p className="text-[0.5rem] text-brand/60">Este evento está visível na agenda do profissional responsável.</p>
                  </div>
                  <a href="#" className="text-[0.55rem] text-brand font-semibold hover:underline no-underline flex items-center gap-0.5 shrink-0">
                    <ExternalLink size={9} />
                    Abrir
                  </a>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t border-(--border-custom) px-5 py-3 flex items-center justify-between">
              <button
                onClick={() => sendReminder(getPatientPhone(), getPatientFullName(selectedApp.patientId).split(' ')[0], selectedApp.data, selectedApp.horaInicio)}
                className="text-[0.65rem] font-medium text-[#25D366] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                <Phone size={11} />
                Enviar lembrete via WhatsApp
              </button>
              <button onClick={() => setSelectedApp(null)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50" style={{ animation: 'slide-up-fade 0.3s ease-out' }}>
          <div className="flex items-start gap-3 bg-white border border-emerald-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-95">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 shrink-0 mt-0.5">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--text)">Agendamento criado com sucesso!</p>
              <p className="text-xs text-(--text-muted) mt-1">
                {googleConnected
                  ? 'O agendamento foi registrado e sincronizado automaticamente com o Google Agenda.'
                  : 'O agendamento foi registrado. O paciente será notificado conforme as configurações definidas.'}
              </p>
            </div>
            <button onClick={() => setShowToast(false)} className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Add appointment modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom)">
              <h3 className="text-sm font-bold text-(--text)">Novo Agendamento</h3>
              <button onClick={() => setShowAddModal(false)} className="text-(--text-muted) hover:text-(--text) transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3.5">
              {googleConnected && (
                <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
                  <Calendar size={13} className="text-brand shrink-0" />
                  <p className="text-[0.6rem] text-brand leading-relaxed">
                    Este agendamento será sincronizado automaticamente com o Google Agenda.
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Paciente</label>
                <div className="relative">
                  <select className={cn(inputClass, 'appearance-none pr-8 cursor-pointer')}>
                    <option value="" disabled selected>Selecione o paciente</option>
                    {immunotherapies.filter((i) => i.status === 'ativo').map((i) => (
                      <option key={i.id} value={i.id}>{i.nome}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Dose / Concentração</label>
                  <div className="relative">
                    <select className={cn(inputClass, 'appearance-none pr-8 cursor-pointer')}>
                      <option value="" disabled selected>Selecione</option>
                      {['1:10.000 - 0,1ml','1:10.000 - 0,2ml','1:10.000 - 0,4ml','1:10.000 - 0,8ml','1:1.000 - 0,1ml','1:1.000 - 0,2ml','1:1.000 - 0,4ml','1:1.000 - 0,8ml','1:100 - 0,1ml','1:100 - 0,2ml','1:100 - 0,4ml','1:100 - 0,8ml','1:10 - 0,1ml','1:10 - 0,2ml','1:10 - 0,4ml','1:10 - 0,5ml'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Intervalo</label>
                  <div className="relative">
                    <select className={cn(inputClass, 'appearance-none pr-8 cursor-pointer')}>
                      <option value="7">7 dias</option>
                      <option value="14">14 dias</option>
                      <option value="21">21 dias</option>
                      <option value="28">28 dias</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Observações</label>
                <textarea rows={2} placeholder="Observações adicionais (opcional)" className="w-full rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none" />
              </div>
            </div>
            <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={() => { setShowAddModal(false); setShowToast(true); setTimeout(() => setShowToast(false), 6000) }} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
