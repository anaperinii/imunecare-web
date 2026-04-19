import { createFileRoute } from '@tanstack/react-router'
import { SecurityPage } from '@/features/settings/security-page'

export const Route = createFileRoute('/security')({
  component: SecurityPage,
})
