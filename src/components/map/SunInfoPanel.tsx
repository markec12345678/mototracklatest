'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Sunrise, Sunset, Clock, Compass, Minus, X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
import { cn } from '@/lib/utils'

interface SunPositionData {
  altitude: number
  azimuth: number
  subsolarPoint: { lat: number; lng: number }
  sunriseFormatted: string
  sunsetFormatted: string
  isDaytime: boolean
  dayLength: string
  goldenHour: {
    startFormatted: string
    endFormatted: string
  }
  blueHour: {
    startFormatted: string
    endFormatted: string
  }
}

export function SunInfoPanel() {
  const { sunPositionEnabled, center, setSunPositionEnabled } = useMapStore()
  const [sunData, setSunData] = useState<SunPositionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const lastFetchCenter = useRef<[number, number] | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSunPosition = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const tzOffset = -(new Date().getTimezoneOffset() / 60)
      const res = await fetch(`/api/sun-position?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&tz=${tzOffset}`)
      if (!res.ok) throw new Error('Failed to fetch sun position')
      const data = await res.json()
      setSunData(data)
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data when enabled or center changes
  useEffect(() => {
    if (!sunPositionEnabled) {
      setSunData(null)
      return
    }

    const [lng, lat] = center

    // Debounce: only fetch if center moved significantly
    if (lastFetchCenter.current) {
      const [lastLng, lastLat] = lastFetchCenter.current
      const dist = Math.sqrt((lng - lastLng) ** 2 + (lat - lastLat) ** 2)
      if (dist < 0.05) return // Skip if moved less than ~5km
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      lastFetchCenter.current = [lng, lat]
      fetchSunPosition(lat, lng)
    }, 500)

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [sunPositionEnabled, center, fetchSunPosition])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!sunPositionEnabled) return

    const interval = setInterval(() => {
      const [lng, lat] = useMapStore.getState().center
      fetchSunPosition(lat, lng)
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [sunPositionEnabled, fetchSunPosition])

  if (!sunPositionEnabled || !sunData) return null

  const getAzimuthDirection = (azimuth: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(azimuth / 22.5) % 16
    return directions[index]
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'relative w-72 overflow-hidden rounded-2xl border shadow-xl',
          'bg-background/90 backdrop-blur-xl border-border/50',
          minimized && 'w-auto'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
          <Sun className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold flex-1">Sun Position</span>
          {loading && (
            <div className="h-3 w-3 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          )}
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 rounded-md hover:bg-accent/50 transition-colors"
            aria-label={minimized ? 'Expand panel' : 'Minimize panel'}
          >
            <Minus className="h-3 w-3 text-muted-foreground" />
          </button>
          <button
            onClick={() => setSunPositionEnabled(false)}
            className="p-1 rounded-md hover:bg-accent/50 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        <AnimatePresence>
          {!minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 py-2.5 space-y-2.5">
                {/* Day/Night Status */}
                <div className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium',
                  sunData.isDaytime
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                )}>
                  <span>{sunData.isDaytime ? '☀️' : '🌙'}</span>
                  <span>{sunData.isDaytime ? 'Daytime' : 'Nighttime'}</span>
                  <span className="ml-auto text-[10px] opacity-70">Day: {sunData.dayLength}</span>
                </div>

                {/* Sun Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-2.5 py-2 rounded-lg bg-accent/30">
                    <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                      <Sun className="h-2.5 w-2.5" /> Altitude
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {sunData.altitude.toFixed(1)}°
                    </div>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg bg-accent/30">
                    <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                      <Compass className="h-2.5 w-2.5" /> Azimuth
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {sunData.azimuth.toFixed(1)}° <span className="text-[10px] text-muted-foreground font-normal">{getAzimuthDirection(sunData.azimuth)}</span>
                    </div>
                  </div>
                </div>

                {/* Sunrise / Sunset */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="px-2.5 py-2 rounded-lg bg-accent/30">
                    <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                      <Sunrise className="h-2.5 w-2.5 text-orange-500" /> Sunrise
                    </div>
                    <div className="text-sm font-semibold">{sunData.sunriseFormatted}</div>
                  </div>
                  <div className="px-2.5 py-2 rounded-lg bg-accent/30">
                    <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                      <Sunset className="h-2.5 w-2.5 text-orange-600" /> Sunset
                    </div>
                    <div className="text-sm font-semibold">{sunData.sunsetFormatted}</div>
                  </div>
                </div>

                {/* Golden Hour & Blue Hour */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <span className="text-xs">🌅</span>
                    <div className="flex-1">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Golden Hour</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {sunData.goldenHour.startFormatted} – {sunData.goldenHour.endFormatted}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <span className="text-xs">🌅</span>
                    <div className="flex-1">
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 font-medium">Blue Hour</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {sunData.blueHour.startFormatted} – {sunData.blueHour.endFormatted}
                    </span>
                  </div>
                </div>

                {/* Subsolar Point */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent/20 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  <span>Subsolar: {sunData.subsolarPoint.lat.toFixed(1)}°, {sunData.subsolarPoint.lng.toFixed(1)}°</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
