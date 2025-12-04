"use client"

import { useState, useEffect } from "react"
import { X, Bell, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  duration?: number
}

interface NotificationBarProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function NotificationBar({ notifications, onDismiss }: NotificationBarProps) {
  if (notifications.length === 0) return null

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-200"
      case "error":
        return "bg-red-500/10 border-red-500/30 text-red-200"
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-200"
    }
  }

  return (
    <div className="sticky top-16 z-40 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${getStyles(notification.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-sm opacity-90">{notification.message}</p>
              {notification.action && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={notification.action.onClick}
                  className="mt-2 h-7 text-xs"
                >
                  {notification.action.label}
                </Button>
              )}
            </div>
            {notification.dismissible !== false && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 h-6 w-6 p-0 hover:bg-transparent"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Hook para gerenciar notificações
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newNotification: Notification = {
      ...notification,
      id,
      dismissible: notification.dismissible !== false,
      duration: notification.duration || 5000,
    }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-dismiss após duração especificada
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id)
      }, newNotification.duration)
    }

    return id
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  }
}

