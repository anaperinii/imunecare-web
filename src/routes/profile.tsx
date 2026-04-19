import { createFileRoute } from '@tanstack/react-router'
import { ProfilePage } from '@/features/settings/profile-page'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})
