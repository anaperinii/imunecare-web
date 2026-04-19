import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { usePatientStore } from '@/features/patient/patient-store'
import { useImmunotherapiesStore } from '@/features/immunotherapy/immunotherapies-store'
import { useCan, useUserStore } from '@/features/user/user-store'
import { useAuditStore } from '@/features/audit/audit-store'
import { Search, ChevronDown, ArrowLeft, ClipboardList, Syringe, CalendarDays, Info } from 'lucide-react'
import { addDays, format, differenceInDays, parse } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { validateVolume, validateConcentration } from '@/shared/lib/validators'
import { calculateNextDose, parseDose } from '@/features/immunotherapy/scit-protocol'
import { useForm } from '@/shared/hooks/useForm'

const stepLabels = ['Paciente', 'Pré-Aplicação', 'Pós-Aplicação', 'Revisão dos Dados']

const RESPONSAVEIS_APLICACAO = [
  { name: 'Jaqueline Oliveira', role: 'Enfermeira' },
  { name: 'Carlos Eduardo Silva', role: 'Enfermeiro' },
  { name: 'Rafael Mendes', role: 'Técnico em Enfermagem' },
  { name: 'Mariana Costa', role: 'Técnica em Enfermagem' },
]

export function PatientEvolutionPage() {
  const navigate = useNavigate()
  const { patientId: preselectedId } = useSearch({ from: '/patient-evolution' })
  const { setSelectedPatient: setStorePatient, recordEvolution } = usePatientStore()
  const currentUser = useUserStore((s) => s.current)
  const logAccess = useAuditStore((s) => s.logAccess)
  const { immunotherapies } = useImmunotherapiesStore()
  const canEvolve = useCan('evolve_patient')
  useEffect(() => { if (!canEvolve) navigate({ to: '/immunotherapies' }) }, [canEvolve, navigate])
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedPatient, setSelected] = useState<typeof immunotherapies[0] | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (preselectedId && !selectedPatient) {
      const found = immunotherapies.find((i) => i.id === preselectedId)
      if (found) {
        handleSelect(found)
      }
    }
  }, [preselectedId])

  type EvolutionForm = {
    intervaloRelato: string; efeitoColateral: string; efeitosRelatados: string; necessidadeMedicacao: string
    medicacoes: string; notasPre: string
    dataAplicacao: string; horaInicio: string; horaFim: string; volumeAplicado: string; concentracao: string
    intervaloProxima: string; intervaloJustificativa: string; responsavel: string
    efeitoColateralPos: string; efeitosRelatadosPos: string; necessidadeMedicacaoPos: string; medicacoesPos: string; notasPos: string
    ajusteReacao: '' | 'reduzir_dose' | 'aumentar_intervalo' | 'suspender' | 'manter'
    ajusteReacaoJustificativa: string
  }

  const formState = useForm<EvolutionForm>({
    initial: {
      intervaloRelato: '', efeitoColateral: 'Não', efeitosRelatados: '', necessidadeMedicacao: 'Não',
      medicacoes: '', notasPre: '',
      dataAplicacao: '', horaInicio: '', horaFim: '', volumeAplicado: '', concentracao: '',
      intervaloProxima: '', intervaloJustificativa: '', responsavel: '', efeitoColateralPos: 'Não', efeitosRelatadosPos: '',
      necessidadeMedicacaoPos: 'Não', medicacoesPos: '', notasPos: '',
      ajusteReacao: '',
      ajusteReacaoJustificativa: '',
    },
  })
  const form = formState.values
  const errors = formState.errors
  const touched = formState.touched
  const touch = formState.touch

  function addMinutesToTime(time: string, minutes: number): string {
    const parts = time.split(':')
    if (parts.length !== 2) return ''
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    if (isNaN(h) || isNaN(m)) return ''
    const total = h * 60 + m + minutes
    const newH = Math.floor(total / 60) % 24
    const newM = total % 60
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
  }

  const set = <K extends keyof EvolutionForm>(field: K, value: EvolutionForm[K]) => {
    if (field === 'horaInicio' && typeof value === 'string' && value && !formState.values.horaFim) {
      formState.patch({ horaInicio: value, horaFim: addMinutesToTime(value, 30) })
      return
    }
    formState.set(field, value)
  }

  const formatVolume = (v: string) => v.replace(/[^0-9,.]/g, '').replace(',', '.')
  const formatConcentration = (v: string) => {
    const cleaned = v.replace(/[^0-9.:]/g, '')
    if (!cleaned.startsWith('1:') && cleaned.length > 0) {
      const digits = cleaned.replace(/\D/g, '')
      return digits.length > 0 ? `1:${digits}` : ''
    }
    return cleaned
  }

  const validateStep1 = useCallback((): boolean => {
    const e: Partial<Record<keyof EvolutionForm, string>> = {}
    if (!form.intervaloRelato.trim()) e.intervaloRelato = 'Relato do intervalo é obrigatório'
    if (form.efeitoColateral === 'Sim' && !form.efeitosRelatados.trim()) e.efeitosRelatados = 'Descreva os efeitos colaterais'
    if (form.necessidadeMedicacao === 'Sim' && !form.medicacoes.trim()) e.medicacoes = 'Informe as medicações administradas'
    formState.setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const validateStep2 = useCallback((): boolean => {
    const e: Partial<Record<keyof EvolutionForm, string>> = {}
    if (!form.dataAplicacao) e.dataAplicacao = 'Data é obrigatória'
    if (!form.horaInicio) e.horaInicio = 'Hora de início é obrigatória'
    if (!form.horaFim) e.horaFim = 'Hora de fim é obrigatória'
    if (form.horaInicio && form.horaFim && form.horaInicio >= form.horaFim) e.horaFim = 'Hora fim deve ser após início'
    { const err = validateVolume(form.volumeAplicado); if (err) e.volumeAplicado = err }
    { const err = validateConcentration(form.concentracao); if (err) e.concentracao = err }
    if (!form.intervaloProxima || !form.intervaloProxima.trim()) e.intervaloProxima = 'Intervalo é obrigatório'
    else {
      const customInterval = form.intervaloProxima && !['7','14','21','28'].includes(form.intervaloProxima)
      if (customInterval && !form.intervaloJustificativa.trim()) e.intervaloJustificativa = 'Justifique o intervalo personalizado'
      else if (customInterval && form.intervaloJustificativa.trim().length < 10) e.intervaloJustificativa = 'Justificativa deve ter ao menos 10 caracteres'
    }
    if (!form.responsavel.trim()) e.responsavel = 'Responsável é obrigatório'
    if (form.efeitoColateralPos === 'Sim' && !form.efeitosRelatadosPos.trim()) e.efeitosRelatadosPos = 'Descreva os efeitos colaterais'
    if (form.necessidadeMedicacaoPos === 'Sim' && !form.medicacoesPos.trim()) e.medicacoesPos = 'Informe as medicações'
    if (form.efeitoColateralPos === 'Sim' && form.necessidadeMedicacaoPos === 'Sim' && !form.ajusteReacao) e.ajusteReacao = 'Selecione a conduta para o protocolo'
    if (form.ajusteReacao === 'manter' && !form.ajusteReacaoJustificativa.trim()) e.ajusteReacaoJustificativa = 'Justifique por que manter o protocolo'
    formState.setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const filtered = useMemo(() => {
    if (!search) return immunotherapies.slice(0, 8)
    return immunotherapies.filter((i) => i.nome.toLowerCase().includes(search.toLowerCase()))
  }, [search, immunotherapies])

  useEffect(() => { setHighlightedIndex(-1) }, [filtered.length, showSuggestions])

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion-item]')
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) handleSelect(filtered[highlightedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  const handleSelect = (item: typeof immunotherapies[0]) => {
    setSelected(item)
    setSearch(item.nome)
    setShowSuggestions(false)
    setStorePatient({
      id: item.id, nome: item.nome, dataNascimento: '02/07/2000', idade: 25,
      telefone: '(62) 99557-1423', peso: '89.7 kg', cpf: '711.905.744-89',
      medicoResponsavel: 'Dra. Karina Martins', status: 'ativo',
      tipoImunoterapia: item.tipo, inicioInducao: '01/01/2020', inicioManutencao: null,
      viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
      concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
      intervaloAtual: item.cicloIntervalo.dias, dataProximaAplicacao: '21/05/2025',
      concentracaoDoseAtuais: item.doseConcentracao,
    })
  }

  const { applications } = usePatientStore()

  const lastApp = useMemo(() => {
    if (!selectedPatient) return null
    const realized = applications.filter((a) => a.status === 'realizada' && a.patientId === selectedPatient.id)
    if (!realized.length) return null
    return [...realized].sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })[0]
  }, [selectedPatient, applications])

  const doseNumber = useMemo(() => {
    if (!selectedPatient) return 0
    return applications.filter((a) => a.status === 'realizada' && a.patientId === selectedPatient.id).length
  }, [selectedPatient, applications])

  const nextDose = useMemo(() => {
    if (!lastApp || !selectedPatient) return null
    const [d, m, y] = lastApp.data.split('/')
    const currentDose = `${lastApp.concentracaoExtrato || lastApp.dose.split(' - ')[0]} - ${lastApp.volumeAplicado || lastApp.dose.split(' - ')[1]}`
    const currentInterval = lastApp.ciclo.dias
    const calc = calculateNextDose(currentDose, currentInterval)
    const nextDate = addDays(new Date(+y, +m - 1, +d), calc.interval)
    const next = parseDose(calc.dose)
    return {
      date: format(nextDate, 'dd/MM/yyyy'),
      conc: next?.conc ?? calc.dose,
      vol: next?.vol ?? '',
      dose: doseNumber + 1,
      interval: calc.interval,
      phase: calc.phase,
    }
  }, [lastApp, selectedPatient, doseNumber])

  const plannedNext = useMemo(() => {
    if (!form.dataAplicacao || !form.intervaloProxima || !form.intervaloProxima.trim()) return null
    const [y, m, d] = form.dataAplicacao.split('-')
    if (!y || !m || !d) return null
    const applicationDate = new Date(+y, +m - 1, +d)
    if (isNaN(applicationDate.getTime())) return null
    const intervalDays = parseInt(form.intervaloProxima.trim(), 10)
    if (isNaN(intervalDays) || intervalDays <= 0) return null
    const nextDate = addDays(applicationDate, intervalDays)
    return { date: format(nextDate, 'dd/MM/yyyy'), interval: intervalDays, applicationDate }
  }, [form.dataAplicacao, form.intervaloProxima])

  const treatmentTime = useMemo(() => {
    if (!selectedPatient) return null
    try {
      const start = parse('01/01/2020', 'dd/MM/yyyy', new Date())
      const days = differenceInDays(new Date(), start)
      const years = Math.floor(days / 365)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      const months = Math.floor(days / 30)
      if (months > 0) return `${months} meses`
      return `${days} dias`
    } catch { return null }
  }, [selectedPatient])

  const inputCls = (field?: keyof EvolutionForm) => cn(
    "w-full h-9 rounded-lg border bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all",
    field && errors[field] && touched[field] ? "border-red-400 bg-red-50/30" : "border-(--border-custom)"
  )
  const textareaCls = (field?: keyof EvolutionForm) => cn(
    "w-full rounded-lg border bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none",
    field && errors[field] && touched[field] ? "border-red-400 bg-red-50/30" : "border-(--border-custom)"
  )
  const ErrorMsg = ({ field }: { field: keyof EvolutionForm }) => {
    if (!errors[field] || !touched[field]) return null
    return <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors[field]}</span>
  }

  const handleContinue = () => {
    if (step === 0 && (!selectedPatient || selectedPatient.status === 'inativo')) return
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 1 && nextDose) {
      const p = formState.values
      formState.patch({
        dataAplicacao: p.dataAplicacao || nextDose.date.split('/').reverse().join('-'),
        volumeAplicado: p.volumeAplicado || nextDose.vol.replace('ml', '').replace(',', '.'),
        concentracao: p.concentracao || nextDose.conc,
        intervaloProxima: p.intervaloProxima || String(nextDose.interval),
      })
    }
    setStep((s) => (s + 1) as 0 | 1 | 2 | 3)
  }

  const handleSaveEvolution = () => {
    if (!selectedPatient || !plannedNext) return
    const [y, m, d] = form.dataAplicacao.split('-')
    const pt = ['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO']
    const dataRealizada = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
    const mesRealizada = pt[parseInt(m, 10) - 1]
    const volStr = form.volumeAplicado.replace('.', ',') + 'ml'
    const doseStr = `${form.concentracao} - ${volStr}`
    const interval = plannedNext.interval
    const ciclo = interval === 7 ? 1 : interval === 14 ? 1 : interval === 21 ? 2 : interval === 28 ? 3 : 1
    const nextDateParts = plannedNext.date.split('/')
    const nextMonth = pt[parseInt(nextDateParts[1], 10) - 1]

    const realizada = {
      id: `evo-${Date.now()}-r`,
      patientId: selectedPatient.id,
      data: dataRealizada,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      status: 'realizada' as const,
      dose: doseStr,
      ciclo: { numero: ciclo, dias: interval },
      mes: mesRealizada,
      ano: parseInt(y, 10),
      volumeAplicado: volStr,
      concentracaoExtrato: form.concentracao,
      efeitoColateral: form.efeitoColateralPos,
      efeitosRelatados: form.efeitoColateralPos === 'Sim' ? form.efeitosRelatadosPos : undefined,
      necessidadeMedicacao: form.necessidadeMedicacaoPos,
      medicacoes: form.necessidadeMedicacaoPos === 'Sim' ? form.medicacoesPos : undefined,
      responsavel: form.responsavel,
      notaResponsavel: form.notasPos || '-',
    }

    const nextCalc = calculateNextDose(doseStr, interval)
    const proxima = {
      id: `evo-${Date.now()}-n`,
      patientId: selectedPatient.id,
      data: plannedNext.date,
      horaInicio: form.horaInicio,
      horaFim: form.horaFim,
      status: 'agendada' as const,
      dose: nextCalc.dose,
      ciclo: { numero: ciclo, dias: nextCalc.interval },
      mes: nextMonth,
      ano: parseInt(nextDateParts[2], 10),
    }

    recordEvolution({ realizada, proxima })

    logAccess({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userRegistration: currentUser.registration,
      patientId: selectedPatient.id,
      patientName: selectedPatient.nome,
      action: 'apply_dose',
      description: `Aplicou ${doseStr} em ${dataRealizada} (ciclo ${ciclo} · intervalo ${interval} dias) · responsável: ${form.responsavel}`,
    })

    navigate({ to: '/immunotherapies', search: { success: true, patientName: selectedPatient.nome } })
  }

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
    e.preventDefault()
    if (step < 3) handleContinue()
    else handleSaveEvolution()
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 p-4 min-h-0 overflow-hidden" onKeyDown={handleEnterKey}>
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => setShowCancelModal(true)} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Evolução do Paciente</h1>
        </div>

        {/* Steps */}
        <div className="px-5 py-7 flex items-center justify-center gap-4">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all", step === i ? "bg-linear-to-br from-brand to-teal-400 text-white" : step > i ? "bg-teal-100 text-teal-600 opacity-50" : "bg-gray-200 text-gray-500")}>
                  {i + 1}
                </div>
                <span className={cn("text-[0.8rem] font-medium", step === i ? "text-teal-600" : step > i ? "text-teal-600 opacity-50" : "text-gray-400")}>{label}</span>
              </div>
              {i < 3 && <div className={cn("h-px w-14 border-t-[1.5px]", step > i ? "border-teal-400 border-solid" : "border-gray-200 border-dashed")} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-(--text)">Selecionar Paciente</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" />
                <input
                  placeholder="Buscar paciente por nome"
                  value={search}
                  disabled={!!preselectedId && !!selectedPatient}
                  onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleKeyDown}
                  className={cn(inputCls(), "pl-8", preselectedId && selectedPatient && "opacity-60 cursor-not-allowed")}
                />
                {showSuggestions && filtered.length > 0 && (
                  <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-white border border-(--border-custom) rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filtered.map((p, idx) => (
                      <button
                        key={p.id}
                        data-suggestion-item
                        onClick={() => handleSelect(p)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={cn("w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between", highlightedIndex === idx ? "bg-teal-50" : "hover:bg-teal-50")}
                      >
                        <span className="text-xs font-medium text-(--text)">{p.nome}</span>
                        <span className="text-[0.65rem] text-(--text-muted)">{p.tipo}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedPatient && (
                <div className="border border-(--border-custom) rounded-xl mt-4 overflow-hidden">
                  {/* Patient header */}
                  <div className="px-4 py-3.5 border-b border-(--border-custom) flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-sm font-bold text-white shrink-0">
                      {selectedPatient.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-(--text)">{selectedPatient.nome}</div>
                      <div className="text-[0.7rem] text-(--text-muted)">
                        25 anos · 89.7 kg · Dra. Karina Martins
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[0.6rem] font-semibold border border-teal-200">{selectedPatient.tipo}</span>
                      {treatmentTime && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[0.6rem] font-medium border border-amber-200">{treatmentTime}</span>}
                    </div>
                  </div>

                  {/* Dose cards */}
                  <div className="grid grid-cols-2 gap-0">
                    <div className="p-4 bg-stone-50 border-r border-(--border-custom)">
                      <div className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider mb-3">Última aplicação</div>
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Dose</div>
                          <div className="text-xs font-bold text-(--text)">Dose {doseNumber || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Volume</div>
                          <div className="text-xs font-bold text-(--text)">{lastApp?.volumeAplicado || lastApp?.dose.split(' - ')[1] || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Concentração</div>
                          <div className="text-xs font-bold text-(--text)">{lastApp?.concentracaoExtrato || lastApp?.dose.split(' - ')[0] || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Data</div>
                          <div className="text-xs font-bold text-(--text)">{lastApp?.data || '-'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50/50">
                      <div className="text-[0.65rem] font-bold text-teal-600 uppercase tracking-wider mb-3">Dose prevista</div>
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Dose</div>
                          <div className="text-xs font-bold text-(--text)">Dose {nextDose?.dose || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Volume</div>
                          <div className="text-xs font-bold text-(--text)">{nextDose?.vol || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Concentração</div>
                          <div className="text-xs font-bold text-(--text)">{nextDose?.conc || '-'}</div>
                        </div>
                        <div>
                          <div className="text-[0.6rem] text-(--text-muted) font-medium">Data</div>
                          <div className="text-xs font-bold text-(--text)">{nextDose?.date || '-'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedPatient && selectedPatient.status === 'inativo' && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-3 mt-3">
                  <Info size={14} className="text-red-500 shrink-0" />
                  <p className="text-xs text-red-700">Este paciente está <span className="font-semibold">inativo</span>. Não é possível registrar uma evolução para pacientes inativos.</p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-(--text)">Pré-Aplicação</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Como o paciente passou durante o intervalo? <span className="text-red-400">*</span></label>
                  <textarea rows={3} placeholder="Descreva aqui" value={form.intervaloRelato} onChange={(e) => set('intervaloRelato', e.target.value)} onBlur={() => touch('intervaloRelato')} className={textareaCls('intervaloRelato')} />
                  <ErrorMsg field="intervaloRelato" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Efeito colateral</label>
                  <div className="relative">
                    <select value={form.efeitoColateral} onChange={(e) => set('efeitoColateral', e.target.value)} className={cn(inputCls(), "appearance-none pr-8 cursor-pointer")}>
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Necessidade de medicação</label>
                  <div className="relative">
                    <select value={form.necessidadeMedicacao} onChange={(e) => set('necessidadeMedicacao', e.target.value)} className={cn(inputCls(), "appearance-none pr-8 cursor-pointer")}>
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={cn("text-xs font-semibold mb-1.5 block", form.efeitoColateral === 'Sim' ? "text-(--text-muted)" : "text-(--text-muted)/40")}>Efeitos colaterais relatados {form.efeitoColateral === 'Sim' && <span className="text-red-400">*</span>}</label>
                  <input
                    placeholder="Insira aqui"
                    disabled={form.efeitoColateral !== 'Sim'}
                    value={form.efeitosRelatados}
                    onChange={(e) => set('efeitosRelatados', e.target.value)}
                    onBlur={() => touch('efeitosRelatados')}
                    className={cn(form.efeitoColateral === 'Sim' ? inputCls('efeitosRelatados') : inputCls(), form.efeitoColateral !== 'Sim' && "opacity-40 cursor-not-allowed")}
                  />
                  {form.efeitoColateral === 'Sim' && <ErrorMsg field="efeitosRelatados" />}
                </div>
                <div>
                  <label className={cn("text-xs font-semibold mb-1.5 block", form.necessidadeMedicacao === 'Sim' ? "text-(--text-muted)" : "text-(--text-muted)/40")}>Medicações administradas {form.necessidadeMedicacao === 'Sim' && <span className="text-red-400">*</span>}</label>
                  <input
                    placeholder="Insira aqui"
                    disabled={form.necessidadeMedicacao !== 'Sim'}
                    value={form.medicacoes}
                    onChange={(e) => set('medicacoes', e.target.value)}
                    onBlur={() => touch('medicacoes')}
                    className={cn(form.necessidadeMedicacao === 'Sim' ? inputCls('medicacoes') : inputCls(), form.necessidadeMedicacao !== 'Sim' && "opacity-40 cursor-not-allowed")}
                  />
                  {form.necessidadeMedicacao === 'Sim' && <ErrorMsg field="medicacoes" />}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Notas do responsável</label>
                  <textarea rows={2} placeholder="Insira aqui" value={form.notasPre} onChange={(e) => set('notasPre', e.target.value)} className={textareaCls()} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-(--text)">Pós-Aplicação</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data da aplicação</label>
                  <input type="date" value={form.dataAplicacao} onChange={(e) => set('dataAplicacao', e.target.value)} onBlur={() => touch('dataAplicacao')} className={inputCls('dataAplicacao')} />
                  <ErrorMsg field="dataAplicacao" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora início</label>
                    <input type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} onBlur={() => touch('horaInicio')} className={inputCls('horaInicio')} />
                    <ErrorMsg field="horaInicio" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora fim</label>
                    <input type="time" value={form.horaFim} onChange={(e) => set('horaFim', e.target.value)} onBlur={() => touch('horaFim')} className={inputCls('horaFim')} />
                    <ErrorMsg field="horaFim" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Volume aplicado</label>
                  <div className="relative">
                    <input placeholder="Ex: 0.5" value={form.volumeAplicado} onChange={(e) => set('volumeAplicado', formatVolume(e.target.value))} onBlur={() => touch('volumeAplicado')} className={cn(inputCls('volumeAplicado'), "pr-10")} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">ml</span>
                  </div>
                  <ErrorMsg field="volumeAplicado" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Concentração do extrato</label>
                  <input placeholder="1:10" value={form.concentracao} onChange={(e) => set('concentracao', formatConcentration(e.target.value))} onBlur={() => touch('concentracao')} className={inputCls('concentracao')} />
                  <ErrorMsg field="concentracao" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Intervalo próxima aplicação</label>
                  <div className="relative">
                    {(() => {
                      const isCustom = form.intervaloProxima && !['7', '14', '21', '28'].includes(form.intervaloProxima)
                      const selectValue = isCustom ? 'outro' : form.intervaloProxima
                      return (
                        <select
                          value={selectValue}
                          onChange={(e) => {
                            const v = e.target.value
                            set('intervaloProxima', v === 'outro' ? ' ' : v)
                          }}
                          onBlur={() => touch('intervaloProxima')}
                          className={cn(inputCls('intervaloProxima'), "appearance-none pr-8 cursor-pointer")}
                        >
                          <option value="" disabled>Selecione</option>
                          <option value="7">7 dias</option>
                          <option value="14">14 dias</option>
                          <option value="21">21 dias</option>
                          <option value="28">28 dias</option>
                          <option value="outro">Outro</option>
                        </select>
                      )
                    })()}
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                  {(form.intervaloProxima === ' ' || (form.intervaloProxima && !['7','14','21','28'].includes(form.intervaloProxima))) && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Ex: 35"
                          value={form.intervaloProxima.trim()}
                          onChange={(e) => set('intervaloProxima', e.target.value.replace(/[^0-9]/g, ''))}
                          className={cn(inputCls('intervaloProxima'), "flex-1")}
                        />
                        <span className="text-[0.65rem] text-(--text-muted) shrink-0">dias</span>
                      </div>
                      {(() => {
                        const n = parseInt(form.intervaloProxima.trim(), 10)
                        if (isNaN(n) || n <= 0) return null
                        if (n < 4) return <div className="text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">⚠ Intervalo muito curto desrespeita o tempo mínimo de segurança entre doses. Reavalie o protocolo.</div>
                        if (n > 15) return <div className="text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">⚠ Intervalo muito longo na indução pode comprometer a progressão. Confirme a conduta clínica.</div>
                        return null
                      })()}
                      <div>
                        <label className="text-[0.65rem] font-semibold text-(--text-muted) mb-1 block">Justificativa do intervalo personalizado <span className="text-red-400">*</span></label>
                        <textarea
                          rows={2}
                          placeholder="Descreva o motivo clínico para um intervalo fora do protocolo padrão"
                          value={form.intervaloJustificativa}
                          onChange={(e) => set('intervaloJustificativa', e.target.value)}
                          onBlur={() => touch('intervaloJustificativa')}
                          className={cn("w-full rounded-lg border bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none", errors.intervaloJustificativa && touched.intervaloJustificativa ? "border-red-400 bg-red-50/30" : "border-(--border-custom)")}
                        />
                        <ErrorMsg field="intervaloJustificativa" />
                      </div>
                    </div>
                  )}
                  <ErrorMsg field="intervaloProxima" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Responsável</label>
                  <div className="relative">
                    <select
                      value={form.responsavel}
                      onChange={(e) => set('responsavel', e.target.value)}
                      onBlur={() => touch('responsavel')}
                      className={cn(inputCls('responsavel'), "appearance-none pr-8 cursor-pointer")}
                    >
                      <option value="" disabled>Selecione o responsável pela aplicação</option>
                      {RESPONSAVEIS_APLICACAO.map((r) => (
                        <option key={r.name} value={r.name}>{r.name} — {r.role}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                  <ErrorMsg field="responsavel" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Efeito colateral</label>
                  <div className="relative">
                    <select value={form.efeitoColateralPos} onChange={(e) => set('efeitoColateralPos', e.target.value)} className={cn(inputCls(), "appearance-none pr-8 cursor-pointer")}>
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Necessidade de medicação</label>
                  <div className="relative">
                    <select value={form.necessidadeMedicacaoPos} onChange={(e) => set('necessidadeMedicacaoPos', e.target.value)} className={cn(inputCls(), "appearance-none pr-8 cursor-pointer")}>
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                {/* Conditional fields with fade-in */}
                <div className={cn("transition-all duration-300 overflow-hidden", form.efeitoColateralPos === 'Sim' ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Efeitos colaterais relatados</label>
                  <input placeholder="Insira aqui" value={form.efeitosRelatadosPos} onChange={(e) => set('efeitosRelatadosPos', e.target.value)} onBlur={() => touch('efeitosRelatadosPos')} className={inputCls('efeitosRelatadosPos')} />
                  <ErrorMsg field="efeitosRelatadosPos" />
                </div>
                <div className={cn("transition-all duration-300 overflow-hidden", form.necessidadeMedicacaoPos === 'Sim' ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Medicações administradas</label>
                  <input placeholder="Insira aqui" value={form.medicacoesPos} onChange={(e) => set('medicacoesPos', e.target.value)} onBlur={() => touch('medicacoesPos')} className={inputCls('medicacoesPos')} />
                  <ErrorMsg field="medicacoesPos" />
                </div>
                {/* RF-013 — Ajuste após reação adversa com necessidade de medicação */}
                <div className={cn("col-span-2 transition-all duration-300 overflow-hidden", form.efeitoColateralPos === 'Sim' && form.necessidadeMedicacaoPos === 'Sim' ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                  <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-[0.65rem] text-amber-800 leading-relaxed">
                        <span className="font-bold">Reação adversa com uso de medicação registrada.</span> Selecione a conduta a ser aplicada no protocolo antes de concluir a evolução. A escolha fica vinculada a esta aplicação no histórico clínico.
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: 'reduzir_dose', label: 'Reduzir dose', desc: 'Retornar ao volume anterior' },
                        { v: 'aumentar_intervalo', label: 'Aumentar intervalo', desc: 'Ampliar espaçamento entre doses' },
                        { v: 'suspender', label: 'Suspender temporariamente', desc: 'Pausar até avaliação médica' },
                        { v: 'manter', label: 'Manter protocolo', desc: 'Mantém dose e intervalo' },
                      ].map((opt) => {
                        const selected = form.ajusteReacao === opt.v
                        return (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => set('ajusteReacao', opt.v as EvolutionForm['ajusteReacao'])}
                            className={cn("text-left px-2.5 py-2 rounded-lg border-[1.5px] transition-all cursor-pointer", selected ? "border-amber-500 bg-amber-100/50" : "border-amber-200 bg-white hover:border-amber-400")}
                          >
                            <div className="text-[0.65rem] font-bold text-(--text)">{opt.label}</div>
                            <div className="text-[0.55rem] text-(--text-muted) mt-0.5">{opt.desc}</div>
                          </button>
                        )
                      })}
                    </div>
                    {form.ajusteReacao && (
                      <div>
                        <label className="text-[0.6rem] font-semibold text-(--text-muted) mb-1 block">
                          Justificativa clínica {form.ajusteReacao === 'manter' && <span className="text-red-400">*</span>}
                        </label>
                        <textarea
                          rows={2}
                          placeholder={form.ajusteReacao === 'manter' ? 'Justifique por que o protocolo será mantido mesmo com reação adversa' : 'Contexto clínico da conduta (opcional)'}
                          value={form.ajusteReacaoJustificativa}
                          onChange={(e) => set('ajusteReacaoJustificativa', e.target.value)}
                          className="w-full rounded-lg border border-(--border-custom) bg-white px-2.5 py-1.5 text-[0.7rem] placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                        />
                        {form.ajusteReacao === 'manter' && !form.ajusteReacaoJustificativa.trim() && (
                          <span className="text-[0.55rem] text-red-500 block mt-0.5">Manter protocolo após reação adversa exige justificativa.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Notas do responsável</label>
                  <textarea rows={2} placeholder="Insira aqui" value={form.notasPos} onChange={(e) => set('notasPos', e.target.value)} className={textareaCls()} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-(--text)">Revisão da evolução</h2>
                <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de registrar a dose.</p>
              </div>

              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                    <ClipboardList size={13} className="text-teal-600" />
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Pré-Aplicação</span>
                </div>
                <div className="bg-gray-50/60 p-4">
                  {form.intervaloRelato && (
                    <div className="mb-3 bg-teal-50 border-l-2 border-teal-400 rounded-r-lg px-3 py-2.5">
                      <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-teal-700 mb-1">Relato do intervalo</div>
                      <div className="text-xs text-teal-900 leading-relaxed">{form.intervaloRelato}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                    {[
                      { label: 'Efeito Colateral', value: form.efeitoColateral },
                      { label: 'Necessidade de Medicação', value: form.necessidadeMedicacao },
                      ...(form.efeitoColateral === 'Sim' ? [{ label: 'Efeitos Relatados', value: form.efeitosRelatados || '—' }] : []),
                      ...(form.necessidadeMedicacao === 'Sim' ? [{ label: 'Medicações', value: form.medicacoes || '—' }] : []),
                      ...(form.notasPre ? [{ label: 'Notas', value: form.notasPre }] : []),
                    ].map((item) => (
                      <div key={item.label} className="bg-white px-3.5 py-2.5">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                        <div className="text-xs font-medium text-(--text)">{item.value || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                    <Syringe size={13} className="text-teal-600" />
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Pós-Aplicação</span>
                </div>
                <div className="bg-gray-50/60 p-4">
                  <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                    {[
                      { label: 'Data', value: form.dataAplicacao ? format(parse(form.dataAplicacao, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '—' },
                      { label: 'Horário', value: form.horaInicio && form.horaFim ? `${form.horaInicio} – ${form.horaFim}` : '—' },
                      { label: 'Volume Aplicado', value: form.volumeAplicado ? `${form.volumeAplicado} ml` : '—' },
                      { label: 'Concentração', value: form.concentracao || '—' },
                      { label: 'Intervalo Próxima Dose', value: form.intervaloProxima ? `${form.intervaloProxima} dias` : '—' },
                      { label: 'Responsável', value: form.responsavel || '—' },
                      { label: 'Efeito Colateral', value: form.efeitoColateralPos },
                      { label: 'Necessidade de Medicação', value: form.necessidadeMedicacaoPos },
                      ...(form.notasPos ? [{ label: 'Notas', value: form.notasPos }] : []),
                    ].map((item) => (
                      <div key={item.label} className="bg-white px-3.5 py-2.5">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                        <div className="text-xs font-medium text-(--text)">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-teal-50 border border-teal-200 rounded-lg px-3.5 py-3">
                <CalendarDays size={15} className="text-teal-600 shrink-0" />
                <p className="text-xs text-teal-800 leading-relaxed">
                  Próxima dose agendada para <span className="font-bold">{plannedNext?.date || '—'}</span>
                  {plannedNext && <> (intervalo de <span className="font-bold">{plannedNext.interval} dias</span> a partir da aplicação).</>}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
          {step > 0 && (
            <button onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)} className="h-8 px-4 rounded-lg border-[1.5px] border-teal-400 text-teal-600 text-xs font-semibold hover:bg-teal-50 transition-all">
              Voltar
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleContinue}
              disabled={step === 0 && (!selectedPatient || selectedPatient.status === 'inativo')}
              className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Continuar
            </button>
          ) : (
            <button onClick={handleSaveEvolution} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
              Salvar Evolução
            </button>
          )}
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-(--text) mb-2">Cancelar evolução?</h3>
            <p className="text-xs text-(--text-muted) mb-5">Os dados preenchidos serão perdidos. Deseja realmente cancelar a evolução do paciente?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCancelModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all">
                Continuar editando
              </button>
              <button onClick={() => navigate({ to: '/immunotherapies' })} className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
