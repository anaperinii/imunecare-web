import { createFileRoute } from '@tanstack/react-router'
import { AppointmentsPage } from '@/features/appointment/appointments-page'

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
})
