'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type HighwayBottleneckState, type HighwayBottleneckData } from '@/lib/map-store'
import { Route as RouteIcon3, X, Gauge, AlertTriangle, AlertOctagon, BarChart3 } from 'lucide-react'

const SAMPLE_LOCATIONS: HighwayBottleneckData[] = [
  {
    id: 'hb-i405',
    name: 'I-405 LA',
    lat: 34.050,
    lng: -118.460,
    congestionLevel: 95,
    avgSpeed: 18,
    queueLength: 12,
    incidentCount: 4,
    status: 'gridlock',
    description: 'I-405 Sepulveda Pass experiencing severe gridlock with multiple incidents',
  },
  {
    id: 'hb-m25',
    name: 'M25 London',
    lat: 51.500,
    lng: -0.200,
    congestionLevel: 72,
    avgSpeed: 35,
    queueLength: 8,
    incidentCount: 2,
    status: 'heavy',
    description: 'M25 London orbital with heavy congestion near junction delays',
  },
  {
    id: 'hb-a9',
    name: 'AutoBahn A9',
    lat: 48.800,
    lng: 11.500,
    congestionLevel: 45,
    avgSpeed: 85,
    queueLength: 3,
    incidentCount: 1,
    status: 'moderate',
    description: 'A9 Munich corridor with moderate delays near Ingolstadt construction zone',
  },
  {
    id: 'hb-n1',
    name: 'Gauteng N1',
    lat: -26.200,
    lng: 28.050,
    congestionLevel: 82,
    avgSpeed: 28,
    queueLength: 9,
    incidentCount: 3,
    status: 'heavy',
    description: 'N1 Gauteng freeway heavy congestion during peak commuter hours',
  },
]

const STATUS_COLORS: Record<HighwayBottleneckData['status'], { label: string; color: string; bgClass: string }> = {
  'free-flow': { label: 'Free Flow', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  heavy: { label: 'Heavy', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  gridlock: { label: 'Gridlock', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: HighwayBottleneckData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HighwayBottleneckMonitor() {
  const state = useMapStore((s) => s.highwayBottleneck)
  const setState = useMapStore((s) => s.setHighwayBottleneck)

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
      return { avgSpeed: 0, avgDelayIndex: 0, totalIncidents: 0, totalVolume: 0 }
    }
    const avgSpeed = filteredItems.reduce((sum, e) => sum + e.avgSpeed, 0) / filteredItems.length
    const avgDelayIndex = filteredItems.reduce((sum, e) => sum + e.congestionLevel, 0) / filteredItems.length
    const totalIncidents = filteredItems.reduce((sum, e) => sum + e.incidentCount, 0)
    const totalVolume = filteredItems.reduce((sum, e) => sum + e.queueLength, 0)
    return {
      avgSpeed: avgSpeed.toFixed(0),
      avgDelayIndex: Math.round(avgDelayIndex),
      totalIncidents,
      totalVolume,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, avgSpeed: e.avgSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHighwayBottleneck({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HighwayBottleneckState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCongestionLevel', label: 'Congestion Level', icon: BarChart3 },
    { key: 'showAvgSpeed', label: 'Avg Speed', icon: Gauge },
    { key: 'showQueueLength', label: 'Queue Length', icon: RouteIcon3 },
    { key: 'showIncidentCount', label: 'Incidents', icon: AlertOctagon },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <RouteIcon3 className="h-4 w-4 text-orange-400" />
              Highway Bottleneck
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as HighwayBottleneckState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="free-flow">Free Flow</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
                <SelectItem value="gridlock">Gridlock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSpeed}</div>
              <div className="text-[9px] text-slate-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Delay Index</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgDelayIndex}</div>
              <div className="text-[9px] text-slate-400/60">0-100</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Incident Count</div>
              <div className="text-sm font-semibold text-amber-400">{summary.totalIncidents}</div>
              <div className="text-[9px] text-slate-400/60">active</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Volume AADT</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalVolume} km</div>
              <div className="text-[9px] text-slate-400/60">queue length</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Bottleneck Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
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
                          <TrendIcon status={e.status} />
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
                        {state.showCongestionLevel && (
                          <div>
                            Congestion:{' '}
                            <span className="text-slate-100 font-medium">{e.congestionLevel}%</span>
                          </div>
                        )}
                        {state.showAvgSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-slate-100 font-medium">{e.avgSpeed} km/h</span>
                          </div>
                        )}
                        {state.showQueueLength && (
                          <div>
                            Queue:{' '}
                            <span className="text-slate-100 font-medium">{e.queueLength} km</span>
                          </div>
                        )}
                        {state.showIncidentCount && (
                          <div>
                            Incidents:{' '}
                            <span className="text-slate-100 font-medium">{e.incidentCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No highways match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <RouteIcon3 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Speed: </span>
                    <span className="font-medium text-orange-400">{activeItem.avgSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Congestion: </span>
                    <span className="font-medium text-red-400">{activeItem.congestionLevel}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Queue: </span>
                    <span className="font-medium text-amber-400">{activeItem.queueLength} km</span>
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
