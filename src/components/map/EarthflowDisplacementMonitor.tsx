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
import { useMapStore, type EarthflowDisplacementState, type EarthflowDisplacementData } from '@/lib/map-store'
import { TrendingDown as TrendingDownIcon4, X, Ruler, Gauge, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: EarthflowDisplacementData[] = [
  {
    id: 'ef-portuguese',
    name: 'Portuguese Bend',
    lat: 33.7400,
    lng: -118.3900,
    displacement: 450,
    flowRate: 5.2,
    moistureContent: 62,
    status: 'rapid',
    description: 'Rapid earthflow in coastal California',
  },
  {
    id: 'ef-mud-creek',
    name: 'Mud Creek Slide',
    lat: 36.0833,
    lng: -121.6000,
    displacement: 180,
    flowRate: 2.1,
    moistureContent: 48,
    status: 'moderate',
    description: 'Moderate earthflow on Big Sur coast',
  },
  {
    id: 'ef-nepal',
    name: 'Nepal Himal Earthflow',
    lat: 27.7000,
    lng: 85.3000,
    displacement: 45,
    flowRate: 0.8,
    moistureContent: 35,
    status: 'slow',
    description: 'Slow earthflow in monsoon terrain',
  },
  {
    id: 'ef-torres',
    name: 'Torres Del Paine Flow',
    lat: -51.0000,
    lng: -73.0000,
    displacement: 8,
    flowRate: 0.1,
    moistureContent: 18,
    status: 'stabilized',
    description: 'Stabilized earthflow in Patagonia',
  },
]

const STATUS_COLORS: Record<EarthflowDisplacementData['status'], { label: string; color: string; bgClass: string }> = {
  rapid: { label: 'Rapid', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  slow: { label: 'Slow', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stabilized: { label: 'Stabilized', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: EarthflowDisplacementData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function EarthflowDisplacementMonitor() {
  const state = useMapStore((s) => s.earthflowDisplacement)
  const setState = useMapStore((s) => s.setEarthflowDisplacement)

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
      return { totalFlows: 0, avgDisplacement: 0, avgFlowRate: 0, rapidCount: 0 }
    }
    const avgDisplacement = filteredItems.reduce((sum, e) => sum + e.displacement, 0) / filteredItems.length
    const avgFlowRate = filteredItems.reduce((sum, e) => sum + e.flowRate, 0) / filteredItems.length
    const rapidCount = filteredItems.filter((e) => e.status === 'rapid').length
    return {
      totalFlows: filteredItems.length,
      avgDisplacement: Math.round(avgDisplacement * 10) / 10,
      avgFlowRate: Math.round(avgFlowRate * 10) / 10,
      rapidCount,
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
      properties: { id: e.id, name: e.name, status: e.status, displacement: e.displacement },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setEarthflowDisplacement({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EarthflowDisplacementState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDisplacement', label: 'Displacement', icon: Ruler },
    { key: 'showFlowRate', label: 'Flow Rate', icon: Gauge },
    { key: 'showMoistureContent', label: 'Moisture Content', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <TrendingDownIcon4 className="h-4 w-4 text-violet-400" />
              Earthflow Displacement Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as EarthflowDisplacementState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="rapid">Rapid</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="stabilized">Stabilized</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Total Flows</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalFlows}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Displacement</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgDisplacement}</div>
              <div className="text-[9px] text-violet-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-violet-400/60">cm/day</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Rapid</div>
              <div className="text-sm font-semibold text-red-400">{summary.rapidCount}</div>
              <div className="text-[9px] text-violet-400/60">flows</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
              Flows ({filteredItems.length})
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
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-violet-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showDisplacement && (
                          <div>
                            Displacement:{' '}
                            <span className="text-violet-100 font-medium">{e.displacement} cm</span>
                          </div>
                        )}
                        {state.showFlowRate && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-violet-100 font-medium">{e.flowRate} cm/day</span>
                          </div>
                        )}
                        {state.showMoistureContent && (
                          <div>
                            Moisture:{' '}
                            <span className="text-violet-100 font-medium">{e.moistureContent}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No flows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Displacement: </span>
                    <span className="font-medium text-purple-400">{activeItem.displacement} cm</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Flow Rate: </span>
                    <span className="font-medium text-violet-400">{activeItem.flowRate} cm/day</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Moisture: </span>
                    <span className="font-medium text-red-400">{activeItem.moistureContent}%</span>
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
