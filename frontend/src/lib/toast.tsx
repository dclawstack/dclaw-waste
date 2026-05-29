"use client"

import React, { createContext, useContext, useState, useCallback, useId } from "react"
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react"

type ToastType = "success" | "error" | "warning"
type Toast = { id: string; message: string; type: ToastType }

interface ToastContextValue {
  success: (msg: string) => void
  error: (msg: string) => void
  warning: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  success: () => {}, error: () => {}, warning: () => {},
})

export function useToast() {
  return useContext(ToastContext)
}

const STYLE: Record<ToastType, { bg: string; color: string; icon: React.ElementType }> = {
  success: { bg: "var(--dk-success-bg)", color: "var(--dk-success)", icon: CheckCircle },
  error:   { bg: "var(--dk-danger-bg)",  color: "var(--dk-danger)",  icon: XCircle },
  warning: { bg: "var(--dk-warning-bg)", color: "var(--dk-warning)", icon: AlertTriangle },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  const dismiss = (id: string) => setToasts(t => t.filter(x => x.id !== id))

  const ctx: ToastContextValue = {
    success: (msg) => add(msg, "success"),
    error:   (msg) => add(msg, "error"),
    warning: (msg) => add(msg, "warning"),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed bottom-20 left-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => {
          const { bg, color, icon: Icon } = STYLE[t.type]
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-left-4"
              style={{ background: bg, border: `1px solid ${color}22`, minWidth: 240 }}
            >
              <Icon size={16} style={{ color, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: "var(--dk-text-sm)", color, flex: 1 }}>{t.message}</span>
              <button onClick={() => dismiss(t.id)} style={{ color, opacity: 0.6 }}>
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
