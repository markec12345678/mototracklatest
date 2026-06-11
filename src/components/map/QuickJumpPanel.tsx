'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'

interface BookmarkLocation {
  name: string
  emoji: string
  flag: string
  lng: number
  lat: number
  zoom: number
  color: string
  hoverColor: string
}

const BOOKMARKS: BookmarkLocation[] = [
  { name: 'New York', emoji: '🗽', flag: '🇺🇸', lng: -74.006, lat: 40.7128, zoom: 12, color: 'from-red-500/20 to-orange-500/10', hoverColor: 'hover:border-red-400/40' },
  { name: 'London', emoji: '🎡', flag: '🇬🇧', lng: -0.1276, lat: 51.5074, zoom: 12, color: 'from-blue-500/20 to-indigo-500/10', hoverColor: 'hover:border-blue-400/40' },
  { name: 'Paris', emoji: '🗼', flag: '🇫🇷', lng: 2.3522, lat: 48.8566, zoom: 13, color: 'from-amber-500/20 to-yellow-500/10', hoverColor: 'hover:border-amber-400/40' },
  { name: 'Tokyo', emoji: '⛩️', flag: '🇯🇵', lng: 139.6917, lat: 35.6895, zoom: 12, color: 'from-rose-500/20 to-pink-500/10', hoverColor: 'hover:border-rose-400/40' },
  { name: 'Ljubljana', emoji: '🏰', flag: '🇸🇮', lng: 14.5058, lat: 46.0569, zoom: 13, color: 'from-emerald-500/20 to-teal-500/10', hoverColor: 'hover:border-emerald-400/40' },
  { name: 'Sydney', emoji: '🏝️', flag: '🇦🇺', lng: 151.2093, lat: -33.8688, zoom: 12, color: 'from-cyan-500/20 to-sky-500/10', hoverColor: 'hover:border-cyan-400/40' },
  { name: 'Dubai', emoji: '🏙️', flag: '🇦🇪', lng: 55.2708, lat: 25.2048, zoom: 12, color: 'from-yellow-500/20 to-amber-500/10', hoverColor: 'hover:border-yellow-400/40' },
  { name: 'Rome', emoji: '🏛️', flag: '🇮🇹', lng: 12.4964, lat: 41.9028, zoom: 13, color: 'from-orange-500/20 to-red-500/10', hoverColor: 'hover:border-orange-400/40' },
  { name: 'Tokyo Tower', emoji: '🗼', flag: '🇯🇵', lng: 139.7454, lat: 35.6586, zoom: 15, color: 'from-rose-500/20 to-pink-500/10', hoverColor: 'hover:border-rose-400/40' },
  { name: 'Eiffel Tower', emoji: '🗼', flag: '🇫🇷', lng: 2.2945, lat: 48.8584, zoom: 16, color: 'from-amber-500/20 to-yellow-500/10', hoverColor: 'hover:border-amber-400/40' },
  { name: 'Colosseum', emoji: '🏟️', flag: '🇮🇹', lng: 12.4922, lat: 41.8902, zoom: 16, color: 'from-orange-500/20 to-red-500/10', hoverColor: 'hover:border-orange-400/40' },
  { name: 'Machu Picchu', emoji: '🏔️', flag: '🇵🇪', lng: -72.5450, lat: -13.1631, zoom: 15, color: 'from-green-500/20 to-emerald-500/10', hoverColor: 'hover:border-green-400/40' },
  { name: 'Great Wall', emoji: '🧱', flag: '🇨🇳', lng: 116.5704, lat: 40.4319, zoom: 13, color: 'from-red-500/20 to-rose-500/10', hoverColor: 'hover:border-red-400/40' },
  { name: 'Sydney Opera House', emoji: '🎭', flag: '🇦🇺', lng: 151.2153, lat: -33.8568, zoom: 16, color: 'from-cyan-500/20 to-sky-500/10', hoverColor: 'hover:border-cyan-400/40' },
  { name: 'Table Mountain', emoji: '⛰️', flag: '🇿🇦', lng: 18.4024, lat: -33.9628, zoom: 14, color: 'from-emerald-500/20 to-teal-500/10', hoverColor: 'hover:border-emerald-400/40' },
  { name: 'Matterhorn', emoji: '🏔️', flag: '🇨🇭', lng: 7.6585, lat: 45.9763, zoom: 14, color: 'from-slate-500/20 to-gray-500/10', hoverColor: 'hover:border-slate-400/40' },
  { name: 'Taj Mahal', emoji: '🕌', flag: '🇮🇳', lng: 78.0421, lat: 27.1751, zoom: 16, color: 'from-amber-500/20 to-orange-500/10', hoverColor: 'hover:border-amber-400/40' },
  { name: 'Grand Canyon', emoji: '🏜️', flag: '🇺🇸', lng: -112.1129, lat: 36.1069, zoom: 12, color: 'from-orange-500/20 to-red-500/10', hoverColor: 'hover:border-orange-400/40' },
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
                {BOOKMARKS.find((b) => b.name === activeBookmark)?.flag} {activeBookmark}
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
                      delay: Math.min(index * 0.03, 0.3),
                      ease: 'easeOut',
                    }}
                    onClick={() => handleJump(bookmark)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-1.5 rounded-lg border border-transparent',
                      'transition-all duration-150 text-left',
                      'hover:scale-[1.02] active:scale-[0.98] cursor-pointer',
                      bookmark.hoverColor,
                      isActive
                        ? 'bg-primary/10 ring-1 ring-primary/30'
                        : `bg-gradient-to-r ${bookmark.color} hover:bg-accent/50`
                    )}
                    aria-label={`Jump to ${bookmark.name}`}
                    title={`${bookmark.name} (${bookmark.lat.toFixed(2)}°, ${bookmark.lng.toFixed(2)}°)`}
                  >
                    <span className="text-base leading-none shrink-0">{bookmark.flag}</span>
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
                Click a location to fly there
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
