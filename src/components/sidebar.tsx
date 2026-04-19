import { Link, useLocation, useNavigate } from '@tanstack/react-router'
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
  LogOut,
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
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

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
      if (
        userMenuRef.current &&
        userButtonRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications, showUserMenu])

  const collapsedItemClass = "flex items-center justify-center w-9 h-9 mx-auto rounded-lg"
  const expandedItemClass = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8rem] font-medium"

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-(--border-custom) bg-white transition-all duration-300 ease-in-out h-full",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-(--border-custom) px-3 gap-2.5 transition-all duration-300",
          isCollapsed && "justify-center px-0"
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-cyan-500 shadow-[0_2px_8px_rgba(20,184,166,0.3)] shrink-0">
          <Syringe size={15} className="text-white" />
        </div>
        <span
          className={cn(
            "text-[0.95rem] font-extrabold tracking-[-0.5px] gradient-text transition-all duration-300 whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}
        >
          ImuneCare
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative no-underline transition-all duration-200",
                isCollapsed ? collapsedItemClass : expandedItemClass,
                isActive
                  ? "bg-linear-to-r from-teal-500/10 to-cyan-500/10 text-teal-600"
                  : "text-(--text-muted) hover:bg-teal-50 hover:text-teal-600"
              )}
            >
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-linear-to-b from-teal-500 to-cyan-500" />
              )}
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors duration-200",
                  isActive ? "text-teal-600" : "group-hover:text-teal-500"
                )}
              />
              {!isCollapsed && <span>{item.title}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-teal-600 text-white text-[0.7rem] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md z-50">
                  {item.title}
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
              "group w-full transition-all duration-200 text-(--text-muted) hover:bg-teal-50 hover:text-teal-600",
              isCollapsed ? collapsedItemClass : expandedItemClass,
            )}
          >
            <div className="relative shrink-0">
              <Bell size={18} className="group-hover:text-teal-500 transition-colors" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 text-[8px] font-bold text-white">
                2
              </span>
            </div>
            {!isCollapsed && <span>Notificações</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-teal-600 text-white text-[0.7rem] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md z-50">
                Notificações
              </div>
            )}
          </button>

          {showNotifications && (
            <div
              ref={notificationsRef}
              className={cn(
                "absolute z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200",
                isCollapsed
                  ? "left-full ml-2.5 top-0 w-72"
                  : "left-0 right-0 top-full mt-1.5"
              )}
            >
              <div className="bg-white border border-(--border-custom) rounded-xl shadow-[0_12px_40px_rgba(13,148,136,0.12)] overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-(--border-custom) bg-teal-50/50">
                  <h3 className="text-xs font-bold text-(--text)">Notificações</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="flex items-center justify-center w-5 h-5 rounded hover:bg-teal-100 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-3.5 py-2.5 border-b border-(--border-custom) last:border-0 hover:bg-teal-50/50 cursor-pointer transition-colors"
                    >
                      <div className="font-semibold text-xs text-(--text)">
                        {notification.title}
                      </div>
                      <div className="text-[0.7rem] text-(--text-muted) mt-0.5 leading-relaxed">
                        {notification.message}
                      </div>
                      <div className="text-[0.65rem] text-teal-500 font-medium mt-1">
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
      <div className="relative border-t border-(--border-custom) p-2">
        <button
          ref={userButtonRef}
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={cn(
            "group w-full transition-all duration-200 text-(--text-muted) hover:bg-teal-50",
            isCollapsed
              ? "flex items-center justify-center w-9 h-9 mx-auto rounded-lg"
              : "flex items-center gap-2.5 rounded-lg px-3 py-2"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-teal-400 to-cyan-500 text-white text-[0.65rem] font-bold shadow-[0_2px_6px_rgba(20,184,166,0.3)]">
            <User size={14} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-(--text) whitespace-nowrap">Dr. Usuário</span>
              <span className="text-[0.65rem] text-(--text-muted) whitespace-nowrap">Administrador</span>
            </div>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-teal-600 text-white text-[0.7rem] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md z-50">
              Dr. Usuário
            </div>
          )}
        </button>

        {showUserMenu && (
          <div
            ref={userMenuRef}
            className={cn(
              "absolute z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
              isCollapsed
                ? "left-full ml-2 bottom-2 w-36"
                : "left-0 right-0 bottom-full mb-1.5"
            )}
          >
            <div className="bg-white border border-(--border-custom) rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  navigate({ to: '/login' })
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-(--text-muted) hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-2.5 top-16 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-(--border-custom) text-(--text-muted) shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_10px_rgba(13,148,136,0.15)] hover:border-teal-300 hover:text-teal-600 transition-all duration-200 z-10"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={12} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={12} strokeWidth={2.5} />
        )}
      </button>
    </aside>
  )
}
