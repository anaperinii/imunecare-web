import { createFileRoute } from '@tanstack/react-router'
import { TrialPage } from '@/features/auth/trial-page'

export const Route = createFileRoute('/trial')({
  component: TrialPage,
})
