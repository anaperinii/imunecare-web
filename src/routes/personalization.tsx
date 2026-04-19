import { createFileRoute } from '@tanstack/react-router'
import { PersonalizationPage } from '@/features/settings/personalization-page'
export const Route = createFileRoute('/personalization')({ component: PersonalizationPage })
