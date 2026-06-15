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
import { useMapStore, type PeatlandCarbonSinkState, type PeatlandCarbonSinkData } from '@/lib/map-store'
import { TreePine as TreePineIcon7, X, Layers, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PeatlandCarbonSinkData[] = [
  {
    id: 'pc-siberia',
    name: 'Siberian Peatland',
    lat: 60.0,
    lng: 90.0,
    carbonStock: 45.2,
    sequestrationRate: 0.85,
    waterTableDepth: 15,
    status: 'accumulating',
    description: 'Vast boreal peat complex',
  },
  {
    id: 'pc-borneo',
    name: 'Borneo Tropical Peat',
    lat: 1.5,
    lng: 114.0,
    carbonStock: 28.5,
    sequestrationRate: 0.62,
    waterTableDepth: 20,
    status: 'stable',
    description: 'Tropical peat swamp forest',
  },
  {
    id: 'pc-uk',
    name: 'UK Blanket Bog',
    lat: 54.5,
    lng: -2.5,
    carbonStock: 12.3,
    sequestrationRate: -0.15,
    waterTableDepth: 35,
    status: 'emitting',
    description: 'Degraded blanket bog',
  },
  {
    id: 'pc-patagonia',
    name: 'Patagonian Peat',
    lat: -52.0,
    lng: -70.0,
    carbonStock: 8.7,
    sequestrationRate: -0.45,
    waterTableDepth: 50,
    status: 'degraded',
    description: 'Southern peatland complex',
  },
]

const STATUS_COLORS: Record<PeatlandCarbonSinkData['status'], { label: string; color: string; bgClass: string }> = {
  accumulating: { label: 'Accumulating', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  emitting: { label: 'Emitting', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: PeatlandCarbonSinkData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PeatlandCarbonSinkMonitor() {
  const state = useMapStore((s) => s.peatlandCarbonSink)
  const setState = useMapStore((s) => s.setPeatlandCarbonSink)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, totalCarbon: 0, avgSeqRate: 0, emittingDegradedCount: 0 }
    }
    const totalCarbon = filteredItems.reduce((sum, e) => sum + e.carbonStock, 0)
    const avgSeqRate = filteredItems.reduce((sum, e) => sum + e.sequestrationRate, 0) / filteredItems.length
    const emittingDegradedCount = filteredItems.filter((e) => e.status === 'emitting' || e.status === 'degraded').length
    return {
      totalSites: filteredItems.length,
      totalCarbon,
      avgSeqRate,
      emittingDegradedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, carbonStock: e.carbonStock },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPeatlandCarbonSink({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PeatlandCarbonSinkState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Layers },
    { key: 'showSequestrationRate', label: 'Sequestration Rate', icon: TreePineIcon7 },
    { key: 'showWaterTableDepth', label: 'Water Table Depth', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-emerald-950/95 backdrop-blur-xl border border-green-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <TreePineIcon7 className="h-4 w-4 text-green-400" />
              Peatland Carbon Sink
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-green-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as PeatlandCarbonSinkState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="accumulating">Accumulating</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="emitting">Emitting</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-green-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-green-200">{summary.totalSites}</div>
              <div className="text-[9px] text-green-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Total Carbon</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.totalCarbon.toFixed(1)}</div>
              <div className="text-[9px] text-green-400/60">GtC</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Avg Seq Rate</div>
              <div className="text-sm font-semibold text-lime-400">{summary.avgSeqRate.toFixed(2)}</div>
              <div className="text-[9px] text-green-400/60">tC/ha/yr</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Emitting+Degraded</div>
              <div className="text-sm font-semibold text-red-400">{summary.emittingDegradedCount}</div>
              <div className="text-[9px] text-green-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">
              Sites ({filteredItems.length})
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
                          ? 'border-green-500/50 bg-green-800/30'
                          : 'border-green-700/30 hover:border-green-500/30 hover:bg-green-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-green-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300/60">
                        {state.showCarbonStock && (
                          <div>
                            Carbon:{' '}
                            <span className="text-green-100 font-medium">{e.carbonStock} GtC</span>
                          </div>
                        )}
                        {state.showSequestrationRate && (
                          <div>
                            Seq Rate:{' '}
                            <span className="text-green-100 font-medium">{e.sequestrationRate} tC/ha/yr</span>
                          </div>
                        )}
                        {state.showWaterTableDepth && (
                          <div>
                            Water Table:{' '}
                            <span className="text-green-100 font-medium">{e.waterTableDepth} cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-green-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-green-700/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-green-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400/70">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Carbon Stock: </span>
                    <span className="font-medium text-emerald-400">{activeItem.carbonStock} GtC</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Seq Rate: </span>
                    <span className="font-medium text-lime-400">{activeItem.sequestrationRate} tC/ha/yr</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Water Table: </span>
                    <span className="font-medium text-green-400">{activeItem.waterTableDepth} cm</span>
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
