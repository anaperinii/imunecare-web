import { createFileRoute } from '@tanstack/react-router'
import { AdvancedSettingsPage } from '@/pages/advanced-settings-page'
export const Route = createFileRoute('/advanced-settings')({ component: AdvancedSettingsPage })
