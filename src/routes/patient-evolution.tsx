import { createFileRoute } from '@tanstack/react-router'
import { PatientEvolutionPage } from '@/pages/patient-evolution-page'

type SearchParams = {
  patientId?: string
}

export const Route = createFileRoute('/patient-evolution')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    patientId: search.patientId as string | undefined,
  }),
  component: PatientEvolutionPage,
})
