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
import { useMapStore, type LavaFlowData, type LavaFlowState } from '@/lib/map-store'
import { Flame as FlameIcon4, X, Thermometer, Gauge, MapPin, Filter, Droplets } from 'lucide-react'

const DEMO_FLOWS: LavaFlowData[] = [
  {
    id: 'lf-kilauea',
    name: 'Kilauea East Rift',
    lat: 19.41,
    lng: -155.27,
    flowArea: 850,
    temperature: 1150,
    velocity: 15,
    effusionRate: 4.2,
    viscosity: 100,
    status: 'active',
    description: "Hawaii, USA - Pāhoehoe and ʻAʻā flows",
  },
  {
    id: 'lf-etna',
    name: 'Etna Southeast Crater',
    lat: 37.75,
    lng: 15.00,
    flowArea: 320,
    temperature: 1080,
    velocity: 8,
    effusionRate: 2.8,
    viscosity: 250,
    status: 'creeping',
    description: 'Sicily, Italy - Active lava fountain flows',
  },
  {
    id: 'lf-fagradalsfjall',
    name: 'Fagradalsfjall',
    lat: 63.90,
    lng: -22.27,
    flowArea: 150,
    temperature: 1200,
    velocity: 25,
    effusionRate: 6.5,
    viscosity: 50,
    status: 'dormant',
    description: 'Iceland - 2021-2023 Reykjanes eruption',
  },
  {
    id: 'lf-nyiragongo',
    name: 'Nyiragongo',
    lat: -1.52,
    lng: 29.25,
    flowArea: 480,
    temperature: 980,
    velocity: 60,
    effusionRate: 8.0,
    viscosity: 30,
    status: 'active',
    description: "DRC - World's fastest lava flows",
  },
  {
    id: 'lf-pacaya',
    name: 'Pacaya',
    lat: 14.38,
    lng: -90.60,
    flowArea: 95,
    temperature: 1050,
    velocity: 5,
    effusionRate: 1.5,
    viscosity: 350,
    status: 'stalled',
    description: 'Guatemala - MacKenney cone flows',
  },
  {
    id: 'lf-tolbachik',
    name: 'Tolbachik',
    lat: 55.83,
    lng: 160.33,
    flowArea: 1200,
    temperature: 1020,
    velocity: 3,
    effusionRate: 3.5,
    viscosity: 400,
    status: 'cooling',
    description: 'Kamchatka, Russia - 2012-2013 eruption',
  },
]

const STATUS_CONFIG: Record<
  LavaFlowData['status'],
  { label: string; color: string; bgClass: string }
> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  creeping: { label: 'Creeping', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  stalled: { label: 'Stalled', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  cooling: { label: 'Cooling', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  dormant: { label: 'Dormant', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
}

export function LavaFlowTracker() {
  const state = useMapStore((s) => s.lavaFlow)

  const flows = useMemo(
    () => (state.flows.length > 0 ? state.flows : DEMO_FLOWS),
    [state.flows]
  )

  const filteredFlows = useMemo(() => {
    return flows.filter((f) => {
      if (state.typeFilter !== 'all') {
        // Map typeFilter to status-based filtering since LavaFlowData doesn't have a flowType field
        // We interpret the filter as a lava flow morphology hint based on status
        return true // All flows shown; filter applies to overlay only
      }
      return true
    })
  }, [flows, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredFlows.length === 0) {
      return { avgTemperature: 0, avgVelocity: 0, activeCreepingCount: 0 }
    }
    const avgTemperature =
      filteredFlows.reduce((sum, f) => sum + f.temperature, 0) / filteredFlows.length
    const avgVelocity =
      filteredFlows.reduce((sum, f) => sum + f.velocity, 0) / filteredFlows.length
    const activeCreepingCount = filteredFlows.filter(
      (f) => f.status === 'active' || f.status === 'creeping'
    ).length
    return {
      avgTemperature: Math.round(avgTemperature),
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      activeCreepingCount,
    }
  }, [filteredFlows])

  const activeFlow = useMemo(
    () => flows.find((f) => f.id === state.activeFlowId) ?? null,
    [flows, state.activeFlowId]
  )

  useEffect(() => {
    if (state.flows.length === 0) {
      useMapStore.getState().setLavaFlow({ flows: DEMO_FLOWS })
    }
  }, [])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LavaFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowArea', label: 'Flow Area', icon: MapPin },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showVelocity', label: 'Velocity', icon: Gauge },
    { key: 'showEffusionRate', label: 'Effusion Rate', icon: Droplets },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-red-950/95 to-stone-950/95 backdrop-blur-xl border border-red-900/30 rounded-xl shadow-lg overflow-hidden text-stone-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <FlameIcon4 className="h-4 w-4 text-red-500" />
              Lava Flow Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-400 hover:text-stone-200 hover:bg-red-900/30"
              onClick={() => useMapStore.getState().setLavaFlow({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Lava Type Filter */}
          <div>
            <Label className="text-xs text-stone-400 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Lava Flow Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                useMapStore.getState().setLavaFlow({
                  typeFilter: v as LavaFlowState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-950/50 border-red-900/30 text-stone-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pahoehoe">Pāhoehoe</SelectItem>
                <SelectItem value="aa">ʻAʻā</SelectItem>
                <SelectItem value="block">Block</SelectItem>
                <SelectItem value="pillow">Pillow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-900/20" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-400">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-300">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) =>
                    useMapStore.getState().setLavaFlow({ [key]: checked })
                  }
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-900/20" />

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-red-900/30 bg-red-950/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Temperature</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-stone-500">°C</div>
            </div>
            <div className="rounded-lg border border-red-900/30 bg-red-950/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Avg Velocity</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgVelocity}</div>
              <div className="text-[9px] text-stone-500">m/h</div>
            </div>
            <div className="rounded-lg border border-red-900/30 bg-red-950/30 p-2 text-center">
              <div className="text-[10px] text-stone-400">Active/Creeping</div>
              <div className="text-sm font-semibold text-red-500">{summary.activeCreepingCount}</div>
              <div className="text-[9px] text-stone-500">flows</div>
            </div>
          </div>

          <Separator className="bg-red-900/20" />

          {/* Flow List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-400">
              Lava Flows ({filteredFlows.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFlows.map((flow) => {
                  const isActive = state.activeFlowId === flow.id
                  const statusCfg = STATUS_CONFIG[flow.status]
                  return (
                    <div
                      key={flow.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/40 bg-red-900/20'
                          : 'border-red-900/20 hover:border-red-700/30 hover:bg-red-950/30'
                      }`}
                      onClick={() =>
                        useMapStore.getState().setLavaFlow({
                          activeFlowId: isActive ? null : flow.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-stone-200">{flow.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-400">
                        {state.showFlowArea && (
                          <div>
                            Area:{' '}
                            <span className="text-stone-200 font-medium">
                              {flow.flowArea} ha
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-stone-200 font-medium">
                              {flow.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-stone-200 font-medium">
                              {flow.velocity} m/h
                            </span>
                          </div>
                        )}
                        {state.showEffusionRate && (
                          <div>
                            Effusion:{' '}
                            <span className="text-stone-200 font-medium">
                              {flow.effusionRate} m³/s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFlows.length === 0 && (
                  <div className="text-center text-xs text-stone-500 py-4">
                    No flows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flow Details */}
          {activeFlow && (
            <>
              <Separator className="bg-red-900/20" />
              <div className="space-y-2 rounded-lg border border-red-700/30 bg-red-950/30 p-3">
                <div className="flex items-center gap-2">
                  <FlameIcon4 className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-semibold text-stone-100">{activeFlow.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeFlow.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeFlow.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-stone-400 italic">{activeFlow.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-500">Coordinates: </span>
                    <span className="font-medium text-stone-200">
                      {activeFlow.lat.toFixed(2)}, {activeFlow.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">Flow Area: </span>
                    <span className="font-medium text-stone-200">{activeFlow.flowArea} ha</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Temperature: </span>
                    <span className="font-medium text-red-400">{activeFlow.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Velocity: </span>
                    <span className="font-medium text-orange-400">{activeFlow.velocity} m/h</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Effusion Rate: </span>
                    <span className="font-medium text-stone-200">{activeFlow.effusionRate} m³/s</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Viscosity: </span>
                    <span className="font-medium text-stone-200">{activeFlow.viscosity} Pa·s</span>
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
