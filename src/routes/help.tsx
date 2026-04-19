import { createFileRoute } from '@tanstack/react-router'
import { HelpPage } from '@/pages/help-page'
export const Route = createFileRoute('/help')({ component: HelpPage })
