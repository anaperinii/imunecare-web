import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const publicRoutes = ['/', '/login', '/register']
const authRoutes = ['/login', '/register']

function PageTransition({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cn("transition-opacity duration-300 ease-out", visible ? "opacity-100" : "opacity-0")}>
      {children}
    </div>
  )
}

function RootComponent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isAuthRoute = authRoutes.includes(location.pathname)

  if (isPublicRoute) {
    return (
      <div className="min-h-screen">
        <Header isAuthPage={isAuthRoute} />
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
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
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
