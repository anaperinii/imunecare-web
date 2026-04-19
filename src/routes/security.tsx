import { createFileRoute } from '@tanstack/react-router'
import { SecurityPage } from '@/pages/security-page'

export const Route = createFileRoute('/security')({
  component: SecurityPage,
})
