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
import { useMapStore, type TrafficFlowState, type TrafficFlowData } from '@/lib/map-store'
import { Car as CarIcon2, X, Gauge, Timer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TrafficFlowData[] = [
  {
    id: 'tf-timessquare',
    name: 'Times Square NYC',
    lat: 40.758,
    lng: -73.986,
    averageSpeed: 12,
    congestionIndex: 82,
    vehicleCount: 3200,
    travelTime: 45,
    status: 'congested',
    description: 'Heavy traffic congestion in Midtown Manhattan commercial district',
  },
  {
    id: 'tf-shibuya',
    name: 'Shibuya Tokyo',
    lat: 35.664,
    lng: 139.700,
    averageSpeed: 18,
    congestionIndex: 65,
    vehicleCount: 2800,
    travelTime: 32,
    status: 'moderate',
    description: 'Moderate traffic around Shibuya crossing and surrounding area',
  },
  {
    id: 'tf-champselysees',
    name: 'Champs Elysees Paris',
    lat: 48.869,
    lng: 2.308,
    averageSpeed: 28,
    congestionIndex: 45,
    vehicleCount: 1800,
    travelTime: 18,
    status: 'flowing',
    description: 'Steady traffic flow along the iconic Parisian boulevard',
  },
  {
    id: 'tf-oxfordst',
    name: 'Oxford St London',
    lat: 51.514,
    lng: -0.145,
    averageSpeed: 35,
    congestionIndex: 22,
    vehicleCount: 1200,
    travelTime: 12,
    status: 'clear',
    description: 'Clear traffic conditions in central London shopping district',
  },
]

const STATUS_COLORS: Record<TrafficFlowData['status'], { label: string; color: string; bgClass: string }> = {
  congested: { label: 'Congested', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  flowing: { label: 'Flowing', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  clear: { label: 'Clear', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: TrafficFlowData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TrafficFlowMonitor() {
  const state = useMapStore((s) => s.trafficFlowMonitor)
  const setState = useMapStore((s) => s.setTrafficFlowMonitor)

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
      return { totalZones: 0, avgSpeed: 0, avgCongestion: 0, avgVehicles: 0 }
    }
    const avgSpeed = filteredItems.reduce((sum, e) => sum + e.averageSpeed, 0) / filteredItems.length
    const avgCongestion = filteredItems.reduce((sum, e) => sum + e.congestionIndex, 0) / filteredItems.length
    const avgVehicles = filteredItems.reduce((sum, e) => sum + e.vehicleCount, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgSpeed: avgSpeed.toFixed(1),
      avgCongestion: Math.round(avgCongestion),
      avgVehicles: Math.round(avgVehicles),
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
      properties: { id: e.id, name: e.name, status: e.status, averageSpeed: e.averageSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setTrafficFlowMonitor({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TrafficFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAverageSpeed', label: 'Average Speed', icon: Gauge },
    { key: 'showCongestionIndex', label: 'Congestion Index', icon: Timer },
    { key: 'showVehicleCount', label: 'Vehicle Count', icon: CarIcon2 },
    { key: 'showTravelTime', label: 'Travel Time', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CarIcon2 className="h-4 w-4 text-emerald-400" />
              Traffic Flow Monitor
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
                setState({ statusFilter: v as TrafficFlowState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="congested">Congested</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="flowing">Flowing</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgSpeed}</div>
              <div className="text-[9px] text-slate-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Congestion</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgCongestion}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Vehicles</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgVehicles}</div>
              <div className="text-[9px] text-slate-400/60">per hour</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Traffic Zones ({filteredItems.length})
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
                        {state.showAverageSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-slate-100 font-medium">{e.averageSpeed} km/h</span>
                          </div>
                        )}
                        {state.showCongestionIndex && (
                          <div>
                            Congestion:{' '}
                            <span className="text-slate-100 font-medium">{e.congestionIndex}</span>
                          </div>
                        )}
                        {state.showVehicleCount && (
                          <div>
                            Vehicles:{' '}
                            <span className="text-slate-100 font-medium">{e.vehicleCount}/h</span>
                          </div>
                        )}
                        {state.showTravelTime && (
                          <div>
                            Travel Time:{' '}
                            <span className="text-slate-100 font-medium">{e.travelTime} min</span>
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
                    <span className="text-slate-400/70">Avg Speed: </span>
                    <span className="font-medium text-emerald-400">{activeItem.averageSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Congestion: </span>
                    <span className="font-medium text-teal-400">{activeItem.congestionIndex}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Vehicles: </span>
                    <span className="font-medium text-slate-200">{activeItem.vehicleCount}/h</span>
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
