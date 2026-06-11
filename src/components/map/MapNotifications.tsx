'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore, type MapNotification } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import {
  Map,
  MapPin,
  Trash2,
  Route,
  Pencil,
  Ruler,
  Cloud,
  Mountain,
  Info,
} from 'lucide-react'

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  style: <Map className="h-3.5 w-3.5" />,
  location: <MapPin className="h-3.5 w-3.5" />,
  route: <Route className="h-3.5 w-3.5" />,
  drawing: <Pencil className="h-3.5 w-3.5" />,
  measurement: <Ruler className="h-3.5 w-3.5" />,
  weather: <Cloud className="h-3.5 w-3.5" />,
  terrain: <Mountain className="h-3.5 w-3.5" />,
  general: <Info className="h-3.5 w-3.5" />,
}

const NOTIFICATION_COLORS: Record<string, string> = {
  style: 'text-violet-500',
  location: 'text-blue-500',
  route: 'text-cyan-500',
  drawing: 'text-green-500',
  measurement: 'text-amber-500',
  weather: 'text-sky-500',
  terrain: 'text-orange-500',
  general: 'text-muted-foreground',
}

const NOTIFICATION_BORDER_CLASS: Record<string, string> = {
  style: 'notification-border-style',
  location: 'notification-border-location',
  route: 'notification-border-route',
  drawing: 'notification-border-drawing',
  measurement: 'notification-border-measurement',
  weather: 'notification-border-weather',
  terrain: 'notification-border-terrain',
  general: 'notification-border-general',
}

const NOTIFICATION_PROGRESS_COLORS: Record<string, string> = {
  style: 'oklch(0.6 0.2 300)',
  location: 'oklch(0.6 0.2 250)',
  route: 'oklch(0.6 0.15 200)',
  drawing: 'oklch(0.6 0.2 160)',
  measurement: 'oklch(0.7 0.15 80)',
  weather: 'oklch(0.6 0.12 230)',
  terrain: 'oklch(0.65 0.18 60)',
  general: 'oklch(0.5 0 0)',
}

const NOTIFICATION_DURATION = 3000

function NotificationItem({ notification, onDismiss }: { notification: MapNotification; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    timerRef.current = setTimeout(() => {
      onDismiss(notification.id)
    }, NOTIFICATION_DURATION)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [notification.id, onDismiss, isPaused])

  const borderColor = NOTIFICATION_BORDER_CLASS[notification.type] || NOTIFICATION_BORDER_CLASS.general
  const progressColor = NOTIFICATION_PROGRESS_COLORS[notification.type] || NOTIFICATION_PROGRESS_COLORS.general

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.9, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 30, scale: 0.9, filter: 'blur(2px)' }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-card flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg min-w-[200px] max-w-[280px] relative overflow-hidden cursor-pointer",
        borderColor
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onDismiss(notification.id)}
      role="alert"
    >
      <span className={cn(NOTIFICATION_COLORS[notification.type] ?? 'text-muted-foreground')}>
        {NOTIFICATION_ICONS[notification.type] ?? NOTIFICATION_ICONS.general}
      </span>
      <span className="text-[11px] text-foreground leading-tight flex-1">{notification.message}</span>
      {/* Progress bar for auto-dismiss timer */}
      {!isPaused && (
        <div
          className="notification-progress-bar"
          style={{
            background: progressColor,
            animationDuration: `${NOTIFICATION_DURATION}ms`,
          }}
        />
      )}
    </motion.div>
  )
}

export function MapNotifications() {
  const notifications = useMapStore((s) => s.notifications)
  const dismissNotification = useMapStore((s) => s.dismissNotification)

  // Show max 3 at a time
  const visible = notifications.slice(0, 3)

  return (
    <div className="absolute top-[52px] right-3 z-10 flex flex-col gap-1.5 items-end">
      <AnimatePresence mode="popLayout">
        {visible.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
