import { cn } from '@/shared/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'success'
export type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-[0.65rem]',
  md: 'h-8 px-4 text-xs',
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-br from-brand to-teal-400 text-white font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all cursor-pointer',
  outline:
    'border-[1.5px] border-(--border-custom) font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer',
  ghost:
    'font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer',
  danger:
    'bg-red-600 text-white font-semibold hover:bg-red-700 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(220,38,38,0.3)] transition-all cursor-pointer',
  warning:
    'bg-linear-to-br from-yellow-500 to-amber-500 text-white font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(234,179,8,0.3)] transition-all cursor-pointer',
  success:
    'bg-linear-to-br from-emerald-400 to-emerald-500 text-white font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(52,211,153,0.3)] transition-all cursor-pointer',
}

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={cn(
        'rounded-lg flex items-center justify-center gap-1.5',
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  )
}
