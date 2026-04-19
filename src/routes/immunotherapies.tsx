import { createFileRoute } from '@tanstack/react-router'
import { ImmunotherapiesPage } from '@/pages/immunotherapies-page'

export const Route = createFileRoute('/immunotherapies')({
  component: ImmunotherapiesPage,
})
