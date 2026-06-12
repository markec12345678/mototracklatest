'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type DifficultyAnalysis, type RouteSegment, type MapRoute } from '@/lib/map-store'
import { TrendingUp, Mountain, Clock, Droplets, Sun, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function fetchElevation(latitude: number, longitude: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.elevation?.[0] ?? null
  } catch {
    return null
  }
}

async function fetchElevationsBatch(
  coordinates: [number, number][]
): Promise<(number | null)[]> {
  // Open-Meteo supports batch requests
  const lats = coordinates.map((c) => c[1]).join(',')
  const lngs = coordinates.map((c) => c[0]).join(',')
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`
    )
    if (!res.ok) {
      // Fallback: individual requests
      return Promise.all(coordinates.map((c) => fetchElevation(c[1], c[0])))
    }
    const data = await res.json()
    return data.elevation ?? coordinates.map(() => null)
  } catch {
    return coordinates.map(() => null)
  }
}

function calculateDifficulty(
  distanceKm: number,
  totalGain: number,
  maxGrade: number
): { difficulty: DifficultyAnalysis['difficulty']; score: number } {
  let score = 0
  // Distance contribution (0-30 points)
  score += Math.min(30, (distanceKm / 30) * 30)
  // Elevation gain contribution (0-40 points)
  score += Math.min(40, (totalGain / 2000) * 40)
  // Max grade contribution (0-30 points)
  score += Math.min(30, (maxGrade / 30) * 30)

  score = Math.round(Math.min(100, Math.max(1, score)))

  let difficulty: DifficultyAnalysis['difficulty']
  if (score <= 20) difficulty = 'easy'
  else if (score <= 40) difficulty = 'moderate'
  else if (score <= 60) difficulty = 'hard'
  else if (score <= 80) difficulty = 'very-hard'
  else difficulty = 'expert'

  return { difficulty, score }
}

function estimateNaismithTime(distanceKm: number, totalGain: number): number {
  // Naismith's Rule: 1 hour per 5 km + 1 hour per 600m ascent
  const baseMinutes = (distanceKm / 5) * 60
  const ascentMinutes = (totalGain / 600) * 60
  return Math.round(baseMinutes + ascentMinutes)
}

function getSegmentDifficulty(grade: number): string {
  const absGrade = Math.abs(grade)
  if (absGrade < 3) return 'Easy'
  if (absGrade < 6) return 'Moderate'
  if (absGrade < 10) return 'Steep'
  if (absGrade < 15) return 'Very Steep'
  return 'Extreme'
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy': return '#22c55e'
    case 'Moderate': return '#eab308'
    case 'Steep': return '#f97316'
    case 'Very Steep': return '#ef4444'
    case 'Extreme': return '#991b1b'
    default: return '#6b7280'
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  return `${h}h ${m}min`
}

export function RouteDifficultyAnalyzer() {
  const open = useMapStore((s) => s.difficultyAnalyzerOpen)
  const setOpen = useMapStore((s) => s.setDifficultyAnalyzerOpen)
  const difficultyAnalysis = useMapStore((s) => s.difficultyAnalysis)
  const setDifficultyAnalysis = useMapStore((s) => s.setDifficultyAnalysis)
  const routes = useMapStore((s) => s.routes)

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [elevations, setElevations] = useState<number[]>([])

  const selectedRoute = routes.find((r) => r.id === selectedRouteId)

  const analyzeRoute = useCallback(async () => {
    if (!selectedRoute || selectedRoute.points.length < 2) {
      toast.error('Select a route with at least 2 points')
      return
    }

    setAnalyzing(true)
    try {
      const coords: [number, number][] = selectedRoute.points.map((p) => [p.longitude, p.latitude])
      
      // Sample points for elevation (max 50 to avoid API limits)
      let sampledCoords: [number, number][] = coords
      if (coords.length > 50) {
        const step = Math.floor(coords.length / 50)
        sampledCoords = coords.filter((_, i) => i % step === 0 || i === coords.length - 1)
      }

      const elevData = await fetchElevationsBatch(sampledCoords)
      const elevs = elevData.map((e) => e ?? 0)
      setElevations(elevs)

      // Calculate total distance
      let totalDistance = 0
      const segmentDistances: number[] = []
      for (let i = 1; i < coords.length; i++) {
        const d = haversineDistance(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0])
        totalDistance += d
        segmentDistances.push(d)
      }

      const totalDistanceKm = totalDistance / 1000

      // Calculate elevation gain/loss
      let totalGain = 0
      let totalLoss = 0
      const gradeData: { distance: number; grade: number; difficulty: string }[] = []
      let cumDist = 0
      const segments: RouteSegment[] = []

      for (let i = 1; i < elevs.length; i++) {
        const elevChange = elevs[i] - elevs[i - 1]
        if (elevChange > 0) totalGain += elevChange
        else totalLoss += Math.abs(elevChange)

        // Map sampled index back to original coords for distance
        const distStep = coords.length > 50 ? Math.floor(coords.length / 50) : 1
        const segDist = i < segmentDistances.length
          ? segmentDistances.slice(Math.max(0, (i - 1) * distStep), i * distStep).reduce((a, b) => a + b, 0) / 1000
          : totalDistanceKm / elevs.length
        cumDist += Math.max(segDist, 0.01)

        const grade = segDist > 0 ? (elevChange / (segDist * 1000)) * 100 : 0
        const segDiff = getSegmentDifficulty(grade)

        gradeData.push({
          distance: Math.round(cumDist * 10) / 10,
          grade: Math.round(grade * 10) / 10,
          difficulty: segDiff,
        })

        segments.push({
          startIndex: Math.max(0, (i - 1) * (coords.length > 50 ? distStep : 1)),
          endIndex: Math.min(coords.length - 1, i * (coords.length > 50 ? distStep : 1)),
          distance: segDist,
          elevationChange: elevChange,
          grade: Math.round(grade * 10) / 10,
          difficulty: segDiff,
        })
      }

      const maxGrade = segments.length > 0 ? Math.max(...segments.map((s) => Math.abs(s.grade))) : 0
      const avgGrade = segments.length > 0 ? segments.reduce((sum, s) => sum + Math.abs(s.grade), 0) / segments.length : 0
      const estimatedTime = estimateNaismithTime(totalDistanceKm, totalGain)

      const { difficulty, score } = calculateDifficulty(totalDistanceKm, totalGain, maxGrade)

      const analysis: DifficultyAnalysis = {
        routeId: selectedRoute.id,
        difficulty,
        score,
        totalGain: Math.round(totalGain),
        totalLoss: Math.round(totalLoss),
        maxGrade: Math.round(maxGrade * 10) / 10,
        avgGrade: Math.round(avgGrade * 10) / 10,
        estimatedTime,
        segments,
      }

      setDifficultyAnalysis(analysis)
    } catch {
      toast.error('Failed to analyze route')
    } finally {
      setAnalyzing(false)
    }
  }, [selectedRoute, setDifficultyAnalysis])

  const totalDistance = selectedRoute?.distance
    ? selectedRoute.distance / 1000
    : selectedRoute
      ? selectedRoute.points.reduce((acc, p, i, arr) => {
          if (i === 0) return 0
          return acc + haversineDistance(arr[i - 1].latitude, arr[i - 1].longitude, p.latitude, p.longitude) / 1000
        }, 0)
      : 0

  const sceneryScore = difficultyAnalysis
    ? Math.min(100, Math.round(
        (difficultyAnalysis.totalGain / 10) +
        (difficultyAnalysis.segments.filter((s) => Math.abs(s.grade) > 3).length /
          Math.max(1, difficultyAnalysis.segments.length)) * 50
      ))
    : 0

  const waterRequired = difficultyAnalysis
    ? Math.max(0.5, Math.round((difficultyAnalysis.estimatedTime / 60) * 0.5 + difficultyAnalysis.totalGain / 500) * 10) / 10
    : 0

  const restStops = difficultyAnalysis
    ? Math.max(1, Math.floor(totalDistance / 5) + Math.floor(difficultyAnalysis.totalGain / 500))
    : 0

  const difficultyColorMap: Record<string, string> = {
    easy: 'bg-emerald-500',
    moderate: 'bg-yellow-500',
    hard: 'bg-orange-500',
    'very-hard': 'bg-red-500',
    expert: 'bg-red-900',
  }

  const difficultyLabelMap: Record<string, string> = {
    easy: 'Easy',
    moderate: 'Moderate',
    hard: 'Hard',
    'very-hard': 'Very Hard',
    expert: 'Expert',
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Route Difficulty Analyzer
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Route Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Select Route</label>
            {routes.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 text-center">
                No routes available. Create a route first.
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {routes.map((route) => (
                  <Button
                    key={route.id}
                    variant={selectedRouteId === route.id ? 'default' : 'outline'}
                    size="sm"
                    className={`text-xs h-8 ${selectedRouteId === route.id ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                    onClick={() => {
                      setSelectedRouteId(route.id)
                      setDifficultyAnalysis(null)
                    }}
                  >
                    {route.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {selectedRoute && (
            <Button
              className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={analyzeRoute}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Analyze Route Difficulty
                </>
              )}
            </Button>
          )}

          {/* Analysis Results */}
          {difficultyAnalysis && (
            <div className="space-y-4">
              {/* Difficulty Rating */}
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-semibold">Difficulty Rating</span>
                  </div>
                  <Badge className={`${difficultyColorMap[difficultyAnalysis.difficulty]} text-white text-xs`}>
                    {difficultyLabelMap[difficultyAnalysis.difficulty]}
                  </Badge>
                </div>
                {/* Score bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Score</span>
                    <span>{difficultyAnalysis.score}/100</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${difficultyColorMap[difficultyAnalysis.difficulty]}`}
                      style={{ width: `${difficultyAnalysis.score}%` }}
                    />
                  </div>
                </div>
                {/* Star rating */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`h-4 w-4 rounded-sm ${
                        star <= Math.ceil(difficultyAnalysis.score / 20)
                          ? difficultyColorMap[difficultyAnalysis.difficulty]
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border p-3 space-y-1">
                  <div className="text-[10px] text-muted-foreground">Total Distance</div>
                  <div className="text-sm font-bold">{totalDistance.toFixed(1)} km</div>
                </div>
                <div className="rounded-xl border p-3 space-y-1">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Elevation Gain
                  </div>
                  <div className="text-sm font-bold text-emerald-600">+{difficultyAnalysis.totalGain}m</div>
                </div>
                <div className="rounded-xl border p-3 space-y-1">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 rotate-180" /> Elevation Loss
                  </div>
                  <div className="text-sm font-bold text-red-500">-{difficultyAnalysis.totalLoss}m</div>
                </div>
                <div className="rounded-xl border p-3 space-y-1">
                  <div className="text-[10px] text-muted-foreground">Max Grade</div>
                  <div className="text-sm font-bold">{difficultyAnalysis.maxGrade}%</div>
                </div>
                <div className="rounded-xl border p-3 space-y-1">
                  <div className="text-[10px] text-muted-foreground">Avg Grade</div>
                  <div className="text-sm font-bold">{difficultyAnalysis.avgGrade}%</div>
                </div>
                <div className="rounded-xl border p-3 space-y-1">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Est. Time
                  </div>
                  <div className="text-sm font-bold">{formatDuration(difficultyAnalysis.estimatedTime)}</div>
                </div>
              </div>

              {/* Grade Profile Chart */}
              {difficultyAnalysis.segments.length > 0 && (
                <div className="rounded-xl border p-4 space-y-2">
                  <h4 className="text-xs font-semibold">Grade Profile</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                      data={difficultyAnalysis.segments.map((s, i) => ({
                        name: `${((i + 1) * s.distance).toFixed(1)}km`,
                        grade: s.grade,
                        difficulty: s.difficulty,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} unit="%" />
                      <RechartsTooltip
                        contentStyle={{ fontSize: 11 }}
                        formatter={(value: number) => [`${value}%`, 'Grade']}
                      />
                      <Area
                        type="monotone"
                        dataKey="grade"
                        stroke="#10b981"
                        fill="#10b98133"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Bar chart with difficulty colors */}
                  <h4 className="text-xs font-semibold mt-4">Segment Difficulty</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart
                      data={difficultyAnalysis.segments.map((s, i) => ({
                        name: `${i + 1}`,
                        grade: Math.abs(s.grade),
                        difficulty: s.difficulty,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} label={{ value: 'Segment', position: 'insideBottom', offset: -2, fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} unit="%" />
                      <RechartsTooltip
                        contentStyle={{ fontSize: 11 }}
                        formatter={(value: number, _name: string, props: { payload: { difficulty: string } }) => [`${value}% (${props.payload.difficulty})`, 'Grade']}
                      />
                      <Bar dataKey="grade" radius={[2, 2, 0, 0]}>
                        {difficultyAnalysis.segments.map((s, i) => (
                          <Cell key={i} fill={getDifficultyColor(s.difficulty)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Segment Analysis */}
              {difficultyAnalysis.segments.length > 0 && (
                <div className="rounded-xl border p-4 space-y-2">
                  <h4 className="text-xs font-semibold">Segment Analysis</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {difficultyAnalysis.segments.map((seg, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 rounded-lg p-2 text-xs ${
                          seg.difficulty === 'Very Steep' || seg.difficulty === 'Extreme'
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'bg-muted/30'
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getDifficultyColor(seg.difficulty) }}
                        />
                        <span className="font-medium min-w-[60px]">Seg {i + 1}</span>
                        <span className="text-muted-foreground min-w-[60px]">{seg.distance.toFixed(2)} km</span>
                        <span className={`min-w-[60px] ${seg.elevationChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {seg.elevationChange >= 0 ? '+' : ''}{Math.round(seg.elevationChange)}m
                        </span>
                        <span className="min-w-[50px]">{seg.grade}%</span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0"
                          style={{ backgroundColor: getDifficultyColor(seg.difficulty) + '22', color: getDifficultyColor(seg.difficulty) }}
                        >
                          {seg.difficulty}
                        </Badge>
                        {(seg.difficulty === 'Very Steep' || seg.difficulty === 'Extreme') && (
                          <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="rounded-xl border p-4 space-y-3">
                <h4 className="text-xs font-semibold">Recommendations</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <Clock className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Rest Stops</p>
                      <p className="text-[10px] text-muted-foreground">
                        Plan {restStops} rest stop{restStops !== 1 ? 's' : ''} along the route
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <Droplets className="h-4 w-4 text-sky-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Water Requirements</p>
                      <p className="text-[10px] text-muted-foreground">
                        Bring at least {waterRequired}L of water
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <Sun className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Best Time</p>
                      <p className="text-[10px] text-muted-foreground">
                        {difficultyAnalysis.difficulty === 'easy' || difficultyAnalysis.difficulty === 'moderate'
                          ? 'Any time of day is suitable'
                          : difficultyAnalysis.difficulty === 'hard'
                            ? 'Start early morning to avoid heat'
                            : 'Start before dawn, avoid midday sun'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Required Fitness</p>
                      <p className="text-[10px] text-muted-foreground">
                        {difficultyAnalysis.difficulty === 'easy'
                          ? 'Beginner friendly, no special fitness required'
                          : difficultyAnalysis.difficulty === 'moderate'
                            ? 'Basic fitness, can walk 2+ hours comfortably'
                            : difficultyAnalysis.difficulty === 'hard'
                              ? 'Good fitness, regular hiking experience recommended'
                              : difficultyAnalysis.difficulty === 'very-hard'
                                ? 'Excellent fitness, advanced hiking experience required'
                                : 'Elite fitness level, expert mountaineering experience essential'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scenery Score */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <Mountain className="h-4 w-4 text-emerald-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">Scenery Score</p>
                      <span className="text-xs font-bold text-emerald-600">{sceneryScore}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${sceneryScore}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Based on elevation variation and terrain diversity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
