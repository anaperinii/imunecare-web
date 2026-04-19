import { createFileRoute } from '@tanstack/react-router'
import { TeamsPage } from '@/features/settings/teams-page'

export const Route = createFileRoute('/teams')({
  component: TeamsPage,
})
