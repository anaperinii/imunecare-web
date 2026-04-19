import { createFileRoute } from '@tanstack/react-router'
import { AdvancedSettingsPage } from '@/features/settings/advanced-settings-page'
export const Route = createFileRoute('/advanced-settings')({ component: AdvancedSettingsPage })
