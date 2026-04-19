import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useNotificationsStore, type Notification, type NotificationCategory } from '@/features/notification/notifications-store'
import { BellOff, Mail, MailOpen, ChevronDown, ChevronRight, CheckCheck, ChevronUp } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { formatDistanceToNow, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const typeConfig: Record<Notification['type'], { color: string; bg: string; label: string }> = {
  upcoming_application: { color: 'text-brand', bg: 'bg-teal-50', label: 'Aplicação próxima' },
  missed_appointment: { color: 'text-red-600', bg: 'bg-red-50', label: 'Falta' },
  adverse_reaction: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Reação adversa' },
  protocol_milestone: { color: 'text-violet-600', bg: 'bg-violet-50', label: 'Protocolo' },
  patient_inactivity: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Inatividade' },
  system_alert: { color: 'text-gray-500', bg: 'bg-gray-100', label: 'Sistema' },
}

const tabs: { key: 'todas' | NotificationCategory; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'clinica', label: 'Clínicas' },
  { key: 'agendamento', label: 'Agendamentos' },
  { key: 'sistema', label: 'Sistema' },
]

export function NotificationsPage() {
  const { notifications, markAsRead, markAsUnread, markAllAsRead, markSelectedAsRead, markSelectedAsUnread, unreadCount } = useNotificationsStore()
  const [activeTab, setActiveTab] = useState<'todas' | NotificationCategory>('todas')
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return notifications
      .filter((n) => activeTab === 'todas' || n.category === activeTab)
      .filter((n) => readFilter === 'all' || (readFilter === 'unread' ? !n.read : n.read))
      .filter((n) => {
        if (dateFrom && isBefore(n.timestamp, startOfDay(new Date(dateFrom + 'T00:00')))) return false
        if (dateTo && isAfter(n.timestamp, endOfDay(new Date(dateTo + 'T23:59')))) return false
        return true
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [notifications, activeTab, readFilter, dateFrom, dateTo])

  const tabCounts = useMemo(() => {
    const counts = { todas: 0, clinica: 0, agendamento: 0, sistema: 0 }
    notifications.filter((n) => !n.read).forEach((n) => {
      counts.todas++
      counts[n.category]++
    })
    return counts
  }, [notifications])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map((n) => n.id)))
  }

  const handleBatchRead = () => { markSelectedAsRead([...selectedIds]); setSelectedIds(new Set()) }
  const handleBatchUnread = () => { markSelectedAsUnread([...selectedIds]); setSelectedIds(new Set()) }

  const selectClass = "h-7 pl-2 pr-6 rounded-lg border border-(--border-custom) bg-white text-[0.65rem] appearance-none cursor-pointer focus:outline-none"

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-(--text)">Central de Notificações</h1>
            {unreadCount() > 0 && (
              <span className="text-[0.6rem] font-semibold text-white bg-red-500 rounded-full px-2 py-0.5">{unreadCount()} não lidas</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <span className="text-[0.6rem] font-semibold text-brand bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">{selectedIds.size} selecionadas</span>
                <button onClick={handleBatchRead} className="h-7 px-2.5 rounded-lg border border-(--border-custom) text-[0.65rem] font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all flex items-center gap-1">
                  <MailOpen size={11} />
                  Marcar como lidas
                </button>
                <button onClick={handleBatchUnread} className="h-7 px-2.5 rounded-lg border border-(--border-custom) text-[0.65rem] font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all flex items-center gap-1">
                  <Mail size={11} />
                  Marcar como não lidas
                </button>
              </>
            )}
            {unreadCount() > 0 && selectedIds.size === 0 && (
              <button onClick={markAllAsRead} className="h-7 px-2.5 rounded-lg border border-(--border-custom) text-[0.65rem] font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all flex items-center gap-1">
                <CheckCheck size={12} />
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="border-b border-(--border-custom) px-5 py-2.5 flex items-center justify-between">
          <div className="flex h-7 rounded-lg border border-(--border-custom) overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-3 text-[0.65rem] font-semibold transition-all flex items-center gap-1",
                  activeTab === tab.key
                    ? "bg-linear-to-br from-brand to-teal-400 text-white"
                    : "text-(--text-muted) hover:bg-gray-50"
                )}
              >
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <span className={cn("text-[0.5rem] rounded-full px-1 py-px", activeTab === tab.key ? "bg-white/25" : "bg-red-500 text-white")}>{tabCounts[tab.key]}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select value={readFilter} onChange={(e) => setReadFilter(e.target.value as typeof readFilter)} className={selectClass}>
                <option value="all">Todas</option>
                <option value="unread">Não lidas</option>
                <option value="read">Lidas</option>
              </select>
              <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
            </div>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-7 px-2 rounded-lg border border-(--border-custom) bg-white text-[0.65rem] focus:outline-none" />
            <span className="text-[0.6rem] text-(--text-muted)">—</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-7 px-2 rounded-lg border border-(--border-custom) bg-white text-[0.65rem] focus:outline-none" />
          </div>
        </div>

        {/* Select all bar */}
        <div className="px-5 py-1.5 border-b border-(--border-custom) bg-gray-50/50 flex items-center gap-3">
          <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={selectAll} className="w-3.5 h-3.5 rounded border-gray-300 text-brand cursor-pointer accent-brand" />
          <span className="text-[0.6rem] text-(--text-muted)">{filtered.length} notificações</span>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <BellOff size={32} className="text-gray-300 mb-3" />
              <span className="text-xs text-(--text-muted)">Nenhuma notificação encontrada</span>
            </div>
          ) : (
            filtered.map((n) => {
              const tc = typeConfig[n.type]
              const isExpanded = expandedId === n.id
              const isSelected = selectedIds.has(n.id)
              const relativeTime = formatDistanceToNow(n.timestamp, { locale: ptBR, addSuffix: true })

              return (
                <div
                  key={n.id}
                  className={cn(
                    "px-5 py-3 border-b border-(--border-custom) last:border-0 transition-colors",
                    !n.read && "bg-teal-50/20",
                    isSelected && "bg-brand/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(n.id)} className="w-3.5 h-3.5 rounded border-gray-300 mt-1 cursor-pointer accent-brand shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={cn("text-[0.55rem] font-semibold px-1.5 py-px rounded-full", tc.bg, tc.color)}>{tc.label}</span>
                        <span className="text-[0.6rem] text-(--text-muted)">{relativeTime}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                      </div>
                      <div className="text-xs font-semibold text-(--text)">{n.title}</div>
                      <div className={cn("text-[0.65rem] text-(--text-muted) mt-0.5 leading-relaxed", !isExpanded && "line-clamp-2")}>
                        {n.message}
                      </div>

                      {isExpanded && n.details && (
                        <div className="mt-2 pt-2 border-t border-(--border-custom)">
                          <p className="text-[0.65rem] text-(--text-muted) leading-relaxed">{n.details}</p>
                          {n.actionUrl && (
                            <Link to={n.actionUrl} className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-brand hover:underline no-underline mt-2">
                              {n.actionLabel || 'Ver detalhes'}
                              <ChevronRight size={12} />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => n.read ? markAsUnread(n.id) : markAsRead(n.id)}
                        className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all"
                        title={n.read ? 'Marcar como não lida' : 'Marcar como lida'}
                      >
                        {n.read ? <Mail size={13} /> : <MailOpen size={13} />}
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : n.id)}
                        className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
