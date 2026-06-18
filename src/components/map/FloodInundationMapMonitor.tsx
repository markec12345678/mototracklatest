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
import { useMapStore, type FloodInundationMapState, type FloodInundationMapData } from '@/lib/map-store'
import { AlertTriangle as AlertTriangleIcon5, X, Waves, Clock, Map, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: FloodInundationMapData[] = [
  {
    id: 'fim-bangladesh',
    name: 'Bangladesh Flood Plain',
    lat: 24.0000,
    lng: 90.0000,
    floodDepth: 3.5,
    returnPeriod: 10,
    affectedArea: 35000,
    status: 'active',
    description: 'Active monsoon flooding across delta',
  },
  {
    id: 'fim-mississippi',
    name: 'Mississippi Flood',
    lat: 35.0000,
    lng: -90.0000,
    floodDepth: 2.0,
    returnPeriod: 50,
    affectedArea: 15000,
    status: 'warning',
    description: 'Flood warning for lower Mississippi',
  },
  {
    id: 'fim-rhine',
    name: 'Rhine Flood Plain',
    lat: 51.0000,
    lng: 6.5000,
    floodDepth: 1.2,
    returnPeriod: 25,
    affectedArea: 8000,
    status: 'receding',
    description: 'Receding floodwaters after storm',
  },
  {
    id: 'fim-murray',
    name: 'Murray-Darling Basin',
    lat: -34.0000,
    lng: 143.0000,
    floodDepth: 0,
    returnPeriod: 100,
    affectedArea: 0,
    status: 'dry',
    description: 'Dry conditions, no flood risk',
  },
]

const STATUS_COLORS: Record<FloodInundationMapData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-600 border-red-600/30' },
  warning: { label: 'Warning', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  receding: { label: 'Receding', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  dry: { label: 'Dry', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-500 border-stone-500/30' },
}

function TrendIcon({ status }: { status: FloodInundationMapData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function FloodInundationMapMonitor() {
  const state = useMapStore((s) => s.floodInundationMap)
  const setState = useMapStore((s) => s.setFloodInundationMap)

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
      return { totalPaths: 0, avgFloodDepth: 0, avgReturnPeriod: 0, avgAffectedArea: 0 }
    }
    const avgFloodDepth = filteredItems.reduce((sum, e) => sum + e.floodDepth, 0) / filteredItems.length
    const avgReturnPeriod = filteredItems.reduce((sum, e) => sum + e.returnPeriod, 0) / filteredItems.length
    const avgAffectedArea = filteredItems.reduce((sum, e) => sum + e.affectedArea, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgFloodDepth: Math.round(avgFloodDepth * 100) / 100,
      avgReturnPeriod: Math.round(avgReturnPeriod * 100) / 100,
      avgAffectedArea: Math.round(avgAffectedArea * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, floodDepth: e.floodDepth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setFloodInundationMap({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof FloodInundationMapState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFloodDepth', label: 'Flood Depth', icon: Waves },
    { key: 'showReturnPeriod', label: 'Return Period', icon: Clock },
    { key: 'showAffectedArea', label: 'Affected Area', icon: Map },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <AlertTriangleIcon5 className="h-4 w-4 text-red-400" />
              Flood Inundation Map Monitor
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
                setState({ statusFilter: v as FloodInundationMapState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="receding">Receding</SelectItem>
                <SelectItem value="dry">Dry</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgFloodDepth}</div>
              <div className="text-[9px] text-slate-400/60">m</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Return Period</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgReturnPeriod}</div>
              <div className="text-[9px] text-slate-400/60">yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Affected</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgAffectedArea}</div>
              <div className="text-[9px] text-slate-400/60">km2</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
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
                        {state.showFloodDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-slate-100 font-medium">{e.floodDepth} m</span>
                          </div>
                        )}
                        {state.showReturnPeriod && (
                          <div>
                            Return:{' '}
                            <span className="text-slate-100 font-medium">{e.returnPeriod} yr</span>
                          </div>
                        )}
                        {state.showAffectedArea && (
                          <div>
                            Affected:{' '}
                            <span className="text-slate-100 font-medium">{e.affectedArea} km2</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
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
                    <span className="text-slate-400/70">Depth: </span>
                    <span className="font-medium text-red-400">{activeItem.floodDepth} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Return Period: </span>
                    <span className="font-medium text-orange-400">{activeItem.returnPeriod} yr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Affected: </span>
                    <span className="font-medium text-slate-400">{activeItem.affectedArea} km2</span>
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
