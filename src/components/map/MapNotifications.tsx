'use client'

import { useEffect, useRef } from 'react'
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

function NotificationItem({ notification, onDismiss }: { notification: MapNotification; onDismiss: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(notification.id)
    }, 3000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [notification.id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg min-w-[200px] max-w-[280px]"
    >
      <span className={cn(NOTIFICATION_COLORS[notification.type] ?? 'text-muted-foreground')}>
        {NOTIFICATION_ICONS[notification.type] ?? NOTIFICATION_ICONS.general}
      </span>
      <span className="text-[11px] text-foreground leading-tight flex-1">{notification.message}</span>
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
