'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  X,
  Download,
  Timer,
  Gauge,
  Mountain,
  Flame,
  Clock,
  ArrowUpDown,
  TrendingUp,
  Activity,
  FileJson,
  FileSpreadsheet,
  Pause,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type TrackRecording, type TrackPoint } from '@/lib/map-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface TrackStats {
  totalDistance: number // meters
  totalDuration: number // seconds
  avgSpeed: number // m/s
  maxSpeed: number // m/s
  elevationGain: number // meters
  elevationLoss: number // meters
  minElevation: number | null
  maxElevation: number | null
  movingTime: number // seconds
  stoppedTime: number // seconds
  avgPace: number // seconds per km
  caloriesEstimate: number
  speedData: { time: number; speed: number }[]
  elevationData: { distance: number; elevation: number | null }[]
}

function computeTrackStats(track: TrackRecording): TrackStats {
  const points = track.points
  if (points.length === 0) {
    return {
      totalDistance: 0,
      totalDuration: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      elevationGain: 0,
      elevationLoss: 0,
      minElevation: null,
      maxElevation: null,
      movingTime: 0,
      stoppedTime: 0,
      avgPace: 0,
      caloriesEstimate: 0,
      speedData: [],
      elevationData: [],
    }
  }

  // Total duration
  const startTime = points[0].timestamp
  const endTime = points[points.length - 1].timestamp
  const totalDuration = (endTime - startTime) / 1000 // seconds

  // Calculate distances and speeds between consecutive points
  let totalDistance = track.distance || 0
  let maxSpeed = 0
  let movingTime = 0
  let stoppedTime = 0
  let elevationGain = 0
  let elevationLoss = 0
  let minElevation: number | null = null
  let maxElevation: number | null = null
  const speedData: { time: number; speed: number }[] = []
  const elevationData: { distance: number; elevation: number | null }[] = []
  let cumulativeDist = 0

  const STOPPED_THRESHOLD = 0.5 // m/s
  const R = 6371000 // Earth radius in meters

  for (let i = 0; i < points.length; i++) {
    const p = points[i]

    // Elevation tracking
    if (p.elevation !== null) {
      if (minElevation === null || p.elevation < minElevation) minElevation = p.elevation
      if (maxElevation === null || p.elevation > maxElevation) maxElevation = p.elevation
    }

    if (i > 0) {
      const prev = points[i - 1]
      const dLat = ((p.latitude - prev.latitude) * Math.PI) / 180
      const dLon = ((p.longitude - prev.longitude) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((prev.latitude * Math.PI) / 180) *
          Math.cos((p.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      cumulativeDist += dist

      const dt = (p.timestamp - prev.timestamp) / 1000
      const speed = dt > 0 ? dist / dt : 0

      if (speed > maxSpeed) maxSpeed = speed

      if (speed > STOPPED_THRESHOLD) {
        movingTime += dt
      } else {
        stoppedTime += dt
      }

      // Elevation gain/loss
      if (prev.elevation !== null && p.elevation !== null) {
        const elevDiff = p.elevation - prev.elevation
        if (elevDiff > 0) elevationGain += elevDiff
        else elevationLoss += Math.abs(elevDiff)
      }

      speedData.push({
        time: (p.timestamp - startTime) / 1000,
        speed: Math.round(speed * 3.6 * 10) / 10, // km/h
      })
    }

    elevationData.push({
      distance: Math.round(cumulativeDist),
      elevation: p.elevation,
    })
  }

  // Use computed distance if track.distance is not set
  if (!track.distance) {
    totalDistance = cumulativeDist
  }

  const avgSpeed = movingTime > 0 ? totalDistance / movingTime : 0
  const avgPace = avgSpeed > 0 ? 1000 / avgSpeed : 0 // seconds per km

  // Calorie estimation (rough): based on MET values
  // Walking ~4 MET, Running ~9 MET, Cycling ~8 MET
  // Calories = MET * weight(kg) * time(hours) - assume 70kg person
  const avgSpeedKmh = avgSpeed * 3.6
  let met = 4
  if (avgSpeedKmh > 20) met = 12 // fast cycling/running
  else if (avgSpeedKmh > 14) met = 10
  else if (avgSpeedKmh > 10) met = 8 // cycling
  else if (avgSpeedKmh > 7) met = 9.8 // running
  else if (avgSpeedKmh > 5) met = 7 // jogging
  else if (avgSpeedKmh > 3) met = 4.3 // brisk walk
  else met = 2 // slow walk
  // Terrain factor
  const terrainFactor = 1 + (elevationGain / Math.max(totalDistance, 1)) * 5
  const caloriesEstimate = Math.round(met * 70 * (movingTime / 3600) * terrainFactor)

  return {
    totalDistance,
    totalDuration,
    avgSpeed,
    maxSpeed,
    elevationGain,
    elevationLoss,
    minElevation,
    maxElevation,
    movingTime,
    stoppedTime,
    avgPace,
    caloriesEstimate,
    speedData: speedData.length > 200 ? downsample(speedData, 200) : speedData,
    elevationData: elevationData.length > 200 ? downsample(elevationData, 200) : elevationData,
  }
}

function downsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, i) => i % step === 0)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatPace(secondsPerKm: number): string {
  if (secondsPerKm <= 0 || !isFinite(secondsPerKm)) return '--:--'
  const mins = Math.floor(secondsPerKm / 60)
  const secs = Math.floor(secondsPerKm % 60)
  return `${mins}:${secs.toString().padStart(2, '0')} /km`
}

function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`
  return `${Math.round(meters)} m`
}

export function TrackStatsPanel() {
  const trackStatsPanelOpen = useMapStore((s) => s.trackStatsPanelOpen)
  const setTrackStatsPanelOpen = useMapStore((s) => s.setTrackStatsPanelOpen)
  const savedTracks = useMapStore((s) => s.savedTracks)
  const currentTrack = useMapStore((s) => s.currentTrack)
  const isRecording = useMapStore((s) => s.isRecording)

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')

  // Available tracks for selection
  const availableTracks = useMemo(() => {
    const tracks = [...savedTracks]
    if (isRecording && currentTrack.length > 1) {
      tracks.unshift({
        id: 'current-recording',
        name: 'Current Recording',
        color: '#ef4444',
        points: currentTrack,
        distance: 0,
        duration: 0,
        startedAt: new Date(currentTrack[0].timestamp).toISOString(),
        stoppedAt: null,
      })
    }
    return tracks
  }, [savedTracks, currentTrack, isRecording])

  const selectedTrack = useMemo(
    () => availableTracks.find((t) => t.id === selectedTrackId) || null,
    [availableTracks, selectedTrackId]
  )

  const stats = useMemo(
    () => (selectedTrack ? computeTrackStats(selectedTrack) : null),
    [selectedTrack]
  )

  const handleClose = useCallback(() => {
    setTrackStatsPanelOpen(false)
  }, [setTrackStatsPanelOpen])

  const handleExportJSON = useCallback(() => {
    if (!stats || !selectedTrack) return
    const exportData = {
      track: {
        name: selectedTrack.name,
        startedAt: selectedTrack.startedAt,
        stoppedAt: selectedTrack.stoppedAt,
        pointCount: selectedTrack.points.length,
      },
      statistics: {
        totalDistance: stats.totalDistance,
        totalDistanceFormatted: formatDistance(stats.totalDistance),
        totalDuration: stats.totalDuration,
        totalDurationFormatted: formatDuration(stats.totalDuration),
        averageSpeed: stats.avgSpeed,
        maxSpeed: stats.maxSpeed,
        elevationGain: stats.elevationGain,
        elevationLoss: stats.elevationLoss,
        minElevation: stats.minElevation,
        maxElevation: stats.maxElevation,
        movingTime: stats.movingTime,
        stoppedTime: stats.stoppedTime,
        averagePace: stats.avgPace,
        caloriesEstimate: stats.caloriesEstimate,
      },
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `track-stats-${selectedTrack.name.replace(/\s+/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Statistics exported as JSON')
  }, [stats, selectedTrack])

  const handleExportCSV = useCallback(() => {
    if (!stats || !selectedTrack) return
    const rows = [
      ['Metric', 'Value'],
      ['Track Name', selectedTrack.name],
      ['Total Distance (m)', stats.totalDistance.toFixed(1)],
      ['Total Duration (s)', stats.totalDuration.toFixed(1)],
      ['Average Speed (km/h)', (stats.avgSpeed * 3.6).toFixed(1)],
      ['Max Speed (km/h)', (stats.maxSpeed * 3.6).toFixed(1)],
      ['Elevation Gain (m)', stats.elevationGain.toFixed(1)],
      ['Elevation Loss (m)', stats.elevationLoss.toFixed(1)],
      ['Min Elevation (m)', stats.minElevation?.toFixed(1) ?? 'N/A'],
      ['Max Elevation (m)', stats.maxElevation?.toFixed(1) ?? 'N/A'],
      ['Moving Time (s)', stats.movingTime.toFixed(1)],
      ['Stopped Time (s)', stats.stoppedTime.toFixed(1)],
      ['Average Pace (min/km)', formatPace(stats.avgPace)],
      ['Calories Estimate (kcal)', stats.caloriesEstimate.toString()],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `track-stats-${selectedTrack.name.replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Statistics exported as CSV')
  }, [stats, selectedTrack])

  const distUnit = unitSystem === 'metric' ? 'km' : 'mi'
  const elevUnit = unitSystem === 'metric' ? 'm' : 'ft'
  const speedUnit = unitSystem === 'metric' ? 'km/h' : 'mph'
  const convertDist = (m: number) => unitSystem === 'metric' ? m / 1000 : m / 1609.34
  const convertElev = (m: number) => unitSystem === 'metric' ? m : m * 3.28084
  const convertSpeed = (ms: number) => unitSystem === 'metric' ? ms * 3.6 : ms * 2.23694

  return (
    <Dialog open={trackStatsPanelOpen} onOpenChange={setTrackStatsPanelOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            Track Statistics Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-2 flex items-center gap-2">
          <Select
            value={selectedTrackId || ''}
            onValueChange={(v) => setSelectedTrackId(v)}
          >
            <SelectTrigger className="w-[240px] h-8 text-xs">
              <SelectValue placeholder="Select a track..." />
            </SelectTrigger>
            <SelectContent>
              {availableTracks.map((track) => (
                <SelectItem key={track.id} value={track.id} className="text-xs">
                  {track.name} ({track.points.length} pts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={unitSystem} onValueChange={(v: 'metric' | 'imperial') => setUnitSystem(v)}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric" className="text-xs">Metric</SelectItem>
              <SelectItem value="imperial" className="text-xs">Imperial</SelectItem>
            </SelectContent>
          </Select>

          {stats && (
            <div className="ml-auto flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleExportJSON}>
                <FileJson className="h-3 w-3" />
                JSON
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleExportCSV}>
                <FileSpreadsheet className="h-3 w-3" />
                CSV
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <ScrollArea className="max-h-[70vh]">
          <div className="p-4">
            {!selectedTrack ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No track selected</p>
                <p className="text-xs mt-1">Select a track from the dropdown to view statistics</p>
              </div>
            ) : !stats ? null : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTrackId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <StatCard
                      icon={<Timer className="h-4 w-4" />}
                      label="Distance"
                      value={`${convertDist(stats.totalDistance).toFixed(2)}`}
                      unit={distUnit}
                      color="emerald"
                    />
                    <StatCard
                      icon={<Clock className="h-4 w-4" />}
                      label="Duration"
                      value={formatDuration(stats.totalDuration)}
                      unit=""
                      color="cyan"
                    />
                    <StatCard
                      icon={<Gauge className="h-4 w-4" />}
                      label="Avg Speed"
                      value={`${convertSpeed(stats.avgSpeed).toFixed(1)}`}
                      unit={speedUnit}
                      color="amber"
                    />
                    <StatCard
                      icon={<Gauge className="h-4 w-4" />}
                      label="Max Speed"
                      value={`${convertSpeed(stats.maxSpeed).toFixed(1)}`}
                      unit={speedUnit}
                      color="red"
                    />
                  </div>

                  {/* Elevation Stats */}
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                      <Mountain className="h-3.5 w-3.5 text-amber-500" />
                      Elevation
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <MiniStat label="Gain" value={`${convertElev(stats.elevationGain).toFixed(0)}`} unit={elevUnit} positive />
                      <MiniStat label="Loss" value={`${convertElev(stats.elevationLoss).toFixed(0)}`} unit={elevUnit} negative />
                      <MiniStat label="Min" value={stats.minElevation !== null ? `${convertElev(stats.minElevation).toFixed(0)}` : 'N/A'} unit={stats.minElevation !== null ? elevUnit : ''} />
                      <MiniStat label="Max" value={stats.maxElevation !== null ? `${convertElev(stats.maxElevation).toFixed(0)}` : 'N/A'} unit={stats.maxElevation !== null ? elevUnit : ''} />
                    </div>
                  </div>

                  {/* Pace & Time Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Pace Calculator */}
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
                        Pace
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Average Pace</span>
                          <span className="font-mono font-semibold">
                            {unitSystem === 'metric' ? formatPace(stats.avgPace) : formatPace(stats.avgPace * 1.60934)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Pace Unit</span>
                          <span className="font-mono">{unitSystem === 'metric' ? 'min/km' : 'min/mi'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Moving vs Stopped */}
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                        <ArrowUpDown className="h-3.5 w-3.5 text-purple-500" />
                        Time Breakdown
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Play className="h-3 w-3 text-emerald-500" /> Moving
                          </span>
                          <span className="font-mono font-semibold">{formatDuration(stats.movingTime)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Pause className="h-3 w-3 text-red-400" /> Stopped
                          </span>
                          <span className="font-mono font-semibold">{formatDuration(stats.stoppedTime)}</span>
                        </div>
                        {/* Time bar */}
                        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                          {stats.movingTime + stats.stoppedTime > 0 && (
                            <>
                              <div
                                className="bg-emerald-500 h-full transition-all"
                                style={{ width: `${(stats.movingTime / (stats.movingTime + stats.stoppedTime)) * 100}%` }}
                              />
                              <div
                                className="bg-red-400 h-full transition-all"
                                style={{ width: `${(stats.stoppedTime / (stats.movingTime + stats.stoppedTime)) * 100}%` }}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calories Estimate */}
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                    <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                      <Flame className="h-3.5 w-3.5 text-orange-500" />
                      Calories Burned Estimate
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-orange-500 tabular-nums">
                        {stats.caloriesEstimate}
                      </span>
                      <span className="text-xs text-muted-foreground">kcal</span>
                      <Badge variant="secondary" className="text-[10px] ml-auto">
                        ~70kg rider, incl. terrain factor
                      </Badge>
                    </div>
                  </div>

                  {/* Speed Distribution Chart */}
                  {stats.speedData.length > 1 && (
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-3">
                        <Gauge className="h-3.5 w-3.5 text-cyan-500" />
                        Speed Over Time
                      </h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.speedData}>
                            <defs>
                              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="time"
                              tick={{ fontSize: 10 }}
                              tickFormatter={(v: number) => {
                                const m = Math.floor(v / 60)
                                const s = Math.floor(v % 60)
                                return m > 0 ? `${m}m` : `${s}s`
                              }}
                              stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis
                              tick={{ fontSize: 10 }}
                              stroke="hsl(var(--muted-foreground))"
                              tickFormatter={(v: number) => `${v}`}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                fontSize: 11,
                                borderRadius: 8,
                                border: '1px solid hsl(var(--border))',
                                backgroundColor: 'hsl(var(--popover))',
                                color: 'hsl(var(--popover-foreground))',
                              }}
                              formatter={(value: number) => [`${value.toFixed(1)} ${speedUnit}`, 'Speed']}
                              labelFormatter={(label: number) => {
                                const m = Math.floor(label / 60)
                                const s = Math.floor(label % 60)
                                return `${m}m ${s}s`
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="speed"
                              stroke="#06b6d4"
                              strokeWidth={2}
                              fill="url(#speedGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Elevation Profile Chart */}
                  {stats.elevationData.length > 1 && stats.elevationData.some((d) => d.elevation !== null) && (
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <h4 className="text-xs font-semibold flex items-center gap-1.5 mb-3">
                        <Mountain className="h-3.5 w-3.5 text-amber-500" />
                        Elevation Profile
                      </h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats.elevationData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis
                              dataKey="distance"
                              tick={{ fontSize: 10 }}
                              stroke="hsl(var(--muted-foreground))"
                              tickFormatter={(v: number) => {
                                const km = v / 1000
                                return km >= 1 ? `${km.toFixed(1)}` : `${v}`
                              }}
                            />
                            <YAxis
                              tick={{ fontSize: 10 }}
                              stroke="hsl(var(--muted-foreground))"
                              tickFormatter={(v: number) => `${Math.round(convertElev(v))}`}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                fontSize: 11,
                                borderRadius: 8,
                                border: '1px solid hsl(var(--border))',
                                backgroundColor: 'hsl(var(--popover))',
                                color: 'hsl(var(--popover-foreground))',
                              }}
                              formatter={(value: number | null) => [
                                value !== null ? `${convertElev(value).toFixed(0)} ${elevUnit}` : 'N/A',
                                'Elevation',
                              ]}
                              labelFormatter={(label: number) => `${convertDist(label).toFixed(2)} ${distUnit}`}
                            />
                            <Line
                              type="monotone"
                              dataKey="elevation"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  color: 'emerald' | 'cyan' | 'amber' | 'red'
}) {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-500/10',
    cyan: 'text-cyan-500 bg-cyan-500/10',
    amber: 'text-amber-500 bg-amber-500/10',
    red: 'text-red-500 bg-red-500/10',
  }

  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
      <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center mb-1.5', colorMap[color])}>
        {icon}
      </div>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold tabular-nums leading-tight">
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function MiniStat({
  label,
  value,
  unit,
  positive,
  negative,
}: {
  label: string
  value: string
  unit: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn(
        'text-sm font-semibold tabular-nums',
        positive && 'text-emerald-500',
        negative && 'text-red-400',
      )}>
        {value}
        {unit && <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>}
      </p>
    </div>
  )
}
