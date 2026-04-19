import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { cn } from '@/shared/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { usePatientStore } from '@/features/patient/patient-store'
import { useUserStore, useCan, PROFILES, ROLE_LABELS } from '@/features/user/user-store'
import { useNotificationsStore, type Notification } from '@/features/notification/notifications-store'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import imunecareLogo from '@/assets/imunecare-logo.png'
import {
  ChevronLeft,
  ChevronRight,
  Syringe,
  CalendarDays,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  X as XIcon,
  Check,
  UserCog,
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

const allMenuItems = [
  { title: 'Imunoterapias', icon: Syringe, path: '/immunotherapies', gate: null as null | 'view_dashboard' },
  { title: 'Agendamentos', icon: CalendarDays, path: '/appointments', gate: null as null | 'view_dashboard' },
  { title: 'Dashboard', icon: BarChart3, path: '/dashboard', gate: 'view_dashboard' as const },
  { title: 'Configurações', icon: Settings, path: '/settings', gate: null as null | 'view_dashboard' },
]

const typeConfig: Record<Notification['type'], { color: string; bg: string; label: string }> = {
  upcoming_application: { color: 'text-brand', bg: 'bg-teal-50', label: 'Aplicação' },
  missed_appointment: { color: 'text-red-600', bg: 'bg-red-50', label: 'Falta' },
  adverse_reaction: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Reação' },
  protocol_milestone: { color: 'text-violet-600', bg: 'bg-violet-50', label: 'Protocolo' },
  patient_inactivity: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Inatividade' },
  system_alert: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Sistema' },
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationsStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedPatient, setSelectedPatient } = usePatientStore()
  const { current: currentUser, setProfile } = useUserStore()
  const canViewDashboard = useCan('view_dashboard')

  useEffect(() => {
    if (selectedPatient && !location.pathname.startsWith('/patient/')) {
      setSelectedPatient(null)
    }
  }, [location.pathname, selectedPatient, setSelectedPatient])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && notificationButtonRef.current && !notificationsRef.current.contains(event.target as Node) && !notificationButtonRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && userButtonRef.current && !userMenuRef.current.contains(event.target as Node) && !userButtonRef.current.contains(event.target as Node)) {
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

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

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
        <img src={imunecareLogo} alt="ImuneCare" className="w-8 h-8 shrink-0 rounded-lg" />
        <span
          className={cn(
            "text-[0.95rem] font-extrabold tracking-[-0.5px] gradient-text transition-all duration-300 whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}
        >
          ImuneCare
        </span>
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-2.5 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-(--border-custom) text-(--text-muted) shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:shadow-[0_3px_10px_rgba(13,148,136,0.15)] hover:border-brand-light hover:text-brand transition-all duration-200 z-20"
        aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight size={12} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={12} strokeWidth={2.5} />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {allMenuItems.filter((item) => !item.gate || (item.gate === 'view_dashboard' && canViewDashboard)).map((item) => {
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
                  ? "bg-linear-to-r from-teal-500/10 to-cyan-500/10 text-brand"
                  : "text-(--text-muted) hover:bg-brand-50 hover:text-brand"
              )}
            >
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-linear-to-b from-brand to-teal-400" />
              )}
              <Icon size={18} className={cn("shrink-0 transition-colors duration-200", isActive ? "text-brand" : "group-hover:text-brand")} />
              {!isCollapsed && <span>{item.title}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-brand text-white text-[0.7rem] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md z-50">
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
              "group w-full transition-all duration-200 text-(--text-muted) hover:bg-brand-50 hover:text-brand",
              isCollapsed ? collapsedItemClass : expandedItemClass,
            )}
          >
            <div className="relative shrink-0">
              <Bell size={18} className="group-hover:text-brand transition-colors" />
              {unreadCount() > 0 && <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 text-[8px] font-bold text-white">{unreadCount()}</span>}
            </div>
            {!isCollapsed && <span>Notificações</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-brand text-white text-[0.7rem] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md z-50">
                Notificações
              </div>
            )}
          </button>

          {showNotifications && (
            <div ref={notificationsRef} className="fixed z-200 animate-in fade-in-0 slide-in-from-top-2 duration-200 w-80" style={{ top: (notificationButtonRef.current?.getBoundingClientRect().bottom ?? 200) + 6, left: isCollapsed ? (notificationButtonRef.current?.getBoundingClientRect().right ?? 64) + 8 : (notificationButtonRef.current?.getBoundingClientRect().left ?? 8) }}>
              <div className="bg-white border border-(--border-custom) rounded-xl shadow-[0_12px_40px_rgba(13,148,136,0.12)] overflow-hidden">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-(--border-custom)">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-(--text)">Notificações</h3>
                    {unreadCount() > 0 && <span className="text-[0.6rem] font-semibold text-white bg-red-500 rounded-full px-1.5 py-px">{unreadCount()}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unreadCount() > 0 && (
                      <button onClick={markAllAsRead} className="text-[0.6rem] font-medium text-brand hover:underline">
                        Marcar todas como lidas
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 transition-colors">
                      <XIcon size={12} />
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center text-xs text-(--text-muted) py-8">Nenhuma notificação</div>
                  ) : (
                    notifications.map((n) => {
                      const tc = typeConfig[n.type]
                      return (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={cn("px-3.5 py-2.5 border-b border-(--border-custom) last:border-0 cursor-pointer transition-colors hover:bg-gray-50", !n.read && "bg-teal-50/30")}
                        >
                          <div className="flex items-start gap-2.5">
                            {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />}
                            <div className={cn("flex-1 min-w-0", n.read && "ml-4")}>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn("text-[0.55rem] font-semibold px-1.5 py-px rounded-full", tc.bg, tc.color)}>{tc.label}</span>
                                <span className="text-[0.6rem] text-(--text-muted)">{formatDistanceToNow(n.timestamp, { locale: ptBR, addSuffix: true })}</span>
                              </div>
                              <div className="text-xs font-semibold text-(--text) truncate">{n.title}</div>
                              <div className="text-[0.65rem] text-(--text-muted) mt-0.5 leading-relaxed line-clamp-2">{n.message}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="border-t border-(--border-custom) px-3.5 py-2">
                  <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-[0.65rem] font-semibold text-brand hover:underline flex items-center justify-center gap-1 no-underline">
                    Ver todas as notificações
                    <ChevronRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {selectedPatient && (
        <div className="border-t border-(--border-custom) p-2">
          <Link
            to="/patient/$patientId"
            params={{ patientId: selectedPatient.id }}
            className={cn(
              "group relative no-underline transition-all duration-200",
              isCollapsed
                ? "flex items-center justify-center w-9 h-9 mx-auto rounded-lg"
                : "flex items-center gap-2.5 rounded-lg px-3 py-2 bg-brand/10 text-brand"
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-white text-[0.6rem] font-bold">
              {getInitials(selectedPatient.nome)}
            </div>
            {!isCollapsed && (
              <div className="flex flex-1 items-center justify-between min-w-0">
                <span className="text-xs font-semibold truncate">
                  {selectedPatient.nome.split(' ').slice(0, 2).join(' ')}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setSelectedPatient(null)
                    navigate({ to: '/immunotherapies' })
                  }}
                  className="ml-1.5 flex h-5 w-5 items-center justify-center rounded hover:bg-brand/20 transition-colors shrink-0"
                >
                  <XIcon size={12} />
                </button>
              </div>
            )}
            {isCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setSelectedPatient(null)
                  navigate({ to: '/immunotherapies' })
                }}
                className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors z-10"
              >
                <XIcon size={8} className="text-white" />
              </button>
            )}
          </Link>
        </div>
      )}

      {/* User profile */}
      <div className="relative border-t border-(--border-custom) p-2">
        <button
          ref={userButtonRef}
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={cn(
            "group w-full transition-all duration-200 text-(--text-muted) hover:bg-brand-50",
            isCollapsed ? "flex items-center justify-center w-9 h-9 mx-auto rounded-lg" : "flex items-center gap-2.5 rounded-lg px-3 py-2"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-[0.65rem] font-bold shadow-[0_2px_6px_rgba(20,184,166,0.3)]">
            {getInitials(currentUser.name)}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold text-(--text) whitespace-nowrap truncate">{currentUser.name}</span>
              <span className="text-[0.65rem] text-(--text-muted) whitespace-nowrap">{currentUser.title}</span>
            </div>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-brand text-white text-[0.7rem] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-md z-50">
              {currentUser.name}
            </div>
          )}
        </button>

        {showUserMenu && (
          <div ref={userMenuRef} className={cn("absolute z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-200", isCollapsed ? "left-full ml-2 bottom-2 w-64" : "left-0 right-0 bottom-full mb-1.5")}>
            <div className="bg-white border border-(--border-custom) rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-(--border-custom)">
                <div className="text-xs font-semibold text-(--text) truncate">{currentUser.name}</div>
                <div className="text-[0.65rem] text-(--text-muted)">{currentUser.title} · {currentUser.registration}</div>
              </div>
              <div className="px-3.5 py-2 border-b border-(--border-custom)">
                <div className="flex items-center gap-1.5 text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider mb-1.5">
                  <UserCog size={10} />
                  Trocar perfil (teste)
                </div>
                <div className="space-y-0.5">
                  {PROFILES.map((p) => {
                    const isCurrent = currentUser.id === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setProfile(p.id); setShowUserMenu(false) }}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-[0.7rem] transition-colors",
                          isCurrent ? "bg-teal-50 text-brand" : "text-(--text) hover:bg-gray-50"
                        )}
                      >
                        <div className="flex flex-col text-left min-w-0">
                          <span className="font-semibold truncate">{ROLE_LABELS[p.role]}</span>
                          <span className="text-[0.6rem] text-(--text-muted) truncate">{p.name}</span>
                        </div>
                        {isCurrent && <Check size={12} className="text-brand shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); navigate({ to: '/login' }) }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-(--text-muted) hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
