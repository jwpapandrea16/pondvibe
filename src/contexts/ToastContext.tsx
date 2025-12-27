'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ToastContainer, ToastProps } from '@/components/notifications/Toast'

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'error', duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'error' = 'info', duration = 5000) => {
      const id = Math.random().toString(36).substring(7)
      const toast: ToastProps = {
        id,
        message,
        type,
        duration,
        onClose: removeToast,
      }

      setToasts((prev) => [...prev, toast])

      // Auto-remove after duration
      setTimeout(() => {
        removeToast(id)
      }, duration)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
