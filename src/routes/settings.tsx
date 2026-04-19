import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Configurações</h1>
      <p className="text-(--text-muted) mt-2">Em breve</p>
    </div>
  ),
})
