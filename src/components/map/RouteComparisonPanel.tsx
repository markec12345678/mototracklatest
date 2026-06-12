'use client'

import { useMemo } from 'react'
import { X, Trophy, GitCompare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useMapStore, type MapRoute } from '@/lib/map-store'

function getRouteMetrics(route: MapRoute) {
  const distance = route.distance ?? 0
  const duration = route.duration ?? 0
  // Estimate elevation gain based on number of points and distance
  const estimatedElevationGain = distance > 0 ? Math.round(distance * 15 + route.points.length * 2) : 0
  // Estimate number of turns from route points
  let turns = 0
  if (route.points.length >= 3) {
    for (let i = 1; i < route.points.length - 1; i++) {
      const prev = route.points[i - 1]
      const curr = route.points[i]
      const next = route.points[i + 1]
      const bearing1 = Math.atan2(curr.longitude - prev.longitude, curr.latitude - prev.latitude)
      const bearing2 = Math.atan2(next.longitude - curr.longitude, next.latitude - curr.latitude)
      let angleDiff = Math.abs(bearing2 - bearing1) * (180 / Math.PI)
      if (angleDiff > 180) angleDiff = 360 - angleDiff
      if (angleDiff > 30) turns++
    }
  }

  return {
    name: route.name,
    color: route.color,
    distance: Math.round(distance * 10) / 10, // km
    duration: Math.round(duration / 60), // min
    elevationGain: estimatedElevationGain, // m
    turns,
    points: route.points.length,
    profile: distance < 5 ? 'Short' : distance < 20 ? 'Medium' : distance < 100 ? 'Long' : 'Ultra',
  }
}

function getWinner<T extends Record<string, unknown>>(
  routes: T[],
  key: keyof T,
  lowerIsBetter: boolean = true
): number {
  if (routes.length === 0) return -1
  const values = routes.map((r) => r[key] as number)
  const best = lowerIsBetter ? Math.min(...values) : Math.max(...values)
  return values.indexOf(best)
}

export function RouteComparisonPanel() {
  const comparedRoutes = useMapStore((s) => s.comparedRoutes)
  const routes = useMapStore((s) => s.routes)
  const removeComparedRoute = useMapStore((s) => s.removeComparedRoute)
  const clearComparedRoutes = useMapStore((s) => s.clearComparedRoutes)

  const comparedRouteData = useMemo(() => {
    return comparedRoutes
      .map((id) => routes.find((r) => r.id === id))
      .filter((r): r is MapRoute => r !== undefined)
  }, [comparedRoutes, routes])

  const metrics = useMemo(() => {
    return comparedRouteData.map(getRouteMetrics)
  }, [comparedRouteData])

  if (comparedRoutes.length === 0) return null

  const distanceWinner = getWinner(metrics, 'distance', true)
  const durationWinner = getWinner(metrics, 'duration', true)
  const elevationWinner = getWinner(metrics, 'elevationGain', true)
  const turnsWinner = getWinner(metrics, 'turns', true)

  const chartData = metrics.map((m) => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + '…' : m.name,
    'Distance (km)': m.distance,
    'Duration (min)': m.duration,
    'Elevation (m)': m.elevationGain,
    'Turns': m.turns,
  }))

  const getCellColor = (valueIndex: number, winnerIndex: number) => {
    if (metrics.length < 2) return ''
    if (valueIndex === winnerIndex) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
    // Worst = highest value for lower-is-better metrics
    const worstIndex = metrics.length === 2 ? (winnerIndex === 0 ? 1 : 0) : -1
    if (valueIndex === worstIndex) return 'bg-red-500/10 text-red-700 dark:text-red-400'
    return ''
  }

  return (
    <Card className="w-[520px] max-w-[calc(100vw-40px)] shadow-xl border-border/50 bg-background/95 backdrop-blur-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-primary" />
            Route Comparison
            <Badge variant="secondary" className="text-[10px] ml-1">
              {comparedRoutes.length}/3
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={clearComparedRoutes}
            aria-label="Close comparison panel"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comparison Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs h-8 w-28">Metric</TableHead>
                {metrics.map((m, i) => (
                  <TableHead key={i} className="text-xs h-8 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="truncate max-w-[80px]">{m.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs font-medium py-2">Distance</TableCell>
                {metrics.map((m, i) => (
                  <TableCell key={i} className={`text-xs text-center py-2 ${getCellColor(i, distanceWinner)}`}>
                    <div className="flex items-center justify-center gap-1">
                      {m.distance} km
                      {i === distanceWinner && metrics.length > 1 && (
                        <Badge className="h-4 px-1 text-[9px] bg-emerald-500 text-white border-0">
                          <Trophy className="h-2.5 w-2.5 mr-0.5" />Best
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium py-2">Duration</TableCell>
                {metrics.map((m, i) => (
                  <TableCell key={i} className={`text-xs text-center py-2 ${getCellColor(i, durationWinner)}`}>
                    <div className="flex items-center justify-center gap-1">
                      {m.duration} min
                      {i === durationWinner && metrics.length > 1 && (
                        <Badge className="h-4 px-1 text-[9px] bg-emerald-500 text-white border-0">
                          <Trophy className="h-2.5 w-2.5 mr-0.5" />Best
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium py-2">Elev. Gain</TableCell>
                {metrics.map((m, i) => (
                  <TableCell key={i} className={`text-xs text-center py-2 ${getCellColor(i, elevationWinner)}`}>
                    <div className="flex items-center justify-center gap-1">
                      {m.elevationGain} m
                      {i === elevationWinner && metrics.length > 1 && (
                        <Badge className="h-4 px-1 text-[9px] bg-emerald-500 text-white border-0">
                          <Trophy className="h-2.5 w-2.5 mr-0.5" />Best
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium py-2">Turns</TableCell>
                {metrics.map((m, i) => (
                  <TableCell key={i} className={`text-xs text-center py-2 ${getCellColor(i, turnsWinner)}`}>
                    <div className="flex items-center justify-center gap-1">
                      {m.turns}
                      {i === turnsWinner && metrics.length > 1 && (
                        <Badge className="h-4 px-1 text-[9px] bg-emerald-500 text-white border-0">
                          <Trophy className="h-2.5 w-2.5 mr-0.5" />Best
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium py-2">Profile</TableCell>
                {metrics.map((m, i) => (
                  <TableCell key={i} className="text-xs text-center py-2">
                    <Badge variant="outline" className="text-[10px]">{m.profile}</Badge>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Bar Chart */}
        {metrics.length >= 1 && (
          <div className="h-48 rounded-lg border bg-muted/10 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Distance (km)" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Duration (min)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Elevation (m)" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Route chips for removal */}
        <div className="flex flex-wrap gap-1.5">
          {comparedRouteData.map((route) => (
            <Badge
              key={route.id}
              variant="secondary"
              className="text-xs gap-1 pr-1 pl-2 py-1"
              style={{ borderLeft: `3px solid ${route.color}` }}
            >
              {route.name}
              <button
                onClick={() => removeComparedRoute(route.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 transition-colors"
                aria-label={`Remove ${route.name} from comparison`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
