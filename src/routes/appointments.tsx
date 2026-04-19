import { createFileRoute } from '@tanstack/react-router'
import { AppointmentsPage } from '@/pages/appointments-page'

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
})
