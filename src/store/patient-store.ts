import { create } from 'zustand'

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
  necessidadeMedicacao?: string
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
}

const INACTIVATION_SEEDS: Record<string, Omit<Inactivation, 'id' | 'snapshotConcentracao' | 'snapshotIntervalo'>> = {
  '10': { category: 'solicitacao_paciente', detail: 'Paciente optou por interromper o tratamento por motivos pessoais. Retorno será reavaliado após estabilização da rotina.', startDate: '15/02/2026 às 09:15', expectedReturnDate: '15/05/2026', responsavel: 'Dra. Karina Martins' },
  '11': { category: 'gestacao', detail: 'Paciente comunicou gestação; tratamento pausado conforme protocolo para reavaliação no pós-parto.', startDate: '22/01/2026 às 11:30', expectedReturnDate: '01/10/2026', responsavel: 'Dra. Karina Martins' },
  '12': { category: 'reacao_adversa_grave', detail: 'Reação moderada durante aplicação 1:1.000 - 0,2ml com necessidade de anti-histamínico. Conduta revista com alergologista responsável.', startDate: '10/01/2026 às 15:45', expectedReturnDate: null, responsavel: 'Dra. Karina Martins' },
}

export function seedInactivationsFor(patientId: string, snapshotConcentracao: string, snapshotIntervalo: number): Inactivation[] | undefined {
  const seed = INACTIVATION_SEEDS[patientId]
  if (!seed) return undefined
  return [{ id: `inact-seed-${patientId}`, ...seed, snapshotConcentracao, snapshotIntervalo }]
}

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: null,
  applications: [
    // ══════ Bárbara (id:1) — Indução 1:10.000, dose atual 0,1ml → próxima 0,2ml ══════
    { id: 'b1', patientId: '1', data: '13/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'agendada', dose: '1:10.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'b2', patientId: '1', data: '06/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Primeira aplicação' },

    // ══════ Camilla (id:2) — Indução 1:1.000, dose atual 0,2ml ══════
    { id: 'c1', patientId: '2', data: '14/04/2026', horaInicio: '10:00', horaFim: '10:30', status: 'agendada', dose: '1:1.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'c2', patientId: '2', data: '07/04/2026', horaInicio: '10:00', horaFim: '10:30', status: 'realizada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'c3', patientId: '2', data: '31/03/2026', horaInicio: '10:00', horaFim: '10:30', status: 'realizada', dose: '1:1.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'c4', patientId: '2', data: '24/03/2026', horaInicio: '10:00', horaFim: '10:30', status: 'realizada', dose: '1:10.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Última dose 1:10.000, avança para 1:1.000' },
    { id: 'c5', patientId: '2', data: '17/03/2026', horaInicio: '10:00', horaFim: '10:30', status: 'realizada', dose: '1:10.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'c6', patientId: '2', data: '10/03/2026', horaInicio: '10:00', horaFim: '10:30', status: 'realizada', dose: '1:10.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'c7', patientId: '2', data: '03/03/2026', horaInicio: '10:00', horaFim: '10:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },

    // ══════ Ana Clara (id:3) — Indução 1:100, dose atual 0,4ml ══════
    { id: 'a1', patientId: '3', data: '13/04/2026', horaInicio: '10:30', horaFim: '11:00', status: 'agendada', dose: '1:100 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'a2', patientId: '3', data: '06/04/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:100 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'a3', patientId: '3', data: '30/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:100 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'a4', patientId: '3', data: '23/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:100 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:100', efeitoColateral: 'Sim', necessidadeMedicacao: 'Sim', responsavel: 'Jaqueline', notaResponsavel: 'Prurido local leve, aplicado anti-histamínico' },
    // 1:1.000 completa (0,1→0,2→0,4→0,8)
    { id: 'a5', patientId: '3', data: '16/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:100' },
    { id: 'a6', patientId: '3', data: '09/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'a7', patientId: '3', data: '02/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'a8', patientId: '3', data: '23/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:1.000' },
    // 1:10.000 completa (0,1→0,2→0,4→0,8)
    { id: 'a9', patientId: '3', data: '16/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Última dose 1:10.000' },
    { id: 'a10', patientId: '3', data: '09/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'a11', patientId: '3', data: '02/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'a12', patientId: '3', data: '26/01/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Primeira aplicação' },

    // ══════ Valentina (id:4) — Indução 1:10, dose atual 0,8ml (quase manutenção) ══════
    { id: 'v1', patientId: '4', data: '14/04/2026', horaInicio: '11:00', horaFim: '11:30', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'v2', patientId: '4', data: '07/04/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Próxima: 0,5ml manutenção se tolerado' },
    { id: 'v3', patientId: '4', data: '31/03/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v4', patientId: '4', data: '24/03/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v5', patientId: '4', data: '17/03/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Início concentração 1:10' },
    { id: 'v6', patientId: '4', data: '10/03/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:100 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:10' },
    { id: 'v7', patientId: '4', data: '03/03/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:100 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v8', patientId: '4', data: '24/02/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:100 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v9', patientId: '4', data: '17/02/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:100 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v10', patientId: '4', data: '10/02/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:1.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:100' },
    { id: 'v11', patientId: '4', data: '03/02/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:1.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v12', patientId: '4', data: '27/01/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v13', patientId: '4', data: '20/01/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:1.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v14', patientId: '4', data: '13/01/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:1.000' },
    { id: 'v15', patientId: '4', data: '06/01/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v16', patientId: '4', data: '30/12/2025', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'DEZEMBRO', ano: 2025, volumeAplicado: '0,2ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'v17', patientId: '4', data: '23/12/2025', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'DEZEMBRO', ano: 2025, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Primeira aplicação' },

    // ══════ Heitor (id:5) — Manutenção 1:10-0,5ml, intervalo 14 dias ══════
    { id: 'h1', patientId: '5', data: '22/04/2026', horaInicio: '14:00', horaFim: '14:30', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'ABRIL', ano: 2026 },
    { id: 'h2', patientId: '5', data: '08/04/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'h3', patientId: '5', data: '25/03/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Início manutenção 14 dias' },
    { id: 'h4', patientId: '5', data: '18/03/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Meta atingida! Transição para manutenção' },
    { id: 'h5', patientId: '5', data: '11/03/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'h6', patientId: '5', data: '04/03/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'h7', patientId: '5', data: '25/02/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Início 1:10' },
    { id: 'h8', patientId: '5', data: '18/02/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:100 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:10' },
    { id: 'h9', patientId: '5', data: '11/02/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:100 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'h10', patientId: '5', data: '04/02/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:1.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:100' },
    { id: 'h11', patientId: '5', data: '28/01/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:1.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'h12', patientId: '5', data: '21/01/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:1.000' },
    { id: 'h13', patientId: '5', data: '14/01/2026', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Primeira aplicação' },

    // ══════ Caroline (id:6) — Manutenção 1:10-0,5ml, intervalo 21 dias ══════
    { id: 'cr1', patientId: '6', data: '29/04/2026', horaInicio: '15:30', horaFim: '16:00', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 2, dias: 21 }, mes: 'ABRIL', ano: 2026 },
    { id: 'cr2', patientId: '6', data: '08/04/2026', horaInicio: '15:30', horaFim: '16:00', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 2, dias: 21 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'cr3', patientId: '6', data: '18/03/2026', horaInicio: '15:30', horaFim: '16:00', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 2, dias: 21 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Progrediu para 21 dias' },
    { id: 'cr4', patientId: '6', data: '04/03/2026', horaInicio: '15:30', horaFim: '16:00', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'cr5', patientId: '6', data: '18/02/2026', horaInicio: '15:30', horaFim: '16:00', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },

    // ══════ Marta (id:7) — Manutenção 1:10-0,5ml, intervalo 28 dias ══════
    { id: 'm1', patientId: '7', data: '08/05/2026', horaInicio: '08:00', horaFim: '08:30', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 3, dias: 28 }, mes: 'MAIO', ano: 2026 },
    { id: 'm2', patientId: '7', data: '10/04/2026', horaInicio: '08:00', horaFim: '08:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 3, dias: 28 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'm3', patientId: '7', data: '13/03/2026', horaInicio: '08:00', horaFim: '08:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 3, dias: 28 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Progrediu para 28 dias' },
    { id: 'm4', patientId: '7', data: '20/02/2026', horaInicio: '08:00', horaFim: '08:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 2, dias: 21 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'm5', patientId: '7', data: '30/01/2026', horaInicio: '08:00', horaFim: '08:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 2, dias: 21 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },

    // ══════ Patrício (id:8) — Indução 1:1.000, dose atual 0,1ml ══════
    { id: 'pt1', patientId: '8', data: '16/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'agendada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'pt2', patientId: '8', data: '09/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:1.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pt3', patientId: '8', data: '02/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:1.000' },
    { id: 'pt4', patientId: '8', data: '26/03/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Sim', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Eritema leve' },
    { id: 'pt5', patientId: '8', data: '19/03/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pt6', patientId: '8', data: '12/03/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Primeira aplicação' },

    // ══════ Pedro (id:9) — Indução 1:100, dose atual 0,2ml ══════
    { id: 'pe1', patientId: '9', data: '16/04/2026', horaInicio: '10:30', horaFim: '11:00', status: 'agendada', dose: '1:100 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'pe2', patientId: '9', data: '09/04/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:100 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pe3', patientId: '9', data: '02/04/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:100 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pe4', patientId: '9', data: '26/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:100' },
    { id: 'pe5', patientId: '9', data: '19/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pe6', patientId: '9', data: '12/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pe7', patientId: '9', data: '05/03/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:1.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MARÇO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pe8', patientId: '9', data: '26/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,8ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Avançou para 1:1.000' },
    { id: 'pe9', patientId: '9', data: '19/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pe10', patientId: '9', data: '12/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'pe11', patientId: '9', data: '05/02/2026', horaInicio: '10:30', horaFim: '11:00', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Primeira aplicação' },

    // ══════ Lucas (id:10) — INATIVO — última dose 1:100 - 0,4ml ══════
    { id: 'l1', patientId: '10', data: '15/02/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:100 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,4ml', concentracaoExtrato: '1:100', efeitoColateral: 'Sim', necessidadeMedicacao: 'Sim', responsavel: 'Jaqueline', notaResponsavel: 'Paciente solicitou interrupção' },
    { id: 'l2', patientId: '10', data: '08/02/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:100 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'l3', patientId: '10', data: '01/02/2026', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:100 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'FEVEREIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:100', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },

    // ══════ Juliana (id:11) — INATIVA — manutenção 14 dias ══════
    { id: 'j1', patientId: '11', data: '20/01/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 2, dias: 14 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Última aplicação antes da inativação' },
    { id: 'j2', patientId: '11', data: '06/01/2026', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'j3', patientId: '11', data: '23/12/2025', horaInicio: '11:00', horaFim: '11:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'DEZEMBRO', ano: 2025, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },

    // ══════ Roberto (id:12) — INATIVO — indução 1:1.000 ══════
    { id: 'r1', patientId: '12', data: '10/01/2026', horaInicio: '15:00', horaFim: '15:30', status: 'realizada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,2ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Sim', necessidadeMedicacao: 'Sim', responsavel: 'Jaqueline', notaResponsavel: 'Reação moderada, tratamento suspenso a pedido médico' },
    { id: 'r2', patientId: '12', data: '03/01/2026', horaInicio: '15:00', horaFim: '15:30', status: 'realizada', dose: '1:1.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'JANEIRO', ano: 2026, volumeAplicado: '0,1ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },

    // ══════ Agendamentos extras para calendário (sem duplicatas) ══════
  ],
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
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
