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
import { useMapStore, type MudVolcanoActivityState, type MudVolcanoActivityData } from '@/lib/map-store'
import { Mountain as MountainIcon12, X, Droplets, Thermometer, Beaker, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MudVolcanoActivityData[] = [
  {
    id: 'mv-lusi',
    name: 'Lusi Mud Volcano',
    lat: -7.5256,
    lng: 112.7083,
    eruptionRate: 180000,
    flowTemperature: 100,
    mudViscosity: 50,
    status: 'erupting',
    description: 'Ongoing eruption since 2006',
  },
  {
    id: 'mv-dashgil',
    name: 'Dashgil Mud Volcano',
    lat: 40.0833,
    lng: 49.3167,
    eruptionRate: 50000,
    flowTemperature: 45,
    mudViscosity: 120,
    status: 'flowing',
    description: 'Active mud flow region',
  },
  {
    id: 'mv-salton',
    name: 'Salton Sea Mud Pots',
    lat: 33.3286,
    lng: -115.9158,
    eruptionRate: 200,
    flowTemperature: 30,
    mudViscosity: 300,
    status: 'dormant',
    description: 'Geothermal mud pots',
  },
  {
    id: 'mv-baku',
    name: 'Baku Mud Volcanoes',
    lat: 40.3833,
    lng: 49.85,
    eruptionRate: 75000,
    flowTemperature: 60,
    mudViscosity: 80,
    status: 'monitoring',
    description: 'Multiple active cones',
  },
]

const STATUS_COLORS: Record<MudVolcanoActivityData['status'], { label: string; color: string; bgClass: string }> = {
  erupting: { label: 'Erupting', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  flowing: { label: 'Flowing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  monitoring: { label: 'Monitoring', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: MudVolcanoActivityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MudVolcanoActivityMonitor() {
  const state = useMapStore((s) => s.mudVolcanoActivity)
  const setState = useMapStore((s) => s.setMudVolcanoActivity)

  const volcanoes = useMemo(
    () => (state.volcanoes.length > 0 ? state.volcanoes : SAMPLE_LOCATIONS),
    [state.volcanoes]
  )

  const filteredItems = useMemo(() => {
    return volcanoes.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [volcanoes, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalVolcanoes: 0, avgEruptionRate: 0, avgTemperature: 0, eruptingFlowingCount: 0 }
    }
    const avgEruptionRate = Math.round(filteredItems.reduce((sum, e) => sum + e.eruptionRate, 0) / filteredItems.length)
    const avgTemperature = Math.round(filteredItems.reduce((sum, e) => sum + e.flowTemperature, 0) / filteredItems.length)
    const eruptingFlowingCount = filteredItems.filter((e) => e.status === 'erupting' || e.status === 'flowing').length
    return {
      totalVolcanoes: filteredItems.length,
      avgEruptionRate,
      avgTemperature,
      eruptingFlowingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => volcanoes.find((e) => e.id === state.activeVolcanoId) ?? null,
    [volcanoes, state.activeVolcanoId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, eruptionRate: e.eruptionRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.volcanoes.length === 0) {
      useMapStore.getState().setMudVolcanoActivity({ volcanoes: SAMPLE_LOCATIONS })
    }
  }, [state.volcanoes.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MudVolcanoActivityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showEruptionRate', label: 'Eruption Rate', icon: Droplets },
    { key: 'showFlowTemperature', label: 'Flow Temperature', icon: Thermometer },
    { key: 'showMudViscosity', label: 'Mud Viscosity', icon: Beaker },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-brown-950/95 to-amber-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <MountainIcon12 className="h-4 w-4 text-amber-400" />
              Mud Volcano Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as MudVolcanoActivityState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="erupting">Erupting</SelectItem>
                <SelectItem value="flowing">Flowing</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Volcanoes</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalVolcanoes}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Eruption Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgEruptionRate.toLocaleString()}</div>
              <div className="text-[9px] text-amber-400/60">m³/hr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-amber-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Erupting+Flowing</div>
              <div className="text-sm font-semibold text-red-400">{summary.eruptingFlowingCount}</div>
              <div className="text-[9px] text-amber-400/60">volcanoes</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Volcano List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Volcanoes ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeVolcanoId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeVolcanoId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-amber-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showEruptionRate && (
                          <div>
                            Eruption Rate:{' '}
                            <span className="text-amber-100 font-medium">{e.eruptionRate.toLocaleString()} m³/hr</span>
                          </div>
                        )}
                        {state.showFlowTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-amber-100 font-medium">{e.flowTemperature} °C</span>
                          </div>
                        )}
                        {state.showMudViscosity && (
                          <div>
                            Viscosity:{' '}
                            <span className="text-amber-100 font-medium">{e.mudViscosity} Pa·s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No volcanoes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Volcano Details */}
          {activeItem && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Eruption Rate: </span>
                    <span className="font-medium text-orange-400">{activeItem.eruptionRate.toLocaleString()} m³/hr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Temperature: </span>
                    <span className="font-medium text-yellow-400">{activeItem.flowTemperature} °C</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Viscosity: </span>
                    <span className="font-medium text-amber-400">{activeItem.mudViscosity} Pa·s</span>
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
