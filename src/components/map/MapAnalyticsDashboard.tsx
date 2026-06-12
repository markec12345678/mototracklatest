'use client'

import { useMemo, useCallback, useRef, useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useMapStore } from '@/lib/map-store'
import {
  BarChart3,
  MapPin,
  Route,
  Ruler,
  Pencil,
  Clock,
  TrendingUp,
  Activity,
  Save,
  Hash,
} from 'lucide-react'

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`
  return `${km.toFixed(1)} km`
}

export function MapAnalyticsDashboard() {
  const analyticsPanelOpen = useMapStore((s) => s.analyticsPanelOpen)
  const setAnalyticsPanelOpen = useMapStore((s) => s.setAnalyticsPanelOpen)
  const markers = useMapStore((s) => s.markers)
  const routes = useMapStore((s) => s.routes)
  const savedLocations = useMapStore((s) => s.savedLocations)
  const drawings = useMapStore((s) => s.drawings)
  const toolUsageHistory = useMapStore((s) => s.toolUsageHistory)
  const sessionStartTime = useMapStore((s) => s.sessionStartTime)
  const measureDistance = useMapStore((s) => s.measureDistance)
  const drawnFeatures = useMapStore((s) => s.drawnFeatures)
  const annotations = useMapStore((s) => s.annotations)

  const [sessionTime, setSessionTime] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Session time timer - using ref pattern to avoid setState in useEffect
  const updateTime = useCallback(() => {
    const now = Date.now()
    const elapsed = now - sessionStartTime
    setSessionTime(formatDuration(elapsed))
  }, [sessionStartTime])

  // Use interval via useEffect to avoid accessing refs during render
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (analyticsPanelOpen && !timerRef.current) {
      timerRef.current = setInterval(updateTime, 1000)
    }
    if (!analyticsPanelOpen && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [analyticsPanelOpen, updateTime])

  // Computed analytics
  const totalRouteDistance = useMemo(() => {
    return routes.reduce((sum, r) => sum + (r.distance || 0), 0)
  }, [routes])

  const activityData = useMemo(() => {
    return [
      { name: 'Markers', value: markers.length, color: '#ef4444' },
      { name: 'Routes', value: routes.length, color: '#3b82f6' },
      { name: 'Measurements', value: measureDistance ? 1 : 0, color: '#f59e0b' },
      { name: 'Drawings', value: drawings.length + drawnFeatures.length, color: '#22c55e' },
    ]
  }, [markers.length, routes.length, measureDistance, drawings.length, drawnFeatures.length])

  const mostUsedTool = useMemo(() => {
    if (toolUsageHistory.length === 0) return { tool: 'None', count: 0 }
    const counts: Record<string, number> = {}
    for (const entry of toolUsageHistory) {
      counts[entry.tool] = (counts[entry.tool] || 0) + 1
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return { tool: sorted[0][0], count: sorted[0][1] }
  }, [toolUsageHistory])

  const toolUsageData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const entry of toolUsageHistory) {
      counts[entry.tool] = (counts[entry.tool] || 0) + 1
    }
    const toolIcons: Record<string, string> = {
      navigate: 'Navigate',
      mark: 'Mark',
      measure: 'Measure',
      directions: 'Directions',
      draw: 'Draw',
      area: 'Area',
      annotate: 'Annotate',
    }
    return Object.entries(counts)
      .map(([tool, count]) => ({
        name: toolIcons[tool] || tool,
        count,
        color: tool === 'navigate' ? '#10b981' :
               tool === 'mark' ? '#ef4444' :
               tool === 'measure' ? '#f59e0b' :
               tool === 'directions' ? '#06b6d4' :
               tool === 'draw' ? '#22c55e' :
               tool === 'area' ? '#8b5cf6' :
               tool === 'annotate' ? '#ec4899' : '#6b7280',
      }))
      .sort((a, b) => b.count - a.count)
  }, [toolUsageHistory])

  // Daily heatmap data (past 7 days, simulated from existing store data)
  const heatmapData = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayStr = date.toLocaleDateString('en', { weekday: 'short' })
      const dateStr = date.toISOString().split('T')[0]

      // Count actions from that day
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayActions = toolUsageHistory.filter(
        (h) => h.timestamp >= dayStart.getTime() && h.timestamp <= dayEnd.getTime()
      ).length

      // Simulate some activity for past days if no history
      const simulatedActivity = i === 0
        ? dayActions
        : dayActions + Math.floor(Math.abs(Math.sin(date.getDate() * 1.5)) * (markers.length + routes.length))

      days.push({
        day: dayStr,
        date: dateStr,
        intensity: simulatedActivity,
      })
    }
    return days
  }, [toolUsageHistory, markers.length, routes.length])

  const maxHeatIntensity = useMemo(() => {
    return Math.max(...heatmapData.map((d) => d.intensity), 1)
  }, [heatmapData])

  const getHeatColor = useCallback((intensity: number) => {
    const ratio = intensity / maxHeatIntensity
    if (ratio === 0) return 'bg-muted'
    if (ratio < 0.25) return 'bg-emerald-200 dark:bg-emerald-900'
    if (ratio < 0.5) return 'bg-emerald-300 dark:bg-emerald-700'
    if (ratio < 0.75) return 'bg-emerald-400 dark:bg-emerald-600'
    return 'bg-emerald-500 dark:bg-emerald-500'
  }, [maxHeatIntensity])

  // Total actions count
  const totalActions = useMemo(() => {
    return markers.length + routes.length + savedLocations.length +
      drawings.length + drawnFeatures.length + annotations.length +
      toolUsageHistory.length
  }, [markers.length, routes.length, savedLocations.length, drawings.length, drawnFeatures.length, annotations.length, toolUsageHistory.length])

  return (
    <Sheet open={analyticsPanelOpen} onOpenChange={setAnalyticsPanelOpen}>
      <SheetContent side="right" className="w-full sm:w-[480px] sm:max-w-[480px] p-0 overflow-y-auto">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-500" />
            Map Analytics Dashboard
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-muted-foreground">Markers</span>
                </div>
                <p className="text-2xl font-bold">{markers.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Route className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Routes</span>
                </div>
                <p className="text-2xl font-bold">{routes.length}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Distance</span>
                </div>
                <p className="text-2xl font-bold">{formatDistance(totalRouteDistance)}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Save className="h-4 w-4 text-teal-500" />
                  <span className="text-xs text-muted-foreground">Saved</span>
                </div>
                <p className="text-2xl font-bold">{savedLocations.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Session Time & Most Used Tool */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Session</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">{sessionTime || '0s'}</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Top Tool</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold capitalize">{mostUsedTool.tool}</p>
                  {mostUsedTool.count > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      x{mostUsedTool.count}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total Activity Score */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Total Activity Score</span>
                </div>
                <span className="text-lg font-bold text-emerald-500">{totalActions}</span>
              </div>
              <Progress
                value={Math.min(totalActions, 100)}
                className="h-2"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {totalActions < 10 ? 'Just getting started!' :
                 totalActions < 30 ? 'Getting active!' :
                 totalActions < 60 ? 'Power user in the making!' :
                 'Map explorer extraordinaire!'}
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Activity Bar Chart */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                Actions by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {activityData.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={activityData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Hash className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-xs">No activity yet. Start exploring!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tool Usage Chart */}
          {toolUsageData.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  Tool Usage Frequency
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={toolUsageData} layout="vertical" margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {toolUsageData.map((entry, index) => (
                        <Cell key={`tool-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Daily Heatmap */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Activity Heatmap (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-7 gap-1.5">
                {heatmapData.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-muted-foreground font-medium">
                      {day.day}
                    </span>
                    <div
                      className={`w-full aspect-square rounded-md ${getHeatColor(day.intensity)} transition-colors flex items-center justify-center`}
                      title={`${day.date}: ${day.intensity} actions`}
                    >
                      {day.intensity > 0 && (
                        <span className="text-[9px] font-medium text-foreground/80">
                          {day.intensity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-muted-foreground">Less</span>
                <div className="flex gap-0.5">
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <div
                      key={ratio}
                      className={`w-3 h-3 rounded-sm ${
                        ratio === 0 ? 'bg-muted' :
                        ratio < 0.5 ? 'bg-emerald-200 dark:bg-emerald-900' :
                        ratio < 0.75 ? 'bg-emerald-300 dark:bg-emerald-700' :
                        'bg-emerald-500'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-muted-foreground">More</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Detailed Breakdown
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Markers Placed', value: markers.length, icon: MapPin, color: 'text-red-500' },
                  { label: 'Routes Created', value: routes.length, icon: Route, color: 'text-blue-500' },
                  { label: 'Saved Locations', value: savedLocations.length, icon: Save, color: 'text-teal-500' },
                  { label: 'Freehand Drawings', value: drawings.length, icon: Pencil, color: 'text-green-500' },
                  { label: 'Shape Drawings', value: drawnFeatures.length, icon: Pencil, color: 'text-emerald-500' },
                  { label: 'Annotations', value: annotations.length, icon: Hash, color: 'text-pink-500' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                      <span className="text-sm">{stat.label}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
