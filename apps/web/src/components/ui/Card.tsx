import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface border border-line rounded-card shadow-low', className)}>
      {children}
    </div>
  )
}
