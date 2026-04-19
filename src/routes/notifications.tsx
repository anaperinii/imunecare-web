import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notification/notifications-page'

export const Route = createFileRoute('/notifications')({
  component: NotificationsPage,
})
