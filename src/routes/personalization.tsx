import { createFileRoute } from '@tanstack/react-router'
import { PersonalizationPage } from '@/pages/personalization-page'
export const Route = createFileRoute('/personalization')({ component: PersonalizationPage })
