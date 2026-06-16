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
import { useMapStore, type HydroelectricFlowState, type HydroelectricFlowData } from '@/lib/map-store'
import { Waves as WavesIcon24, X, Droplets, Gauge, Zap, BarChart3, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HydroelectricFlowData[] = [
  {
    id: 'hf-threegorges',
    name: 'Three Gorges',
    lat: 30.820,
    lng: 111.000,
    flowRate: 30000,
    reservoirLevel: 175,
    turbineEfficiency: 94,
    powerOutput: 22500,
    status: 'normal',
    description: 'World largest hydroelectric dam on the Yangtze River',
  },
  {
    id: 'hf-itaipu',
    name: 'Itaipu Brazil',
    lat: -25.410,
    lng: -54.590,
    flowRate: 12000,
    reservoirLevel: 220,
    turbineEfficiency: 92,
    powerOutput: 14000,
    status: 'normal',
    description: 'Second largest hydroelectric dam on the Parana River',
  },
  {
    id: 'hf-hoover',
    name: 'Hoover Dam',
    lat: 36.015,
    lng: -114.738,
    flowRate: 1500,
    reservoirLevel: 85,
    turbineEfficiency: 88,
    powerOutput: 2074,
    status: 'low',
    description: 'Historic dam on the Colorado River with declining reservoir',
  },
  {
    id: 'hf-aswan',
    name: 'Aswan High',
    lat: 23.970,
    lng: 32.880,
    flowRate: 8000,
    reservoirLevel: 180,
    turbineEfficiency: 90,
    powerOutput: 2100,
    status: 'normal',
    description: 'Major dam on the Nile River in Upper Egypt',
  },
]

const STATUS_COLORS: Record<HydroelectricFlowData['status'], { label: string; color: string; bgClass: string }> = {
  flood: { label: 'Flood', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  normal: { label: 'Normal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  low: { label: 'Low', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  drought: { label: 'Drought', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: HydroelectricFlowData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HydroelectricFlowMonitor() {
  const state = useMapStore((s) => s.hydroelectricFlow)
  const setState = useMapStore((s) => s.setHydroelectricFlow)

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
      return { totalDams: 0, avgFlow: 0, avgOutput: 0, avgEfficiency: 0 }
    }
    const avgFlow = filteredItems.reduce((sum, e) => sum + e.flowRate, 0) / filteredItems.length
    const avgOutput = filteredItems.reduce((sum, e) => sum + e.powerOutput, 0) / filteredItems.length
    const avgEfficiency = filteredItems.reduce((sum, e) => sum + e.turbineEfficiency, 0) / filteredItems.length
    return {
      totalDams: filteredItems.length,
      avgFlow: Math.round(avgFlow),
      avgOutput: Math.round(avgOutput),
      avgEfficiency: Math.round(avgEfficiency),
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
      properties: { id: e.id, name: e.name, status: e.status, flowRate: e.flowRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHydroelectricFlow({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydroelectricFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: Droplets },
    { key: 'showReservoirLevel', label: 'Head Level', icon: Gauge },
    { key: 'showPowerOutput', label: 'Output MW', icon: Zap },
    { key: 'showTurbineEfficiency', label: 'Efficiency', icon: BarChart3 },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <WavesIcon24 className="h-4 w-4 text-blue-400" />
              Hydroelectric Flow Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as HydroelectricFlowState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="flood">Flood</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="drought">Drought</SelectItem>
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
              <div className="text-[10px] text-blue-400/70">Flow Rate</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgFlow}</div>
              <div className="text-[9px] text-blue-400/60">m\u00B3/s avg</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Output MW</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgOutput}</div>
              <div className="text-[9px] text-blue-400/60">average</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Efficiency</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgEfficiency}%</div>
              <div className="text-[9px] text-blue-400/60">turbine avg</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Dams</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalDams}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Hydroelectric Dams ({filteredItems.length})
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
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-blue-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showFlowRate && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-blue-100 font-medium">{e.flowRate} m\u00B3/s</span>
                          </div>
                        )}
                        {state.showReservoirLevel && (
                          <div>
                            Head Level:{' '}
                            <span className="text-blue-100 font-medium">{e.reservoirLevel} m</span>
                          </div>
                        )}
                        {state.showPowerOutput && (
                          <div>
                            Output:{' '}
                            <span className="text-blue-100 font-medium">{e.powerOutput} MW</span>
                          </div>
                        )}
                        {state.showTurbineEfficiency && (
                          <div>
                            Efficiency:{' '}
                            <span className="text-blue-100 font-medium">{e.turbineEfficiency}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No dams match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
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
                    <span className="text-blue-400/70">Flow Rate: </span>
                    <span className="font-medium text-blue-300">{activeItem.flowRate} m\u00B3/s</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Output: </span>
                    <span className="font-medium text-indigo-300">{activeItem.powerOutput} MW</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Efficiency: </span>
                    <span className="font-medium text-cyan-400">{activeItem.turbineEfficiency}%</span>
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
