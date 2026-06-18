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
import { useMapStore, type WaterPipeNetworkState, type WaterPipeNetworkData } from '@/lib/map-store'
import { Droplets as PipeIcon, X, Gauge, Droplet, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: WaterPipeNetworkData[] = [
  {
    id: 'wp-manhattan',
    name: 'Manhattan Network',
    lat: 40.713,
    lng: -74.007,
    pressureLevel: 4.2,
    flowRate: 850,
    leakDetection: 2.3,
    waterQuality: 92,
    status: 'normal',
    description: 'Normal operation across Manhattan water distribution grid',
  },
  {
    id: 'wp-london',
    name: 'London Ring Main',
    lat: 51.508,
    lng: -0.090,
    pressureLevel: 5.8,
    flowRate: 1200,
    leakDetection: 0.8,
    waterQuality: 97,
    status: 'optimal',
    description: 'Optimal performance from Thames Ring Main infrastructure',
  },
  {
    id: 'wp-tokyo',
    name: 'Tokyo Water Grid',
    lat: 35.682,
    lng: 139.692,
    pressureLevel: 3.1,
    flowRate: 680,
    leakDetection: 4.5,
    waterQuality: 78,
    status: 'leaking',
    description: 'Multiple leak detections in aged pipe segments of Shibuya ward',
  },
  {
    id: 'wp-paris',
    name: 'Paris Reseau',
    lat: 48.860,
    lng: 2.338,
    pressureLevel: 1.2,
    flowRate: 220,
    leakDetection: 8.2,
    waterQuality: 55,
    status: 'burst',
    description: 'Major pipe burst reported in 10th arrondissement sector',
  },
]

const STATUS_COLORS: Record<WaterPipeNetworkData['status'], { label: string; color: string; bgClass: string }> = {
  burst: { label: 'Burst', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  leaking: { label: 'Leaking', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  normal: { label: 'Normal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  optimal: { label: 'Optimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: WaterPipeNetworkData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WaterPipeNetworkMonitor() {
  const state = useMapStore((s) => s.waterPipeNetwork)
  const setState = useMapStore((s) => s.setWaterPipeNetwork)

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
      return { totalNetworks: 0, avgPressure: 0, avgFlowRate: 0, avgQuality: 0 }
    }
    const avgPressure = filteredItems.reduce((sum, e) => sum + e.pressureLevel, 0) / filteredItems.length
    const avgFlowRate = filteredItems.reduce((sum, e) => sum + e.flowRate, 0) / filteredItems.length
    const avgQuality = filteredItems.reduce((sum, e) => sum + e.waterQuality, 0) / filteredItems.length
    return {
      totalNetworks: filteredItems.length,
      avgPressure: avgPressure.toFixed(1),
      avgFlowRate: Math.round(avgFlowRate),
      avgQuality: Math.round(avgQuality),
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
      properties: { id: e.id, name: e.name, status: e.status, pressureLevel: e.pressureLevel },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWaterPipeNetwork({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WaterPipeNetworkState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPressureLevel', label: 'Pressure Level', icon: Gauge },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Droplet },
    { key: 'showLeakDetection', label: 'Leak Detection', icon: PipeIcon },
    { key: 'showWaterQuality', label: 'Water Quality', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <PipeIcon className="h-4 w-4 text-blue-400" />
              Water Pipe Network Monitor
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
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as WaterPipeNetworkState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="burst">Burst</SelectItem>
                <SelectItem value="leaking">Leaking</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Networks</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalNetworks}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Pressure</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgPressure}</div>
              <div className="text-[9px] text-slate-400/60">bar</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Flow</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-slate-400/60">L/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Quality</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgQuality}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Pipe Networks ({filteredItems.length})
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
                        {state.showPressureLevel && (
                          <div>
                            Pressure:{' '}
                            <span className="text-slate-100 font-medium">{e.pressureLevel} bar</span>
                          </div>
                        )}
                        {state.showFlowRate && (
                          <div>
                            Flow:{' '}
                            <span className="text-slate-100 font-medium">{e.flowRate} L/s</span>
                          </div>
                        )}
                        {state.showLeakDetection && (
                          <div>
                            Leaks:{' '}
                            <span className="text-slate-100 font-medium">{e.leakDetection}/km</span>
                          </div>
                        )}
                        {state.showWaterQuality && (
                          <div>
                            Quality:{' '}
                            <span className="text-slate-100 font-medium">{e.waterQuality}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No networks match the current filter.
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
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Pressure: </span>
                    <span className="font-medium text-blue-400">{activeItem.pressureLevel} bar</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Flow: </span>
                    <span className="font-medium text-cyan-400">{activeItem.flowRate} L/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Quality: </span>
                    <span className="font-medium text-slate-200">{activeItem.waterQuality}</span>
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
