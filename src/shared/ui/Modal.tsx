import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { ReactNode } from 'react'

type Size = 'sm' | 'md' | 'lg'
const SIZE_CLASS: Record<Size, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: Size
  children: ReactNode
  footer?: ReactNode
  /** Override do container interno quando título customizado é necessário. */
  headerSlot?: ReactNode
}

/**
 * Modal padrão ImuneCare: backdrop blur + overlay com X + header opcional + footer sticky.
 * Clicar no backdrop fecha; clicar no conteúdo não propaga.
 */
export function Modal({ open, onClose, title, size = 'md', children, footer, headerSlot }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-white rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col overflow-hidden',
          SIZE_CLASS[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || headerSlot) && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom) shrink-0">
            {headerSlot ?? <h3 className="text-sm font-bold text-(--text)">{title}</h3>}
            <button
              type="button"
              onClick={onClose}
              className="text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="px-5 py-4 space-y-3.5 flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
