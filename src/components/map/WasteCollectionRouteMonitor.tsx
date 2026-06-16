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
import { useMapStore, type WasteCollectionRouteState, type WasteCollectionRouteData } from '@/lib/map-store'
import { Trash2 as TrashIcon2, X, Route, Recycle, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: WasteCollectionRouteData[] = [
  {
    id: 'wc-seoul',
    name: 'Seoul System',
    lat: 37.567,
    lng: 126.978,
    collectionRate: 96,
    routeEfficiency: 88,
    fillLevel: 72,
    recyclingRate: 68,
    status: 'efficient',
    description: 'Highly efficient waste collection with advanced sorting technology',
  },
  {
    id: 'wc-stockholm',
    name: 'Stockholm Eco',
    lat: 59.329,
    lng: 18.069,
    collectionRate: 92,
    routeEfficiency: 85,
    fillLevel: 65,
    recyclingRate: 82,
    status: 'ontrack',
    description: 'On-track performance with strong recycling infrastructure in place',
  },
  {
    id: 'wc-singapore',
    name: 'Singapore ZeroWaste',
    lat: 1.352,
    lng: 103.820,
    collectionRate: 78,
    routeEfficiency: 62,
    fillLevel: 88,
    recyclingRate: 42,
    status: 'delayed',
    description: 'Delayed collections in high-density residential sectors',
  },
  {
    id: 'wc-copenhagen',
    name: 'Copenhagen Green',
    lat: 55.676,
    lng: 12.569,
    collectionRate: 55,
    routeEfficiency: 45,
    fillLevel: 95,
    recyclingRate: 31,
    status: 'overflow',
    description: 'Overflow conditions at multiple collection points during festival period',
  },
]

const STATUS_COLORS: Record<WasteCollectionRouteData['status'], { label: string; color: string; bgClass: string }> = {
  overflow: { label: 'Overflow', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  delayed: { label: 'Delayed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  ontrack: { label: 'On Track', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  efficient: { label: 'Efficient', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: WasteCollectionRouteData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WasteCollectionRouteMonitor() {
  const state = useMapStore((s) => s.wasteCollectionRoute)
  const setState = useMapStore((s) => s.setWasteCollectionRoute)

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
      return { totalRoutes: 0, avgCollection: 0, avgEfficiency: 0, avgRecycling: 0 }
    }
    const avgCollection = filteredItems.reduce((sum, e) => sum + e.collectionRate, 0) / filteredItems.length
    const avgEfficiency = filteredItems.reduce((sum, e) => sum + e.routeEfficiency, 0) / filteredItems.length
    const avgRecycling = filteredItems.reduce((sum, e) => sum + e.recyclingRate, 0) / filteredItems.length
    return {
      totalRoutes: filteredItems.length,
      avgCollection: Math.round(avgCollection),
      avgEfficiency: Math.round(avgEfficiency),
      avgRecycling: Math.round(avgRecycling),
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
      properties: { id: e.id, name: e.name, status: e.status, collectionRate: e.collectionRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWasteCollectionRoute({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WasteCollectionRouteState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCollectionRate', label: 'Collection Rate', icon: Route },
    { key: 'showRouteEfficiency', label: 'Route Efficiency', icon: TrashIcon2 },
    { key: 'showFillLevel', label: 'Fill Level', icon: MapPin },
    { key: 'showRecyclingRate', label: 'Recycling %', icon: Recycle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-emerald-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <TrashIcon2 className="h-4 w-4 text-green-400" />
              Waste Collection Route Monitor
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
                setState({ statusFilter: v as WasteCollectionRouteState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="overflow">Overflow</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="ontrack">On Track</SelectItem>
                <SelectItem value="efficient">Efficient</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Routes</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalRoutes}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Collection</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgCollection}%</div>
              <div className="text-[9px] text-slate-400/60">rate</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Efficiency</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgEfficiency}%</div>
              <div className="text-[9px] text-slate-400/60">route</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Recycling</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgRecycling}%</div>
              <div className="text-[9px] text-slate-400/60">rate</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Collection Routes ({filteredItems.length})
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
                        {state.showCollectionRate && (
                          <div>
                            Collection:{' '}
                            <span className="text-slate-100 font-medium">{e.collectionRate}%</span>
                          </div>
                        )}
                        {state.showRouteEfficiency && (
                          <div>
                            Efficiency:{' '}
                            <span className="text-slate-100 font-medium">{e.routeEfficiency}%</span>
                          </div>
                        )}
                        {state.showFillLevel && (
                          <div>
                            Fill Level:{' '}
                            <span className="text-slate-100 font-medium">{e.fillLevel}%</span>
                          </div>
                        )}
                        {state.showRecyclingRate && (
                          <div>
                            Recycling:{' '}
                            <span className="text-slate-100 font-medium">{e.recyclingRate}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No routes match the current filter.
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
                    <span className="text-slate-400/70">Collection: </span>
                    <span className="font-medium text-green-400">{activeItem.collectionRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Efficiency: </span>
                    <span className="font-medium text-emerald-400">{activeItem.routeEfficiency}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Recycling: </span>
                    <span className="font-medium text-slate-200">{activeItem.recyclingRate}%</span>
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
