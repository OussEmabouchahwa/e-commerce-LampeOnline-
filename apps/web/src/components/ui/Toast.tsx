import { useRef, createContext, useContext, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastState {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastState | null>(null)

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={18} className="text-ok flex-shrink-0" />,
  error: <AlertCircle size={18} className="text-danger flex-shrink-0" />,
  info: <Info size={18} className="text-teal flex-shrink-0" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
  }

  function toast(message: string, type: ToastType = 'success') {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev.slice(-4), { id, message, type }])
    timers.current[id] = setTimeout(() => dismiss(id), 4000)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div
          className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2"
          aria-live="polite"
          aria-label="Notifications"
        >
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 48 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 bg-surface border border-line rounded-card shadow-mid px-4 py-3 min-w-[260px] max-w-sm"
              >
                {icons[t.type]}
                <p className="flex-1 text-xs text-ink">{t.message}</p>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-mute hover:text-ink">
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
