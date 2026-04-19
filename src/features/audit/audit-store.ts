import { create } from 'zustand'
import type { UserRole } from '@/features/user/user-store'

/**
 * RNE-021 — Auditoria na visualização do prontuário.
 * Log append-only: cada abertura do prontuário gera um registro imutável
 * com quem, quando e qual paciente. Usado para cumprir LGPD Art. 18, V
 * (portabilidade) e Art. 19 (direito de acesso) — o titular tem direito
 * de saber quem acessou seus dados.
 */
export type AuditAction = 'view_chart' | 'view_report' | 'export_lgpd' | 'edit_patient' | 'adjust_protocol' | 'inactivate' | 'reactivate' | 'apply_dose'

export interface AccessLog {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  userRegistration: string
  patientId: string
  patientName: string
  action: AuditAction
  /** Descrição concreta do que foi feito (ex: "Aplicou 1:100 - 0,4ml", "Editou telefone"). */
  description: string
  timestamp: string  // ISO string
}

interface AuditState {
  logs: AccessLog[]
  logAccess: (entry: Omit<AccessLog, 'id' | 'timestamp'>) => void
  getLogsForPatient: (patientId: string) => AccessLog[]
}

// Histórico sintético de acessos e operações para os pacientes existentes.
// Inclui visualizações + operações clínicas (ajustes de protocolo, inativações,
// reativações, edições) para compor a trilha completa exigida pela LGPD.
function buildSeedLogs(): AccessLog[] {
  const karina = { userId: 'medico_karina', userName: 'Dra. Karina Martins', userRole: 'medico' as const, userRegistration: 'CRM/GO 24.815' }
  const andre = { userId: 'medico_andre', userName: 'Dr. André Lima', userRole: 'medico' as const, userRegistration: 'CRM/GO 28.104' }
  const jaque = { userId: 'enfermeiro', userName: 'Jaqueline Oliveira', userRole: 'enfermeiro' as const, userRegistration: 'COREN/GO 318.942' }
  const rafael = { userId: 'tecnico', userName: 'Rafael Mendes', userRole: 'tecnico' as const, userRegistration: 'COREN/GO 415.327' }
  const carla = { userId: 'admin', userName: 'Carla Souza', userRole: 'admin' as const, userRegistration: 'Gestão clínica' }

  const seeds: Array<Omit<AccessLog, 'id'>> = [
    // ═════ Visualizações ═════
    { ...karina, patientId: '1', patientName: 'Bárbara Sofia Diniz', action: 'view_chart', description: 'Consultou o prontuário', timestamp: '2026-04-15T09:12:04.000Z' },
    { ...karina, patientId: '2', patientName: 'Camilla Martins', action: 'view_chart', description: 'Consultou o prontuário', timestamp: '2026-04-14T10:03:17.000Z' },
    { ...karina, patientId: '5', patientName: 'Heitor Guimarães de Assis', action: 'view_chart', description: 'Consultou o prontuário', timestamp: '2026-04-10T14:22:48.000Z' },
    { ...andre, patientId: '3', patientName: 'Ana Clara de Souza Martins', action: 'view_chart', description: 'Consultou o prontuário', timestamp: '2026-04-16T11:48:29.000Z' },
    { ...andre, patientId: '6', patientName: 'Caroline Ferreira de Abreu', action: 'view_chart', description: 'Consultou o prontuário', timestamp: '2026-04-12T15:34:06.000Z' },
    { ...jaque, patientId: '1', patientName: 'Bárbara Sofia Diniz', action: 'view_chart', description: 'Consultou o prontuário antes da aplicação', timestamp: '2026-04-17T08:45:00.000Z' },
    { ...jaque, patientId: '2', patientName: 'Camilla Martins', action: 'view_chart', description: 'Consultou o prontuário antes da aplicação', timestamp: '2026-04-17T09:52:11.000Z' },
    { ...carla, patientId: '12', patientName: 'Roberto Alves Neto', action: 'view_chart', description: 'Auditoria administrativa periódica', timestamp: '2026-04-05T16:20:08.000Z' },

    // ═════ Aplicações (enfermagem/técnico) ═════
    { ...jaque, patientId: '1', patientName: 'Bárbara Sofia Diniz', action: 'apply_dose', description: 'Aplicou 1:10.000 - 0,1ml (indução, ciclo 1 · intervalo 7 dias)', timestamp: '2026-04-11T09:18:00.000Z' },
    { ...jaque, patientId: '2', patientName: 'Camilla Martins', action: 'apply_dose', description: 'Aplicou 1:1.000 - 0,2ml (indução, ciclo 1 · intervalo 7 dias)', timestamp: '2026-04-11T10:12:00.000Z' },
    { ...rafael, patientId: '3', patientName: 'Ana Clara de Souza Martins', action: 'apply_dose', description: 'Aplicou 1:100 - 0,1ml (indução, ciclo 1 · intervalo 7 dias) — reação adversa leve registrada', timestamp: '2026-03-23T10:42:00.000Z' },
    { ...jaque, patientId: '3', patientName: 'Ana Clara de Souza Martins', action: 'apply_dose', description: 'Aplicou 1:100 - 0,4ml (indução, ciclo 1 · intervalo 7 dias)', timestamp: '2026-04-11T10:45:00.000Z' },
    { ...rafael, patientId: '4', patientName: 'Valentina Bittencourt Farias', action: 'apply_dose', description: 'Aplicou 1:10 - 0,4ml (indução, ciclo 1 · intervalo 7 dias)', timestamp: '2026-04-11T11:22:00.000Z' },
    { ...jaque, patientId: '5', patientName: 'Heitor Guimarães de Assis', action: 'apply_dose', description: 'Aplicou 1:10 - 0,5ml (manutenção, ciclo 1 · intervalo 14 dias)', timestamp: '2026-04-04T14:08:00.000Z' },
    { ...jaque, patientId: '6', patientName: 'Caroline Ferreira de Abreu', action: 'apply_dose', description: 'Aplicou 1:10 - 0,5ml (manutenção, ciclo 2 · intervalo 21 dias)', timestamp: '2026-03-28T15:40:00.000Z' },
    { ...rafael, patientId: '7', patientName: 'Marta Gabriela de Sousa', action: 'apply_dose', description: 'Aplicou 1:10 - 0,5ml (manutenção, ciclo 3 · intervalo 28 dias)', timestamp: '2026-03-21T08:12:00.000Z' },
    { ...jaque, patientId: '8', patientName: 'Patrício Gomes Cardoso', action: 'apply_dose', description: 'Aplicou 1:1.000 - 0,1ml (indução, ciclo 1 · intervalo 7 dias)', timestamp: '2026-04-11T09:10:00.000Z' },
    { ...rafael, patientId: '9', patientName: 'Pedro Luccas Pereira', action: 'apply_dose', description: 'Aplicou 1:100 - 0,2ml (indução, ciclo 1 · intervalo 7 dias)', timestamp: '2026-04-11T10:32:00.000Z' },

    // ═════ Operações clínicas (médico) ═════
    { ...andre, patientId: '3', patientName: 'Ana Clara de Souza Martins', action: 'adjust_protocol', description: 'Ajustou protocolo após reação adversa: redução de dose para 1:100 - 0,1ml', timestamp: '2026-03-23T14:35:12.000Z' },
    { ...karina, patientId: '8', patientName: 'Patrício Gomes Cardoso', action: 'edit_patient', description: 'Editou dados de contato (telefone atualizado)', timestamp: '2026-04-02T10:20:00.000Z' },
    { ...karina, patientId: '10', patientName: 'Lucas Ferreira Lima', action: 'inactivate', description: 'Inativou tratamento — motivo: solicitação do paciente (interrupção por motivos pessoais)', timestamp: '2026-02-15T09:22:14.000Z' },
    { ...karina, patientId: '11', patientName: 'Juliana Mendes Costa', action: 'inactivate', description: 'Inativou tratamento — motivo: gestação confirmada, retomada programada para pós-parto', timestamp: '2026-01-22T11:35:42.000Z' },
    { ...andre, patientId: '12', patientName: 'Roberto Alves Neto', action: 'inactivate', description: 'Inativou tratamento — motivo: reação adversa moderada (urticária generalizada + corticoide)', timestamp: '2026-01-10T15:48:05.000Z' },
    { ...karina, patientId: '5', patientName: 'Heitor Guimarães de Assis', action: 'adjust_protocol', description: 'Progrediu intervalo de manutenção: 7 dias → 14 dias (meta estabilizada)', timestamp: '2026-03-18T14:10:33.000Z' },
    { ...andre, patientId: '6', patientName: 'Caroline Ferreira de Abreu', action: 'adjust_protocol', description: 'Progrediu intervalo de manutenção: 14 dias → 21 dias', timestamp: '2026-03-04T15:42:10.000Z' },
    { ...andre, patientId: '7', patientName: 'Marta Gabriela de Sousa', action: 'adjust_protocol', description: 'Progrediu intervalo de manutenção: 21 dias → 28 dias', timestamp: '2026-02-20T08:18:40.000Z' },
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
  apply_dose: 'Aplicação de dose',
  view_chart: 'Visualização do prontuário',
  view_report: 'Visualização de relatório',
  export_lgpd: 'Exportação LGPD',
  edit_patient: 'Edição de dados do paciente',
  adjust_protocol: 'Ajuste de protocolo',
  inactivate: 'Inativação da imunoterapia',
  reactivate: 'Reativação do paciente',
}
