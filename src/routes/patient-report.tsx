import { createFileRoute } from '@tanstack/react-router'
import { PatientReportPage } from '@/pages/patient-report-page'

type SearchParams = {
  patientId?: string
}

export const Route = createFileRoute('/patient-report')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    patientId: search.patientId as string | undefined,
  }),
  component: PatientReportPage,
})
