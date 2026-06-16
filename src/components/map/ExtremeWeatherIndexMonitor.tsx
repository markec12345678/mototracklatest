'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { CloudRain as CloudRainIcon8, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'ewi-hurricane',
    name: 'Hurricane Belt',
    lat: 15.0,
    lng: -60.0,
    eventCount: 24,
    intensityIndex: 8.4,
    durationDays: 7.2,
    frequencyPct: 78,
    status: 'extreme',
    description: 'Atlantic hurricane corridor showing increased category 4 and 5 storm activity',
  },
  {
    id: 'ewi-tornado',
    name: 'Tornado Alley',
    lat: 37.0,
    lng: -98.0,
    eventCount: 187,
    intensityIndex: 6.8,
    durationDays: 0.4,
    frequencyPct: 64,
    status: 'severe',
    description: 'US Great Plains tornado alley with shifting spatial patterns and longer seasons',
  },
  {
    id: 'ewi-monsoon',
    name: 'Monsoon Region',
    lat: 20.0,
    lng: 80.0,
    eventCount: 42,
    intensityIndex: 7.1,
    durationDays: 5.6,
    frequencyPct: 71,
    status: 'elevated',
    description: 'South Asian monsoon region with extreme precipitation events intensifying',
  },
  {
    id: 'ewi-typhoon',
    name: 'Typhoon Zone',
    lat: 20.0,
    lng: 130.0,
    eventCount: 28,
    intensityIndex: 8.1,
    durationDays: 6.4,
    frequencyPct: 69,
    status: 'normal',
    description: 'Western Pacific typhoon basin with rapid intensification events becoming common',
  },
]

const STATUS_COLORS: Record<string, { label: string; color: string; bgClass: string }> = {
  extreme: { label: 'Extreme', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  severe: { label: 'Severe', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  elevated: { label: 'Elevated', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.normal
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function ExtremeWeatherIndexMonitor() {
  const state = useMapStore((s) => s.extremeWeatherIndex)
  const setState = useMapStore((s) => s.setExtremeWeatherIndex)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalEvents: 0, avgIntensity: 0, avgDuration: 0, avgFrequency: 0 }
    }
    const totalEvents = filteredItems.reduce((sum, e) => sum + (e.eventCount as number), 0)
    const avgIntensity = filteredItems.reduce((sum, e) => sum + (e.intensityIndex as number), 0) / filteredItems.length
    const avgDuration = filteredItems.reduce((sum, e) => sum + (e.durationDays as number), 0) / filteredItems.length
    const avgFrequency = filteredItems.reduce((sum, e) => sum + (e.frequencyPct as number), 0) / filteredItems.length
    return {
      totalEvents,
      avgIntensity: avgIntensity.toFixed(1),
      avgDuration: avgDuration.toFixed(1),
      avgFrequency: Math.round(avgFrequency),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setExtremeWeatherIndex({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-600/95 to-violet-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CloudRainIcon8 className="h-4 w-4 text-purple-200" />
              Extreme Weather Index
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <select
              className="mt-1 w-full h-8 text-xs bg-slate-900/40 border border-slate-700/40 rounded-md px-2 text-slate-100"
              value={state.statusFilter || 'all'}
              onChange={(e) => setState({ statusFilter: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="extreme">Extreme</option>
              <option value="severe">Severe</option>
              <option value="elevated">Elevated</option>
              <option value="normal">Normal</option>
            </select>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Event Count</div>
              <div className="text-sm font-semibold text-purple-200">{summary.totalEvents}</div>
              <div className="text-[9px] text-slate-400/60">season</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Intensity</div>
              <div className="text-sm font-semibold text-violet-200">{summary.avgIntensity}</div>
              <div className="text-[9px] text-slate-400/60">index avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Duration</div>
              <div className="text-sm font-semibold text-fuchsia-200">{summary.avgDuration}</div>
              <div className="text-[9px] text-slate-400/60">days avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Frequency</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgFrequency}%</div>
              <div className="text-[9px] text-slate-400/60">above norm</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Storm Regions ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status as string] ?? STATUS_COLORS.normal
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status as string} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        <div>
                          Events: <span className="text-slate-100 font-medium">{e.eventCount}</span>
                        </div>
                        <div>
                          Intensity: <span className="text-slate-100 font-medium">{e.intensityIndex}</span>
                        </div>
                        <div>
                          Duration: <span className="text-slate-100 font-medium">{e.durationDays} d</span>
                        </div>
                        <div>
                          Frequency: <span className="text-slate-100 font-medium">{e.frequencyPct}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status as string]?.bgClass ?? STATUS_COLORS.normal.bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status as string]?.label ?? 'Normal'}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description as string}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {(activeItem.lat as number).toFixed(2)}, {(activeItem.lng as number).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Events: </span>
                    <span className="font-medium text-purple-200">{activeItem.eventCount}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
