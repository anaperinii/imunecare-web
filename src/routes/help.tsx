import { createFileRoute } from '@tanstack/react-router'
import { HelpPage } from '@/features/settings/help-page'
export const Route = createFileRoute('/help')({ component: HelpPage })
