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
import { useMapStore, type TalusAccumulationState, type TalusAccumulationData } from '@/lib/map-store'
import { Layers as LayersIcon7, X, Gauge, Box, Mountain, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TalusAccumulationData[] = [
  {
    id: 'ta-matterhorn',
    name: 'Matterhorn Talus Cone',
    lat: 45.9763,
    lng: 7.6586,
    accumulationRate: 8.5,
    talusVolume: 12000,
    slopeAngle: 35,
    status: 'accumulating',
    description: 'Active talus cone at Matterhorn base',
  },
  {
    id: 'ta-ben',
    name: 'Ben Nevis Scree',
    lat: 56.7969,
    lng: -5.0036,
    accumulationRate: 3.2,
    talusVolume: 5500,
    slopeAngle: 30,
    status: 'redistributing',
    description: 'Redistributing scree on Ben Nevis',
  },
  {
    id: 'ta-peggy',
    name: 'Peggy Cove Talus',
    lat: 44.4900,
    lng: -63.9200,
    accumulationRate: 1.0,
    talusVolume: 2000,
    slopeAngle: 25,
    status: 'weathering',
    description: 'Weathering granite talus in Nova Scotia',
  },
  {
    id: 'ta-atacama',
    name: 'Atacama Talus Ramp',
    lat: -24.0000,
    lng: -69.5000,
    accumulationRate: 0.05,
    talusVolume: 800,
    slopeAngle: 18,
    status: 'stable',
    description: 'Stable desert talus ramp in Atacama',
  },
]

const STATUS_COLORS: Record<TalusAccumulationData['status'], { label: string; color: string; bgClass: string }> = {
  accumulating: { label: 'Accumulating', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  redistributing: { label: 'Redistributing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  weathering: { label: 'Weathering', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: TalusAccumulationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TalusAccumulationMonitor() {
  const state = useMapStore((s) => s.talusAccumulation)
  const setState = useMapStore((s) => s.setTalusAccumulation)

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
      return { totalZones: 0, avgAccumRate: 0, avgTalusVolume: 0, accumulatingCount: 0 }
    }
    const avgAccumRate = filteredItems.reduce((sum, e) => sum + e.accumulationRate, 0) / filteredItems.length
    const avgTalusVolume = filteredItems.reduce((sum, e) => sum + e.talusVolume, 0) / filteredItems.length
    const accumulatingCount = filteredItems.filter((e) => e.status === 'accumulating').length
    return {
      totalZones: filteredItems.length,
      avgAccumRate: Math.round(avgAccumRate * 10) / 10,
      avgTalusVolume: Math.round(avgTalusVolume * 10) / 10,
      accumulatingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, accumulationRate: e.accumulationRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setTalusAccumulation({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TalusAccumulationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAccumulationRate', label: 'Accumulation Rate', icon: Gauge },
    { key: 'showTalusVolume', label: 'Talus Volume', icon: Box },
    { key: 'showSlopeAngle', label: 'Slope Angle', icon: Mountain },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-zinc-950/95 to-neutral-950/95 backdrop-blur-xl border border-zinc-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-zinc-100">
              <LayersIcon7 className="h-4 w-4 text-zinc-400" />
              Talus Accumulation Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-zinc-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-zinc-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as TalusAccumulationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-zinc-900/40 border-zinc-700/40 text-zinc-100 hover:bg-zinc-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="accumulating">Accumulating</SelectItem>
                <SelectItem value="redistributing">Redistributing</SelectItem>
                <SelectItem value="weathering">Weathering</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-200">
                  <Icon className="h-3 w-3 text-zinc-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-zinc-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-zinc-200">{summary.totalZones}</div>
              <div className="text-[9px] text-zinc-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Avg Accum Rate</div>
              <div className="text-sm font-semibold text-neutral-400">{summary.avgAccumRate}</div>
              <div className="text-[9px] text-zinc-400/60">cm/yr</div>
            </div>
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Avg Volume</div>
              <div className="text-sm font-semibold text-zinc-400">{summary.avgTalusVolume}</div>
              <div className="text-[9px] text-zinc-400/60">m3</div>
            </div>
            <div className="rounded-lg border border-zinc-700/30 bg-zinc-900/30 p-2 text-center">
              <div className="text-[10px] text-zinc-400/70">Accumulating</div>
              <div className="text-sm font-semibold text-red-400">{summary.accumulatingCount}</div>
              <div className="text-[9px] text-zinc-400/60">zones</div>
            </div>
          </div>

          <Separator className="bg-zinc-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-300/80">
              Zones ({filteredItems.length})
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
                          ? 'border-zinc-500/50 bg-zinc-800/30'
                          : 'border-zinc-700/30 hover:border-zinc-500/30 hover:bg-zinc-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-zinc-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-zinc-300/60">
                        {state.showAccumulationRate && (
                          <div>
                            Rate:{' '}
                            <span className="text-zinc-100 font-medium">{e.accumulationRate} cm/yr</span>
                          </div>
                        )}
                        {state.showTalusVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-zinc-100 font-medium">{e.talusVolume} m3</span>
                          </div>
                        )}
                        {state.showSlopeAngle && (
                          <div>
                            Slope:{' '}
                            <span className="text-zinc-100 font-medium">{e.slopeAngle}°</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-zinc-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-zinc-700/30" />
              <div className="space-y-2 rounded-lg border border-zinc-600/30 bg-zinc-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-400/70">Coordinates: </span>
                    <span className="font-medium text-zinc-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400/70">Accum Rate: </span>
                    <span className="font-medium text-neutral-400">{activeItem.accumulationRate} cm/yr</span>
                  </div>
                  <div>
                    <span className="text-zinc-400/70">Talus Vol: </span>
                    <span className="font-medium text-zinc-400">{activeItem.talusVolume} m3</span>
                  </div>
                  <div>
                    <span className="text-zinc-400/70">Slope: </span>
                    <span className="font-medium text-red-400">{activeItem.slopeAngle}°</span>
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
