import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'appointment' | 'alert' | 'system' | 'protocol'
  title: string
  message: string
  time: string
  read: boolean
  patientId?: string
}

interface NotificationsState {
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  unreadCount: () => number
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [
    { id: 'n1', type: 'appointment', title: 'Aplicação agendada', message: 'Bárbara Sofia Diniz tem aplicação agendada para hoje às 08:30', time: 'agora', read: false, patientId: '1' },
    { id: 'n2', type: 'alert', title: 'Reação adversa registrada', message: 'Valentina Bittencourt apresentou eritema leve na última aplicação', time: 'há 1 hora', read: false, patientId: '4' },
    { id: 'n3', type: 'protocol', title: 'Progressão de dose', message: 'Camilla Martins avançou para concentração 1:1.000 — 0,4ml', time: 'há 2 horas', read: false, patientId: '2' },
    { id: 'n4', type: 'system', title: 'Ausência registrada', message: 'Pedro Luccas Pereira não compareceu à aplicação de 09/04', time: 'há 3 horas', read: false, patientId: '9' },
    { id: 'n5', type: 'appointment', title: 'Lembrete de ciclo', message: 'Heitor Guimarães de Assis — próxima aplicação em 2 dias (14d)', time: 'há 5 horas', read: true, patientId: '5' },
    { id: 'n6', type: 'protocol', title: 'Meta atingida', message: 'Caroline Ferreira atingiu dose de manutenção 1:10 — 0,5ml', time: 'ontem', read: true, patientId: '6' },
    { id: 'n7', type: 'system', title: 'Backup concluído', message: 'Backup automático dos dados realizado com sucesso', time: 'ontem', read: true },
  ],
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
