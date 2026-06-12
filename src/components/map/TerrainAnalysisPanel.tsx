'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Mountain, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useMapStore, type MapRoute } from '@/lib/map-store'

interface TerrainData {
  totalAscent: number
  totalDescent: number
  maxElevation: number
  minElevation: number
  averageSlope: number
  maxSlope: number
  slopeProfile: { distance: number; slope: number; elevation: number }[]
  terrainType: 'flat' | 'rolling' | 'hilly' | 'mountainous'
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme'
  elevationRange: number
}

const TERRAIN_COLORS: Record<string, string> = {
  flat: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  rolling: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  hilly: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  mountainous: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500',
  moderate: 'bg-amber-500',
  hard: 'bg-orange-500',
  extreme: 'bg-red-500',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '🟢 Easy',
  moderate: '🟡 Moderate',
  hard: '🟠 Hard',
  extreme: '🔴 Extreme',
}

export function TerrainAnalysisPanel() {
  const terrainAnalysisRouteId = useMapStore((s) => s.terrainAnalysisRouteId)
  const setTerrainAnalysisRouteId = useMapStore((s) => s.setTerrainAnalysisRouteId)
  const routes = useMapStore((s) => s.routes)

  const route = routes.find((r) => r.id === terrainAnalysisRouteId) ?? null

  const routeId = route?.id ?? null
  const routePoints = route?.points

  const [terrainData, setTerrainData] = useState<TerrainData | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const fetchIdRef = useRef(0)

  // Reset when route changes - derived state instead of setState in effect
  const effectiveData = routeId ? terrainData : null
  const effectiveError = routeId ? fetchError : null
  const loading = routeId ? fetching : false

  const fetchTerrain = useCallback(async (points: { lng: number; lat: number }[]) => {
    const fetchId = ++fetchIdRef.current
    setFetching(true)
    setFetchError(null)

    try {
      const res = await fetch('/api/terrain-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points }),
      })
      if (!res.ok) throw new Error('Failed to analyze terrain')
      const data = await res.json()
      if (fetchId === fetchIdRef.current) {
        setTerrainData(data)
        setFetching(false)
      }
    } catch (err) {
      if (fetchId === fetchIdRef.current) {
        setFetchError(err instanceof Error ? err.message : 'Failed to analyze terrain')
        setFetching(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!routePoints || routePoints.length < 2) return
    fetchTerrain(routePoints.map((p) => ({ lng: p.longitude, lat: p.latitude })))
  }, [routePoints, fetchTerrain])

  if (!terrainAnalysisRouteId || !route) return null

  return (
    <Card className="w-[480px] max-w-[calc(100vw-40px)] shadow-xl border-border/50 bg-background/95 backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mountain className="h-4 w-4 text-primary" />
            Terrain Analysis
            {route && (
              <Badge variant="outline" className="text-[10px] font-normal">
                {route.name}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setTerrainAnalysisRouteId(null)}
            aria-label="Close terrain analysis"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
                <Mountain className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Analyzing terrain...</p>
          </div>
        )}

        {effectiveError && (
          <div className="text-center py-4 text-xs text-destructive">
            Failed to analyze terrain. Please try again.
          </div>
        )}

        {effectiveData && !loading && (
          <>
            {/* Overview badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs border ${TERRAIN_COLORS[effectiveData.terrainType]}`}>
                {effectiveData.terrainType.charAt(0).toUpperCase() + effectiveData.terrainType.slice(1)} Terrain
              </Badge>
              <Badge variant="outline" className="text-xs">
                {DIFFICULTY_LABELS[effectiveData.difficulty]}
              </Badge>
            </div>

            {/* Difficulty meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Difficulty</span>
                <span className="font-medium">{effectiveData.difficulty.charAt(0).toUpperCase() + effectiveData.difficulty.slice(1)}</span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
                <div
                  className={`rounded-full transition-all duration-500 ${DIFFICULTY_COLORS[effectiveData.difficulty]}`}
                  style={{
                    width: `${effectiveData.difficulty === 'easy' ? 25 : effectiveData.difficulty === 'moderate' ? 50 : effectiveData.difficulty === 'hard' ? 75 : 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground/60">
                <span>Easy</span>
                <span>Moderate</span>
                <span>Hard</span>
                <span>Extreme</span>
              </div>
            </div>

            {/* Statistics grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border p-2.5 space-y-1">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Total Ascent
                </div>
                <div className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  +{effectiveData.totalAscent} m
                </div>
              </div>
              <div className="rounded-lg border p-2.5 space-y-1">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 rotate-180" />
                  Total Descent
                </div>
                <div className="text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                  -{effectiveData.totalDescent} m
                </div>
              </div>
              <div className="rounded-lg border p-2.5 space-y-1">
                <div className="text-[10px] text-muted-foreground">Max Elevation</div>
                <div className="text-sm font-semibold tabular-nums">
                  {effectiveData.maxElevation} m
                </div>
              </div>
              <div className="rounded-lg border p-2.5 space-y-1">
                <div className="text-[10px] text-muted-foreground">Min Elevation</div>
                <div className="text-sm font-semibold tabular-nums">
                  {effectiveData.minElevation} m
                </div>
              </div>
              <div className="rounded-lg border p-2.5 space-y-1">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Avg Slope
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {effectiveData.averageSlope}%
                </div>
              </div>
              <div className="rounded-lg border p-2.5 space-y-1">
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Max Slope
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {effectiveData.maxSlope}%
                </div>
              </div>
            </div>

            {/* Elevation area chart */}
            {effectiveData.slopeProfile.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Elevation Profile</h4>
                <div className="h-36 rounded-lg border bg-muted/10 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={effectiveData.slopeProfile} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                      <defs>
                        <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="distance"
                        tick={{ fontSize: 9 }}
                        tickFormatter={(v: number) => `${Math.round(v / 1000)}km`}
                      />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `${v}m`} />
                      <Tooltip
                        contentStyle={{
                          fontSize: 10,
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--background)',
                        }}
                        formatter={(value: number) => [`${value}m`, 'Elevation']}
                        labelFormatter={(label: number) => `Distance: ${Math.round(label)}m`}
                      />
                      <Area
                        type="monotone"
                        dataKey="elevation"
                        stroke="#10b981"
                        fill="url(#elevGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Slope line chart */}
            {effectiveData.slopeProfile.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Slope Profile</h4>
                <div className="h-28 rounded-lg border bg-muted/10 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={effectiveData.slopeProfile} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                      <XAxis
                        dataKey="distance"
                        tick={{ fontSize: 9 }}
                        tickFormatter={(v: number) => `${Math.round(v / 1000)}km`}
                      />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: number) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          fontSize: 10,
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--background)',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Slope']}
                        labelFormatter={(label: number) => `Distance: ${Math.round(label)}m`}
                      />
                      <Line
                        type="monotone"
                        dataKey="slope"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
