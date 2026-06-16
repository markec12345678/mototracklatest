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
import { useMapStore, type LandslideVelocityState, type LandslideVelocityData } from '@/lib/map-store'
import { TriangleAlert as TriangleAlertIcon5, X, Gauge, Ruler, Mountain, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: LandslideVelocityData[] = [
  {
    id: 'lv-la-conchita',
    name: 'La Conchita Slide',
    lat: 34.3617,
    lng: -119.4478,
    velocity: 12.5,
    displacement: 340,
    depth: 18,
    status: 'active',
    description: 'Active slide threatening community',
  },
  {
    id: 'lv-vaiont',
    name: 'Vaiont Reservoir Slide',
    lat: 46.2633,
    lng: 12.3367,
    velocity: 45.0,
    displacement: 1200,
    depth: 45,
    status: 'accelerating',
    description: 'Historic catastrophic slide zone',
  },
  {
    id: 'lv-hongkong',
    name: 'Hong Kong Mid-Levels',
    lat: 22.2783,
    lng: 114.1500,
    velocity: 3.2,
    displacement: 85,
    depth: 12,
    status: 'slow',
    description: 'Slow-moving urban landslide',
  },
  {
    id: 'lv-utah',
    name: 'Utah Wasatch Front',
    lat: 40.5650,
    lng: -111.8383,
    velocity: 0.8,
    displacement: 22,
    depth: 8,
    status: 'dormant',
    description: 'Dormant slide mass monitored',
  },
]

const STATUS_COLORS: Record<LandslideVelocityData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  slow: { label: 'Slow', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dormant: { label: 'Dormant', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  accelerating: { label: 'Accelerating', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
}

function TrendIcon({ status }: { status: LandslideVelocityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function LandslideVelocityMonitor() {
  const state = useMapStore((s) => s.landslideVelocity)
  const setState = useMapStore((s) => s.setLandslideVelocity)

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
      return { totalSlides: 0, avgVelocity: 0, avgDisplacement: 0, activeAcceleratingCount: 0 }
    }
    const avgVelocity = filteredItems.reduce((sum, e) => sum + e.velocity, 0) / filteredItems.length
    const avgDisplacement = filteredItems.reduce((sum, e) => sum + e.displacement, 0) / filteredItems.length
    const activeAcceleratingCount = filteredItems.filter((e) => e.status === 'active' || e.status === 'accelerating').length
    return {
      totalSlides: filteredItems.length,
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      avgDisplacement: Math.round(avgDisplacement * 10) / 10,
      activeAcceleratingCount,
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
      properties: { id: e.id, name: e.name, status: e.status, velocity: e.velocity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setLandslideVelocity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LandslideVelocityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showDisplacement', label: 'Displacement', icon: Ruler },
    { key: 'showDepth', label: 'Depth', icon: Mountain },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <TriangleAlertIcon5 className="h-4 w-4 text-orange-400" />
              Landslide Velocity Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-orange-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as LandslideVelocityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="accelerating">Accelerating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Icon className="h-3 w-3 text-orange-400" />
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

          <Separator className="bg-orange-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Total Slides</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalSlides}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgVelocity}</div>
              <div className="text-[9px] text-orange-400/60">mm/day</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Displacement</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgDisplacement}</div>
              <div className="text-[9px] text-orange-400/60">mm</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Active+Accelerating</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeAcceleratingCount}</div>
              <div className="text-[9px] text-orange-400/60">slides</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Slides ({filteredItems.length})
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
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-orange-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-orange-100 font-medium">{e.velocity} mm/day</span>
                          </div>
                        )}
                        {state.showDisplacement && (
                          <div>
                            Displacement:{' '}
                            <span className="text-orange-100 font-medium">{e.displacement} mm</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-orange-100 font-medium">{e.depth} m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No slides match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-orange-700/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-orange-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400/70">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Velocity: </span>
                    <span className="font-medium text-amber-400">{activeItem.velocity} mm/day</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Displacement: </span>
                    <span className="font-medium text-orange-400">{activeItem.displacement} mm</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Depth: </span>
                    <span className="font-medium text-red-400">{activeItem.depth} m</span>
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
