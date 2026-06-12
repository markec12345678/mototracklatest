'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mountain, Loader2, Minus, Maximize2, TrendingUp, TrendingDown, X } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { useMapStore, type MapRoute } from '@/lib/map-store'
import { cn } from '@/lib/utils'

/** Haversine distance in km between two lat/lng points */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** Format distance for display */
function formatDist(km: number): string {
  return km < 1
    ? `${Math.round(km * 1000)} m`
    : `${km.toFixed(1)} km`
}

interface ElevationDataPoint {
  distance: number
  elevation: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: ElevationDataPoint }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload
  return (
    <div className="bg-background/95 border border-border/50 rounded-lg px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
      <div className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
        {Math.round(data.elevation)} m
      </div>
      <div className="text-[10px] text-muted-foreground tabular-nums">
        {formatDist(data.distance)}
      </div>
    </div>
  )
}

interface ElevationProfileProps {
  /** If provided, show elevation for this specific route */
  route?: MapRoute | null
  /** Compact mode for sidebar embedding */
  compact?: boolean
}

export function ElevationProfile({ route, compact }: ElevationProfileProps) {
  const { toolMode, measurePoints, routePoints, elevationRouteId, routes, setElevationRouteId } = useMapStore()
  const [elevationData, setElevationData] = useState<ElevationDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minimized, setMinimized] = useState(false)
  const fetchedKeyRef = useRef('')

  // Determine the active route from elevationRouteId
  const activeRoute = route ?? (elevationRouteId ? routes.find((r) => r.id === elevationRouteId) ?? null : null)

  // Use routePoints in directions mode, measurePoints in measure mode, or a specific route
  const activePoints = activeRoute
    ? activeRoute.points
    : toolMode === 'directions'
      ? routePoints
      : measurePoints

  // Determine if we should show the profile
  const shouldShow = activeRoute || toolMode === 'measure' || toolMode === 'directions'

  // Build a cache key for the current points
  const pointsKey = activePoints.length >= 2
    ? activePoints.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(';')
    : ''

  // Fetch elevation data using POST for routes, GET for measure/directions
  const fetchElevation = useCallback(async () => {
    if (activePoints.length < 2) {
      setElevationData([])
      return
    }

    if (pointsKey === fetchedKeyRef.current) return

    setLoading(true)
    setError(null)

    try {
      if (activeRoute) {
        // Use POST endpoint for route elevation (with interpolation)
        const res = await fetch('/api/elevation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coordinates: activeRoute.points.map((p) => ({
              lng: p.longitude,
              lat: p.latitude,
            })),
          }),
        })
        if (!res.ok) throw new Error('Failed to fetch elevation data')
        const data = await res.json()
        setElevationData(data.points || [])
      } else {
        // Use GET endpoint for measure/directions (fewer points)
        const pointsParam = activePoints
          .map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`)
          .join(';')

        const res = await fetch(`/api/elevation?points=${encodeURIComponent(pointsParam)}`)
        if (!res.ok) throw new Error('Failed to fetch elevation data')
        const data = await res.json()
        const elevations: number[] = data.elevations || []

        // Build distance/elevation pairs
        let cumulativeDistance = 0
        const points: ElevationDataPoint[] = []
        for (let i = 0; i < elevations.length; i++) {
          if (i > 0) {
            const prev = activePoints[i - 1]
            const curr = activePoints[i]
            cumulativeDistance += haversineDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude)
          }
          points.push({ distance: Math.round(cumulativeDistance * 100) / 100, elevation: elevations[i] })
        }
        setElevationData(points)
      }
      fetchedKeyRef.current = pointsKey
    } catch (err) {
      console.error('Elevation fetch error:', err)
      setError('Unable to fetch elevation data')
      setElevationData([])
    } finally {
      setLoading(false)
    }
  }, [activePoints, activeRoute, pointsKey])

  useEffect(() => {
    fetchElevation()
  }, [fetchElevation])

  // Reset cache key when points change significantly
  useEffect(() => {
    if (pointsKey !== fetchedKeyRef.current) {
      fetchedKeyRef.current = ''
    }
  }, [pointsKey])

  // Compute stats
  const elevations = elevationData.map((p) => p.elevation)
  const totalDistance = elevationData.length > 0 ? elevationData[elevationData.length - 1].distance : 0
  const minElev = elevations.length > 0 ? Math.min(...elevations) : 0
  const maxElev = elevations.length > 0 ? Math.max(...elevations) : 0

  let gain = 0
  let loss = 0
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1]
    if (diff > 0) gain += diff
    else if (diff < 0) loss += Math.abs(diff)
  }

  // Don't render if not applicable
  if (!shouldShow) return null

  // Compact mode for sidebar
  if (compact) {
    return (
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            <span className="ml-2 text-xs text-muted-foreground">Loading elevation...</span>
          </div>
        ) : error ? (
          <div className="text-xs text-destructive text-center py-2">{error}</div>
        ) : elevationData.length >= 2 ? (
          <>
            <div style={{ width: '100%', height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={elevationData} margin={{ top: 2, right: 2, bottom: 2, left: -20 }}>
                  <defs>
                    <linearGradient id="elevGradientCompact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="distance" hide />
                  <YAxis domain={[minElev - (maxElev - minElev || 1) * 0.1, maxElev + (maxElev - minElev || 1) * 0.1]} hide />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="elevation"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#elevGradientCompact)"
                    animationDuration={600}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50">
                <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-[9px] text-muted-foreground">Gain</div>
                  <div className="text-[10px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +{Math.round(gain)}m
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50">
                <TrendingDown className="h-3 w-3 text-amber-500 shrink-0" />
                <div>
                  <div className="text-[9px] text-muted-foreground">Loss</div>
                  <div className="text-[10px] font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                    -{Math.round(loss)}m
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50">
                <Mountain className="h-3 w-3 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[9px] text-muted-foreground">Range</div>
                  <div className="text-[10px] font-semibold tabular-nums">
                    {Math.round(minElev)}-{Math.round(maxElev)}m
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-2">No elevation data</div>
        )}
      </div>
    )
  }

  // Full floating panel mode (bottom-left)
  // Less than 2 points message
  if (activePoints.length < 2 && !activeRoute) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl overflow-hidden"
          style={{ width: 300, backdropFilter: 'blur(20px) saturate(180%)' }}
        >
          <div className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Mountain className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRoute
                ? 'This route has no points'
                : toolMode === 'directions'
                  ? 'Click on the map to add route waypoints'
                  : 'Click on the map to add measurement points'}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl overflow-hidden"
        style={{ width: activeRoute ? 360 : 320, backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold">
              {activeRoute ? `Elevation: ${activeRoute.name}` : 'Elevation Profile'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {activeRoute && elevationRouteId && (
              <button
                onClick={() => setElevationRouteId(null)}
                className="p-1 hover:bg-background/50 rounded-lg transition-colors"
                aria-label="Close route elevation"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => setMinimized(!minimized)}
              className="p-1 hover:bg-background/50 rounded-lg transition-colors"
              aria-label={minimized ? 'Expand elevation panel' : 'Minimize elevation panel'}
            >
              {minimized ? (
                <Maximize2 className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Minus className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {!minimized && (
          <div className="px-3 pb-2">
            {/* Chart */}
            <div className="relative">
              {loading ? (
                <div className="flex items-center justify-center" style={{ height: 150 }}>
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  <span className="ml-2 text-xs text-muted-foreground">Loading elevation...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center" style={{ height: 150 }}>
                  <span className="text-xs text-destructive">{error}</span>
                </div>
              ) : elevationData.length >= 2 ? (
                <div style={{ width: '100%', height: 150 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={elevationData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                      <defs>
                        <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                      <XAxis
                        dataKey="distance"
                        tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                        tickFormatter={(v: number) => formatDist(v)}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[minElev - (maxElev - minElev || 1) * 0.1, maxElev + (maxElev - minElev || 1) * 0.1]}
                        tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
                        tickFormatter={(v: number) => `${Math.round(v)}m`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="elevation"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#elevGradient)"
                        animationDuration={600}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 150 }}>
                  <span className="text-xs text-muted-foreground">No elevation data</span>
                </div>
              )}
            </div>

            {/* Stats row */}
            {elevationData.length >= 2 && !loading && (
              <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50">
                  <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] text-muted-foreground leading-tight">Gain</div>
                    <div className="text-[11px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 leading-tight">
                      +{Math.round(gain)}m
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50">
                  <TrendingDown className="h-3 w-3 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] text-muted-foreground leading-tight">Loss</div>
                    <div className="text-[11px] font-semibold tabular-nums text-amber-600 dark:text-amber-400 leading-tight">
                      -{Math.round(loss)}m
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background/50">
                  <Mountain className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[9px] text-muted-foreground leading-tight">Range</div>
                    <div className="text-[11px] font-semibold tabular-nums leading-tight">
                      {Math.round(minElev)}-{Math.round(maxElev)}m
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Credit */}
            <p className="text-[8px] text-muted-foreground/50 mt-1 text-center">
              Elevation data from Open-Meteo.com
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
