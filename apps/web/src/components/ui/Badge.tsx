import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'ok' | 'danger' | 'bulb' | 'mute'
  className?: string
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-line text-ink',
  ok: 'bg-ok/20 text-ok',
  danger: 'bg-danger/20 text-danger',
  bulb: 'bg-bulb/20 text-bulb',
  mute: 'bg-line text-mute',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-pill text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
