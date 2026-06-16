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
import { useMapStore, type IcebergCalvingState, type IcebergCalvingData } from '@/lib/map-store'
import { Waves as WavesIcon23, X, TrendingUp, Box, Navigation, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IcebergCalvingData[] = [
  {
    id: 'ibc-jakobshavn',
    name: 'Jakobshavn Glacier',
    lat: 69,
    lng: -50,
    calvingRate: 35,
    icebergSize: 5,
    driftSpeed: 2,
    status: 'intense',
    description: 'Most active calving glacier in Greenland',
  },
  {
    id: 'ibc-pineisland',
    name: 'Pine Island Glacier',
    lat: -75,
    lng: -100,
    calvingRate: 25,
    icebergSize: 8,
    driftSpeed: 1.5,
    status: 'active',
    description: 'West Antarctic glacier with active calving',
  },
  {
    id: 'ibc-helheim',
    name: 'Helheim Glacier',
    lat: 66,
    lng: -38,
    calvingRate: 12,
    icebergSize: 3,
    driftSpeed: 0.8,
    status: 'moderate',
    description: 'SE Greenland glacier with moderate calving',
  },
  {
    id: 'ibc-ross',
    name: 'Ross Ice Shelf Edge',
    lat: -78,
    lng: -170,
    calvingRate: 2,
    icebergSize: 0.5,
    driftSpeed: 0.1,
    status: 'minimal',
    description: 'Minimal calving from the Ross Ice Shelf front',
  },
]

const STATUS_COLORS: Record<IcebergCalvingData['status'], { label: string; color: string; bgClass: string }> = {
  intense: { label: 'Intense', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  active: { label: 'Active', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: IcebergCalvingData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IcebergCalvingMonitor() {
  const state = useMapStore((s) => s.icebergCalving)
  const setState = useMapStore((s) => s.setIcebergCalving)

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
      return { totalGlaciers: 0, avgCalvingRate: 0, avgSize: 0, avgSpeed: 0 }
    }
    const avgCalvingRate = filteredItems.reduce((sum, e) => sum + e.calvingRate, 0) / filteredItems.length
    const avgSize = filteredItems.reduce((sum, e) => sum + e.icebergSize, 0) / filteredItems.length
    const avgSpeed = filteredItems.reduce((sum, e) => sum + e.driftSpeed, 0) / filteredItems.length
    return {
      totalGlaciers: filteredItems.length,
      avgCalvingRate: Math.round(avgCalvingRate * 100) / 100,
      avgSize: Math.round(avgSize * 100) / 100,
      avgSpeed: Math.round(avgSpeed * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, calvingRate: e.calvingRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setIcebergCalving({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IcebergCalvingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCalvingRate', label: 'Calving Rate', icon: TrendingUp },
    { key: 'showIcebergSize', label: 'Iceberg Size', icon: Box },
    { key: 'showDriftSpeed', label: 'Drift Speed', icon: Navigation },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-slate-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WavesIcon23 className="h-4 w-4 text-blue-400" />
              Iceberg Calving Monitor
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
                setState({ statusFilter: v as IcebergCalvingState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
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
              <div className="text-[10px] text-slate-400/70">Total Glaciers</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalGlaciers}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Calving Rate</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgCalvingRate}</div>
              <div className="text-[9px] text-slate-400/60">km2/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Iceberg Size</div>
              <div className="text-sm font-semibold text-slate-300">{summary.avgSize}</div>
              <div className="text-[9px] text-slate-400/60">km2</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Drift Speed</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgSpeed}</div>
              <div className="text-[9px] text-slate-400/60">km/day</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Glaciers ({filteredItems.length})
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
                        {state.showCalvingRate && (
                          <div>
                            Calving:{' '}
                            <span className="text-slate-100 font-medium">{e.calvingRate} km2/yr</span>
                          </div>
                        )}
                        {state.showIcebergSize && (
                          <div>
                            Size:{' '}
                            <span className="text-slate-100 font-medium">{e.icebergSize} km2</span>
                          </div>
                        )}
                        {state.showDriftSpeed && (
                          <div>
                            Drift:{' '}
                            <span className="text-slate-100 font-medium">{e.driftSpeed} km/day</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No glaciers match the current filter.
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
                    <span className="text-slate-400/70">Calving Rate: </span>
                    <span className="font-medium text-blue-400">{activeItem.calvingRate} km2/year</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Iceberg Size: </span>
                    <span className="font-medium text-slate-300">{activeItem.icebergSize} km2</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Drift Speed: </span>
                    <span className="font-medium text-slate-400">{activeItem.driftSpeed} km/day</span>
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
