import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

export type ToastVariant = 'success' | 'warning' | 'info' | 'danger'

const VARIANT_CLASS: Record<ToastVariant, { border: string; iconBg: string; iconColor: string }> = {
  success: { border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500' },
  warning: { border: 'border-yellow-200', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-700' },
  info: { border: 'border-teal-200', iconBg: 'bg-teal-100', iconColor: 'text-brand' },
  danger: { border: 'border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
}

interface ToastProps {
  open: boolean
  onClose: () => void
  variant?: ToastVariant
  icon: ReactNode
  title: string
  description?: string
}

/** Toast fixo no canto superior direito com animação de slide. */
export function Toast({ open, onClose, variant = 'success', icon, title, description }: ToastProps) {
  if (!open) return null
  const v = VARIANT_CLASS[variant]
  return (
    <div className="fixed top-6 right-6 z-50" style={{ animation: 'slide-up-fade 0.3s ease-out' }}>
      <div className={cn('flex items-start gap-3 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-95 border', v.border)}>
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0 mt-0.5', v.iconBg, v.iconColor)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-(--text)">{title}</p>
          {description && <p className="text-xs text-(--text-muted) mt-1">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
