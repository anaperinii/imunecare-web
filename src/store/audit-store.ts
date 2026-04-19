import { create } from 'zustand'
import type { UserRole } from './user-store'

export type AuditAction = 'view_chart' | 'view_report' | 'export_lgpd' | 'edit_patient' | 'adjust_protocol' | 'inactivate' | 'reactivate'

export interface AccessLog {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  userRegistration: string
  patientId: string
  patientName: string
  action: AuditAction
  timestamp: string  // ISO string
}

interface AuditState {
  logs: AccessLog[]
  logAccess: (entry: Omit<AccessLog, 'id' | 'timestamp'>) => void
  getLogsForPatient: (patientId: string) => AccessLog[]
}

// Histórico sintético de acessos para os pacientes existentes — dados fictícios
// para a demo ter o que exibir na aba Portabilidade do relatório.
function buildSeedLogs(): AccessLog[] {
  const seeds: Array<Omit<AccessLog, 'id'>> = [
    // Dra. Karina acessa seus próprios pacientes regularmente
    { userId: 'medico_karina', userName: 'Dra. Karina Martins', userRole: 'medico', userRegistration: 'CRM/GO 24.815', patientId: '1', patientName: 'Bárbara Sofia Diniz', action: 'view_chart', timestamp: '2026-04-15T09:12:04.000Z' },
    { userId: 'medico_karina', userName: 'Dra. Karina Martins', userRole: 'medico', userRegistration: 'CRM/GO 24.815', patientId: '2', patientName: 'Camilla Martins', action: 'view_chart', timestamp: '2026-04-14T10:03:17.000Z' },
    { userId: 'medico_karina', userName: 'Dra. Karina Martins', userRole: 'medico', userRegistration: 'CRM/GO 24.815', patientId: '5', patientName: 'Heitor Guimarães de Assis', action: 'view_chart', timestamp: '2026-04-10T14:22:48.000Z' },
    // Dr. André nos seus
    { userId: 'medico_andre', userName: 'Dr. André Lima', userRole: 'medico', userRegistration: 'CRM/GO 28.104', patientId: '3', patientName: 'Ana Clara de Souza Martins', action: 'view_chart', timestamp: '2026-04-16T11:48:29.000Z' },
    { userId: 'medico_andre', userName: 'Dr. André Lima', userRole: 'medico', userRegistration: 'CRM/GO 28.104', patientId: '6', patientName: 'Caroline Ferreira de Abreu', action: 'view_chart', timestamp: '2026-04-12T15:34:06.000Z' },
    // Jaqueline (enfermeira) consulta para preparar aplicações
    { userId: 'enfermeiro', userName: 'Jaqueline Oliveira', userRole: 'enfermeiro', userRegistration: 'COREN/GO 318.942', patientId: '1', patientName: 'Bárbara Sofia Diniz', action: 'view_chart', timestamp: '2026-04-17T08:45:00.000Z' },
    { userId: 'enfermeiro', userName: 'Jaqueline Oliveira', userRole: 'enfermeiro', userRegistration: 'COREN/GO 318.942', patientId: '2', patientName: 'Camilla Martins', action: 'view_chart', timestamp: '2026-04-17T09:52:11.000Z' },
    { userId: 'enfermeiro', userName: 'Jaqueline Oliveira', userRole: 'enfermeiro', userRegistration: 'COREN/GO 318.942', patientId: '5', patientName: 'Heitor Guimarães de Assis', action: 'view_chart', timestamp: '2026-04-17T13:48:33.000Z' },
    // Rafael (técnico) também consulta antes de aplicar
    { userId: 'tecnico', userName: 'Rafael Mendes', userRole: 'tecnico', userRegistration: 'COREN/GO 415.327', patientId: '1', patientName: 'Bárbara Sofia Diniz', action: 'view_chart', timestamp: '2026-04-17T08:51:20.000Z' },
    { userId: 'tecnico', userName: 'Rafael Mendes', userRole: 'tecnico', userRegistration: 'COREN/GO 415.327', patientId: '4', patientName: 'Valentina Bittencourt Farias', action: 'view_chart', timestamp: '2026-04-17T11:12:04.000Z' },
    // Admin audita periodicamente
    { userId: 'admin', userName: 'Carla Souza', userRole: 'admin', userRegistration: 'Gestão clínica', patientId: '12', patientName: 'Roberto Alves Neto', action: 'view_chart', timestamp: '2026-04-05T16:20:08.000Z' },
  ]
  return seeds.map((s, i) => ({ id: `seed-${i + 1}`, ...s }))
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: buildSeedLogs(),
  logAccess: (entry) => set((s) => ({
    logs: [...s.logs, { ...entry, id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() }],
  })),
  getLogsForPatient: (patientId) => get().logs.filter((l) => l.patientId === patientId),
}))

export const ACTION_LABELS: Record<AuditAction, string> = {
  view_chart: 'Visualização do prontuário',
  view_report: 'Visualização de relatório',
  export_lgpd: 'Exportação LGPD',
  edit_patient: 'Edição de dados do paciente',
  adjust_protocol: 'Ajuste de protocolo',
  inactivate: 'Inativação da imunoterapia',
  reactivate: 'Reativação do paciente',
}
