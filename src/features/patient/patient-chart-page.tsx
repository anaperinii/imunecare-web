import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { usePatientStore, seedInactivationsFor, type Application, type ProtocolAdjustmentType, type InactivationCategory } from '@/features/patient/patient-store'
import { useImmunotherapiesStore } from '@/features/immunotherapy/immunotherapies-store'
import { useCan, useDoctorFilter, useUserStore } from '@/features/user/user-store'
import { useAuditStore } from '@/features/audit/audit-store'
import { META_DOSE, calculateNextDose } from '@/features/immunotherapy/scit-protocol'
import { addDays, format, differenceInDays, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/shared/lib/utils'
import { Toast, Modal, Button, FieldLabel, TextInput, TextArea, Select } from '@/shared/ui'
import { useForm } from '@/shared/hooks/useForm'
import {
  Clock,
  CalendarDays,
  Droplet,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  Save,
  List,
  SlidersHorizontal,
  AlertTriangle,
  History,
  Power,
  PowerOff,
  Info,
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
  const { selectedPatient, applications, setSelectedPatient, inactivateImunoterapia, reactivateImunoterapia } = usePatientStore()
  const canAdjustProtocol = useCan('adjust_protocol')
  const canInactivate = useCan('inactivate_immunotherapy')
  const canReactivate = useCan('reactivate_patient')
  const canEditPatient = useCan('edit_patient_data')
  const canEvolve = useCan('evolve_patient')
  const canEmitReport = useCan('emit_report')
  const doctorFilter = useDoctorFilter()

  useEffect(() => {
    if (doctorFilter && selectedPatient && selectedPatient.medicoResponsavel !== doctorFilter) {
      navigate({ to: '/immunotherapies' })
    }
  }, [doctorFilter, selectedPatient, navigate])
  const [showPersonal, setShowPersonal] = useState(true)
  const [showImmuno, setShowImmuno] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [modalTab, setModalTab] = useState<'pre' | 'pos'>('pre')
  const [monthFilter, setMonthFilter] = useState('all')
  const [showProgress, setShowProgress] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showAdjustHistory, setShowAdjustHistory] = useState(false)
  const adjustForm = useForm<{
    type: ProtocolAdjustmentType | ''
    outroMotivo: string
    newConcentracao: string
    newIntervalo: string
    newTipo: string
    newVia: string
    newExtrato: string
    justificativa: string
  }>({
    initial: { type: '', outroMotivo: '', newConcentracao: '', newIntervalo: '', newTipo: '', newVia: '', newExtrato: '', justificativa: '' },
    validate: (v) => {
      const e: Partial<Record<string, string>> = {}
      if (!v.type) e.type = 'Selecione o tipo de ajuste'
      if (v.type === 'outro' && !v.outroMotivo.trim()) e.outroMotivo = 'Especifique o motivo'
      if (!v.newConcentracao.trim()) e.newConcentracao = 'Informe a nova concentração'
      if (!v.newIntervalo.trim()) e.newIntervalo = 'Selecione o novo intervalo'
      else if (!/^\d+$/.test(v.newIntervalo.trim())) e.newIntervalo = 'Informe um número válido de dias'
      if (!v.justificativa.trim()) e.justificativa = 'Justificativa é obrigatória'
      else if (v.justificativa.trim().length < 10) e.justificativa = 'Justificativa deve ter ao menos 10 caracteres'
      return e
    },
  })
  const [showAdjustToast, setShowAdjustToast] = useState(false)
  const [showInactivateModal, setShowInactivateModal] = useState(false)
  const [showInactivateToast, setShowInactivateToast] = useState(false)
  const inactivateForm = useForm<{ category: InactivationCategory | ''; outroMotivo: string; detail: string; expectedReturnDate: string }>({
    initial: { category: '', outroMotivo: '', detail: '', expectedReturnDate: '' },
    validate: (v) => {
      const e: { category?: string; outroMotivo?: string; detail?: string; expectedReturnDate?: string } = {}
      if (!v.category) e.category = 'Selecione a categoria da inativação'
      if (v.category === 'outro' && !v.outroMotivo.trim()) e.outroMotivo = 'Especifique o motivo'
      if (!v.detail.trim()) e.detail = 'Detalhamento é obrigatório'
      else if (v.detail.trim().length < 10) e.detail = 'Detalhamento deve ter ao menos 10 caracteres'
      return e
    },
  })
  const [showReactivateModal, setShowReactivateModal] = useState(false)
  const [showReactivateToast, setShowReactivateToast] = useState(false)
  const reactivateForm = useForm<{ concentracao: string; intervalo: string; justificativa: string; note: string }>({
    initial: { concentracao: '', intervalo: '', justificativa: '', note: '' },
  })
  const [showInactivationHistory, setShowInactivationHistory] = useState(false)
  const [editForm, setEditForm] = useState({
    nome: '', telefone: '', peso: '', medicoResponsavel: '',
  })
  const monthsScrollRef = useRef<HTMLDivElement | null>(null)
  const [monthsCanScrollLeft, setMonthsCanScrollLeft] = useState(false)
  const [monthsCanScrollRight, setMonthsCanScrollRight] = useState(false)

  const scrollMonths = (direction: 'left' | 'right') => {
    const el = monthsScrollRef.current
    if (!el) return
    el.scrollBy({ left: direction === 'left' ? -el.clientWidth * 0.6 : el.clientWidth * 0.6, behavior: 'smooth' })
  }

  const INACTIVATION_CATEGORY_LABELS: Record<InactivationCategory, string> = {
    conclusao_tratamento: 'Conclusão do tratamento',
    reacao_adversa_leve: 'Reação adversa leve',
    reacao_adversa_grave: 'Reação adversa grave',
    infeccao_aguda: 'Infecção aguda',
    gestacao: 'Gestação',
    cirurgia_programada: 'Cirurgia programada',
    vacinacao_recente: 'Vacinação recente',
    contraindicacao_clinica: 'Contraindicação clínica',
    mudanca_conduta: 'Mudança de conduta clínica',
    falta_adesao: 'Falta de adesão',
    solicitacao_paciente: 'Solicitação do paciente',
    outro: 'Outro',
  }

  useEffect(() => {
    if (!selectedPatient && patientId) {
      const { immunotherapies } = useImmunotherapiesStore.getState()
      const imm = immunotherapies.find((i) => i.id === patientId)
      if (imm) {
        setSelectedPatient({
          id: imm.id, nome: imm.nome, dataNascimento: '02/07/2000', idade: 25,
          telefone: '(62) 99557-1423', peso: '89.7 kg', cpf: '711.905.744-89',
          medicoResponsavel: imm.medicoResponsavel, status: imm.status === 'ativo' ? 'ativo' as const : 'inativo' as const,
          tipoImunoterapia: imm.tipo, inicioInducao: '01/01/2020', inicioManutencao: null,
          viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
          concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
          intervaloAtual: imm.cicloIntervalo.dias, dataProximaAplicacao: '21/05/2025',
          concentracaoDoseAtuais: imm.doseConcentracao,
          inactivations: imm.status === 'inativo' ? seedInactivationsFor(imm.id, imm.doseConcentracao, imm.cicloIntervalo.dias) : undefined,
        })
      } else {
        navigate({ to: '/immunotherapies' })
      }
    }
  }, [patientId, selectedPatient, navigate, setSelectedPatient])

  const currentUser = useUserStore((s) => s.current)
  const logAccess = useAuditStore((s) => s.logAccess)
  const loggedAccessRef = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedPatient) return
    const key = `${currentUser.id}::${selectedPatient.id}`
    if (loggedAccessRef.current === key) return
    loggedAccessRef.current = key
    logAccess({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userRegistration: currentUser.registration,
      patientId: selectedPatient.id,
      patientName: selectedPatient.nome,
      action: 'view_chart',
      description: 'Consultou o prontuário',
    })
  }, [selectedPatient, currentUser, logAccess])

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

  const inicioInducaoCalc = useMemo(() => {
    const realized = patientApps.filter((a) => a.status === 'realizada')
    if (!realized.length) return null
    const firstApp = [...realized].sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+da[2], +da[1] - 1, +da[0]).getTime() - new Date(+db[2], +db[1] - 1, +db[0]).getTime()
    })[0]
    return firstApp.data
  }, [patientApps])

  const inicioManutencaoCalc = useMemo(() => {
    const meta = patientApps.filter((a) => a.status === 'realizada' && a.dose === META_DOSE)
    if (!meta.length) return null
    const firstMeta = [...meta].sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+da[2], +da[1] - 1, +da[0]).getTime() - new Date(+db[2], +db[1] - 1, +db[0]).getTime()
    })[0]
    return firstMeta.data
  }, [patientApps])

  const currentInterval = lastRealized?.ciclo.dias ?? selectedPatient?.intervaloAtual ?? 7
  const currentDose = lastRealized
    ? `${lastRealized.concentracaoExtrato || lastRealized.dose.split(' - ')[0]} - ${lastRealized.volumeAplicado || lastRealized.dose.split(' - ')[1]}`
    : selectedPatient?.concentracaoDoseAtuais ?? '-'

  const nextCalc = useMemo(() => calculateNextDose(currentDose, currentInterval), [currentDose, currentInterval])

  const nextDate = useMemo(() => {
    if (!lastRealized) return selectedPatient?.dataProximaAplicacao ?? '-'
    try {
      const [d, m, y] = lastRealized.data.split('/')
      return format(addDays(new Date(+y, +m - 1, +d), nextCalc.interval), 'dd/MM/yyyy')
    } catch { return '-' }
  }, [lastRealized, nextCalc.interval, selectedPatient])

  const treatmentTime = useMemo(() => {
    const inicio = inicioInducaoCalc || selectedPatient?.inicioInducao
    if (!inicio) return null
    try {
      const start = parse(inicio, 'dd/MM/yyyy', new Date())
      const days = differenceInDays(new Date(), start)
      const months = Math.floor(days / 30)
      const years = Math.floor(months / 12)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      if (months > 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
      return `${days} ${days === 1 ? 'dia' : 'dias'}`
    } catch { return null }
  }, [inicioInducaoCalc, selectedPatient])

  const sortedApps = useMemo(() => {
    return [...patientApps].sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })
  }, [patientApps])

  const availableMonths = useMemo(() => {
    const set = new Map<string, string>()
    sortedApps.forEach((a) => {
      const key = `${a.ano}-${a.mes}`
      if (!set.has(key)) set.set(key, `${a.mes} ${a.ano}`)
    })
    return Array.from(set.entries()).map(([key, label]) => ({ key, label }))
  }, [sortedApps])

  useEffect(() => {
    const el = monthsScrollRef.current
    if (!el) return
    const update = () => {
      setMonthsCanScrollLeft(el.scrollLeft > 2)
      setMonthsCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
    }
    const raf = requestAnimationFrame(update)
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    Array.from(el.children).forEach((c) => ro.observe(c))
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [availableMonths.length, viewMode])

  const filteredApps = useMemo(() => {
    if (monthFilter === 'all') return sortedApps
    return sortedApps.filter((a) => `${a.ano}-${a.mes}` === monthFilter)
  }, [sortedApps, monthFilter])

  const grouped = useMemo(() => {
    const g: Record<string, Application[]> = {}
    filteredApps.forEach((a) => {
      const key = `${a.mes} ${a.ano}`
      if (!g[key]) g[key] = []
      g[key].push(a)
    })
    return g
  }, [filteredApps])

  const appsByDate = useMemo(() => {
    const m: Record<string, Application[]> = {}
    patientApps.forEach((a) => {
      if (!m[a.data]) m[a.data] = []
      m[a.data].push(a)
    })
    return m
  }, [patientApps])

  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }, [calMonth, calYear])

  const calMonthLabel = (() => {
    const raw = format(new Date(calYear, calMonth, 1), "MMMM 'de' yyyy", { locale: ptBR })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  })()

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
  const isMaintenance = currentInterval > 7
  const progressPct = isMaintenance ? 100 : Math.round(((currentStepIndex >= 0 ? currentStepIndex : 0) + 1) / allSteps.length * 100)

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  const activeInactivation = useMemo(() => {
    if (!selectedPatient?.inactivations?.length) return null
    const last = selectedPatient.inactivations[selectedPatient.inactivations.length - 1]
    return last && !last.reactivatedAt ? last : null
  }, [selectedPatient])

  const inactivationCount = selectedPatient?.inactivations?.length ?? 0

  const suggestedNextDose = useMemo(() => {
    if (isMaintenance) return selectedPatient?.concentracaoDoseAtuais ?? '1:10 - 0,5ml'
    if (currentStepIndex < 0) return selectedPatient?.concentracaoDoseAtuais ?? ''
    const nextIdx = Math.min(currentStepIndex + 1, allSteps.length - 1)
    return allSteps[nextIdx]
  }, [isMaintenance, currentStepIndex, allSteps, selectedPatient])

  const pauseDays = useMemo(() => {
    if (!activeInactivation) return 0
    try {
      const startStr = activeInactivation.startDate.split(' às ')[0]
      const start = parse(startStr, 'dd/MM/yyyy', new Date())
      return Math.max(0, differenceInDays(new Date(), start))
    } catch { return 0 }
  }, [activeInactivation])

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs text-(--text-muted)">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="mx-4 my-4 flex flex-1 gap-4 min-h-0 min-w-0">
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
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[0.6rem] font-semibold border border-yellow-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
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
            {selectedPatient.status === 'inativo' && activeInactivation && (
              <div className="mt-2.5 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-[0.6rem] font-semibold text-yellow-700 flex items-center gap-1">
                    <Info size={9} />
                    Motivo da inativação
                  </div>
                  <span className="text-[0.55rem] text-yellow-700/80">{activeInactivation.startDate}</span>
                </div>
                <div className="text-[0.6rem] font-bold text-yellow-800 mb-0.5">{INACTIVATION_CATEGORY_LABELS[activeInactivation.category]}</div>
                <div className="text-[0.6rem] text-yellow-700 leading-relaxed">{activeInactivation.detail}</div>
                {activeInactivation.expectedReturnDate && (
                  <div className="text-[0.55rem] text-yellow-700/80 mt-1">Retorno previsto: <span className="font-semibold">{activeInactivation.expectedReturnDate}</span></div>
                )}
                <div className="text-[0.55rem] text-yellow-700/80 mt-0.5">Responsável: <span className="font-semibold">{activeInactivation.responsavel}</span></div>
              </div>
            )}
            <div className="mt-3 flex gap-1.5">
              {selectedPatient.status === 'inativo' ? (
                canReactivate && (
                  <button
                    onClick={() => {
                      const snapshotInterval = activeInactivation?.snapshotIntervalo ?? selectedPatient.intervaloAtual
                      reactivateForm.setValues({
                        concentracao: suggestedNextDose,
                        intervalo: String(snapshotInterval),
                        justificativa: '',
                        note: '',
                      })
                      setShowReactivateModal(true)
                    }}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold transition-all bg-linear-to-br from-emerald-400 to-emerald-500 text-white cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(52,211,153,0.3)]"
                  >
                    Reativar paciente
                  </button>
                )
              ) : (
                canEvolve && (
                  <button
                    onClick={() => navigate({ to: '/patient-evolution', search: { patientId: selectedPatient.id } })}
                    className="flex-1 h-8 rounded-lg text-xs font-semibold transition-all bg-linear-to-br from-brand to-teal-400 text-white cursor-pointer hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)]"
                  >
                    Evoluir Paciente
                  </button>
                )
              )}
              {canEmitReport && (
                <button
                  onClick={() => navigate({ to: '/patient-report', search: { patientId: selectedPatient.id } })}
                  className="flex-1 h-8 rounded-lg border-[1.5px] border-(--border-custom) text-xs font-semibold text-(--text-muted) cursor-pointer hover:border-brand hover:text-brand hover:bg-teal-50 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.12)] transition-all"
                >
                  Emitir Relatório
                </button>
              )}
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
              <div className={cn("overflow-hidden transition-all duration-300", showPersonal ? "max-h-80 opacity-100" : "max-h-0 opacity-0")}>
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
                  {canEditPatient && (
                    <div className="pt-2 mt-1 border-t border-(--border-custom)">
                      <button
                        onClick={() => {
                          setEditForm({
                            nome: selectedPatient.nome,
                            telefone: selectedPatient.telefone,
                            peso: selectedPatient.peso,
                            medicoResponsavel: selectedPatient.medicoResponsavel,
                          })
                          setShowEditModal(true)
                        }}
                        className="w-full h-7 rounded-lg text-[0.65rem] font-semibold transition-all flex items-center justify-center gap-1.5 border-[1.5px] border-brand text-brand hover:bg-teal-50 cursor-pointer"
                      >
                        <Pencil size={11} />
                        Editar dados pessoais
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dados da Imunoterapia */}
            <div className="border border-(--border-custom) rounded-lg overflow-hidden">
              <button
                onClick={() => setShowImmuno(!showImmuno)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-(--text) hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  Dados da Imunoterapia
                  {selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Protocolo ajustado" />
                  )}
                </span>
                {showImmuno ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div className={cn("overflow-hidden transition-all duration-300", showImmuno ? "max-h-80 opacity-100" : "max-h-0 opacity-0")}>
                <div className="px-3.5 pb-3 space-y-2">
                  {selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-[0.6rem] text-amber-700 font-semibold">
                      <AlertTriangle size={10} />
                      Protocolo ajustado · {selectedPatient.protocolAdjustments.length} {selectedPatient.protocolAdjustments.length === 1 ? 'alteração' : 'alterações'}
                    </div>
                  )}
                  {[
                    ['Tipo', selectedPatient.tipoImunoterapia],
                    ['Via de Administração', selectedPatient.viaAdministracao],
                    ['Início Indução', inicioInducaoCalc || selectedPatient.inicioInducao],
                    ['Início Manutenção', inicioManutencaoCalc || selectedPatient.inicioManutencao || '-'],
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
                  {/* Action buttons */}
                  {(canAdjustProtocol || canInactivate || (selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0) || (inactivationCount > 0)) && (
                  <div className="pt-2 mt-1 border-t border-(--border-custom) space-y-1.5">
                    {(canAdjustProtocol || (selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0)) && (
                    <div className="flex gap-2">
                      {canAdjustProtocol && (
                        <button
                          onClick={() => {
                            adjustForm.setValues({
                              type: '',
                              outroMotivo: '',
                              newConcentracao: selectedPatient.concentracaoDoseAtuais,
                              newIntervalo: String(selectedPatient.intervaloAtual),
                              newTipo: selectedPatient.tipoImunoterapia,
                              newVia: selectedPatient.viaAdministracao,
                              newExtrato: selectedPatient.extrato,
                              justificativa: '',
                            })
                            setShowAdjustModal(true)
                          }}
                          disabled={selectedPatient.status === 'inativo'}
                          className={cn("flex-1 h-7 rounded-lg text-[0.65rem] font-semibold transition-all flex items-center justify-center gap-1.5 border-[1.5px]", selectedPatient.status === 'inativo' ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-brand text-brand hover:bg-teal-50 cursor-pointer")}
                        >
                          <SlidersHorizontal size={11} />
                          Ajustar protocolo
                        </button>
                      )}
                      {selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0 && (
                        <button
                          onClick={() => setShowAdjustHistory(true)}
                          className={cn("h-7 px-2.5 rounded-lg text-[0.65rem] font-semibold transition-all flex items-center gap-1.5 border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand cursor-pointer", !canAdjustProtocol && "flex-1 justify-center")}
                        >
                          <History size={11} />
                          {canAdjustProtocol ? selectedPatient.protocolAdjustments.length : `Histórico de ajustes (${selectedPatient.protocolAdjustments.length})`}
                        </button>
                      )}
                    </div>
                    )}
                    {canInactivate && selectedPatient.status === 'ativo' && (
                      <button
                        onClick={() => {
                          inactivateForm.reset()
                          setShowInactivateModal(true)
                        }}
                        className="w-full h-7 rounded-lg text-[0.65rem] font-semibold transition-all flex items-center justify-center gap-1.5 border-[1.5px] border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 cursor-pointer"
                      >
                        <PowerOff size={11} />
                        Inativar imunoterapia
                      </button>
                    )}
                    {inactivationCount > 0 && (
                      <button
                        onClick={() => setShowInactivationHistory(true)}
                        className="w-full h-6.5 rounded-lg text-[0.6rem] font-semibold transition-all flex items-center justify-center gap-1.5 border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand cursor-pointer"
                      >
                        <History size={10} />
                        Histórico de inativações ({inactivationCount})
                      </button>
                    )}
                  </div>
                  )}
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
              { icon: Clock, label: 'Intervalo Atual', value: `${currentInterval} dias`, sub: null as string | null },
              { icon: CalendarDays, label: 'Próxima Aplicação', value: nextDate, sub: null },
              { icon: Droplet, label: 'Última Concentração - Volume', value: currentDose, sub: null },
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
                  <div className="flex-1 relative z-10 min-w-0">
                    <div className="text-xs font-medium text-(--text-muted)">{card.label}</div>
                    <div className="text-sm font-extrabold text-(--text) truncate">{card.value}</div>
                    {card.sub && <div className="text-[0.65rem] font-semibold text-brand truncate mt-0.5">{card.sub}</div>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Applications card */}
          <div className="flex-1 flex flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden min-h-0 min-w-0">
            {/* Header + Filters */}
            <div className="px-5 py-3 border-b border-(--border-custom) min-w-0">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-sm font-bold text-(--text)">Aplicações</h2>
                <button
                  onClick={() => setShowProgress(!showProgress)}
                  className="text-[0.6rem] font-semibold text-brand hover:underline cursor-pointer flex items-center gap-1"
                >
                  {showProgress ? 'Ocultar' : 'Ver'} progressão
                  <ChevronDown size={10} className={cn("transition-transform", showProgress && "rotate-180")} />
                </button>
              </div>

              {/* Collapsible progress */}
              <div className={cn("overflow-hidden transition-all duration-300", showProgress ? "max-h-80 opacity-100 mb-3" : "max-h-0 opacity-0")}>
                <div className="bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-(--text-muted)">Progressão da indução</span>
                    <span className="text-[0.7rem] font-bold text-brand">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-linear-to-r from-brand to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPct}%` }} />
                  </div>
                  {/* 4 concentration blocks */}
                  <div className="flex gap-0">
                    {inductionSteps.map((group, gi) => {
                      const startIdx = inductionSteps.slice(0, gi).reduce((acc, s) => acc + s.vols.length, 0)
                      const safeIdx = currentStepIndex >= 0 ? currentStepIndex : 0
                      const blockActive = safeIdx >= startIdx && safeIdx < startIdx + group.vols.length
                      const blockFuture = safeIdx < startIdx
                      return (
                        <div key={group.conc} className="flex items-center flex-1 min-w-0">
                          <div className={cn("flex-1 rounded-md px-2 py-1.5 transition-all", blockFuture && "opacity-30")}>
                            <div className={cn("text-[0.5rem] font-bold mb-1 truncate", blockActive ? "text-brand" : "text-(--text-muted)")}>{group.conc}</div>
                            <div className="flex gap-0.5 flex-wrap">
                              {group.vols.map((vol, vi) => {
                                const stepIdx = startIdx + vi
                                const isCurrent = stepIdx === safeIdx
                                const isDone = stepIdx < safeIdx
                                const isLast = gi === inductionSteps.length - 1 && vi === group.vols.length - 1
                                return (
                                  <span
                                    key={vi}
                                    className={cn(
                                      "text-[0.45rem] px-1 py-px rounded font-semibold",
                                      stepIdx > safeIdx && "opacity-40",
                                    )}
                                    style={{
                                      backgroundColor: isCurrent ? '#18C1CB' : isDone ? '#E2E8F0' : '#F1F5F9',
                                      color: isCurrent ? 'white' : isDone ? '#64748B' : '#94A3B8',
                                      outlineColor: isCurrent ? '#18C1CB' : undefined,
                                      outlineWidth: isCurrent ? 1 : 0,
                                      outlineOffset: 1,
                                    }}
                                  >
                                    {vol}{isLast ? ' ★' : ''}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                          {gi < inductionSteps.length - 1 && <div className="w-px h-8 bg-gray-300 mx-1 shrink-0" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Manutenção progress — timeline */}
                <div className="bg-gray-50 rounded-lg px-4 py-3 mt-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[0.6rem] font-bold uppercase tracking-wider text-(--text-muted)">Progressão da manutenção</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Meta · 28 dias (estável)</span>
                  </div>

                  {/* Timeline horizontal */}
                  <div className="flex items-start justify-between relative px-2">
                    {/* Connecting line */}
                    <div className="absolute top-2.25 left-6 right-6 h-px bg-gray-300" />
                    <div className="absolute top-2.25 left-6 h-px bg-[#A78BFA] transition-all duration-700" style={{ width: isMaintenance ? (currentInterval >= 28 ? 'calc(100% - 48px)' : currentInterval >= 21 ? 'calc(50%)' : 'calc(0%)') : '0%' }} />

                    {(() => {
                      const maintenanceApps = patientApps.filter((a) => a.status === 'realizada' && a.ciclo.dias >= 14)
                      const intervals = [
                        { dias: 14, label: '14 dias' },
                        { dias: 21, label: '21 dias' },
                        { dias: 28, label: '28 dias ★' },
                      ]
                      return intervals.map((step) => {
                        const isActive = isMaintenance && currentInterval >= step.dias
                        const firstApp = maintenanceApps.find((a) => a.ciclo.dias === step.dias)
                        return (
                          <div key={step.dias} className="flex flex-col items-center z-10">
                            <div className={cn(
                              "w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all",
                              isActive
                                ? "bg-[#A78BFA] border-[#A78BFA]"
                                : "bg-white border-gray-300"
                            )}>
                              {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className="w-px h-3 bg-gray-300 mt-0.5" />
                            <div className={cn("text-center mt-1", !isActive && "opacity-40")}>
                              <div className={cn("text-[0.55rem] font-bold", isActive ? "text-[#7C3AED]" : "text-(--text-muted)")}>
                                {step.label}
                              </div>
                              <div className="text-[0.45rem] text-(--text-muted)">
                                {firstApp ? firstApp.data : '—'}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>
              {(viewMode === 'timeline' || viewMode === 'calendar') && (
                <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {monthsCanScrollLeft && (
                    <button
                      type="button"
                      aria-label="Rolar meses para a esquerda"
                      onClick={() => scrollMonths('left')}
                      className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand shadow-sm cursor-pointer transition-all"
                    >
                      <ChevronLeft size={12} />
                    </button>
                  )}
                  <div ref={monthsScrollRef} className="flex gap-1.5 overflow-x-auto pb-0.5 scroll-smooth flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
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
                        onClick={() => {
                          setMonthFilter(m.key)
                          const [yr, monthName] = m.key.split('-')
                          const meses = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
                          const mi = meses.indexOf(monthName.toUpperCase())
                          if (mi >= 0) { setCalMonth(mi); setCalYear(Number(yr)) }
                        }}
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
                  {monthsCanScrollRight && (
                    <button
                      type="button"
                      aria-label="Rolar meses para a direita"
                      onClick={() => scrollMonths('right')}
                      className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand shadow-sm cursor-pointer transition-all"
                    >
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
                <div className="flex h-6.5 rounded-lg border border-(--border-custom) overflow-hidden shrink-0">
                  <button onClick={() => setViewMode('timeline')} className={cn("px-2 flex items-center gap-1 text-[0.55rem] font-semibold transition-all", viewMode === 'timeline' ? "bg-brand text-white" : "text-(--text-muted) hover:bg-gray-50")}>
                    <List size={10} />
                    Lista
                  </button>
                  <button onClick={() => setViewMode('calendar')} className={cn("px-2 flex items-center gap-1 text-[0.55rem] font-semibold transition-all", viewMode === 'calendar' ? "bg-brand text-white" : "text-(--text-muted) hover:bg-gray-50")}>
                    <CalendarDays size={10} />
                    Calendário
                  </button>
                </div>
                </div>
              )}
            </div>

            {viewMode === 'timeline' ? (
              /* Timeline */
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {filteredApps.length === 0 ? (
                  <div className="text-center text-xs text-(--text-muted) py-10">Nenhuma aplicação encontrada neste período.</div>
                ) : (
                  <div className="relative pl-7">
                    {Object.entries(grouped).map(([monthYear, apps]) => {
                      return (
                        <div key={monthYear} className="mb-7 last:mb-0">
                          <div className="flex items-center gap-1.5 mb-2 -ml-7">
                            <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.5px] text-(--text-muted)">{monthYear}</span>
                            <span className="text-[0.55rem] bg-gray-100 text-(--text-muted) border border-(--border-custom) px-1.5 py-px rounded-full">
                              {apps.length} aplicaç{apps.length === 1 ? 'ão' : 'ões'}
                            </span>
                          </div>

                          <div className="relative">
                          <div className="absolute -left-3.75 top-0 bottom-0 w-px bg-gray-200 rounded-full" />

                          {apps.map((app, idx) => {
                            const color = INTERVAL_COLORS[app.ciclo.dias] || DEFAULT_COLOR
                            const isRealized = app.status === 'realizada'
                            const isNext = app.status === 'agendada'
                            const hasReaction = app.efeitoColateral === 'Sim'
                            const nodeColor = hasReaction ? '#EA580C' : isNext ? '#0d9488' : '#2dd4bf'
                            return (
                              <div
                                key={app.id}
                                className="relative mb-2.5 last:mb-0"
                                style={{ animationDelay: `${idx * 0.06}s` }}
                              >
                                <div className="absolute -left-6.25 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center z-10">
                                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nodeColor }} />
                                  </div>
                                </div>

                                <div
                                  onClick={() => isRealized && setSelectedApp(app)}
                                  className={cn(
                                    "rounded-lg border p-3 ml-1 transition-all",
                                    hasReaction
                                      ? "border-orange-300 bg-orange-50/40 hover:border-orange-400"
                                      : isNext
                                      ? "border-teal-400 bg-teal-50/60"
                                      : "border-(--border-custom) bg-white hover:translate-x-0.5 hover:shadow-[0_2px_8px_rgba(20,184,166,0.1)]",
                                    isRealized && "cursor-pointer"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div>
                                        <div className="text-xs font-bold text-(--text) flex items-center gap-1.5">
                                          {app.dose}
                                          {hasReaction && <span className="text-[0.55rem] font-bold text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-px rounded-full">REAÇÃO</span>}
                                        </div>
                                        <div className="text-[0.65rem] text-(--text-muted) mt-0.5">
                                          {app.data} · {app.horaInicio}–{app.horaFim}
                                        </div>
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
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Calendar view */
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }} className="h-7 w-7 flex items-center justify-center rounded-lg border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs font-bold text-(--text)">{calMonthLabel}</span>
                  <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }} className="h-7 w-7 flex items-center justify-center rounded-lg border border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer">
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                    <div key={d} className="text-center text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider py-1">{d}</div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                  {calDays.map((day, i) => {
                    if (day === null) return <div key={`empty-${i}`} className="bg-gray-50/50 h-18" />
                    const dateStr = `${String(day).padStart(2, '0')}/${String(calMonth + 1).padStart(2, '0')}/${calYear}`
                    const dayApps = appsByDate[dateStr] || []
                    const isToday = day === new Date().getDate() && calMonth === new Date().getMonth() && calYear === new Date().getFullYear()
                    return (
                      <div key={day} className={cn("bg-white h-18 p-1.5 relative", isToday && "bg-teal-50/40")}>
                        <div className={cn("text-[0.6rem] font-semibold mb-1", isToday ? "text-brand" : "text-(--text-muted)")}>
                          {day}
                        </div>
                        {dayApps.length > 0 && (
                          <div className="space-y-0.5">
                            {dayApps.slice(0, 2).map((app) => {
                              const isRealized = app.status === 'realizada'
                              const isNext = app.status === 'agendada'
                              const hasReaction = app.efeitoColateral === 'Sim'
                              const intColor = INTERVAL_COLORS[app.ciclo.dias] || DEFAULT_COLOR
                              const style = hasReaction
                                ? { backgroundColor: '#FFEDD5', color: '#9A3412', borderColor: '#EA580C' }
                                : { backgroundColor: intColor.bg, color: intColor.text, borderColor: intColor.dot }
                              return (
                                <div
                                  key={app.id}
                                  onClick={() => isRealized && setSelectedApp(app)}
                                  className={cn(
                                    "rounded px-1 py-0.5 text-[0.45rem] font-semibold truncate flex items-center gap-0.5",
                                    isNext ? "cursor-default border-dashed border" :
                                    isRealized ? "cursor-pointer border" :
                                    "bg-gray-100 text-(--text-muted) border border-gray-200"
                                  )}
                                  style={style}
                                  title={hasReaction ? 'Reação adversa registrada' : undefined}
                                >
                                  <span className="truncate">{app.dose}</span>
                                </div>
                              )
                            })}
                            {dayApps.length > 2 && (
                              <div className="text-[0.45rem] text-(--text-muted) font-medium text-center">+{dayApps.length - 2}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar dados do paciente"
        size="lg"
        footer={<>
          <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
          <Button variant="primary" leftIcon={<Save size={13} />} onClick={() => setShowEditConfirm(true)}>Salvar alterações</Button>
        </>}
      >
        <div>
          <h4 className="text-xs font-bold text-(--text) mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-brand" />
            Dados Pessoais
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Nome completo">
              <TextInput value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Telefone">
              <TextInput value={editForm.telefone} onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Peso">
              <TextInput value={editForm.peso} onChange={(e) => setEditForm({ ...editForm, peso: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="Médico responsável">
              <TextInput value={editForm.medicoResponsavel} onChange={(e) => setEditForm({ ...editForm, medicoResponsavel: e.target.value })} />
            </FieldLabel>
            <FieldLabel label="CPF">
              <TextInput value={selectedPatient.cpf} disabled className="bg-gray-100/80 text-(--text-muted) cursor-not-allowed" />
            </FieldLabel>
            <FieldLabel label="Data de nascimento">
              <TextInput value={selectedPatient.dataNascimento} disabled className="bg-gray-100/80 text-(--text-muted) cursor-not-allowed" />
            </FieldLabel>
          </div>
        </div>
      </Modal>

      <Modal
        open={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Ajustar protocolo"
        footer={<>
          <Button variant="outline" onClick={() => setShowAdjustModal(false)}>Cancelar</Button>
          <Button
            variant="primary"
            leftIcon={<Save size={13} />}
            onClick={() => {
              if (!adjustForm.validate()) return
              const v = adjustForm.values
              const justificativaFinal = v.type === 'outro' && v.outroMotivo.trim()
                ? `[${v.outroMotivo.trim()}] ${v.justificativa.trim()}`
                : v.justificativa.trim()
              const adjustment = {
                id: `adj-${Date.now()}`,
                date: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
                type: v.type as ProtocolAdjustmentType,
                previousConcentracao: selectedPatient.concentracaoDoseAtuais,
                previousIntervalo: selectedPatient.intervaloAtual,
                newConcentracao: v.newConcentracao,
                newIntervalo: Number(v.newIntervalo.trim()),
                justificativa: justificativaFinal,
                responsavel: selectedPatient.medicoResponsavel,
              }
              setSelectedPatient({
                ...selectedPatient,
                tipoImunoterapia: v.newTipo,
                viaAdministracao: v.newVia,
                extrato: v.newExtrato,
                concentracaoDoseAtuais: v.newConcentracao,
                intervaloAtual: Number(v.newIntervalo.trim()),
                protocolAdjustments: [...(selectedPatient.protocolAdjustments || []), adjustment],
              })
              setShowAdjustModal(false)
              setShowAdjustToast(true)
              setTimeout(() => setShowAdjustToast(false), 6000)
            }}
          >Confirmar ajuste</Button>
        </>}
      >
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[0.65rem] text-amber-800 leading-relaxed">
            Alterações no protocolo são <span className="font-bold">irreversíveis</span>. A progressão continuará a partir dos novos valores e o desvio será destacado no prontuário e nos relatórios clínicos.
          </p>
        </div>

        <FieldLabel label="Tipo de ajuste" required error={adjustForm.errorOf('type')}>
          <Select
            value={adjustForm.values.type}
            onChange={(e) => adjustForm.set('type', e.target.value as ProtocolAdjustmentType)}
            invalid={adjustForm.showError('type')}
          >
            <option value="" disabled>Selecione o motivo do ajuste</option>
            <option value="reducao_dose">Redução de dose</option>
            <option value="aumento_intervalo">Aumento de intervalo</option>
            <option value="alteracao_concentracao">Alteração de concentração</option>
            <option value="suspensao">Suspensão temporária</option>
            <option value="outro">Outro</option>
          </Select>
        </FieldLabel>
        {adjustForm.values.type === 'outro' && (
          <div>
            <TextInput
              placeholder="Especifique o motivo do ajuste"
              value={adjustForm.values.outroMotivo}
              onChange={(e) => adjustForm.set('outroMotivo', e.target.value)}
              invalid={adjustForm.showError('outroMotivo')}
            />
            {adjustForm.errorOf('outroMotivo') && <span className="text-[0.6rem] text-red-500 mt-0.5 block">{adjustForm.errorOf('outroMotivo')}</span>}
          </div>
        )}

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-2.5">
          <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider">Dados da imunoterapia</div>
          <div className="grid grid-cols-2 gap-2">
            <FieldLabel label="Tipo">
              <Select value={adjustForm.values.newTipo} onChange={(e) => adjustForm.set('newTipo', e.target.value)}>
                <option value="Ácaros">Ácaros</option>
                <option value="Gramíneas">Gramíneas</option>
                <option value="Cão e Gato">Cão e Gato</option>
                <option value="Cândida">Cândida</option>
                <option value="Herpes">Herpes</option>
                <option value="Fungos">Fungos</option>
                <option value="Insetos">Insetos</option>
              </Select>
            </FieldLabel>
            <FieldLabel label="Via">
              <Select value={adjustForm.values.newVia} onChange={(e) => adjustForm.set('newVia', e.target.value)}>
                <option value="Subcutânea">Subcutânea</option>
                <option value="Sublingual">Sublingual</option>
              </Select>
            </FieldLabel>
          </div>
          <FieldLabel label="Extrato">
            <TextInput
              placeholder="Ex: Der p 60 + Der f 10%"
              value={adjustForm.values.newExtrato}
              onChange={(e) => adjustForm.set('newExtrato', e.target.value)}
            />
          </FieldLabel>
        </div>

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-2.5">
          <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider">Parâmetros do protocolo</div>

          <FieldLabel label="Concentração e volume" error={adjustForm.errorOf('newConcentracao')}>
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] text-(--text-muted) line-through shrink-0">{selectedPatient.concentracaoDoseAtuais}</span>
              <span className="text-(--text-muted) text-xs">→</span>
              <TextInput
                placeholder="Ex: 1:1.000 — 0,2ml"
                value={adjustForm.values.newConcentracao}
                onChange={(e) => adjustForm.set('newConcentracao', e.target.value)}
                invalid={adjustForm.showError('newConcentracao')}
                className="flex-1"
              />
            </div>
          </FieldLabel>

          <FieldLabel label="Intervalo entre doses" error={adjustForm.errorOf('newIntervalo')}>
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] text-(--text-muted) line-through shrink-0">{selectedPatient.intervaloAtual} dias</span>
              <span className="text-(--text-muted) text-xs">→</span>
              <div className="flex-1">
                {(() => {
                  const isCustom = adjustForm.values.newIntervalo && !['7', '14', '21', '28'].includes(adjustForm.values.newIntervalo)
                  const selectValue = isCustom ? 'outro' : adjustForm.values.newIntervalo
                  return (
                    <Select
                      value={selectValue}
                      onChange={(e) => {
                        const v = e.target.value
                        adjustForm.set('newIntervalo', v === 'outro' ? ' ' : v)
                      }}
                      invalid={adjustForm.showError('newIntervalo')}
                    >
                      <option value="" disabled>Selecione</option>
                      <option value="7">7 dias</option>
                      <option value="14">14 dias</option>
                      <option value="21">21 dias</option>
                      <option value="28">28 dias</option>
                      <option value="outro">Outro</option>
                    </Select>
                  )
                })()}
              </div>
            </div>
            {(adjustForm.values.newIntervalo === ' ' || (adjustForm.values.newIntervalo && !['7','14','21','28'].includes(adjustForm.values.newIntervalo))) && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[0.6rem] text-(--text-muted) shrink-0">Especifique:</span>
                <TextInput
                  type="number"
                  min="1"
                  placeholder="Ex: 35"
                  value={adjustForm.values.newIntervalo.trim()}
                  onChange={(e) => adjustForm.set('newIntervalo', e.target.value.replace(/[^0-9]/g, ''))}
                  className="flex-1"
                />
                <span className="text-[0.6rem] text-(--text-muted) shrink-0">dias</span>
              </div>
            )}
          </FieldLabel>
        </div>

        <FieldLabel label="Justificativa clínica" required error={adjustForm.errorOf('justificativa')}>
          <TextArea
            rows={3}
            placeholder="Descreva o motivo clínico do ajuste (obrigatório conforme protocolo)"
            value={adjustForm.values.justificativa}
            onChange={(e) => adjustForm.set('justificativa', e.target.value)}
            invalid={adjustForm.showError('justificativa')}
          />
        </FieldLabel>
      </Modal>

      <Modal
        open={showAdjustHistory && !!selectedPatient.protocolAdjustments && selectedPatient.protocolAdjustments.length > 0}
        onClose={() => setShowAdjustHistory(false)}
        title="Histórico de ajustes"
      >
        {selectedPatient.protocolAdjustments && [...selectedPatient.protocolAdjustments].reverse().map((adj) => {
          const typeLabels: Record<ProtocolAdjustmentType, string> = {
            reducao_dose: 'Redução de dose',
            aumento_intervalo: 'Aumento de intervalo',
            alteracao_concentracao: 'Alteração de concentração',
            suspensao: 'Suspensão temporária',
            outro: 'Outro',
          }
          return (
            <div key={adj.id} className="border border-(--border-custom) rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.6rem] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{typeLabels[adj.type]}</span>
                <span className="text-[0.55rem] text-(--text-muted)">{adj.date}</span>
              </div>
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between text-[0.65rem]">
                  <span className="text-(--text-muted)">Concentração:</span>
                  <span className="font-medium"><span className="text-(--text-muted) line-through">{adj.previousConcentracao}</span> → <span className="text-brand font-bold">{adj.newConcentracao}</span></span>
                </div>
                <div className="flex items-center justify-between text-[0.65rem]">
                  <span className="text-(--text-muted)">Intervalo:</span>
                  <span className="font-medium"><span className="text-(--text-muted) line-through">{adj.previousIntervalo}d</span> → <span className="text-brand font-bold">{adj.newIntervalo}d</span></span>
                </div>
              </div>
              <div className="bg-gray-50 rounded px-2.5 py-1.5 border-l-2 border-amber-400">
                <div className="text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Justificativa</div>
                <div className="text-[0.65rem] text-(--text) leading-relaxed">{adj.justificativa}</div>
              </div>
              <div className="text-[0.55rem] text-(--text-muted) mt-1.5">Responsável: <span className="font-semibold text-(--text)">{adj.responsavel}</span></div>
            </div>
          )
        })}
      </Modal>

      {/* Adjust success toast */}
      {showAdjustToast && (
        <div className="fixed top-6 right-6 z-50" style={{ animation: 'slide-up-fade 0.3s ease-out' }}>
          <div className="flex items-start gap-3 bg-white border border-emerald-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-95">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 shrink-0 mt-0.5">
              <Save size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--text)">Protocolo ajustado com sucesso!</p>
              <p className="text-xs text-(--text-muted) mt-1">A alteração foi registrada no histórico clínico e marcará as próximas aplicações como desvio de protocolo.</p>
            </div>
            <button onClick={() => setShowAdjustToast(false)} className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <Modal
        open={showInactivateModal}
        onClose={() => setShowInactivateModal(false)}
        title="Inativar imunoterapia"
        footer={<>
          <Button variant="outline" onClick={() => setShowInactivateModal(false)}>Voltar</Button>
          <Button
            variant="warning"
            onClick={() => {
              if (!inactivateForm.validate()) return
              const v = inactivateForm.values
              const expectedReturn = v.expectedReturnDate
                ? format(new Date(v.expectedReturnDate + 'T00:00:00'), 'dd/MM/yyyy')
                : null
              const detailFinal = v.category === 'outro' && v.outroMotivo.trim()
                ? `[${v.outroMotivo.trim()}] ${v.detail.trim()}`
                : v.detail.trim()
              inactivateImunoterapia({
                id: `inact-${Date.now()}`,
                category: v.category as InactivationCategory,
                detail: detailFinal,
                startDate: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
                expectedReturnDate: expectedReturn,
                responsavel: selectedPatient.medicoResponsavel,
                snapshotConcentracao: selectedPatient.concentracaoDoseAtuais,
                snapshotIntervalo: selectedPatient.intervaloAtual,
              })
              setShowInactivateModal(false)
              setShowInactivateToast(true)
              setTimeout(() => setShowInactivateToast(false), 6000)
            }}
          >Inativar imunoterapia</Button>
        </>}
      >
        <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
          <Info size={14} className="text-brand shrink-0 mt-0.5" />
          <p className="text-[0.65rem] text-teal-800 leading-relaxed">
            A inativação <span className="font-bold">pausa as aplicações</span> e registra o motivo no histórico clínico. O paciente poderá ser reativado a qualquer momento, com o médico definindo o ponto de retomada do protocolo.
          </p>
        </div>

        <FieldLabel label="Motivo da inativação" required error={inactivateForm.errorOf('category')}>
          <Select
            value={inactivateForm.values.category}
            onChange={(e) => inactivateForm.set('category', e.target.value as InactivationCategory)}
            invalid={inactivateForm.showError('category')}
          >
            <option value="" disabled>Selecione a categoria</option>
            {(Object.keys(INACTIVATION_CATEGORY_LABELS) as InactivationCategory[]).map((k) => (
              <option key={k} value={k}>{INACTIVATION_CATEGORY_LABELS[k]}</option>
            ))}
          </Select>
        </FieldLabel>
        {inactivateForm.values.category === 'outro' && (
          <div>
            <TextInput
              placeholder="Especifique o motivo da inativação"
              value={inactivateForm.values.outroMotivo}
              onChange={(e) => inactivateForm.set('outroMotivo', e.target.value)}
              invalid={inactivateForm.showError('outroMotivo')}
            />
            {inactivateForm.errorOf('outroMotivo') && <span className="text-[0.6rem] text-red-500 mt-0.5 block">{inactivateForm.errorOf('outroMotivo')}</span>}
          </div>
        )}

        <FieldLabel
          label="Detalhamento clínico"
          required
          error={inactivateForm.errorOf('detail')}
          helperText={`Mínimo 10 caracteres · ${inactivateForm.values.detail.trim().length} digitados`}
        >
          <TextArea
            rows={3}
            placeholder="Descreva o contexto clínico da inativação (obrigatório para rastreabilidade)"
            value={inactivateForm.values.detail}
            onChange={(e) => inactivateForm.set('detail', e.target.value)}
            invalid={inactivateForm.showError('detail')}
          />
        </FieldLabel>

        <FieldLabel
          label="Previsão de retorno"
          hint="(opcional)"
          helperText="Use para lembrar a equipe de avaliar a reativação. Deixe em branco se não houver previsão."
        >
          <TextInput
            type="date"
            value={inactivateForm.values.expectedReturnDate}
            onChange={(e) => inactivateForm.set('expectedReturnDate', e.target.value)}
          />
        </FieldLabel>

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-[0.65rem] text-(--text-muted)">Responsável pela inativação</span>
          <span className="text-[0.7rem] font-semibold text-(--text)">{selectedPatient.medicoResponsavel}</span>
        </div>
      </Modal>

      <Modal
        open={showReactivateModal && !!activeInactivation}
        onClose={() => setShowReactivateModal(false)}
        title="Reativar paciente"
        size="lg"
        footer={activeInactivation ? <>
          <Button variant="outline" onClick={() => setShowReactivateModal(false)}>Voltar</Button>
          <Button
            variant="primary"
            onClick={() => {
              const v = reactivateForm.values
              const errs: { concentracao?: string; intervalo?: string; justificativa?: string } = {}
              if (!v.concentracao.trim()) errs.concentracao = 'Informe a concentração/volume'
              const intervaloStr = v.intervalo.trim()
              if (!intervaloStr) errs.intervalo = 'Selecione o intervalo'
              else if (!/^\d+$/.test(intervaloStr)) errs.intervalo = 'Informe um número válido de dias'
              const diverges = v.concentracao.trim() !== suggestedNextDose.trim() || intervaloStr !== String(activeInactivation.snapshotIntervalo)
              if (diverges && !v.justificativa.trim()) errs.justificativa = 'Justifique o ajuste do ponto de retomada'
              else if (diverges && v.justificativa.trim().length < 10) errs.justificativa = 'Justificativa deve ter ao menos 10 caracteres'
              if (Object.keys(errs).length > 0) { reactivateForm.setErrors(errs); return }
              reactivateImunoterapia({
                note: v.note.trim(),
                reactivatedBy: selectedPatient.medicoResponsavel,
                reactivateConcentracao: v.concentracao.trim(),
                reactivateIntervalo: Number(intervaloStr),
                justificativa: v.justificativa.trim(),
              })
              setShowReactivateModal(false)
              setShowReactivateToast(true)
              setTimeout(() => setShowReactivateToast(false), 6000)
            }}
          >Reativar paciente</Button>
        </> : null}
      >
        {activeInactivation && <>
          <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
            <Info size={14} className="text-brand shrink-0 mt-0.5" />
            <p className="text-[0.65rem] text-teal-800 leading-relaxed">
              A sugestão abaixo respeita a progressão do protocolo. O médico pode <span className="font-bold">ajustar o ponto de retomada</span> conforme o tempo de pausa e a avaliação clínica.
            </p>
          </div>

          {/* Inativação atual */}
          <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[0.55rem] font-bold text-yellow-700 uppercase tracking-wider mb-2">
              <PowerOff size={10} />
              Inativação atual
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Motivo</span>
              <span className="font-semibold text-(--text)">{INACTIVATION_CATEGORY_LABELS[activeInactivation.category]}</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Início</span>
              <span className="font-medium text-(--text)">{activeInactivation.startDate}</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Tempo pausado</span>
              <span className={cn("font-semibold", pauseDays > 30 ? "text-red-600" : pauseDays > 14 ? "text-amber-600" : "text-(--text)")}>
                {pauseDays} {pauseDays === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            {activeInactivation.expectedReturnDate && (
              <div className="flex items-center justify-between text-[0.65rem]">
                <span className="text-(--text-muted)">Retorno previsto</span>
                <span className="font-medium text-(--text)">{activeInactivation.expectedReturnDate}</span>
              </div>
            )}
          </div>

          {/* Progresso antes da inativação */}
          <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-1.5">
            <div className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider mb-2">Progresso até a inativação</div>
            {lastRealized && (
              <div className="flex items-center justify-between text-[0.65rem]">
                <span className="text-(--text-muted)">Última aplicação</span>
                <span className="font-medium text-(--text)">{lastRealized.data} · {lastRealized.dose}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Concentração/volume atual</span>
              <span className="font-medium text-(--text)">{activeInactivation.snapshotConcentracao}</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Intervalo</span>
              <span className="font-medium text-(--text)">{activeInactivation.snapshotIntervalo} dias</span>
            </div>
            <div className="flex items-center justify-between text-[0.65rem]">
              <span className="text-(--text-muted)">Etapa</span>
              <span className="font-medium text-(--text)">{isMaintenance ? 'Manutenção' : `Indução · ${progressPct}%`}</span>
            </div>
          </div>

          {/* Ponto de retomada */}
          <div className="bg-teal-50/40 border border-teal-200 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-[0.55rem] font-bold text-brand uppercase tracking-wider">Ponto de retomada</div>
              <button
                type="button"
                onClick={() => reactivateForm.patch({ concentracao: suggestedNextDose, intervalo: String(activeInactivation.snapshotIntervalo) })}
                className="text-[0.55rem] font-semibold text-brand hover:underline cursor-pointer"
              >
                Usar sugestão do protocolo
              </button>
            </div>

            <FieldLabel label="Próxima concentração e volume" required error={reactivateForm.errorOf('concentracao')}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[0.6rem] text-(--text-muted) shrink-0">Sugestão:</span>
                <span className="text-[0.65rem] font-semibold text-brand shrink-0">{suggestedNextDose}</span>
              </div>
              <TextInput
                placeholder="Ex: 1:1.000 — 0,4ml"
                value={reactivateForm.values.concentracao}
                onChange={(e) => reactivateForm.set('concentracao', e.target.value)}
                invalid={reactivateForm.showError('concentracao')}
              />
            </FieldLabel>

            <FieldLabel label="Intervalo entre doses" required error={reactivateForm.errorOf('intervalo')}>
              {(() => {
                const isCustom = reactivateForm.values.intervalo && !['7', '14', '21', '28'].includes(reactivateForm.values.intervalo)
                const selectValue = isCustom ? 'outro' : reactivateForm.values.intervalo
                return (
                  <Select
                    value={selectValue}
                    onChange={(e) => {
                      const v = e.target.value
                      reactivateForm.set('intervalo', v === 'outro' ? ' ' : v)
                    }}
                    invalid={reactivateForm.showError('intervalo')}
                  >
                    <option value="" disabled>Selecione</option>
                    <option value="7">7 dias</option>
                    <option value="14">14 dias</option>
                    <option value="21">21 dias</option>
                    <option value="28">28 dias</option>
                    <option value="outro">Outro</option>
                  </Select>
                )
              })()}
              {(reactivateForm.values.intervalo === ' ' || (reactivateForm.values.intervalo && !['7','14','21','28'].includes(reactivateForm.values.intervalo))) && (
                <div className="flex items-center gap-2 mt-2">
                  <TextInput
                    type="number"
                    min="1"
                    placeholder="Ex: 35"
                    value={reactivateForm.values.intervalo.trim()}
                    onChange={(e) => reactivateForm.set('intervalo', e.target.value.replace(/[^0-9]/g, ''))}
                    className="flex-1"
                  />
                  <span className="text-[0.6rem] text-(--text-muted) shrink-0">dias</span>
                </div>
              )}
            </FieldLabel>
          </div>

          {(() => {
            const diverges = reactivateForm.values.concentracao.trim() !== suggestedNextDose.trim() || reactivateForm.values.intervalo.trim() !== String(activeInactivation.snapshotIntervalo)
            return (
              <FieldLabel
                label="Justificativa do ponto de retomada"
                required={diverges}
                hint={!diverges ? '(opcional)' : undefined}
                error={reactivateForm.errorOf('justificativa')}
              >
                <TextArea
                  rows={2}
                  placeholder={diverges ? "Justifique por que o ponto de retomada difere da sugestão do protocolo." : "Ex: paciente apto, seguir protocolo."}
                  value={reactivateForm.values.justificativa}
                  onChange={(e) => reactivateForm.set('justificativa', e.target.value)}
                  invalid={reactivateForm.showError('justificativa')}
                />
              </FieldLabel>
            )
          })()}

          <FieldLabel label="Observação clínica" hint="(opcional)">
            <TextArea
              rows={2}
              placeholder="Ex: sem sintomas residuais, pré-medicação não necessária."
              value={reactivateForm.values.note}
              onChange={(e) => reactivateForm.set('note', e.target.value)}
            />
          </FieldLabel>

          <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-[0.65rem] text-(--text-muted)">Responsável pela retomada</span>
            <span className="text-[0.7rem] font-semibold text-(--text)">{selectedPatient.medicoResponsavel}</span>
          </div>
        </>}
      </Modal>

      <Modal
        open={showInactivationHistory && !!selectedPatient.inactivations && selectedPatient.inactivations.length > 0}
        onClose={() => setShowInactivationHistory(false)}
        title="Histórico de inativações"
      >
        {selectedPatient.inactivations && [...selectedPatient.inactivations].reverse().map((s) => {
                const isActive = !s.reactivatedAt
                return (
                  <div key={s.id} className={cn("border rounded-lg p-3", isActive ? "border-teal-200 bg-teal-50/40" : "border-(--border-custom)")}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn("text-[0.6rem] font-bold px-2 py-0.5 rounded-full border", isActive ? "text-brand bg-teal-50 border-teal-200" : "text-emerald-700 bg-emerald-50 border-emerald-200")}>
                        {isActive ? 'Inativada' : 'Reativada'}
                      </span>
                      <span className="text-[0.55rem] text-(--text-muted)">{s.startDate}</span>
                    </div>
                    <div className="text-[0.65rem] font-bold text-(--text) mb-1">{INACTIVATION_CATEGORY_LABELS[s.category]}</div>
                    <div className="bg-gray-50 rounded px-2.5 py-1.5 border-l-2 border-teal-400 mb-2">
                      <div className="text-[0.55rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Motivo</div>
                      <div className="text-[0.65rem] text-(--text) leading-relaxed">{s.detail}</div>
                    </div>
                    {s.expectedReturnDate && (
                      <div className="text-[0.6rem] text-(--text-muted) mb-1">Retorno previsto: <span className="font-semibold text-(--text)">{s.expectedReturnDate}</span></div>
                    )}
                    <div className="text-[0.55rem] text-(--text-muted)">Responsável: <span className="font-semibold text-(--text)">{s.responsavel}</span></div>
                    {s.reactivatedAt && (
                      <div className="mt-2 pt-2 border-t border-(--border-custom) space-y-1.5">
                        <div className="text-[0.6rem] text-emerald-700 font-semibold">
                          Reativado em {s.reactivatedAt}
                        </div>
                        {s.reactivateConcentracao && s.reactivateIntervalo !== undefined && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="bg-gray-50 rounded px-2 py-1">
                              <div className="text-[0.5rem] text-(--text-muted) font-semibold uppercase tracking-wider">Ponto de retorno</div>
                              <div className="text-[0.6rem] font-medium text-(--text)">{s.reactivateConcentracao}</div>
                            </div>
                            <div className="bg-gray-50 rounded px-2 py-1">
                              <div className="text-[0.5rem] text-(--text-muted) font-semibold uppercase tracking-wider">Intervalo</div>
                              <div className="text-[0.6rem] font-medium text-(--text)">{s.reactivateIntervalo} dias</div>
                            </div>
                          </div>
                        )}
                        {s.reactivateJustificativa && (
                          <div className="bg-emerald-50/50 border-l-2 border-emerald-300 rounded px-2.5 py-1.5">
                            <div className="text-[0.5rem] font-semibold text-emerald-700 uppercase tracking-wider mb-0.5">Justificativa</div>
                            <div className="text-[0.6rem] text-(--text) leading-relaxed">{s.reactivateJustificativa}</div>
                          </div>
                        )}
                        {s.reactivateNote && (
                          <div className="bg-gray-50 border-l-2 border-gray-300 rounded px-2.5 py-1.5">
                            <div className="text-[0.5rem] font-semibold text-(--text-muted) uppercase tracking-wider mb-0.5">Observação</div>
                            <div className="text-[0.6rem] text-(--text) leading-relaxed">{s.reactivateNote}</div>
                          </div>
                        )}
                        {s.reactivatedBy && <div className="text-[0.55rem] text-(--text-muted)">Por: <span className="font-semibold text-(--text)">{s.reactivatedBy}</span></div>}
                      </div>
                    )}
                  </div>
                )
              })}
      </Modal>

      <Toast
        open={showInactivateToast}
        onClose={() => setShowInactivateToast(false)}
        variant="warning"
        icon={<PowerOff size={16} />}
        title="Imunoterapia inativada"
        description='As aplicações foram pausadas. Use "Reativar paciente" quando ele estiver apto a continuar o protocolo.'
      />
      <Toast
        open={showReactivateToast}
        onClose={() => setShowReactivateToast(false)}
        variant="success"
        icon={<Power size={16} />}
        title="Paciente reativado"
        description="O paciente está ativo novamente e pode continuar o protocolo a partir do ponto definido."
      />

      <Modal
        open={showEditConfirm}
        onClose={() => setShowEditConfirm(false)}
        title="Confirmar alterações?"
        size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setShowEditConfirm(false)} fullWidth>Voltar</Button>
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              setSelectedPatient({
                ...selectedPatient,
                nome: editForm.nome,
                telefone: editForm.telefone,
                peso: editForm.peso,
                medicoResponsavel: editForm.medicoResponsavel,
              })
              setShowEditConfirm(false)
              setShowEditModal(false)
            }}
          >Confirmar e salvar</Button>
        </>}
      >
        <p className="text-xs text-(--text-muted) leading-relaxed">
          Os dados do paciente serão atualizados. Esta ação será registrada no histórico de alterações do prontuário.
        </p>

        <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 space-y-1.5">
          {[
            { label: 'Nome', prev: selectedPatient.nome, next: editForm.nome },
            { label: 'Telefone', prev: selectedPatient.telefone, next: editForm.telefone },
            { label: 'Peso', prev: selectedPatient.peso, next: editForm.peso },
            { label: 'Médico', prev: selectedPatient.medicoResponsavel, next: editForm.medicoResponsavel },
          ].filter((f) => f.prev !== f.next).map((f) => (
            <div key={f.label} className="flex items-center justify-between gap-2">
              <span className="text-[0.6rem] text-(--text-muted) shrink-0">{f.label}</span>
              <div className="flex items-center gap-1.5 text-[0.6rem] min-w-0">
                <span className="text-(--text-muted) line-through truncate max-w-24">{f.prev}</span>
                <span className="text-(--text-muted)">→</span>
                <span className="font-semibold text-brand truncate max-w-24">{f.next}</span>
              </div>
            </div>
          ))}
          {[
            { prev: selectedPatient.nome, next: editForm.nome },
            { prev: selectedPatient.telefone, next: editForm.telefone },
            { prev: selectedPatient.peso, next: editForm.peso },
            { prev: selectedPatient.medicoResponsavel, next: editForm.medicoResponsavel },
          ].every((f) => f.prev === f.next) && (
            <span className="text-[0.6rem] text-(--text-muted)">Nenhuma alteração detectada.</span>
          )}
        </div>
      </Modal>

      <Modal
        open={!!selectedApp}
        onClose={() => { setSelectedApp(null); setModalTab('pre') }}
        title="Dados da aplicação"
        size="lg"
      >
        {selectedApp && <>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setModalTab('pre')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                modalTab === 'pre' ? "bg-linear-to-br from-brand to-teal-400 text-white shadow-sm" : "bg-teal-50 text-teal-600 hover:bg-teal-100"
              )}
            >
              Pré-Aplicação
            </button>
            <button
              onClick={() => setModalTab('pos')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                modalTab === 'pos' ? "bg-linear-to-br from-brand to-teal-400 text-white shadow-sm" : "bg-teal-50 text-teal-600 hover:bg-teal-100"
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
                    <div className="text-xs text-(--text) leading-relaxed">{selectedApp.notaResponsavel || 'Sem intercorrências relatadas durante o intervalo.'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Presença de efeito colateral</div>
                    <div className="text-xs text-(--text)">{selectedApp.efeitoColateral || 'Não'}</div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Necessidade de medicação</div>
                    <div className="text-xs text-(--text)">{selectedApp.necessidadeMedicacao || 'Não'}</div>
                  </div>
                  {selectedApp.efeitoColateral === 'Sim' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Efeitos colaterais relatados</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.efeitosRelatados || '—'}</div>
                    </div>
                  )}
                  {selectedApp.necessidadeMedicacao === 'Sim' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Medicações administradas</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.medicacoes || '—'}</div>
                    </div>
                  )}
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
                  {selectedApp.efeitoColateral === 'Sim' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Efeitos colaterais relatados</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.efeitosRelatados || '—'}</div>
                    </div>
                  )}
                  {selectedApp.necessidadeMedicacao === 'Sim' && (
                    <div className="col-span-2">
                      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Medicações administradas</div>
                      <div className="text-xs text-(--text) leading-relaxed">{selectedApp.medicacoes || '—'}</div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">Notas do responsável</div>
                    <div className="text-xs text-(--text)">{selectedApp.notaResponsavel || '-'}</div>
                  </div>
                </div>
              )}
        </>}
      </Modal>
    </div>
  )
}
