import { createFileRoute } from '@tanstack/react-router'
import { PatientChartPage } from '@/pages/patient-chart-page'

export const Route = createFileRoute('/patient/$patientId')({
  component: PatientChartPage,
})
