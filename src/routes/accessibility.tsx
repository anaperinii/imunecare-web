import { createFileRoute } from '@tanstack/react-router'
import { AccessibilityPage } from '@/features/settings/accessibility-page'
export const Route = createFileRoute('/accessibility')({ component: AccessibilityPage })
