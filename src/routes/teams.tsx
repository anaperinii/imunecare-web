import { createFileRoute } from '@tanstack/react-router'
import { TeamsPage } from '@/pages/teams-page'

export const Route = createFileRoute('/teams')({
  component: TeamsPage,
})
