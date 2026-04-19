import { createFileRoute } from '@tanstack/react-router'
import { AddImmunotherapyPage } from '@/pages/add-immunotherapy-page'

export const Route = createFileRoute('/add-immunotherapy')({
  component: AddImmunotherapyPage,
})
