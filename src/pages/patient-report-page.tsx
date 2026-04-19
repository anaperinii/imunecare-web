import { useState, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { usePatientStore } from '@/store/patient-store'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { ArrowLeft, FileText, FileSpreadsheet, FileDown, Check, Download, Printer, ShieldCheck, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const formats = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV', icon: FileDown },
]

const sections = [
  { id: 'personal', label: 'Dados Pessoais' },
  { id: 'immunotherapy', label: 'Dados da Imunoterapia' },
  { id: 'applications', label: 'Histórico de Aplicações' },
  { id: 'reactions', label: 'Reações Adversas' },
  { id: 'progress', label: 'Progressão do Protocolo' },
]

export function PatientReportPage() {
  const navigate = useNavigate()
  const { patientId } = useSearch({ from: '/patient-report' })
  const { selectedPatient, applications } = usePatientStore()
  const { immunotherapies } = useImmunotherapiesStore()
  const [fileFormat, setFileFormat] = useState('pdf')
  const [selectedSections, setSelectedSections] = useState<string[]>(['personal', 'immunotherapy', 'applications', 'progress'])
  const [anonimizar, setAnonimizar] = useState(false)
  const [consentimento, setConsentimento] = useState(false)
  const [justificativa, setJustificativa] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)

  const patient = selectedPatient || (() => {
    if (!patientId) return null
    const imm = immunotherapies.find((i) => i.id === patientId)
    if (!imm) return null
    return {
      id: imm.id, nome: imm.nome, dataNascimento: '02/07/2000', idade: 25,
      telefone: '(62) 99557-1423', peso: '89.7 kg', cpf: '711.905.744-89',
      medicoResponsavel: 'Dra. Karina Martins', status: imm.status === 'ativo' ? 'ativo' as const : 'inativo' as const,
      tipoImunoterapia: imm.tipo, inicioInducao: '01/01/2020', inicioManutencao: null,
      viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
      concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
      intervaloAtual: imm.cicloIntervalo.dias, dataProximaAplicacao: '21/05/2025',
      concentracaoDoseAtuais: imm.doseConcentracao,
    }
  })()

  const patientApps = useMemo(() => {
    if (!patient) return []
    return applications.filter((a) => a.patientId === patient.id).sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })
  }, [patient, applications])

  const realizedApps = patientApps.filter((a) => a.status === 'realizada')
  const reactionsCount = realizedApps.filter((a) => a.efeitoColateral === 'Sim').length

  const mask = (value: string) => {
    if (!anonimizar) return value
    if (value.length <= 3) return '***'
    return value.slice(0, 3) + '*'.repeat(Math.max(value.length - 3, 3))
  }
  const maskCpf = (cpf: string) => anonimizar ? '***.***.***-**' : cpf
  const maskPhone = (phone: string) => anonimizar ? '(**) *****-****' : phone

  const toggleSection = (id: string) => {
    setSelectedSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  if (!patient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-(--text-muted)">Paciente não encontrado</span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: '/patient/$patientId', params: { patientId: patient.id } })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-(--text)">Emitir Relatório</h1>
              <p className="text-[0.65rem] text-(--text-muted)">{patient.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!consentimento || !justificativa.trim()}
              className={cn("h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-all", consentimento && justificativa.trim() ? "border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand cursor-pointer" : "border-gray-200 text-gray-300 cursor-not-allowed")}
            >
              <Printer size={13} />
              Imprimir
            </button>
            <button
              disabled={!consentimento || !justificativa.trim()}
              onClick={() => setShowExportModal(true)}
              className={cn("h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all", consentimento && justificativa.trim() ? "bg-linear-to-br from-brand to-teal-400 text-white hover:-translate-y-px cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
            >
              <Download size={13} />
              Exportar {fileFormat.toUpperCase()}
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left — Config */}
          <div className="w-72 shrink-0 border-r border-(--border-custom) p-5 overflow-y-auto space-y-5">
            {/* Format */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Formato</label>
              <div className="flex gap-2">
                {formats.map((f) => {
                  const Icon = f.icon
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFileFormat(f.id)}
                      className={cn(
                        "flex-1 h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        fileFormat === f.id
                          ? "border-brand bg-brand-50 text-brand-dark"
                          : "border-(--border-custom) text-(--text-muted) hover:border-brand/50"
                      )}
                    >
                      <Icon size={13} />
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sections */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Seções incluídas</label>
              <div className="space-y-1.5">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSection(s.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                      selectedSections.includes(s.id)
                        ? "border-brand bg-brand-50/50"
                        : "border-(--border-custom) hover:border-brand/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0",
                      selectedSections.includes(s.id)
                        ? "bg-brand border-brand"
                        : "border-gray-300"
                    )}>
                      {selectedSections.includes(s.id) && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-[0.7rem] font-medium text-(--text)">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider">Resumo</div>
              <div className="text-[0.65rem] text-(--text-muted) space-y-1">
                <div className="flex justify-between"><span>Aplicações realizadas</span><span className="font-semibold text-(--text)">{realizedApps.length}</span></div>
                <div className="flex justify-between"><span>Reações adversas</span><span className="font-semibold text-(--text)">{reactionsCount}</span></div>
                <div className="flex justify-between"><span>Intervalo atual</span><span className="font-semibold text-(--text)">{patient.intervaloAtual} dias</span></div>
                <div className="flex justify-between"><span>Status</span><span className={cn("font-semibold", patient.status === 'ativo' ? "text-green-600" : "text-(--text-muted)")}>{patient.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></div>
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
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                    anonimizar ? "border-brand bg-brand/5" : "border-(--border-custom) hover:border-brand/40"
                  )}
                >
                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0", anonimizar ? "bg-brand border-brand" : "border-gray-300")}>
                    {anonimizar && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-medium text-(--text) block">Anonimizar dados pessoais</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Nome, CPF e telefone serão mascarados</span>
                  </div>
                </button>
                <button
                  onClick={() => setConsentimento(!consentimento)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                    consentimento ? "border-brand bg-brand/5" : "border-(--border-custom) hover:border-brand/40"
                  )}
                >
                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0", consentimento ? "bg-brand border-brand" : "border-gray-300")}>
                    {consentimento && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-medium text-(--text) block">Declaro ciência da LGPD</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Responsabilizo-me pelo uso dos dados</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Justificativa <span className="text-red-400">*</span></label>
              <textarea
                rows={2}
                placeholder="Ex: Acompanhamento clínico do paciente"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                className="w-full rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            {!consentimento && (
              <p className="text-[0.55rem] text-amber-600 text-center">Aceite a declaração LGPD para habilitar a exportação</p>
            )}
          </div>

          {/* Right — Preview */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
            <div className="bg-white rounded-xl border border-(--border-custom) shadow-sm max-w-2xl mx-auto relative overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rotate-[-30deg]">
                <span className="text-[3.5rem] font-extrabold text-gray-100 tracking-[0.3em] select-none uppercase">Confidencial</span>
              </div>

              {/* Report header */}
              <div className="px-6 py-5 border-b border-(--border-custom) relative z-20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-(--text)">Relatório Clínico — {anonimizar ? mask(patient.nome) : patient.nome}</h2>
                    <p className="text-[0.65rem] text-(--text-muted) mt-0.5">Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  </div>
                  <div className="text-[0.6rem] text-(--text-muted) text-right">
                    <div>ImuneCare</div>
                    <div>Formato: {fileFormat.toUpperCase()}</div>
                    {anonimizar && (
                      <div className="flex items-center gap-1 text-brand font-semibold mt-0.5 justify-end">
                        <EyeOff size={10} />
                        Dados anonimizados
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {selectedSections.length === 0 ? (
                  <div className="text-center py-12 text-xs text-(--text-muted)">Selecione pelo menos uma seção.</div>
                ) : (
                  <>
                    {/* Dados Pessoais */}
                    {selectedSections.includes('personal') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Dados Pessoais</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {[
                            ['Nome', anonimizar ? mask(patient.nome) : patient.nome],
                            ['CPF', maskCpf(patient.cpf)],
                            ['Data de Nascimento', patient.dataNascimento],
                            ['Idade', `${patient.idade} anos`],
                            ['Telefone', maskPhone(patient.telefone)],
                            ['Peso', patient.peso],
                            ['Médico Responsável', patient.medicoResponsavel],
                          ].map(([l, v]) => (
                            <div key={l} className="flex items-center gap-2 text-[0.7rem]">
                              <span className="text-(--text-muted)">{l}:</span>
                              <span className="font-medium text-(--text)">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dados da Imunoterapia */}
                    {selectedSections.includes('immunotherapy') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Dados da Imunoterapia</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {[
                            ['Tipo', patient.tipoImunoterapia], ['Via', patient.viaAdministracao],
                            ['Extrato', patient.extrato], ['Início Indução', patient.inicioInducao],
                            ['Meta', patient.concentracaoVolumeMeta], ['Dose Atual', patient.concentracaoDoseAtuais],
                            ['Intervalo Atual', `${patient.intervaloAtual} dias`],
                          ].map(([l, v]) => (
                            <div key={l} className="flex items-center gap-2 text-[0.7rem]">
                              <span className="text-(--text-muted)">{l}:</span>
                              <span className="font-medium text-(--text)">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Histórico de Aplicações */}
                    {selectedSections.includes('applications') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Histórico de Aplicações ({realizedApps.length})</h3>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-(--border-custom)">
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Data</th>
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Dose</th>
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Intervalo</th>
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Reação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {realizedApps.slice(0, 15).map((app) => (
                              <tr key={app.id} className="border-b border-(--border-custom) last:border-0">
                                <td className="py-1.5 text-[0.65rem] text-(--text)">{app.data}</td>
                                <td className="py-1.5 text-[0.65rem] text-(--text)">{app.dose}</td>
                                <td className="py-1.5 text-[0.65rem] text-(--text)">{app.ciclo.dias}d</td>
                                <td className="py-1.5 text-[0.65rem]">
                                  <span className={cn("font-medium", app.efeitoColateral === 'Sim' ? "text-amber-600" : "text-green-600")}>
                                    {app.efeitoColateral || 'Não'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {realizedApps.length > 15 && (
                          <div className="text-center text-[0.6rem] text-(--text-muted) mt-2">... e mais {realizedApps.length - 15} aplicações</div>
                        )}
                      </div>
                    )}

                    {/* Reações Adversas */}
                    {selectedSections.includes('reactions') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Reações Adversas ({reactionsCount})</h3>
                        {reactionsCount === 0 ? (
                          <p className="text-[0.7rem] text-(--text-muted)">Nenhuma reação adversa registrada.</p>
                        ) : (
                          <div className="space-y-2">
                            {realizedApps.filter((a) => a.efeitoColateral === 'Sim').map((app) => (
                              <div key={app.id} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.65rem] font-semibold text-amber-700">{app.data} — {app.dose}</span>
                                  <span className="text-[0.55rem] text-amber-600">{app.necessidadeMedicacao === 'Sim' ? 'Com medicação' : 'Sem medicação'}</span>
                                </div>
                                {app.notaResponsavel && app.notaResponsavel !== '-' && (
                                  <div className="text-[0.6rem] text-amber-600 mt-1">{app.notaResponsavel}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progressão */}
                    {selectedSections.includes('progress') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Progressão do Protocolo</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-extrabold text-brand">{realizedApps.length}</div>
                            <div className="text-[0.6rem] text-(--text-muted)">Aplicações</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-extrabold text-brand">{patient.concentracaoDoseAtuais.split(' - ')[0]}</div>
                            <div className="text-[0.6rem] text-(--text-muted)">Concentração atual</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-extrabold text-brand">{patient.intervaloAtual}d</div>
                            <div className="text-[0.6rem] text-(--text-muted)">Intervalo</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-(--border-custom) relative z-20">
                <div className="flex justify-between mb-2">
                  <span className="text-[0.6rem] text-(--text-muted)">ImuneCare © 2026</span>
                  <span className="text-[0.6rem] text-(--text-muted)">Página 1 de 1</span>
                </div>
                <p className="text-[0.5rem] text-(--text-muted)/60 leading-relaxed">
                  Documento protegido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é proibido. O responsável pela exportação assume total responsabilidade pelo uso das informações.
                </p>
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
              Esta ação será registrada no log de auditoria do sistema conforme exigências da LGPD.
            </p>

            <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 mb-4 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Paciente</span>
                <span className="text-[0.6rem] font-semibold text-(--text)">{anonimizar ? mask(patient.nome) : patient.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Formato</span>
                <span className="text-[0.6rem] font-semibold text-(--text)">{fileFormat.toUpperCase()}</span>
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
              <button onClick={() => setShowExportModal(false)} className="flex-1 h-8 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={() => { setShowExportModal(false); navigate({ to: '/patient/$patientId', params: { patientId: patient.id } }) }}
                className="flex-1 h-8 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all cursor-pointer"
              >
                Confirmar e exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
