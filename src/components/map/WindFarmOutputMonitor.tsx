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
import { useMapStore, type WindFarmOutputState, type WindFarmOutputData } from '@/lib/map-store'
import { Wind as WindIcon17, X, Gauge, Zap, BarChart3, RotateCw, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: WindFarmOutputData[] = [
  {
    id: 'wf-northsea',
    name: 'North Sea Farm',
    lat: 55.000,
    lng: 3.000,
    windSpeed: 12.5,
    powerOutput: 630,
    capacityFactor: 45,
    rotorRpm: 14,
    status: 'optimal',
    description: 'Offshore wind farm in the North Sea with consistent high winds',
  },
  {
    id: 'wf-texas',
    name: 'Texas Wind Corridor',
    lat: 34.500,
    lng: -101.500,
    windSpeed: 9.8,
    powerOutput: 420,
    capacityFactor: 38,
    rotorRpm: 16,
    status: 'good',
    description: 'Onshore wind corridor across the Texas panhandle region',
  },
  {
    id: 'wf-hornsea',
    name: 'Hornsea UK',
    lat: 53.900,
    lng: 1.500,
    windSpeed: 11.2,
    powerOutput: 1218,
    capacityFactor: 52,
    rotorRpm: 12,
    status: 'optimal',
    description: 'World largest offshore wind farm off the Yorkshire coast',
  },
  {
    id: 'wf-gansu',
    name: 'Gansu China',
    lat: 40.500,
    lng: 97.000,
    windSpeed: 8.5,
    powerOutput: 280,
    capacityFactor: 25,
    rotorRpm: 18,
    status: 'low',
    description: 'Massive onshore wind farm cluster in Gansu province',
  },
]

const STATUS_COLORS: Record<WindFarmOutputData['status'], { label: string; color: string; bgClass: string }> = {
  optimal: { label: 'Optimal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  low: { label: 'Low', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  curtailed: { label: 'Curtailed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  offline: { label: 'Offline', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
}

function TrendIcon({ status }: { status: WindFarmOutputData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WindFarmOutputMonitor() {
  const state = useMapStore((s) => s.windFarmOutput)
  const setState = useMapStore((s) => s.setWindFarmOutput)

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
      return { totalFarms: 0, avgOutput: 0, avgCapacity: 0, avgWind: 0 }
    }
    const avgOutput = filteredItems.reduce((sum, e) => sum + e.powerOutput, 0) / filteredItems.length
    const avgCapacity = filteredItems.reduce((sum, e) => sum + e.capacityFactor, 0) / filteredItems.length
    const avgWind = filteredItems.reduce((sum, e) => sum + e.windSpeed, 0) / filteredItems.length
    return {
      totalFarms: filteredItems.length,
      avgOutput: Math.round(avgOutput),
      avgCapacity: Math.round(avgCapacity),
      avgWind: avgWind.toFixed(1),
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
      properties: { id: e.id, name: e.name, status: e.status, powerOutput: e.powerOutput },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWindFarmOutput({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WindFarmOutputState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Gauge },
    { key: 'showPowerOutput', label: 'Output MW', icon: Zap },
    { key: 'showCapacityFactor', label: 'Capacity Factor', icon: BarChart3 },
    { key: 'showRotorRpm', label: 'Curtailment', icon: RotateCw },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <WindIcon17 className="h-4 w-4 text-sky-400" />
              Wind Farm Output Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-sky-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as WindFarmOutputState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="curtailed">Curtailed</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Output MW</div>
              <div className="text-sm font-semibold text-sky-300">{summary.avgOutput}</div>
              <div className="text-[9px] text-sky-400/60">average</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Capacity Factor</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgCapacity}%</div>
              <div className="text-[9px] text-sky-400/60">average</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Wind Speed</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgWind}</div>
              <div className="text-[9px] text-sky-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Farms</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalFarms}</div>
              <div className="text-[9px] text-sky-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">
              Wind Farms ({filteredItems.length})
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
                          ? 'border-sky-500/50 bg-sky-800/30'
                          : 'border-sky-700/30 hover:border-sky-500/30 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-sky-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300/60">
                        {state.showWindSpeed && (
                          <div>
                            Wind Speed:{' '}
                            <span className="text-sky-100 font-medium">{e.windSpeed} m/s</span>
                          </div>
                        )}
                        {state.showPowerOutput && (
                          <div>
                            Output:{' '}
                            <span className="text-sky-100 font-medium">{e.powerOutput} MW</span>
                          </div>
                        )}
                        {state.showCapacityFactor && (
                          <div>
                            Capacity:{' '}
                            <span className="text-sky-100 font-medium">{e.capacityFactor}%</span>
                          </div>
                        )}
                        {state.showRotorRpm && (
                          <div>
                            Rotor RPM:{' '}
                            <span className="text-sky-100 font-medium">{e.rotorRpm}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-sky-400/50 py-4">
                    No farms match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-sky-700/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-sky-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400/70">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Output: </span>
                    <span className="font-medium text-sky-300">{activeItem.powerOutput} MW</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Capacity: </span>
                    <span className="font-medium text-blue-300">{activeItem.capacityFactor}%</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Wind Speed: </span>
                    <span className="font-medium text-cyan-400">{activeItem.windSpeed} m/s</span>
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
