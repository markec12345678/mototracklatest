'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowRight, RotateCcw, TrendingDown, Clock, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMapStore, type RoutePoint } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/** Haversine distance in km between two lat/lng points */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** Calculate total route distance in km */
function totalDistance(points: RoutePoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    )
  }
  return total
}

/** Nearest-neighbor TSP heuristic starting from first point */
function nearestNeighborTSP(points: RoutePoint[]): RoutePoint[] {
  if (points.length <= 2) return [...points]

  const start = points[0]
  const unvisited = points.slice(1)
  const ordered: RoutePoint[] = [start]
  let current = start

  while (unvisited.length > 0) {
    let nearestIdx = 0
    let nearestDist = Infinity

    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineDistance(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      )
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIdx = i
      }
    }

    current = unvisited[nearestIdx]
    ordered.push(current)
    unvisited.splice(nearestIdx, 1)
  }

  return ordered
}

/** Format distance for display */
function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

/** Estimate travel time in minutes (driving ~50km/h avg) */
function estimateMinutes(km: number, profile: 'driving' | 'cycling' | 'walking'): number {
  const speedKmH = profile === 'driving' ? 50 : profile === 'cycling' ? 15 : 5
  return (km / speedKmH) * 60
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return '<1 min'
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`
}

export function RouteOptimizer() {
  const routePoints = useMapStore((s) => s.routePoints)
  const originalRoutePoints = useMapStore((s) => s.originalRoutePoints)
  const routeOptimized = useMapStore((s) => s.routeOptimized)
  const setRouteOptimized = useMapStore((s) => s.setRouteOptimized)
  const setOriginalRoutePoints = useMapStore((s) => s.setOriginalRoutePoints)
  const routeProfile = useMapStore((s) => s.routeProfile)

  const [showComparison, setShowComparison] = useState(false)

  const canOptimize = routePoints.length >= 3

  // Calculate optimized route preview (without applying it)
  const optimizedPreview = useMemo(() => {
    if (!canOptimize) return null
    return nearestNeighborTSP(routePoints)
  }, [routePoints, canOptimize])

  const beforeDistance = useMemo(() => totalDistance(routePoints), [routePoints])
  const afterDistance = useMemo(
    () => (optimizedPreview ? totalDistance(optimizedPreview) : 0),
    [optimizedPreview]
  )
  const savedDistance = beforeDistance - afterDistance
  const savedPercent = beforeDistance > 0 ? ((savedDistance / beforeDistance) * 100) : 0
  const savedTime = estimateMinutes(savedDistance, routeProfile)
  const beforeTime = estimateMinutes(beforeDistance, routeProfile)
  const afterTime = estimateMinutes(afterDistance, routeProfile)

  // Identify which points were reordered
  const reorderedIndices = useMemo(() => {
    if (!optimizedPreview) return new Set<number>()
    const reordered = new Set<number>()
    for (let i = 0; i < optimizedPreview.length; i++) {
      if (
        i >= routePoints.length ||
        optimizedPreview[i].latitude !== routePoints[i].latitude ||
        optimizedPreview[i].longitude !== routePoints[i].longitude
      ) {
        reordered.add(i)
      }
    }
    return reordered
  }, [optimizedPreview, routePoints])

  const handleOptimize = useCallback(() => {
    if (!canOptimize || !optimizedPreview) return

    // Save original points for comparison
    setOriginalRoutePoints([...routePoints])
    setRouteOptimized(true)

    // Apply optimized order - use the store's updateRoutePoint to update each point
    // We need to rebuild the routePoints array with the optimized order
    const store = useMapStore.getState()
    // Clear and re-add in optimized order
    store.clearRoutePoints()
    for (const point of optimizedPreview) {
      store.addRoutePoint(point)
    }

    setShowComparison(true)
    toast.success(`Route optimized! Saved ${formatDist(savedDistance)} (${savedPercent.toFixed(1)}%)`)
  }, [canOptimize, optimizedPreview, routePoints, setOriginalRoutePoints, setRouteOptimized, savedDistance, savedPercent])

  const handleRestore = useCallback(() => {
    if (originalRoutePoints.length === 0) return

    const store = useMapStore.getState()
    store.clearRoutePoints()
    for (const point of originalRoutePoints) {
      store.addRoutePoint(point)
    }

    setRouteOptimized(false)
    setOriginalRoutePoints([])
    setShowComparison(false)
    toast.info('Route restored to original order')
  }, [originalRoutePoints, setRouteOptimized, setOriginalRoutePoints])

  if (!canOptimize) return null

  return (
    <div className="space-y-3">
      {/* Optimize Button */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className={cn(
            'flex-1 h-8 text-xs gap-1.5 rounded-xl transition-all',
            routeOptimized
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0'
          )}
          onClick={routeOptimized ? handleRestore : handleOptimize}
        >
          {routeOptimized ? (
            <>
              <RotateCcw className="h-3 w-3" />
              Restore Original
            </>
          ) : (
            <>
              <Zap className="h-3 w-3" />
              Optimize Route
            </>
          )}
        </Button>
        {routeOptimized && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1 rounded-xl"
            onClick={() => setShowComparison(!showComparison)}
          >
            <TrendingDown className="h-3 w-3" />
            {showComparison ? 'Hide' : 'Compare'}
          </Button>
        )}
      </div>

      {/* Preview / Comparison Panel */}
      <AnimatePresence>
        {(showComparison || !routeOptimized) && optimizedPreview && savedDistance > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-3 space-y-3">
              {/* Distance comparison */}
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    {routeOptimized ? 'Original' : 'Current'}
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    {formatDist(beforeDistance)}
                  </div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">
                    {formatDuration(beforeTime)}
                  </div>
                </div>
                <div className="flex flex-col items-center px-2">
                  <ArrowRight className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-center flex-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Optimized
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatDist(afterDistance)}
                  </div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">
                    {formatDuration(afterTime)}
                  </div>
                </div>
              </div>

              {/* Savings badges */}
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-[10px] gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
                >
                  <TrendingDown className="h-2.5 w-2.5" />
                  {savedPercent.toFixed(1)}% shorter
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"
                >
                  <Route className="h-2.5 w-2.5" />
                  {formatDist(savedDistance)} saved
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] gap-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 border-0"
                >
                  <Clock className="h-2.5 w-2.5" />
                  {formatDuration(savedTime)} faster
                </Badge>
              </div>

              {/* Optimized route order with reorder indicators */}
              <div className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Optimized Stop Order
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {optimizedPreview.map((point, idx) => {
                    const wasReordered = reorderedIndices.has(idx)
                    // Find original index of this point
                    const originalIdx = routePoints.findIndex(
                      (p) => p.latitude === point.latitude && p.longitude === point.longitude
                    )
                    return (
                      <motion.div
                        key={`${point.latitude}-${point.longitude}-${idx}`}
                        initial={routeOptimized ? { x: -10, opacity: 0 } : false}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        className={cn(
                          'flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-colors',
                          wasReordered
                            ? 'bg-amber-500/10 border border-amber-500/20'
                            : 'bg-muted/30'
                        )}
                      >
                        <span
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                            idx === 0
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : idx === optimizedPreview.length - 1
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                : 'bg-primary/10 text-primary'
                          )}
                        >
                          {idx === 0 ? 'A' : idx === optimizedPreview.length - 1 ? 'B' : idx + 1}
                        </span>
                        <span className="font-mono tabular-nums text-[11px]">
                          {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                        </span>
                        {point.name && (
                          <span className="text-muted-foreground truncate text-[10px]">
                            {point.name}
                          </span>
                        )}
                        {wasReordered && originalIdx >= 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-[8px] px-1 py-0 h-4 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0 shrink-0"
                          >
                            #{originalIdx + 1}→#{idx + 1}
                          </Badge>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optimized indicator when comparison is hidden */}
      {routeOptimized && !showComparison && savedDistance > 0 && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Zap className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
            Optimized: {savedPercent.toFixed(1)}% shorter ({formatDist(savedDistance)} saved)
          </span>
        </div>
      )}
    </div>
  )
}
