import { createFileRoute } from '@tanstack/react-router'
import { TrialPage } from '@/pages/trial-page'

export const Route = createFileRoute('/trial')({
  component: TrialPage,
})
