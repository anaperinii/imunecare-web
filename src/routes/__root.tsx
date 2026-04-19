import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const publicRoutes = ['/', '/login', '/register']
const authRoutes = ['/login', '/register']

function RootComponent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isAuthRoute = authRoutes.includes(location.pathname)

  if (isPublicRoute) {
    return (
      <div className="min-h-screen">
        <Header isAuthPage={isAuthRoute} />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
        )}
      >
        <Outlet />
      </main>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
