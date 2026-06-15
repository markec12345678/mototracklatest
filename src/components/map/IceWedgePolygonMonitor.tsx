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
import { useMapStore, type IceWedgePolygonState, type IceWedgePolygonData } from '@/lib/map-store'
import { Hexagon as HexagonIcon, X, Square, ArrowDown, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IceWedgePolygonData[] = [
  {
    id: 'iw-barrow',
    name: 'Barrow Polygon Field',
    lat: 71.2906,
    lng: -156.7886,
    polygonArea: 250,
    wedgeDepth: 3.2,
    degradationRate: 0.5,
    status: 'intact',
    description: 'Classic low-center polygons',
  },
  {
    id: 'iw-prudhoe',
    name: 'Prudhoe Bay Polygons',
    lat: 70.2553,
    lng: -148.4247,
    polygonArea: 180,
    wedgeDepth: 2.8,
    degradationRate: 2.1,
    status: 'degrading',
    description: 'Thawing wedge network',
  },
  {
    id: 'iw-svalbard',
    name: 'Svalbard Polygon',
    lat: 78.2304,
    lng: 15.6267,
    polygonArea: 120,
    wedgeDepth: 1.5,
    degradationRate: 5.8,
    status: 'thawed',
    description: 'Degraded polygon terrain',
  },
  {
    id: 'iw-lena',
    name: 'Lena Delta Thermokarst',
    lat: 72.35,
    lng: 126.5,
    polygonArea: 350,
    wedgeDepth: 4.1,
    degradationRate: 8.2,
    status: 'thermokarst',
    description: 'Active thermokarst ponds',
  },
]

const STATUS_COLORS: Record<IceWedgePolygonData['status'], { label: string; color: string; bgClass: string }> = {
  intact: { label: 'Intact', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  degrading: { label: 'Degrading', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  thawed: { label: 'Thawed', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  thermokarst: { label: 'Thermokarst', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: IceWedgePolygonData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IceWedgePolygonMonitor() {
  const state = useMapStore((s) => s.iceWedgePolygon)
  const setState = useMapStore((s) => s.setIceWedgePolygon)

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
      return { totalSites: 0, avgPolygonArea: 0, avgWedgeDepth: 0, degradingCount: 0 }
    }
    const avgPolygonArea = filteredItems.reduce((sum, e) => sum + e.polygonArea, 0) / filteredItems.length
    const avgWedgeDepth = filteredItems.reduce((sum, e) => sum + e.wedgeDepth, 0) / filteredItems.length
    const degradingCount = filteredItems.filter((e) => e.status === 'degrading' || e.status === 'thermokarst').length
    return {
      totalSites: filteredItems.length,
      avgPolygonArea,
      avgWedgeDepth,
      degradingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, polygonArea: e.polygonArea },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setIceWedgePolygon({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IceWedgePolygonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPolygonArea', label: 'Polygon Area', icon: Square },
    { key: 'showWedgeDepth', label: 'Wedge Depth', icon: ArrowDown },
    { key: 'showDegradationRate', label: 'Degradation Rate', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-slate-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <HexagonIcon className="h-4 w-4 text-cyan-400" />
              Ice Wedge Polygon
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as IceWedgePolygonState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="degrading">Degrading</SelectItem>
                <SelectItem value="thawed">Thawed</SelectItem>
                <SelectItem value="thermokarst">Thermokarst</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalSites}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Polygon Area</div>
              <div className="text-sm font-semibold text-cyan-300">{summary.avgPolygonArea.toFixed(0)}</div>
              <div className="text-[9px] text-cyan-400/60">m²</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Wedge Depth</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgWedgeDepth.toFixed(1)}</div>
              <div className="text-[9px] text-cyan-400/60">m</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Degrading+Karst</div>
              <div className="text-sm font-semibold text-orange-400">{summary.degradingCount}</div>
              <div className="text-[9px] text-cyan-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
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
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-cyan-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showPolygonArea && (
                          <div>
                            Area:{' '}
                            <span className="text-cyan-100 font-medium">{e.polygonArea} m²</span>
                          </div>
                        )}
                        {state.showWedgeDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-cyan-100 font-medium">{e.wedgeDepth} m</span>
                          </div>
                        )}
                        {state.showDegradationRate && (
                          <div>
                            Degradation:{' '}
                            <span className="text-cyan-100 font-medium">{e.degradationRate} cm/yr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Area: </span>
                    <span className="font-medium text-cyan-300">{activeItem.polygonArea} m²</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Depth: </span>
                    <span className="font-medium text-blue-400">{activeItem.wedgeDepth} m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Degradation: </span>
                    <span className="font-medium text-orange-400">{activeItem.degradationRate} cm/yr</span>
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
