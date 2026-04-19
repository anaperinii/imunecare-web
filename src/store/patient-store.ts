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
  status: 'agendada' | 'realizada' | 'cancelada'
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
  ],
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}))
