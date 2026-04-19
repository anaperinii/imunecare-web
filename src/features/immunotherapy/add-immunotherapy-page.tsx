import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, ArrowLeft, User, Syringe, Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useCan } from '@/features/user/user-store'
import { useForm } from '@/shared/hooks/useForm'
import { useImmunotherapiesStore, type Immunotherapy } from '@/features/immunotherapy/immunotherapies-store'
import { validateExtrato } from '@/shared/lib/validators'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const stepLabels = ['Dados do Paciente', 'Dados da Imunoterapia', 'Revisão dos Dados']

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatWeight(value: string): string {
  const cleaned = value.replace(/[^0-9,.]/g, '').replace(',', '.')
  const parts = cleaned.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('')
  return cleaned
}

function formatConcentration(value: string): string {
  const cleaned = value.replace(/[^0-9.:]/g, '')
  if (!cleaned.startsWith('1:') && cleaned.length > 0) {
    const digits = cleaned.replace(/\D/g, '')
    if (digits.length > 0) return `1:${digits}`
    return ''
  }
  return cleaned
}

function formatVolume(value: string): string {
  const cleaned = value.replace(/[^0-9,.]/g, '').replace(',', '.')
  const parts = cleaned.split('.')
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('')
  return cleaned
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[9]) !== check) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  return parseInt(digits[10]) === check
}

function validatePhone(phone: string): boolean {
  return phone.replace(/\D/g, '').length === 11
}

function validateWeight(weight: string): boolean {
  const num = parseFloat(weight)
  return !isNaN(num) && num > 0 && num <= 500
}

function validateConcentration(conc: string): boolean {
  return /^1:\d+(\.\d+)?$/.test(conc)
}

function validateVolume(vol: string): boolean {
  const num = parseFloat(vol)
  return !isNaN(num) && num > 0 && num <= 10
}

export function AddImmunotherapyPage() {
  const navigate = useNavigate()
  const canAdd = useCan('add_immunotherapy')
  const addImmunotherapy = useImmunotherapiesStore((s) => s.addImmunotherapy)
  useEffect(() => { if (!canAdd) navigate({ to: '/immunotherapies' }) }, [canAdd, navigate])

  const handleFinish = () => {
    const modalidade: Immunotherapy['modalidade'] = form.viaCutanea === 'sublingual' ? 'sublingual' : 'subcutânea'
    const newImm: Immunotherapy = {
      id: `new-${Date.now()}`,
      nome: form.nome.trim(),
      tipo: form.tipo.trim(),
      doseConcentracao: '1:10.000 - 0,1ml',
      cicloIntervalo: { numero: 1, dias: 7 },
      modalidade,
      status: 'ativo',
      medicoResponsavel: form.medicoResponsavel.trim(),
    }
    addImmunotherapy(newImm)
    navigate({ to: '/immunotherapies', search: { success: true, patientName: form.nome } })
  }
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showCancelModal, setShowCancelModal] = useState(false)
  type ImmForm = {
    nome: string; cpf: string; telefone: string; dataNascimento: string; peso: string; medicoResponsavel: string
    tipo: string; viaCutanea: string; dataInicio: string; extrato: string; metaConcentracao: string; metaVolume: string
  }
  const formState = useForm<ImmForm>({
    initial: {
      nome: '', cpf: '', telefone: '', dataNascimento: '', peso: '', medicoResponsavel: '',
      tipo: '', viaCutanea: '', dataInicio: '', extrato: '', metaConcentracao: '', metaVolume: '',
    },
  })
  const form = formState.values
  const errors = formState.errors
  const touched = formState.touched
  const touch = formState.touch
  const set = <K extends keyof ImmForm>(field: K, value: ImmForm[K]) => formState.set(field, value)

  const validateStep1 = useCallback((): boolean => {
    const e: Partial<Record<keyof ImmForm, string>> = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    else if (form.nome.trim().length < 3) e.nome = 'Nome deve ter ao menos 3 caracteres'
    if (!form.cpf.trim()) e.cpf = 'CPF é obrigatório'
    else if (!validateCPF(form.cpf)) e.cpf = 'CPF inválido'
    if (!form.telefone.trim()) e.telefone = 'Telefone é obrigatório'
    else if (!validatePhone(form.telefone)) e.telefone = 'Telefone inválido'
    if (!form.dataNascimento) e.dataNascimento = 'Data de nascimento é obrigatória'
    if (!form.peso.trim()) e.peso = 'Peso é obrigatório'
    else if (!validateWeight(form.peso)) e.peso = 'Peso inválido'
    if (!form.medicoResponsavel.trim()) e.medicoResponsavel = 'Médico responsável é obrigatório'
    formState.setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const validateStep2 = useCallback((): boolean => {
    const e: Partial<Record<keyof ImmForm, string>> = {}
    if (!form.tipo.trim()) e.tipo = 'Tipo é obrigatório'
    if (!form.viaCutanea) e.viaCutanea = 'Via cutânea é obrigatória'
    if (!form.dataInicio) e.dataInicio = 'Data de início é obrigatória'
    { const err = validateExtrato(form.extrato); if (err) e.extrato = err }
    if (!form.metaConcentracao.trim()) e.metaConcentracao = 'Meta de concentração é obrigatória'
    else if (!validateConcentration(form.metaConcentracao)) e.metaConcentracao = 'Formato inválido (ex: 1:10)'
    if (!form.metaVolume.trim()) e.metaVolume = 'Meta de volume é obrigatória'
    else if (!validateVolume(form.metaVolume)) e.metaVolume = 'Volume inválido'
    formState.setErrors(e)
    return Object.keys(e).length === 0
  }, [form])

  const inputClass = (field?: keyof ImmForm) => cn(
    "w-full h-9 rounded-lg border bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all",
    field && errors[field] && touched[field] ? "border-red-400 bg-red-50/30" : "border-(--border-custom)"
  )

  const ErrorMsg = ({ field }: { field: keyof ImmForm }) => {
    if (!errors[field] || !touched[field]) return null
    return <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors[field]}</span>
  }

  const handleContinue = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => (s + 1) as 1 | 2 | 3)
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 p-4 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => setShowCancelModal(true)} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Adicionar Imunoterapia</h1>
        </div>

        {/* Steps */}
        <div className="px-5 py-7 flex items-center justify-center gap-4">
          {stepLabels.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all", step === s ? "bg-linear-to-br from-brand to-teal-400 text-white" : step > s ? "bg-teal-100 text-teal-600 opacity-50" : "bg-gray-200 text-gray-500")}>
                    {s}
                  </div>
                  <span className={cn("text-[0.8rem] font-medium", step === s ? "text-teal-600" : step > s ? "text-teal-600 opacity-50" : "text-gray-400")}>{label}</span>
                </div>
                {s < 3 && <div className={cn("h-px w-14 border-t-[1.5px]", step > s ? "border-teal-400 border-solid" : "border-gray-200 border-dashed")} />}
              </div>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-(--text)">Dados do Paciente</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nome do Paciente</label>
                  <input placeholder="Nome completo" value={form.nome} onChange={(e) => set('nome', e.target.value)} onBlur={() => touch('nome')} className={inputClass('nome')} />
                  <ErrorMsg field="nome" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">CPF</label>
                  <input placeholder="000.000.000-00" value={form.cpf} onChange={(e) => set('cpf', formatCPF(e.target.value))} onBlur={() => touch('cpf')} className={inputClass('cpf')} />
                  <ErrorMsg field="cpf" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Telefone</label>
                  <input placeholder="(00) 00000-0000" value={form.telefone} onChange={(e) => set('telefone', formatPhone(e.target.value))} onBlur={() => touch('telefone')} className={inputClass('telefone')} />
                  <ErrorMsg field="telefone" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data de Nascimento</label>
                  <input type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)} onBlur={() => touch('dataNascimento')} className={inputClass('dataNascimento')} />
                  <ErrorMsg field="dataNascimento" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Peso</label>
                  <div className="relative">
                    <input placeholder="Ex: 72.5" value={form.peso} onChange={(e) => set('peso', formatWeight(e.target.value))} onBlur={() => touch('peso')} className={cn(inputClass('peso'), "pr-10")} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">kg</span>
                  </div>
                  <ErrorMsg field="peso" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Médico Responsável</label>
                  <input placeholder="Nome do médico" value={form.medicoResponsavel} onChange={(e) => set('medicoResponsavel', e.target.value)} onBlur={() => touch('medicoResponsavel')} className={inputClass('medicoResponsavel')} />
                  <ErrorMsg field="medicoResponsavel" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-(--text)">Dados da Imunoterapia</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Tipo</label>
                  <div className="relative">
                    <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)} onBlur={() => touch('tipo')} className={cn(inputClass('tipo'), "appearance-none pr-8 cursor-pointer")}>
                      <option value="" disabled>Selecione o tipo</option>
                      <option value="Ácaros">Ácaros</option>
                      <option value="Gramíneas">Gramíneas</option>
                      <option value="Cão e Gato">Cão e Gato</option>
                      <option value="Cândida">Cândida</option>
                      <option value="Herpes">Herpes</option>
                      <option value="Fungos">Fungos</option>
                      <option value="Insetos">Insetos</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                  <ErrorMsg field="tipo" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Via Cutânea</label>
                  <div className="relative">
                    <select value={form.viaCutanea} onChange={(e) => set('viaCutanea', e.target.value)} onBlur={() => touch('viaCutanea')} className={cn(inputClass('viaCutanea'), "appearance-none pr-8 cursor-pointer")}>
                      <option value="" disabled>Selecione</option>
                      <option value="Subcutânea">Subcutânea</option>
                      <option value="Sublingual">Sublingual</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                  <ErrorMsg field="viaCutanea" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data de Início</label>
                  <input type="date" value={form.dataInicio} onChange={(e) => set('dataInicio', e.target.value)} onBlur={() => touch('dataInicio')} className={inputClass('dataInicio')} />
                  <ErrorMsg field="dataInicio" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Extrato</label>
                  <input placeholder="Ex: Der p 60 + Der f 10% + Blt 30%" value={form.extrato} onChange={(e) => set('extrato', e.target.value)} onBlur={() => touch('extrato')} className={inputClass('extrato')} />
                  <ErrorMsg field="extrato" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Meta de Concentração</label>
                  <input placeholder="1:10" value={form.metaConcentracao} onChange={(e) => set('metaConcentracao', formatConcentration(e.target.value))} onBlur={() => touch('metaConcentracao')} className={inputClass('metaConcentracao')} />
                  <ErrorMsg field="metaConcentracao" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Meta de Volume</label>
                  <div className="relative">
                    <input placeholder="Ex: 0.5" value={form.metaVolume} onChange={(e) => set('metaVolume', formatVolume(e.target.value))} onBlur={() => touch('metaVolume')} className={cn(inputClass('metaVolume'), "pr-10")} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">ml</span>
                  </div>
                  <ErrorMsg field="metaVolume" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-(--text)">Revisão dos dados</h2>
                <p className="text-[0.7rem] text-(--text-muted) mt-1">Confirme os dados antes de salvar a prescrição.</p>
              </div>

              {/* Dados do Paciente */}
              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                    <User size={13} className="text-teal-600" />
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Dados do Paciente</span>
                </div>
                <div className="bg-gray-50/60 p-4">
                  <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                    {[
                      { label: 'Nome', value: form.nome || '—' },
                      { label: 'CPF', value: form.cpf || '—' },
                      { label: 'Telefone', value: form.telefone || '—' },
                      { label: 'Data de Nascimento', value: form.dataNascimento ? format(new Date(form.dataNascimento + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
                      { label: 'Peso', value: form.peso ? `${form.peso} kg` : '—' },
                      { label: 'Médico Responsável', value: form.medicoResponsavel || '—' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white px-3.5 py-2.5">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                        <div className="text-xs font-medium text-(--text)">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dados da Imunoterapia */}
              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                    <Syringe size={13} className="text-teal-600" />
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Dados da Imunoterapia</span>
                </div>
                <div className="bg-gray-50/60 p-4">
                  <div className="grid grid-cols-2 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
                    {[
                      { label: 'Tipo', value: form.tipo || '—' },
                      { label: 'Via Cutânea', value: form.viaCutanea || '—' },
                      { label: 'Data de Início', value: form.dataInicio ? format(new Date(form.dataInicio + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
                      { label: 'Extrato', value: form.extrato || '—' },
                      { label: 'Meta de Concentração', value: form.metaConcentracao || '—' },
                      { label: 'Meta de Volume', value: form.metaVolume ? `${form.metaVolume} ml` : '—' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white px-3.5 py-2.5">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                        <div className="text-xs font-medium text-(--text)">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alert box */}
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                  <Info size={14} className="text-amber-600" />
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Após confirmar, o protocolo será iniciado e a primeira dose será agendada para <span className="font-bold">{form.dataInicio ? format(new Date(form.dataInicio + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : 'a data de início definida'}</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
          {step > 1 && (
            <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="h-8 px-4 rounded-lg border-[1.5px] border-teal-400 text-teal-600 text-xs font-semibold hover:bg-teal-50 transition-all">
              Voltar
            </button>
          )}
          {step < 3 ? (
            <button onClick={handleContinue} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
              Continuar
            </button>
          ) : (
            <button onClick={handleFinish} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
              Salvar Imunoterapia
            </button>
          )}
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-(--text) mb-2">Cancelar cadastro?</h3>
            <p className="text-xs text-(--text-muted) mb-5">Os dados preenchidos serão perdidos. Deseja realmente cancelar a prescrição da imunoterapia?</p>
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
