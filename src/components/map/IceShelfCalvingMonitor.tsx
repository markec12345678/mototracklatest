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
import { useMapStore, type IceShelfCalvingState, type IceShelfCalvingData } from '@/lib/map-store'
import { MountainSnow as MountainSnowIcon5, X, Maximize2, Activity, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IceShelfCalvingData[] = [
  {
    id: 'is-ross',
    name: 'Ross Ice Shelf',
    lat: -80.0,
    lng: -175.0,
    area: 510000,
    calvingRate: 12.5,
    thickness: 350,
    status: 'retreating',
    description: 'Largest ice shelf in Antarctica showing retreat',
  },
  {
    id: 'is-ronne',
    name: 'Ronne-Filchner Ice Shelf',
    lat: -78.0,
    lng: -45.0,
    area: 422000,
    calvingRate: 8.0,
    thickness: 450,
    status: 'stable',
    description: 'Second-largest Antarctic ice shelf',
  },
  {
    id: 'is-larsen',
    name: 'Larsen C Ice Shelf',
    lat: -67.5,
    lng: -60.0,
    area: 55000,
    calvingRate: 25.0,
    thickness: 250,
    status: 'accelerating',
    description: 'Accelerating calving after A68 iceberg event',
  },
  {
    id: 'is-petermann',
    name: 'Petermann Glacier',
    lat: 80.7,
    lng: -60.0,
    area: 15000,
    calvingRate: 30.0,
    thickness: 600,
    status: 'collapsing',
    description: 'Rapid disintegration of floating tongue',
  },
]

const STATUS_COLORS: Record<IceShelfCalvingData['status'], { label: string; color: string; bgClass: string }> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  retreating: { label: 'Retreating', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  accelerating: { label: 'Accelerating', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsing: { label: 'Collapsing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: IceShelfCalvingData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IceShelfCalvingMonitor() {
  const state = useMapStore((s) => s.iceShelfCalving)
  const setState = useMapStore((s) => s.setIceShelfCalving)

  const shelves = useMemo(
    () => (state.shelves.length > 0 ? state.shelves : SAMPLE_LOCATIONS),
    [state.shelves]
  )

  const filteredItems = useMemo(() => {
    return shelves.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [shelves, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalShelves: 0, totalArea: 0, avgCalvingRate: 0, retreatingCount: 0 }
    }
    const totalArea = filteredItems.reduce((sum, s) => sum + s.area, 0)
    const avgCalvingRate = filteredItems.reduce((sum, s) => sum + s.calvingRate, 0) / filteredItems.length
    const retreatingCount = filteredItems.filter((s) => s.status === 'retreating' || s.status === 'accelerating' || s.status === 'collapsing').length
    return {
      totalShelves: filteredItems.length,
      totalArea,
      avgCalvingRate: Math.round(avgCalvingRate * 10) / 10,
      retreatingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => shelves.find((s) => s.id === state.activeShelfId) ?? null,
    [shelves, state.activeShelfId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, area: s.area },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.shelves.length === 0) {
      useMapStore.getState().setIceShelfCalving({ shelves: SAMPLE_LOCATIONS })
    }
  }, [state.shelves.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IceShelfCalvingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showArea', label: 'Area', icon: Maximize2 },
    { key: 'showCalvingRate', label: 'Calving Rate', icon: Activity },
    { key: 'showThickness', label: 'Thickness', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <MountainSnowIcon5 className="h-4 w-4 text-blue-400" />
              Ice Shelf Calving Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as IceShelfCalvingState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="retreating">Retreating</SelectItem>
                <SelectItem value="accelerating">Accelerating</SelectItem>
                <SelectItem value="collapsing">Collapsing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
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

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Shelves</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalShelves}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Area</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.totalArea.toLocaleString()}</div>
              <div className="text-[9px] text-blue-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Calving Rate</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgCalvingRate}</div>
              <div className="text-[9px] text-blue-400/60">km²/yr</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Retreating+</div>
              <div className="text-sm font-semibold text-amber-400">{summary.retreatingCount}</div>
              <div className="text-[9px] text-blue-400/60">shelves</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Shelf List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Ice Shelves ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeShelfId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeShelfId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-blue-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-blue-100 font-medium">{s.area.toLocaleString()} km²</span>
                          </div>
                        )}
                        {state.showCalvingRate && (
                          <div>
                            Calving Rate:{' '}
                            <span className="text-blue-100 font-medium">{s.calvingRate} km²/yr</span>
                          </div>
                        )}
                        {state.showThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-blue-100 font-medium">{s.thickness}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No ice shelves match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Shelf Details */}
          {activeItem && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Area: </span>
                    <span className="font-medium text-cyan-400">{activeItem.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Calving Rate: </span>
                    <span className="font-medium text-sky-400">{activeItem.calvingRate} km²/yr</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Thickness: </span>
                    <span className="font-medium text-indigo-400">{activeItem.thickness}m</span>
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
