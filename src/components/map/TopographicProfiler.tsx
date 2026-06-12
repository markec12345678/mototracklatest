'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mountain,
  PenLine,
  Trash2,
  Grid3x3,
  Tag,
  Loader2,
  ArrowDown,
  ArrowUp,
  Ruler,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useMapStore, type TopoProfilePoint } from '@/lib/map-store'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function TopographicProfiler() {
  const topoProfiler = useMapStore((s) => s.topoProfiler)
  const setTopoProfiler = useMapStore((s) => s.setTopoProfiler)
  const center = useMapStore((s) => s.center)

  const [loading, setLoading] = useState(false)
  const clickPointsRef = useRef<{ lat: number; lng: number }[]>([])

  const open = topoProfiler.open

  const handleClose = useCallback((value: boolean) => {
    if (!value) {
      setTopoProfiler({ open: false, isDrawing: false })
    }
  }, [setTopoProfiler])

  const handleToggleDraw = useCallback(() => {
    if (!topoProfiler.isDrawing) {
      clickPointsRef.current = []
      setTopoProfiler({ isDrawing: true })
      toast.info('Click on the map to add profile points')
    } else {
      setTopoProfiler({ isDrawing: false })
    }
  }, [topoProfiler.isDrawing, setTopoProfiler])

  const handleAddProfilePoint = useCallback(async (lat: number, lng: number) => {
    if (typeof window === 'undefined') return
    clickPointsRef.current.push({ lat, lng })
    const points = clickPointsRef.current

    if (points.length < 2) {
      toast.info('Add at least one more point to create a profile')
      return
    }

    setLoading(true)
    try {
      const latitudes = points.map((p) => p.lat).join(',')
      const longitudes = points.map((p) => p.lng).join(',')
      const res = await fetch(
        `https://api.open-meteo.com/v1/elevation?latitude=${latitudes}&longitude=${longitudes}`
      )
      if (!res.ok) throw new Error('Elevation API failed')
      const data = await res.json()
      const elevations: number[] = data.elevation || []

      let totalDistance = 0
      let totalAscent = 0
      let totalDescent = 0
      let maxElev = -Infinity
      let minElev = Infinity

      const profilePoints: TopoProfilePoint[] = points.map((p, i) => {
        const elevation = elevations[i] ?? 0
        let distance = 0
        if (i > 0) {
          distance = haversineDistance(points[i - 1].lat, points[i - 1].lng, p.lat, p.lng)
        }
        totalDistance += distance

        if (i > 0) {
          const diff = elevation - (elevations[i - 1] ?? 0)
          if (diff > 0) totalAscent += diff
          else totalDescent += Math.abs(diff)
        }
        maxElev = Math.max(maxElev, elevation)
        minElev = Math.min(minElev, elevation)

        return { distance: totalDistance, elevation, lat: p.lat, lng: p.lng }
      })

      setTopoProfiler({
        profilePoints,
        totalDistance,
        totalAscent,
        totalDescent,
        maxElevation: maxElev === -Infinity ? 0 : maxElev,
        minElevation: minElev === Infinity ? 0 : minElev,
      })
      toast.success(`Profile calculated with ${points.length} points`)
    } catch {
      toast.error('Failed to fetch elevation data')
    } finally {
      setLoading(false)
    }
  }, [setTopoProfiler])

  const handleClearProfile = useCallback(() => {
    clickPointsRef.current = []
    setTopoProfiler({
      profilePoints: [],
      totalDistance: 0,
      totalAscent: 0,
      totalDescent: 0,
      maxElevation: 0,
      minElevation: 0,
      isDrawing: false,
    })
    toast.info('Profile cleared')
  }, [setTopoProfiler])

  const formatDistance = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(0)} m`
  const formatElevation = (m: number) => `${m.toFixed(1)} m`

  const chartData = topoProfiler.profilePoints.map((p) => ({
    distance: Number((p.distance / 1000).toFixed(3)),
    elevation: p.elevation * topoProfiler.verticalExaggeration,
    actualElevation: p.elevation,
  }))

  const stats = [
    { label: 'Distance', value: formatDistance(topoProfiler.totalDistance), icon: Ruler, color: 'text-emerald-600' },
    { label: 'Ascent', value: formatElevation(topoProfiler.totalAscent), icon: ArrowUp, color: 'text-amber-600' },
    { label: 'Descent', value: formatElevation(topoProfiler.totalDescent), icon: ArrowDown, color: 'text-teal-600' },
    { label: 'Max Elev', value: formatElevation(topoProfiler.maxElevation), icon: Maximize2, color: 'text-emerald-700' },
    { label: 'Min Elev', value: formatElevation(topoProfiler.minElevation), icon: Minimize2, color: 'text-amber-700' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 border-b bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-transparent">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mountain className="h-4.5 w-4.5 text-emerald-500" />
            Topographic Profiler
          </DialogTitle>
          <DialogDescription className="text-xs">
            Draw a path to generate elevation profiles
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-80px)]">
          <div className="p-4 space-y-4">
            {/* Draw Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={topoProfiler.isDrawing ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleToggleDraw}
              >
                <PenLine className="h-3.5 w-3.5" />
                {topoProfiler.isDrawing ? 'Stop Drawing' : 'Draw Path'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleClearProfile}
                disabled={topoProfiler.profilePoints.length === 0 && clickPointsRef.current.length === 0}
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </Button>
              {loading && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching elevation...
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-medium">V.Exaggeration</Label>
                <Slider
                  value={[topoProfiler.verticalExaggeration]}
                  min={1}
                  max={10}
                  step={0.5}
                  onValueChange={([v]) => setTopoProfiler({ verticalExaggeration: v })}
                  className="w-24"
                />
                <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
                  {topoProfiler.verticalExaggeration}x
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={topoProfiler.showGrid}
                  onCheckedChange={(v) => setTopoProfiler({ showGrid: v })}
                />
                <Label className="text-[10px]">
                  <Grid3x3 className="h-3 w-3 inline mr-0.5" /> Grid
                </Label>
              </div>
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={topoProfiler.showLabels}
                  onCheckedChange={(v) => setTopoProfiler({ showLabels: v })}
                />
                <Label className="text-[10px]">
                  <Tag className="h-3 w-3 inline mr-0.5" /> Labels
                </Label>
              </div>
            </div>

            {/* Elevation Chart */}
            {topoProfiler.profilePoints.length >= 2 ? (
              <div className="rounded-lg border bg-card p-3">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      {topoProfiler.showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                      )}
                      <XAxis
                        dataKey="distance"
                        tick={{ fontSize: 9 }}
                        label={topoProfiler.showLabels ? { value: 'Distance (km)', position: 'insideBottom', offset: -2, fontSize: 9 } : undefined}
                      />
                      <YAxis
                        tick={{ fontSize: 9 }}
                        label={topoProfiler.showLabels ? { value: 'Elevation (m)', angle: -90, position: 'insideLeft', fontSize: 9 } : undefined}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === 'elevation') return [`${(value / topoProfiler.verticalExaggeration).toFixed(1)} m`, 'Elevation']
                          return [value, name]
                        }}
                        labelFormatter={(label) => `${label} km`}
                        contentStyle={{ fontSize: 10 }}
                      />
                      <defs>
                        <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="elevation"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#elevGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <Mountain className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Draw a path with at least 2 points</p>
                <p className="text-[10px] mt-1">Click &quot;Draw Path&quot; then click on the map</p>
              </div>
            )}

            {/* Stats */}
            {topoProfiler.profilePoints.length >= 2 && (
              <div className="grid grid-cols-5 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center p-2 rounded-lg border bg-card">
                    <stat.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="text-xs font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Profile Points List */}
            {topoProfiler.profilePoints.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Profile Points ({topoProfiler.profilePoints.length})</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {topoProfiler.profilePoints.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded border text-[10px]">
                      <span className="text-muted-foreground">#{i + 1}</span>
                      <span className="font-mono">{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</span>
                      <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
                        {formatElevation(p.elevation)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
