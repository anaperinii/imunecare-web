import { createFileRoute } from '@tanstack/react-router'
import { PatientChartPage } from '@/features/patient/patient-chart-page'

export const Route = createFileRoute('/patient/$patientId')({
  component: PatientChartPage,
})
