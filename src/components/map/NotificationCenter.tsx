'use client'

import { useState } from 'react'
import { Bell, Check, Trash2, MapPin, Footprints, Cloud, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMapStore } from '@/lib/map-store'
import { useTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'

const notifIcons: Record<string, React.ReactNode> = {
  geofence: <MapPin className="h-3.5 w-3.5" />,
  track: <Footprints className="h-3.5 w-3.5" />,
  weather: <Cloud className="h-3.5 w-3.5" />,
  location: <MapPin className="h-3.5 w-3.5" />,
  general: <Info className="h-3.5 w-3.5" />,
}

const notifColors: Record<string, string> = {
  geofence: 'text-violet-500 bg-violet-500/10',
  track: 'text-emerald-500 bg-emerald-500/10',
  weather: 'text-sky-500 bg-sky-500/10',
  location: 'text-red-500 bg-red-500/10',
  general: 'text-muted-foreground bg-muted/50',
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

export function NotificationCenter() {
  const { t } = useTranslation()
  const appNotifications = useMapStore((s) => s.appNotifications)
  const markAllNotificationsRead = useMapStore((s) => s.markAllNotificationsRead)
  const clearAppNotifications = useMapStore((s) => s.clearAppNotifications)
  const [open, setOpen] = useState(false)

  const unreadCount = appNotifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
  }

  const handleClearAll = () => {
    clearAppNotifications()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="map-control-glass h-9 w-9 sm:h-10 sm:w-10 rounded-xl relative transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={`${t('notifTitle')}${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white border-2 border-background rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-border/50">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            {t('notifTitle')}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                {unreadCount}
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {appNotifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                  onClick={handleMarkAllRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {t('notifMarkAllRead')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] px-2 text-muted-foreground hover:text-destructive"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('notifClearAll')}
                </Button>
              </>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-80">
          {appNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
              <Bell className="h-8 w-8 opacity-30" />
              <p className="text-xs">{t('notifEmpty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {appNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 transition-colors',
                    !notif.read && 'bg-primary/5'
                  )}
                >
                  <div className={cn('mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg shrink-0', notifColors[notif.type] ?? notifColors.general)}>
                    {notifIcons[notif.type] ?? notifIcons.general}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs leading-relaxed', !notif.read ? 'font-medium' : 'text-muted-foreground')}>
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatTime(notif.timestamp)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
