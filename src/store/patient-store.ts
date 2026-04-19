import { create } from 'zustand'
import { INDUCTION_SEQUENCE, META_DOSE, META_STEP } from '@/lib/scit-protocol'

export type ProtocolAdjustmentType = 'reducao_dose' | 'aumento_intervalo' | 'alteracao_concentracao' | 'suspensao' | 'outro'

export type InactivationCategory =
  | 'conclusao_tratamento'
  | 'reacao_adversa_leve'
  | 'reacao_adversa_grave'
  | 'infeccao_aguda'
  | 'gestacao'
  | 'cirurgia_programada'
  | 'vacinacao_recente'
  | 'contraindicacao_clinica'
  | 'mudanca_conduta'
  | 'falta_adesao'
  | 'solicitacao_paciente'
  | 'outro'

export interface Inactivation {
  id: string
  category: InactivationCategory
  detail: string
  startDate: string
  expectedReturnDate: string | null
  responsavel: string
  snapshotConcentracao: string
  snapshotIntervalo: number
  reactivatedAt?: string
  reactivateNote?: string
  reactivatedBy?: string
  reactivateConcentracao?: string
  reactivateIntervalo?: number
  reactivateJustificativa?: string
}

export interface ProtocolAdjustment {
  id: string
  date: string
  type: ProtocolAdjustmentType
  previousConcentracao: string
  previousIntervalo: number
  newConcentracao: string
  newIntervalo: number
  justificativa: string
  responsavel: string
}

export interface Patient {
  id: string
  nome: string
  dataNascimento: string
  idade: number
  telefone: string
  peso: string
  cpf: string
  medicoResponsavel: string
  status: 'ativo' | 'inativo'
  tipoImunoterapia: string
  inicioInducao: string
  inicioManutencao: string | null
  viaAdministracao: string
  extrato: string
  concentracaoVolumeMeta: string
  metaAtingida: boolean
  intervaloAtual: number
  dataProximaAplicacao: string
  concentracaoDoseAtuais: string
  protocolAdjustments?: ProtocolAdjustment[]
  inactivations?: Inactivation[]
}

export interface Application {
  id: string
  patientId: string
  data: string
  horaInicio: string
  horaFim: string
  status: 'agendada' | 'realizada' | 'cancelada' | 'ausente'
  dose: string
  ciclo: { numero: number; dias: number }
  mes: string
  ano: number
  volumeAplicado?: string
  concentracaoExtrato?: string
  efeitoColateral?: string
  efeitosRelatados?: string
  necessidadeMedicacao?: string
  medicacoes?: string
  responsavel?: string
  notaResponsavel?: string
  modalidade?: 'subcutânea' | 'sublingual'
}

interface PatientState {
  selectedPatient: Patient | null
  applications: Application[]
  setSelectedPatient: (patient: Patient | null) => void
  addProtocolAdjustment: (adjustment: ProtocolAdjustment) => void
  inactivateImunoterapia: (inactivation: Inactivation) => void
  reactivateImunoterapia: (payload: { note: string; reactivatedBy: string; reactivateConcentracao: string; reactivateIntervalo: number; justificativa: string }) => void
  recordEvolution: (payload: { realizada: Application; proxima: Application }) => void
}

const INACTIVATION_SEEDS: Record<string, Omit<Inactivation, 'id' | 'snapshotConcentracao' | 'snapshotIntervalo'>> = {
  '10': { category: 'solicitacao_paciente', detail: 'Paciente optou por interromper o tratamento por motivos pessoais. Retorno será reavaliado após estabilização da rotina.', startDate: '15/02/2026 às 09:15', expectedReturnDate: '15/05/2026', responsavel: 'Dra. Karina Martins' },
  '11': { category: 'gestacao', detail: 'Paciente comunicou gestação; tratamento pausado conforme protocolo para reavaliação no pós-parto.', startDate: '22/01/2026 às 11:30', expectedReturnDate: '01/10/2026', responsavel: 'Dra. Karina Martins' },
  '12': { category: 'reacao_adversa_grave', detail: 'Reação moderada durante aplicação 1:1.000 - 0,2ml com necessidade de anti-histamínico. Conduta revista com alergologista responsável.', startDate: '10/01/2026 às 15:45', expectedReturnDate: null, responsavel: 'Dr. André Lima' },
}

export function seedInactivationsFor(patientId: string, snapshotConcentracao: string, snapshotIntervalo: number): Inactivation[] | undefined {
  const seed = INACTIVATION_SEEDS[patientId]
  if (!seed) return undefined
  return [{ id: `inact-seed-${patientId}`, ...seed, snapshotConcentracao, snapshotIntervalo }]
}

// ════════════════════════════════════════════════════════════════════
// Geração programática das aplicações seguindo protocolo SCIT (RNE-010)
// ════════════════════════════════════════════════════════════════════

const PT_MONTHS = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO']

function fmtDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0')
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  return { data: `${day}/${mo}/${d.getFullYear()}`, mes: PT_MONTHS[d.getMonth()], ano: d.getFullYear() }
}

function daysOffset(base: Date, n: number): Date {
  const r = new Date(base)
  r.setDate(r.getDate() + n)
  return r
}

function inductionFlow(patientId: string, prefix: string, stepIndex: number, lastRealizedDate: Date, nextScheduledDate: Date | null, horaInicio: string, horaFim: string, responsavel: string): Application[] {
  const apps: Application[] = []
  for (let i = 0; i <= stepIndex; i++) {
    const date = daysOffset(lastRealizedDate, -7 * (stepIndex - i))
    const step = INDUCTION_SEQUENCE[i]
    const { data, mes, ano } = fmtDate(date)
    apps.push({
      id: `${prefix}${i + 1}`, patientId, data, mes, ano,
      horaInicio, horaFim, status: 'realizada',
      dose: `${step.conc} - ${step.vol}`,
      ciclo: { numero: 1, dias: 7 },
      volumeAplicado: step.vol, concentracaoExtrato: step.conc,
      efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel,
      notaResponsavel: i === 0 ? 'Primeira aplicação' : (i % 4 === 0 ? `Avançou para ${step.conc}` : '-'),
    })
  }
  if (nextScheduledDate && stepIndex < INDUCTION_SEQUENCE.length - 1) {
    const nextStep = INDUCTION_SEQUENCE[stepIndex + 1]
    const { data, mes, ano } = fmtDate(nextScheduledDate)
    apps.push({
      id: `${prefix}next`, patientId, data, mes, ano,
      horaInicio, horaFim, status: 'agendada',
      dose: `${nextStep.conc} - ${nextStep.vol}`,
      ciclo: { numero: 1, dias: 7 },
    })
  }
  return apps
}

function maintenanceFlow(patientId: string, prefix: string, finalInterval: 14 | 21 | 28, lastRealizedDate: Date, nextScheduledDate: Date | null, horaInicio: string, horaFim: string, responsavel: string): Application[] {
  type H = { dose: string; conc: string; vol: string; interval: number; ciclo: number; note?: string }
  const hist: H[] = []
  for (let i = 0; i < INDUCTION_SEQUENCE.length; i++) {
    const s = INDUCTION_SEQUENCE[i]
    hist.push({
      dose: `${s.conc} - ${s.vol}`, conc: s.conc, vol: s.vol, interval: 7, ciclo: 1,
      note: i === 0 ? 'Primeira aplicação' : i === INDUCTION_SEQUENCE.length - 1 ? 'Meta atingida! Transição para manutenção' : (i % 4 === 0 ? `Avançou para ${s.conc}` : '-'),
    })
  }
  const pushMeta = (interval: 14 | 21 | 28, ciclo: number, note?: string) =>
    hist.push({ dose: META_DOSE, conc: META_STEP.conc, vol: META_STEP.vol, interval, ciclo, note: note || '-' })

  if (finalInterval >= 14) {
    pushMeta(14, 1, 'Início manutenção 14 dias')
    pushMeta(14, 1)
  }
  if (finalInterval >= 21) {
    pushMeta(21, 2, 'Progrediu para 21 dias')
    pushMeta(21, 2)
  }
  if (finalInterval >= 28) {
    pushMeta(28, 3, 'Progrediu para 28 dias')
    pushMeta(28, 3)
  }

  const dates: Date[] = new Array(hist.length)
  dates[hist.length - 1] = lastRealizedDate
  for (let i = hist.length - 2; i >= 0; i--) {
    dates[i] = daysOffset(dates[i + 1], -hist[i + 1].interval)
  }

  const apps: Application[] = []
  for (let i = 0; i < hist.length; i++) {
    const h = hist[i]
    const { data, mes, ano } = fmtDate(dates[i])
    apps.push({
      id: `${prefix}${i + 1}`, patientId, data, mes, ano,
      horaInicio, horaFim, status: 'realizada',
      dose: h.dose, ciclo: { numero: h.ciclo, dias: h.interval },
      volumeAplicado: h.vol, concentracaoExtrato: h.conc,
      efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel,
      notaResponsavel: h.note,
    })
  }
  if (nextScheduledDate) {
    const ciclo = finalInterval === 14 ? 1 : finalInterval === 21 ? 2 : 3
    const { data, mes, ano } = fmtDate(nextScheduledDate)
    apps.push({
      id: `${prefix}next`, patientId, data, mes, ano,
      horaInicio, horaFim, status: 'agendada',
      dose: META_DOSE, ciclo: { numero: ciclo, dias: finalInterval },
    })
  }
  return apps
}

const REACTION_SEEDS: Record<string, { efeitosRelatados: string; medicacoes: string; nota: string }> = {
  'a4': {
    efeitosRelatados: 'Prurido local leve e eritema no ponto da aplicação',
    medicacoes: 'Anti-histamínico tópico (Polaramine creme)',
    nota: 'Reação local leve. Conduta: manter protocolo com monitoramento.',
  },
  'pt4': {
    efeitosRelatados: 'Eritema leve no local da aplicação (< 2cm)',
    medicacoes: 'Compressas frias locais',
    nota: 'Paciente tolerou; segue protocolo.',
  },
  'l11': {
    efeitosRelatados: 'Placa urticariforme peri-aplicação (~5cm) com prurido intenso',
    medicacoes: 'Loratadina 10mg VO + Dexclorfeniramina creme',
    nota: 'Reação moderada motivou solicitação de interrupção pelo paciente.',
  },
  'r6': {
    efeitosRelatados: 'Urticária generalizada + prurido difuso 20min pós-aplicação',
    medicacoes: 'Anti-histamínico VO + corticoide (Prednisona 20mg)',
    nota: 'Reação moderada. Tratamento suspenso a pedido médico.',
  },
}

function applyReactions(apps: Application[]): Application[] {
  return apps.map((a) => {
    const seed = REACTION_SEEDS[a.id]
    if (!seed) return a
    return {
      ...a,
      efeitoColateral: 'Sim',
      efeitosRelatados: seed.efeitosRelatados,
      necessidadeMedicacao: 'Sim',
      medicacoes: seed.medicacoes,
      notaResponsavel: seed.nota,
    }
  })
}

function buildSeedApplications(): Application[] {
  const r = 'Jaqueline'
  const out: Application[] = []
  out.push(...inductionFlow('1', 'b', 0, new Date(2026, 3, 11), new Date(2026, 3, 18), '09:00', '09:30', r))
  out.push(...inductionFlow('2', 'c', 5, new Date(2026, 3, 11), new Date(2026, 3, 18), '10:00', '10:30', r))
  out.push(...inductionFlow('3', 'a', 10, new Date(2026, 3, 11), new Date(2026, 3, 18), '10:30', '11:00', r))
  out.push(...inductionFlow('4', 'v', 14, new Date(2026, 3, 11), new Date(2026, 3, 18), '11:00', '11:30', r))
  out.push(...maintenanceFlow('5', 'h', 14, new Date(2026, 3, 4), new Date(2026, 3, 18), '14:00', '14:30', r))
  out.push(...maintenanceFlow('6', 'cr', 21, new Date(2026, 2, 28), new Date(2026, 3, 18), '15:30', '16:00', r))
  out.push(...maintenanceFlow('7', 'm', 28, new Date(2026, 2, 21), new Date(2026, 3, 18), '08:00', '08:30', r))
  out.push(...inductionFlow('8', 'pt', 4, new Date(2026, 3, 11), new Date(2026, 3, 18), '09:00', '09:30', r))
  out.push(...inductionFlow('9', 'pe', 9, new Date(2026, 3, 11), new Date(2026, 3, 18), '10:30', '11:00', r))

  out.push(...inductionFlow('10', 'l', 10, new Date(2026, 1, 15), null, '09:00', '09:30', r))
  out.push(...maintenanceFlow('11', 'j', 14, new Date(2026, 0, 20), null, '11:00', '11:30', r))
  out.push(...inductionFlow('12', 'r', 5, new Date(2026, 0, 10), null, '15:00', '15:30', r))

  return applyReactions(out)
}

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: null,
  applications: buildSeedApplications(),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  recordEvolution: ({ realizada, proxima }) => set((s) => {
    const filtered = s.applications.filter((a) =>
      !(a.patientId === realizada.patientId && a.status === 'agendada')
    )
    return {
      applications: [...filtered, realizada, proxima],
      selectedPatient: s.selectedPatient && s.selectedPatient.id === realizada.patientId ? {
        ...s.selectedPatient,
        concentracaoDoseAtuais: realizada.dose,
        intervaloAtual: proxima.ciclo.dias,
        dataProximaAplicacao: proxima.data,
      } : s.selectedPatient,
    }
  }),
  addProtocolAdjustment: (adjustment) => set((s) => {
    if (!s.selectedPatient) return s
    return {
      selectedPatient: {
        ...s.selectedPatient,
        concentracaoDoseAtuais: adjustment.newConcentracao,
        intervaloAtual: adjustment.newIntervalo,
        protocolAdjustments: [...(s.selectedPatient.protocolAdjustments || []), adjustment],
      },
    }
  }),
  inactivateImunoterapia: (inactivation) => set((s) => {
    if (!s.selectedPatient) return s
    return {
      selectedPatient: {
        ...s.selectedPatient,
        status: 'inativo',
        inactivations: [...(s.selectedPatient.inactivations || []), inactivation],
      },
    }
  }),
  reactivateImunoterapia: ({ note, reactivatedBy, reactivateConcentracao, reactivateIntervalo, justificativa }) => set((s) => {
    if (!s.selectedPatient) return s
    const list = s.selectedPatient.inactivations || []
    if (list.length === 0) return s
    const updated = [...list]
    const lastIdx = updated.length - 1
    const reactivatedAt = new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às')
    updated[lastIdx] = {
      ...updated[lastIdx],
      reactivatedAt,
      reactivateNote: note,
      reactivatedBy,
      reactivateConcentracao,
      reactivateIntervalo,
      reactivateJustificativa: justificativa,
    }
    return {
      selectedPatient: {
        ...s.selectedPatient,
        status: 'ativo',
        concentracaoDoseAtuais: reactivateConcentracao,
        intervaloAtual: reactivateIntervalo,
        inactivations: updated,
      },
    }
  }),
}))
