import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/immunotherapies')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Imunoterapias</h1>
      <p className="text-(--text-muted) mt-2">Em breve</p>
    </div>
  ),
})
