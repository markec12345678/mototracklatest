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
import { useMapStore, type RiverSedimentLoadState, type RiverSedimentLoadData } from '@/lib/map-store'
import { Layers as LayersIcon10, X, Mountain, Eye, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: RiverSedimentLoadData[] = [
  {
    id: 'rsl-yellow',
    name: 'Yellow River',
    lat: 35.0000,
    lng: 110.0000,
    suspendedLoad: 35000,
    bedloadTransport: 850,
    turbidity: 5000,
    status: 'heavy',
    description: 'Heaviest sediment load on Earth',
  },
  {
    id: 'rsl-amazon',
    name: 'Amazon Sediment',
    lat: -1.0000,
    lng: -55.0000,
    suspendedLoad: 200,
    bedloadTransport: 120,
    turbidity: 80,
    status: 'elevated',
    description: 'Elevated sediment from Andes erosion',
  },
  {
    id: 'rsl-rhine',
    name: 'Rhine Sediment',
    lat: 51.5000,
    lng: 6.0000,
    suspendedLoad: 45,
    bedloadTransport: 8,
    turbidity: 25,
    status: 'normal',
    description: 'Normal sediment in regulated river',
  },
  {
    id: 'rsl-thames',
    name: 'Thames Water',
    lat: 51.5000,
    lng: -0.1000,
    suspendedLoad: 5,
    bedloadTransport: 0.5,
    turbidity: 3,
    status: 'clear',
    description: 'Clear water in urban river',
  },
]

const STATUS_COLORS: Record<RiverSedimentLoadData['status'], { label: string; color: string; bgClass: string }> = {
  heavy: { label: 'Heavy', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  elevated: { label: 'Elevated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  clear: { label: 'Clear', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: RiverSedimentLoadData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RiverSedimentLoadMonitor() {
  const state = useMapStore((s) => s.riverSedimentLoad)
  const setState = useMapStore((s) => s.setRiverSedimentLoad)

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
      return { totalPaths: 0, avgSuspendedLoad: 0, avgBedloadTransport: 0, avgTurbidity: 0 }
    }
    const avgSuspendedLoad = filteredItems.reduce((sum, e) => sum + e.suspendedLoad, 0) / filteredItems.length
    const avgBedloadTransport = filteredItems.reduce((sum, e) => sum + e.bedloadTransport, 0) / filteredItems.length
    const avgTurbidity = filteredItems.reduce((sum, e) => sum + e.turbidity, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgSuspendedLoad: Math.round(avgSuspendedLoad * 100) / 100,
      avgBedloadTransport: Math.round(avgBedloadTransport * 100) / 100,
      avgTurbidity: Math.round(avgTurbidity * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, suspendedLoad: e.suspendedLoad },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setRiverSedimentLoad({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RiverSedimentLoadState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSuspendedLoad', label: 'Suspended Load', icon: LayersIcon10 },
    { key: 'showBedloadTransport', label: 'Bedload Transport', icon: Mountain },
    { key: 'showTurbidity', label: 'Turbidity', icon: Eye },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-stone-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <LayersIcon10 className="h-4 w-4 text-amber-400" />
              River Sediment Load Monitor
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
                setState({ statusFilter: v as RiverSedimentLoadState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="clear">Clear</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Rivers</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Suspended</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgSuspendedLoad}</div>
              <div className="text-[9px] text-slate-400/60">mg/L</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Bedload</div>
              <div className="text-sm font-semibold text-stone-400">{summary.avgBedloadTransport}</div>
              <div className="text-[9px] text-slate-400/60">kg/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Turbidity</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgTurbidity}</div>
              <div className="text-[9px] text-slate-400/60">NTU</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Rivers ({filteredItems.length})
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
                        {state.showSuspendedLoad && (
                          <div>
                            Suspended:{' '}
                            <span className="text-slate-100 font-medium">{e.suspendedLoad} mg/L</span>
                          </div>
                        )}
                        {state.showBedloadTransport && (
                          <div>
                            Bedload:{' '}
                            <span className="text-slate-100 font-medium">{e.bedloadTransport} kg/s</span>
                          </div>
                        )}
                        {state.showTurbidity && (
                          <div>
                            Turbidity:{' '}
                            <span className="text-slate-100 font-medium">{e.turbidity} NTU</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No rivers match the current filter.
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
                    <span className="text-slate-400/70">Suspended: </span>
                    <span className="font-medium text-amber-400">{activeItem.suspendedLoad} mg/L</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Bedload: </span>
                    <span className="font-medium text-stone-400">{activeItem.bedloadTransport} kg/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Turbidity: </span>
                    <span className="font-medium text-slate-400">{activeItem.turbidity} NTU</span>
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
