import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useState, useEffect } from 'react'
import { useSidebarStore } from '@/store/sidebar-store'
import { cn } from '@/lib/utils'

const publicRoutes = ['/', '/login', '/register', '/trial', '/forgot-password']
const authRoutes = ['/login', '/register', '/forgot-password']
const noHeaderRoutes = ['/trial']

function PageTransition({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cn("transition-opacity duration-300 ease-out flex-1 flex flex-col min-h-0", visible ? "opacity-100" : "opacity-0")}>
      {children}
    </div>
  )
}

function RootComponent() {
  const { isCollapsed, toggle } = useSidebarStore()
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isAuthRoute = authRoutes.includes(location.pathname)
  const hideHeader = noHeaderRoutes.includes(location.pathname)

  if (isPublicRoute) {
    return (
      <div className="min-h-screen">
        {!hideHeader && <Header isAuthPage={isAuthRoute} />}
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={toggle}
      />
      <main className="flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300">
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
