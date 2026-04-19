import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, X, User, Syringe, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const stepLabels = ['Dados do Paciente', 'Dados da Imunoterapia', 'Revisão dos Dados']

export function AddImmunotherapyPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [form, setForm] = useState({
    nome: '', cpf: '', telefone: '', dataNascimento: '', peso: '', medicoResponsavel: '',
    tipo: '', viaCutanea: '', dataInicio: '', extrato: '', metaConcentracao: '', metaVolume: '',
  })

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 p-4 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-(--text)">Adicionar Imunoterapia</h1>
          <button onClick={() => setShowCancelModal(true)} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Steps */}
        <div className="px-5 py-8 flex items-center justify-center gap-4">
          {stepLabels.map((label, i) => {
            const s = i + 1
            return (
              <div key={s} className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all", step === s ? "bg-linear-to-br from-brand to-teal-400 text-white" : step > s ? "bg-teal-100 text-teal-600 opacity-50" : "bg-gray-200 text-gray-500")}>
                    {s}
                  </div>
                  <span className={cn("text-sm font-medium", step === s ? "text-teal-600" : step > s ? "text-teal-600 opacity-50" : "text-gray-400")}>{label}</span>
                </div>
                {s < 3 && <div className={cn("h-px w-16 border-t-[1.5px]", step > s ? "border-teal-400 border-solid" : "border-gray-200 border-dashed")} />}
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
                {[
                  { id: 'nome', label: 'Nome do Paciente', type: 'text' },
                  { id: 'cpf', label: 'CPF', type: 'text' },
                  { id: 'telefone', label: 'Telefone', type: 'text' },
                  { id: 'dataNascimento', label: 'Data de Nascimento', type: 'date' },
                  { id: 'peso', label: 'Peso', type: 'text' },
                  { id: 'medicoResponsavel', label: 'Médico Responsável', type: 'text' },
                ].map((f) => (
                  <div key={f.id}>
                    <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">{f.label}</label>
                    <input type={f.type} placeholder="Insira aqui" value={form[f.id as keyof typeof form]} onChange={(e) => set(f.id, e.target.value)} className={inputClass} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-(--text)">Dados da Imunoterapia</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Tipo</label>
                  <input placeholder="Insira aqui" value={form.tipo} onChange={(e) => set('tipo', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Via Cutânea</label>
                  <div className="relative">
                    <select value={form.viaCutanea} onChange={(e) => set('viaCutanea', e.target.value)} className={cn(inputClass, "appearance-none pr-8 cursor-pointer")}>
                      <option value="" disabled>Selecione</option>
                      <option value="Subcutânea">Subcutânea</option>
                      <option value="Sublingual">Sublingual</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data de Início</label>
                  <input type="date" value={form.dataInicio} onChange={(e) => set('dataInicio', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Extrato</label>
                  <input placeholder="Insira aqui" value={form.extrato} onChange={(e) => set('extrato', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Meta de Concentração</label>
                  <input placeholder="Insira aqui" value={form.metaConcentracao} onChange={(e) => set('metaConcentracao', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Meta de Volume</label>
                  <input placeholder="Insira aqui" value={form.metaVolume} onChange={(e) => set('metaVolume', e.target.value)} className={inputClass} />
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

              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                    <User size={13} className="text-teal-600" />
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Dados do Paciente</span>
                </div>
                <div className="bg-gray-50/50 px-4">
                  {[
                    ['Nome', form.nome], ['CPF', form.cpf], ['Telefone', form.telefone],
                    ['Data de Nascimento', form.dataNascimento ? format(new Date(form.dataNascimento + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : '—'],
                    ['Peso', form.peso], ['Médico Responsável', form.medicoResponsavel],
                  ].map(([l, v]) => (
                    <div key={l} className="flex items-center gap-2 py-2.5 border-b border-(--border-custom) last:border-0">
                      <span className="text-xs text-(--text-muted)">{l}:</span>
                      <span className="text-xs font-medium text-(--text)">{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-(--border-custom) rounded-xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-(--border-custom) bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                    <Syringe size={13} className="text-teal-600" />
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-(--text-muted)">Dados da Imunoterapia</span>
                </div>
                <div className="bg-gray-50/50">
                  <div className="grid grid-cols-2 gap-px bg-(--border-custom) m-4 rounded-lg overflow-hidden border border-(--border-custom)">
                    {[
                      { label: 'Tipo', value: form.tipo || '—' },
                      { label: 'Via Cutânea', value: form.viaCutanea || '—' },
                      { label: 'Data de Início', value: form.dataInicio ? format(new Date(form.dataInicio + 'T12:00'), 'dd/MM/yyyy', { locale: ptBR }) : '—' },
                      { label: 'Extrato', value: form.extrato || '—' },
                      { label: 'Meta de Concentração', value: form.metaConcentracao || '—', accent: true },
                      { label: 'Meta de Volume', value: form.metaVolume || '—', accent: true },
                    ].map((item) => (
                      <div key={item.label} className="bg-white px-3.5 py-2.5">
                        <div className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted) mb-0.5">{item.label}</div>
                        <div className={cn("text-xs font-medium", item.accent ? "text-teal-700" : "text-(--text)")}>{item.value}</div>
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
            <button onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
              Continuar
            </button>
          ) : (
            <button onClick={() => { navigate({ to: '/immunotherapies' }) }} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all">
              Salvar
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
