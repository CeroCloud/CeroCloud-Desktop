/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { X, CheckCircle2, AlertOctagon, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void
    showSuccess: (title: string, message?: string) => void
    showError: (title: string, message?: string) => void
    showWarning: (title: string, message?: string) => void
    showInfo: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const TOAST_DURATION = 5000

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return prev - (100 / (TOAST_DURATION / 100))
            })
        }, 100)

        const dismissTimer = setTimeout(() => {
            onRemove(toast.id)
        }, TOAST_DURATION)

        return () => {
            clearInterval(timer)
            clearTimeout(dismissTimer)
        }
    }, [toast.id, onRemove])

    const config = {
        success: {
            icon: CheckCircle2,
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-emerald-500/20',
            iconColor: 'text-emerald-500',
            iconBg: 'bg-emerald-500/10',
            progressPool: 'bg-emerald-500/20',
            progressBar: 'bg-emerald-500',
            glow: 'shadow-emerald-500/10'
        },
        error: {
            icon: AlertOctagon,
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-rose-500/20',
            iconColor: 'text-rose-500',
            iconBg: 'bg-rose-500/10',
            progressPool: 'bg-rose-500/20',
            progressBar: 'bg-rose-500',
            glow: 'shadow-rose-500/10'
        },
        warning: {
            icon: AlertTriangle,
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-amber-500/20',
            iconColor: 'text-amber-500',
            iconBg: 'bg-amber-500/10',
            progressPool: 'bg-amber-500/20',
            progressBar: 'bg-amber-500',
            glow: 'shadow-amber-500/10'
        },
        info: {
            icon: Info,
            bg: 'bg-white dark:bg-gray-900',
            border: 'border-blue-500/20',
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-500/10',
            progressPool: 'bg-blue-500/20',
            progressBar: 'bg-blue-500',
            glow: 'shadow-blue-500/10'
        }
    }[toast.type]

    const Icon = config.icon

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md select-none group",
                config.bg,
                config.border,
                config.glow
            )}
        >
            {/* Background Effect */}
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shine")} />

            <div className="relative p-4 flex gap-4">
                {/* Icon Section */}
                <div className={cn("relative shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", config.iconBg)}>
                    <Icon className={cn("w-5 h-5", config.iconColor)} />
                    {toast.type === 'success' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className={cn("absolute inset-0 rounded-xl", config.iconBg)}
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1">
                        {toast.title}
                    </h3>
                    {toast.message && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            {toast.message}
                        </p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={() => onRemove(toast.id)}
                    className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className={cn("absolute bottom-0 left-0 right-0 h-1", config.progressPool)}>
                <motion.div
                    className={cn("h-full origin-left", config.progressBar)}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </motion.div>
    )
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { id, type, title, message }])
    }

    const showSuccess = (title: string, message?: string) => showToast('success', title, message)
    const showError = (title: string, message?: string) => showToast('error', title, message)
    const showWarning = (title: string, message?: string) => showToast('warning', title, message)
    const showInfo = (title: string, message?: string) => showToast('info', title, message)

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <ToastItem toast={toast} onRemove={removeToast} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
