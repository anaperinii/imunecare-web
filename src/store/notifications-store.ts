import { create } from 'zustand'

export type NotificationType = 'upcoming_application' | 'missed_appointment' | 'adverse_reaction' | 'protocol_milestone' | 'patient_inactivity' | 'system_alert'
export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low'
export type NotificationCategory = 'clinica' | 'agendamento' | 'sistema'

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  details?: string
  timestamp: Date
  read: boolean
  patientId?: string
  actionUrl?: string
  actionLabel?: string
}

const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  upcoming_application: 'agendamento',
  missed_appointment: 'agendamento',
  adverse_reaction: 'clinica',
  protocol_milestone: 'clinica',
  patient_inactivity: 'clinica',
  system_alert: 'sistema',
}

const now = Date.now()
const h = (hours: number) => new Date(now - hours * 60 * 60 * 1000)
const d = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000)

interface NotificationsState {
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAsUnread: (id: string) => void
  markAllAsRead: () => void
  markSelectedAsRead: (ids: string[]) => void
  markSelectedAsUnread: (ids: string[]) => void
  unreadCount: () => number
}

export { TYPE_TO_CATEGORY }

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [
    // Critical
    { id: 'n1', type: 'adverse_reaction', category: 'clinica', priority: 'critical', title: 'Reação adversa grave registrada', message: 'Valentina Bittencourt apresentou urticária generalizada após aplicação de 1:100 — 0,4ml. Necessidade de medicação registrada.', details: 'A paciente apresentou urticária generalizada 20 minutos após a aplicação. Foi administrado anti-histamínico e a paciente permaneceu em observação por 1 hora. Recomenda-se reavaliar o protocolo antes da próxima dose.', timestamp: h(0.5), read: false, patientId: '4', actionUrl: '/patient/4', actionLabel: 'Ver prontuário' },
    { id: 'n2', type: 'adverse_reaction', category: 'clinica', priority: 'critical', title: 'Reação adversa com medicação', message: 'Ana Clara de Souza Martins relatou edema local persistente após aplicação sublingual.', details: 'Edema sublingual relatado pela paciente via contato telefônico 3 horas após a aplicação. Orientada a suspender a dose seguinte e retornar para avaliação presencial.', timestamp: h(3), read: false, patientId: '3', actionUrl: '/patient/3', actionLabel: 'Ver prontuário' },

    // High
    { id: 'n3', type: 'missed_appointment', category: 'agendamento', priority: 'high', title: 'Paciente não compareceu', message: 'Pedro Luccas Pereira não compareceu à 3ª aplicação consecutiva agendada para hoje às 09:00.', details: 'O paciente acumula 3 faltas consecutivas. De acordo com o protocolo SCIT, a ausência prolongada pode exigir reinício da fase de indução. Recomenda-se contato via WhatsApp para verificar situação.', timestamp: h(1), read: false, patientId: '9', actionUrl: '/patient/9', actionLabel: 'Ver prontuário' },
    { id: 'n4', type: 'patient_inactivity', category: 'clinica', priority: 'high', title: 'Paciente sem retorno há 45 dias', message: 'Heitor Guimarães de Assis não realiza aplicação há 45 dias. O intervalo previsto era de 14 dias.', details: 'Última aplicação realizada em 01/03/2026. O protocolo atual prevê intervalo de 14 dias entre doses. A ausência de mais de 3 intervalos pode comprometer a eficácia do tratamento.', timestamp: h(4), read: false, patientId: '5', actionUrl: '/patient/5', actionLabel: 'Ver prontuário' },
    { id: 'n5', type: 'missed_appointment', category: 'agendamento', priority: 'high', title: 'Ausência não justificada', message: 'Patrício Gomes Cardoso faltou à aplicação sublingual agendada para ontem.', details: 'Tentativa de contato via telefone não atendida. Segunda falta no mês corrente.', timestamp: h(18), read: false, patientId: '8', actionUrl: '/patient/8', actionLabel: 'Ver prontuário' },

    // Medium
    { id: 'n6', type: 'upcoming_application', category: 'agendamento', priority: 'medium', title: 'Aplicação agendada para amanhã', message: 'Bárbara Sofia Diniz tem aplicação agendada para amanhã às 08:30 — 1:10.000, 0,2ml.', details: 'Dose prevista: 1:10.000 — 0,2ml (2ª dose da fase de indução). Intervalo de 7 dias desde a última aplicação. Paciente sem reações adversas anteriores.', timestamp: h(2), read: false, patientId: '1', actionUrl: '/patient/1', actionLabel: 'Ver prontuário' },
    { id: 'n7', type: 'protocol_milestone', category: 'clinica', priority: 'medium', title: 'Progressão de concentração', message: 'Camilla Martins avançou para concentração 1:1.000 — 0,4ml com sucesso.', details: 'A paciente completou as 4 doses da concentração 1:10.000 sem intercorrências. Progride para 1:1.000 conforme protocolo SCIT. Próxima aplicação em 7 dias.', timestamp: h(6), read: false, patientId: '2', actionUrl: '/patient/2', actionLabel: 'Ver prontuário' },
    { id: 'n8', type: 'upcoming_application', category: 'agendamento', priority: 'medium', title: 'Aplicação em 2 dias', message: 'Marta Gabriela de Sousa — próxima aplicação em 2 dias (intervalo de 28 dias).', timestamp: h(8), read: true, patientId: '7' },
    { id: 'n9', type: 'protocol_milestone', category: 'clinica', priority: 'medium', title: 'Dose de manutenção atingida', message: 'Caroline Ferreira de Abreu atingiu a dose de manutenção: 1:10 — 0,5ml.', details: 'A paciente completou toda a fase de indução e atinge agora a fase de manutenção. Os intervalos serão progressivamente ampliados de 14 para 21 e 28 dias conforme resposta clínica.', timestamp: d(1), read: true, patientId: '6', actionUrl: '/patient/6', actionLabel: 'Ver prontuário' },
    { id: 'n10', type: 'upcoming_application', category: 'agendamento', priority: 'medium', title: 'Lembrete de ciclo', message: 'Heitor Guimarães de Assis — próxima aplicação prevista para 16/04 (intervalo de 14 dias).', timestamp: d(1), read: true, patientId: '5' },

    // Low
    { id: 'n11', type: 'system_alert', category: 'sistema', priority: 'low', title: 'Backup automático concluído', message: 'Backup diário dos dados clínicos realizado com sucesso às 03:00.', timestamp: d(0.5), read: true },
    { id: 'n12', type: 'system_alert', category: 'sistema', priority: 'low', title: 'Sincronização Google Agenda', message: '12 eventos sincronizados com sucesso com o Google Agenda.', timestamp: d(0.5), read: true },
    { id: 'n13', type: 'system_alert', category: 'sistema', priority: 'low', title: 'Atualização do sistema', message: 'ImuneCare foi atualizado para a versão 2.1.0. Novas funcionalidades disponíveis.', details: 'Novidades: central de notificações, integração com Google Agenda, exportação com LGPD, calendário no prontuário do paciente.', timestamp: d(2), read: true },
    { id: 'n14', type: 'patient_inactivity', category: 'clinica', priority: 'low', title: 'Paciente com protocolo pausado', message: 'Lucas Ferreira Lima — protocolo inativo há 60 dias por solicitação do paciente.', details: 'O paciente solicitou pausa no tratamento por motivos pessoais. Retorno previsto para reavaliação em 3 meses.', timestamp: d(3), read: true, patientId: '10' },
    { id: 'n15', type: 'system_alert', category: 'sistema', priority: 'low', title: 'Relatório mensal gerado', message: 'O relatório clínico mensal de março/2026 está disponível para download.', timestamp: d(5), read: true },
  ],
  markAsRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAsUnread: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: false } : n) })),
  markAllAsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  markSelectedAsRead: (ids) => set((s) => ({ notifications: s.notifications.map((n) => ids.includes(n.id) ? { ...n, read: true } : n) })),
  markSelectedAsUnread: (ids) => set((s) => ({ notifications: s.notifications.map((n) => ids.includes(n.id) ? { ...n, read: false } : n) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
