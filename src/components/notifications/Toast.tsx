'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Info } from 'lucide-react'

export interface ToastProps {
  id: string
  message: string
  type?: 'success' | 'info' | 'error'
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, message, type = 'info', onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-plague-green" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    error: <X className="w-5 h-5 text-red-500" />,
  }

  const styles = {
    success: 'border-plague-green bg-plague-green/10',
    info: 'border-blue-500 bg-blue-500/10',
    error: 'border-red-500 bg-red-500/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-20 left-1/2 z-[100] max-w-md w-full mx-4 p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm ${styles[type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <p className="flex-1 text-sm text-black font-medium">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-black/60 hover:text-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: ToastProps[]
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <AnimatePresence mode="sync">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </AnimatePresence>
  )
}
