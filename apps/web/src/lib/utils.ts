import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(millimes: number): string {
  return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(
    millimes / 1000,
  )
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-TN', { dateStyle: 'medium' }).format(new Date(iso))
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}
