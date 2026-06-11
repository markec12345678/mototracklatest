'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mountain, Loader2, Minus, Maximize2, TrendingUp, TrendingDown } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'
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

/** Format elevation for display */
function formatElevation(m: number): string {
  if (m < 0) return `${m.toFixed(0)} m`
  return `${m.toFixed(0)} m`
}

interface TooltipData {
  x: number
  y: number
  distance: number
  elevation: number
}

export function ElevationProfile() {
  const { toolMode, measurePoints } = useMapStore()
  const [elevations, setElevations] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch elevation data when measurePoints has 2+ points
  const fetchElevation = useCallback(async () => {
    if (measurePoints.length < 2) {
      setElevations([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const pointsParam = measurePoints
        .map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`)
        .join(';')

      const res = await fetch(`/api/elevation?points=${encodeURIComponent(pointsParam)}`)
      if (!res.ok) {
        throw new Error('Failed to fetch elevation data')
      }
      const data = await res.json()
      setElevations(data.elevations || [])
    } catch (err) {
      console.error('Elevation fetch error:', err)
      setError('Unable to fetch elevation data')
      setElevations([])
    } finally {
      setLoading(false)
    }
  }, [measurePoints])

  useEffect(() => {
    fetchElevation()
  }, [fetchElevation])

  // Compute cumulative distances for each point
  const distances = measurePoints.length >= 2
    ? measurePoints.reduce((acc, p, i) => {
        if (i === 0) {
          acc.push(0)
        } else {
          const prev = measurePoints[i - 1]
          const d = haversineDistance(prev.latitude, prev.longitude, p.latitude, p.longitude)
          acc.push(acc[i - 1] + d)
        }
        return acc
      }, [] as number[])
    : []

  const totalDistance = distances.length > 0 ? distances[distances.length - 1] : 0

  // Compute elevation stats
  const minElev = elevations.length > 0 ? Math.min(...elevations) : 0
  const maxElev = elevations.length > 0 ? Math.max(...elevations) : 0
  const minElevIdx = elevations.indexOf(minElev)
  const maxElevIdx = elevations.indexOf(maxElev)

  // Compute gain/loss
  let gain = 0
  let loss = 0
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1]
    if (diff > 0) gain += diff
    else if (diff < 0) loss += Math.abs(diff)
  }

  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || elevations.length < 2 || minimized) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const padding = { top: 10, right: 10, bottom: 20, left: 40 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom

    // Clear
    ctx.clearRect(0, 0, w, h)

    // Elevation range with some padding
    const elevRange = maxElev - minElev || 1
    const elevPad = elevRange * 0.1
    const yMin = minElev - elevPad
    const yMax = maxElev + elevPad
    const yRange = yMax - yMin

    // Helper functions
    const toX = (i: number) => padding.left + (distances[i] / (totalDistance || 1)) * chartW
    const toY = (elev: number) => padding.top + chartH - ((elev - yMin) / yRange) * chartH

    // Draw grid lines
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.5
    const gridLines = 4
    for (let i = 0; i <= gridLines; i++) {
      const yVal = yMin + (yRange / gridLines) * i
      const y = toY(yVal)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(w - padding.right, y)
      ctx.stroke()

      // Y-axis label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() || '#999'
      ctx.font = '9px system-ui'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${Math.round(yVal)}m`, padding.left - 4, y)
    }

    // X-axis labels
    const xLabels = Math.min(5, elevations.length)
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim() || '#999'
    ctx.font = '9px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let i = 0; i < xLabels; i++) {
      const idx = Math.round((elevations.length - 1) * (i / (xLabels - 1)))
      const x = toX(idx)
      ctx.fillText(formatDist(distances[idx]), x, h - padding.bottom + 4)
    }

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom)
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)')  // emerald-500 with alpha
    gradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.15)') // teal-500 with alpha
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0.02)')

    ctx.beginPath()
    ctx.moveTo(toX(0), toY(elevations[0]))
    for (let i = 1; i < elevations.length; i++) {
      ctx.lineTo(toX(i), toY(elevations[i]))
    }
    ctx.lineTo(toX(elevations.length - 1), h - padding.bottom)
    ctx.lineTo(toX(0), h - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(elevations[0]))
    for (let i = 1; i < elevations.length; i++) {
      ctx.lineTo(toX(i), toY(elevations[i]))
    }
    ctx.strokeStyle = '#10b981' // emerald-500
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    // Highlight highest point
    if (maxElevIdx >= 0) {
      ctx.beginPath()
      ctx.arc(toX(maxElevIdx), toY(maxElev), 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#10b981'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label
      ctx.fillStyle = '#10b981'
      ctx.font = 'bold 8px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`▲ ${Math.round(maxElev)}m`, toX(maxElevIdx), toY(maxElev) - 6)
    }

    // Highlight lowest point
    if (minElevIdx >= 0 && minElevIdx !== maxElevIdx) {
      ctx.beginPath()
      ctx.arc(toX(minElevIdx), toY(minElev), 3.5, 0, Math.PI * 2)
      ctx.fillStyle = '#f59e0b' // amber-500
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 8px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`▼ ${Math.round(minElev)}m`, toX(minElevIdx), toY(minElev) + 6)
    }

    // Draw start and end dots
    ctx.beginPath()
    ctx.arc(toX(0), toY(elevations[0]), 2.5, 0, Math.PI * 2)
    ctx.fillStyle = '#10b981'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(toX(elevations.length - 1), toY(elevations[elevations.length - 1]), 2.5, 0, Math.PI * 2)
    ctx.fillStyle = '#10b981'
    ctx.fill()
  }, [elevations, distances, totalDistance, minElev, maxElev, minElevIdx, maxElevIdx, minimized])

  // Handle mouse hover on chart
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (elevations.length < 2) return
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const w = rect.width
      const padding = { top: 10, right: 10, bottom: 20, left: 40 }
      const chartW = w - padding.left - padding.right

      // Find the closest point
      const relX = mouseX - padding.left
      const ratio = Math.max(0, Math.min(1, relX / chartW))
      const distance = ratio * totalDistance

      // Find the segment
      let idx = 0
      for (let i = 1; i < distances.length; i++) {
        if (distances[i] >= distance) {
          idx = i - 1
          break
        }
        if (i === distances.length - 1) idx = i - 1
      }

      // Interpolate elevation
      const nextIdx = Math.min(idx + 1, elevations.length - 1)
      const segDist = distances[nextIdx] - distances[idx]
      const t = segDist > 0 ? (distance - distances[idx]) / segDist : 0
      const elev = elevations[idx] + (elevations[nextIdx] - elevations[idx]) * t

      const h = rect.height
      const paddingY = { top: 10, bottom: 20 }
      const chartH = h - paddingY.top - paddingY.bottom
      const elevRange = maxElev - minElev || 1
      const elevPad = elevRange * 0.1
      const yMin = minElev - elevPad
      const yMax = maxElev + elevPad
      const yRange = yMax - yMin

      const tooltipY = paddingY.top + chartH - ((elev - yMin) / yRange) * chartH

      setTooltip({
        x: padding.left + ratio * chartW,
        y: tooltipY,
        distance,
        elevation: elev,
      })
    },
    [elevations, distances, totalDistance, minElev, maxElev]
  )

  const handleCanvasMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  // Don't render if not in measure mode
  if (toolMode !== 'measure') return null

  // Less than 2 points message
  if (measurePoints.length < 2) {
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
              Click on the map to add measurement points
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
        ref={containerRef}
        className="bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl overflow-hidden"
        style={{ width: 320, backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold">Elevation Profile</span>
          </div>
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
              ) : elevations.length >= 2 ? (
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full rounded-lg cursor-crosshair"
                    style={{ height: 150 }}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                  />
                  {/* Tooltip */}
                  {tooltip && (
                    <div
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: tooltip.x,
                        top: tooltip.y - 40,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="bg-background/95 border border-border/50 rounded-lg px-2 py-1 shadow-lg backdrop-blur-sm">
                        <div className="text-[10px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                          {formatElevation(tooltip.elevation)}
                        </div>
                        <div className="text-[9px] text-muted-foreground tabular-nums">
                          {formatDist(tooltip.distance)}
                        </div>
                      </div>
                      {/* Vertical line indicator */}
                      <div
                        className="absolute left-1/2 -translate-x-px bg-emerald-500/30"
                        style={{
                          width: 1,
                          height: tooltip.y - 10,
                          top: 40 - tooltip.y + 10,
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center" style={{ height: 150 }}>
                  <span className="text-xs text-muted-foreground">No elevation data</span>
                </div>
              )}
            </div>

            {/* Stats row */}
            {elevations.length >= 2 && !loading && (
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
