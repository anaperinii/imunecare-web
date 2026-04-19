import { createFileRoute } from '@tanstack/react-router'
import { PlansPage } from '@/features/settings/plans-page'
export const Route = createFileRoute('/plans')({ component: PlansPage })
