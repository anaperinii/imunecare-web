import { createFileRoute } from '@tanstack/react-router'
import { ImmunotherapiesPage } from '@/features/immunotherapy/immunotherapies-page'

type ImmunotherapiesSearch = {
  success?: boolean
  patientName?: string
  patientId?: string
}

export const Route = createFileRoute('/immunotherapies')({
  component: ImmunotherapiesPage,
  validateSearch: (search: Record<string, unknown>): ImmunotherapiesSearch => ({
    success: search.success === true || search.success === 'true' ? true : undefined,
    patientName: typeof search.patientName === 'string' ? search.patientName : undefined,
    patientId: typeof search.patientId === 'string' ? search.patientId : undefined,
  }),
})
