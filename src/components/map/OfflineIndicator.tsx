'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, Database } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type OnlineStatus = 'online' | 'offline' | 'limited'

export function OfflineIndicator() {
  const [status, setStatus] = useState<OnlineStatus>('online')
  const [cachedTileCount, setCachedTileCount] = useState(0)
  const [showOnlineFlash, setShowOnlineFlash] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnlineStatus = () => {
      if (navigator.onLine) {
        setStatus('online')
        setShowOnlineFlash(true)
        setTimeout(() => setShowOnlineFlash(false), 2000)
      } else {
        // Check if we have cached tiles
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const channel = new MessageChannel()
          channel.port1.onmessage = (event) => {
            if (event.data && typeof event.data.count === 'number') {
              setCachedTileCount(event.data.count)
              setStatus(event.data.count > 0 ? 'limited' : 'offline')
            } else {
              setStatus('offline')
            }
          }
          navigator.serviceWorker.controller.postMessage(
            { type: 'GET_CACHE_SIZE' },
            [channel.port2]
          )
        } else {
          setStatus('offline')
        }
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Initial check
    updateOnlineStatus()

    // Also get cache count when online
    const updateCacheCount = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const channel = new MessageChannel()
        channel.port1.onmessage = (event) => {
          if (event.data && typeof event.data.count === 'number') {
            setCachedTileCount(event.data.count)
          }
        }
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_SIZE' },
          [channel.port2]
        )
      }
    }

    const interval = setInterval(updateCacheCount, 15000)
    setTimeout(updateCacheCount, 5000)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(interval)
    }
  }, [])

  return (
    <AnimatePresence>
      {/* Offline badge */}
      {status === 'offline' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-14 right-3 z-20"
        >
          <Badge variant="destructive" className="gap-1.5 text-xs px-3 py-1 shadow-lg">
            <WifiOff className="h-3 w-3" />
            Offline
          </Badge>
        </motion.div>
      )}

      {/* Limited connectivity badge */}
      {status === 'limited' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-14 right-3 z-20"
        >
          <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1 shadow-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
            <Database className="h-3 w-3" />
            Limited ({cachedTileCount} cached)
          </Badge>
        </motion.div>
      )}

      {/* Brief green flash when coming back online */}
      {showOnlineFlash && status === 'online' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-14 right-3 z-20"
        >
          <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1 shadow-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
            <Wifi className="h-3 w-3" />
            Back Online
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
