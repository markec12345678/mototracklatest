'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'

interface BookmarkLocation {
  name: string
  emoji: string
  lng: number
  lat: number
  zoom: number
  color: string
}

const BOOKMARKS: BookmarkLocation[] = [
  { name: 'New York', emoji: '🗽', lng: -74.006, lat: 40.7128, zoom: 12, color: 'from-red-500/20 to-orange-500/10' },
  { name: 'London', emoji: '🎡', lng: -0.1276, lat: 51.5074, zoom: 12, color: 'from-blue-500/20 to-indigo-500/10' },
  { name: 'Paris', emoji: '🗼', lng: 2.3522, lat: 48.8566, zoom: 13, color: 'from-amber-500/20 to-yellow-500/10' },
  { name: 'Tokyo', emoji: '⛩️', lng: 139.6917, lat: 35.6895, zoom: 12, color: 'from-rose-500/20 to-pink-500/10' },
  { name: 'Ljubljana', emoji: '🏰', lng: 14.5058, lat: 46.0569, zoom: 13, color: 'from-emerald-500/20 to-teal-500/10' },
  { name: 'Sydney', emoji: '🏝️', lng: 151.2093, lat: -33.8688, zoom: 12, color: 'from-cyan-500/20 to-sky-500/10' },
  { name: 'Dubai', emoji: '🏙️', lng: 55.2708, lat: 25.2048, zoom: 12, color: 'from-yellow-500/20 to-amber-500/10' },
  { name: 'Rome', emoji: '🏛️', lng: 12.4964, lat: 41.9028, zoom: 13, color: 'from-orange-500/20 to-red-500/10' },
]

function isNearBookmark(
  center: [number, number],
  zoom: number,
  bookmark: BookmarkLocation,
  thresholdDeg: number = 0.5,
  thresholdZoom: number = 2
): boolean {
  const lngDist = Math.abs(center[0] - bookmark.lng)
  const latDist = Math.abs(center[1] - bookmark.lat)
  const zoomDist = Math.abs(zoom - bookmark.zoom)
  return lngDist < thresholdDeg && latDist < thresholdDeg && zoomDist < thresholdZoom
}

export function QuickJumpPanel() {
  const { center, zoom } = useMapStore()
  const [expanded, setExpanded] = useState(false)

  // Determine which bookmark is closest to the current map view
  const activeBookmark = useMemo(() => {
    const matched = BOOKMARKS.find((b) => isNearBookmark(center, zoom, b))
    return matched?.name ?? null
  }, [center, zoom])

  const handleJump = useCallback((bookmark: BookmarkLocation) => {
    const flyTo = (window as unknown as Record<string, (lng: number, lat: number, z?: number) => void>).__mapFlyTo
    if (flyTo) {
      flyTo(bookmark.lng, bookmark.lat, bookmark.zoom)
    }
    // Collapse after selection
    setExpanded(false)
  }, [])

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!expanded ? (
          /* Minimized state: small button with Bookmark icon */
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => setExpanded(true)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl',
              'map-control-glass',
              'transition-all duration-200',
              'hover:scale-105 active:scale-95 cursor-pointer',
              activeBookmark && 'ring-1 ring-primary/30'
            )}
            aria-label="Open bookmarks panel"
            title="Quick Jump Bookmarks"
          >
            <Bookmark className="h-4 w-4 text-primary" />
            {activeBookmark && (
              <span className="text-xs font-medium">
                {BOOKMARKS.find((b) => b.name === activeBookmark)?.emoji} {activeBookmark}
              </span>
            )}
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </motion.button>
        ) : (
          /* Expanded state: vertical list of bookmarks */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'rounded-2xl overflow-hidden',
              'map-control-glass',
              'shadow-xl'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Bookmark className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">Bookmarks</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 rounded-lg hover:bg-accent/50 transition-colors"
                aria-label="Minimize bookmarks panel"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>

            {/* Bookmark list */}
            <div className="p-2 flex flex-col gap-1 max-h-80 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {BOOKMARKS.map((bookmark, index) => {
                const isActive = activeBookmark === bookmark.name
                return (
                  <motion.button
                    key={bookmark.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.15,
                      delay: index * 0.04,
                      ease: 'easeOut',
                    }}
                    onClick={() => handleJump(bookmark)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 rounded-lg',
                      'transition-all duration-150 text-left',
                      'hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
                      isActive
                        ? 'bg-primary/10 ring-1 ring-primary/30'
                        : `bg-gradient-to-r ${bookmark.color} hover:bg-accent/50`
                    )}
                    aria-label={`Jump to ${bookmark.name}`}
                    title={`${bookmark.name} (${bookmark.lat.toFixed(2)}°, ${bookmark.lng.toFixed(2)}°)`}
                  >
                    <span className="text-base leading-none shrink-0">{bookmark.emoji}</span>
                    <span className={cn(
                      'text-xs font-medium truncate',
                      isActive ? 'text-primary' : 'text-foreground'
                    )}>
                      {bookmark.name}
                    </span>
                    {isActive && (
                      <MapPin className="h-3 w-3 text-primary shrink-0 ml-auto" />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-1.5 border-t border-border/30">
              <p className="text-[9px] text-muted-foreground text-center">
                Click a city to fly there
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
