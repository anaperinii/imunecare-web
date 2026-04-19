import { create } from 'zustand'

export interface Patient {
  id: string
  nome: string
  dataNascimento: string
  idade: number
  telefone: string
  peso: string
  cpf: string
  medicoResponsavel: string
  status: 'ativo' | 'inativo' | 'suspenso'
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
}

export const usePatientStore = create<PatientState>((set) => ({
  selectedPatient: null,
  applications: [
    // Bárbara (id:1) — Indução 7 dias
    { id: 'p1-1', patientId: '1', data: '21/05/2025', horaInicio: '09:00', horaFim: '09:30', status: 'agendada', dose: '1:10.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MAIO', ano: 2025 },
    { id: 'p1-2', patientId: '1', data: '14/05/2025', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MAIO', ano: 2025, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'p1-3', patientId: '1', data: '07/05/2025', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'MAIO', ano: 2025, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    { id: 'p1-4', patientId: '1', data: '30/04/2025', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2025, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Sim', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: 'Leve eritema no local' },
    { id: 'p1-5', patientId: '1', data: '23/04/2025', horaInicio: '09:00', horaFim: '09:30', status: 'realizada', dose: '1:10.000 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2025, volumeAplicado: '0,1ml', concentracaoExtrato: '1:10.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    // Camilla (id:2)
    { id: 'p2-1', patientId: '2', data: '20/05/2025', horaInicio: '10:00', horaFim: '10:30', status: 'agendada', dose: '1:1.000 - 0,3ml', ciclo: { numero: 1, dias: 7 }, mes: 'MAIO', ano: 2025 },
    { id: 'p2-2', patientId: '2', data: '13/05/2025', horaInicio: '10:00', horaFim: '10:30', status: 'realizada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'MAIO', ano: 2025, volumeAplicado: '0,2ml', concentracaoExtrato: '1:1.000', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    // Heitor (id:5) — Manutenção 14 dias
    { id: 'p5-1', patientId: '5', data: '28/05/2025', horaInicio: '14:00', horaFim: '14:30', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'MAIO', ano: 2025 },
    { id: 'p5-2', patientId: '5', data: '14/05/2025', horaInicio: '14:00', horaFim: '14:30', status: 'realizada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'MAIO', ano: 2025, volumeAplicado: '0,5ml', concentracaoExtrato: '1:10', efeitoColateral: 'Não', necessidadeMedicacao: 'Não', responsavel: 'Jaqueline', notaResponsavel: '-' },
    // === Agendamentos desta semana (06-12 Abril 2026) ===
    { id: 'w1', patientId: '1', data: '06/04/2026', horaInicio: '08:30', horaFim: '09:00', status: 'agendada', dose: '1:10.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'subcutânea' },
    { id: 'w2', patientId: '3', data: '06/04/2026', horaInicio: '10:00', horaFim: '10:30', status: 'agendada', dose: '1:100 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'sublingual' },
    { id: 'w3', patientId: '2', data: '07/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'agendada', dose: '1:1.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'subcutânea' },
    { id: 'w4', patientId: '4', data: '07/04/2026', horaInicio: '11:00', horaFim: '11:30', status: 'ausente', dose: '1:10 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'subcutânea' },
    { id: 'w5', patientId: '5', data: '08/04/2026', horaInicio: '14:00', horaFim: '14:30', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'ABRIL', ano: 2026, modalidade: 'subcutânea' },
    { id: 'w6', patientId: '6', data: '08/04/2026', horaInicio: '15:30', horaFim: '16:00', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 2, dias: 21 }, mes: 'ABRIL', ano: 2026, modalidade: 'sublingual' },
    { id: 'w7', patientId: '8', data: '09/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'agendada', dose: '1:1.000 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'sublingual' },
    { id: 'w8', patientId: '9', data: '09/04/2026', horaInicio: '10:30', horaFim: '11:00', status: 'ausente', dose: '1:100 - 0,2ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'subcutânea' },
    { id: 'w9', patientId: '7', data: '10/04/2026', horaInicio: '08:00', horaFim: '08:30', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 3, dias: 28 }, mes: 'ABRIL', ano: 2026, modalidade: 'subcutânea' },
    { id: 'w10', patientId: '1', data: '10/04/2026', horaInicio: '14:00', horaFim: '14:30', status: 'agendada', dose: '1:10.000 - 0,4ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'sublingual' },
    { id: 'w11', patientId: '3', data: '11/04/2026', horaInicio: '09:30', horaFim: '10:00', status: 'agendada', dose: '1:100 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026, modalidade: 'subcutânea' },
    // Próxima semana
    { id: 'w12', patientId: '2', data: '13/04/2026', horaInicio: '09:00', horaFim: '09:30', status: 'agendada', dose: '1:1.000 - 0,8ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'w13', patientId: '4', data: '14/04/2026', horaInicio: '10:00', horaFim: '10:30', status: 'agendada', dose: '1:10 - 0,1ml', ciclo: { numero: 1, dias: 7 }, mes: 'ABRIL', ano: 2026 },
    { id: 'w14', patientId: '5', data: '22/04/2026', horaInicio: '14:00', horaFim: '14:30', status: 'agendada', dose: '1:10 - 0,5ml', ciclo: { numero: 1, dias: 14 }, mes: 'ABRIL', ano: 2026 },
  ],
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}))
