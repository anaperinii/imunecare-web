import { createFileRoute } from '@tanstack/react-router'
import { AboutPage } from '@/features/settings/about-page'
export const Route = createFileRoute('/about')({ component: AboutPage })
