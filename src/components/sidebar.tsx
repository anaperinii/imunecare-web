import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Syringe,
  CalendarDays,
  BarChart3,
  Settings,
  Bell,
  User,
  X,
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { title: 'Imunoterapias', icon: Syringe, path: '/immunotherapies' },
  { title: 'Agendamentos', icon: CalendarDays, path: '/appointments' },
  { title: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { title: 'Configurações', icon: Settings, path: '/settings' },
]

const notifications = [
  {
    id: 1,
    title: 'Nova aplicação agendada',
    message: 'Bárbara Sofia Diniz tem uma aplicação agendada para amanhã',
    time: 'há 2 horas',
  },
  {
    id: 2,
    title: 'Lembrete de ciclo',
    message: 'Camilla Martins está no ciclo 2, próximo intervalo em 3 dias',
    time: 'há 5 horas',
  },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        notificationButtonRef.current &&
        !notificationsRef.current.contains(event.target as Node) &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-(--border-custom) bg-white transition-all duration-300 ease-in-out h-full",
        isCollapsed ? "w-18" : "w-65"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-17 border-b border-(--border-custom) px-4 gap-3 transition-all duration-300",
          isCollapsed && "justify-center px-0"
        )}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-teal-500 to-cyan-500 shadow-[0_2px_8px_rgba(20,184,166,0.3)] shrink-0">
          <Syringe size={18} className="text-white" />
        </div>
        <span
          className={cn(
            "text-lg font-extrabold tracking-[-0.5px] gradient-text transition-all duration-300 whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}
        >
          ImuneCare
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 no-underline relative overflow-hidden",
                isCollapsed && "justify-center px-0 mx-auto w-11 h-11",
                isActive
                  ? "bg-linear-to-r from-teal-500/10 to-cyan-500/10 text-teal-600"
                  : "text-(--text-muted) hover:bg-teal-50 hover:text-teal-600"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-linear-to-b from-teal-500 to-cyan-500" />
              )}
              <Icon
                size={20}
                className={cn(
                  "shrink-0 transition-all duration-200",
                  isActive ? "text-teal-600" : "group-hover:text-teal-500"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-300 whitespace-nowrap",
                  isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                )}
              >
                {item.title}
              </span>
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-(--text) text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
                  {item.title}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-(--text) rotate-45" />
                </div>
              )}
            </Link>
          )
        })}

        {/* Notifications */}
        <div className="relative">
          <button
            ref={notificationButtonRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--text-muted) transition-all duration-200 hover:bg-teal-50 hover:text-teal-600",
              isCollapsed && "justify-center px-0 mx-auto w-11 h-11"
            )}
          >
            <div className="relative shrink-0">
              <Bell size={20} className="group-hover:text-teal-500 transition-colors" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 text-[9px] font-bold text-white shadow-[0_2px_4px_rgba(239,68,68,0.4)]">
                2
              </span>
            </div>
            <span
              className={cn(
                "transition-all duration-300 whitespace-nowrap",
                isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
              )}
            >
              Notificações
            </span>
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-(--text) text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
                Notificações
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-(--text) rotate-45" />
              </div>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div
              ref={notificationsRef}
              className={cn(
                "absolute z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200",
                isCollapsed
                  ? "left-full ml-3 top-0 w-80"
                  : "left-0 right-0 top-full mt-2"
              )}
            >
              <div className="bg-white border border-(--border-custom) rounded-2xl shadow-[0_16px_48px_rgba(13,148,136,0.12)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-(--border-custom) bg-teal-50/50">
                  <h3 className="text-sm font-bold text-(--text)">Notificações</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 border-b border-(--border-custom) last:border-0 hover:bg-teal-50/50 cursor-pointer transition-colors"
                    >
                      <div className="font-semibold text-sm text-(--text)">
                        {notification.title}
                      </div>
                      <div className="text-xs text-(--text-muted) mt-1 leading-relaxed">
                        {notification.message}
                      </div>
                      <div className="text-[10px] text-teal-500 font-medium mt-2">
                        {notification.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-(--border-custom) p-3">
        <button
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-(--text-muted) hover:bg-teal-50 transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-cyan-500 text-white text-xs font-bold shadow-[0_2px_8px_rgba(20,184,166,0.3)]">
            <User size={16} />
          </div>
          <div
            className={cn(
              "flex flex-col text-left transition-all duration-300",
              isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            )}
          >
            <span className="text-sm font-semibold text-(--text) whitespace-nowrap">Dr. Usuário</span>
            <span className="text-xs text-(--text-muted) whitespace-nowrap">Administrador</span>
          </div>
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-(--text) text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
              Dr. Usuário
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-(--text) rotate-45" />
            </div>
          )}
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-19 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-(--border-custom) text-(--text-muted) shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(13,148,136,0.15)] hover:border-teal-300 hover:text-teal-600 transition-all duration-200 z-10"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={14} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={14} strokeWidth={2.5} />
        )}
      </button>
    </aside>
  )
}
