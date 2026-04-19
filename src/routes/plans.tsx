import { createFileRoute } from '@tanstack/react-router'
import { PlansPage } from '@/pages/plans-page'
export const Route = createFileRoute('/plans')({ component: PlansPage })
