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
import { useMapStore, type HydrothermalDiffuseFlowState, type HydrothermalDiffuseFlowData } from '@/lib/map-store'
import { Droplets as DropletsIcon12, X, Gauge, Thermometer, FlaskConical, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HydrothermalDiffuseFlowData[] = [
  {
    id: 'hd-loihi',
    name: 'Lōihi Seamount Flow',
    lat: 18.9,
    lng: -155.3,
    flowRate: 45,
    temperature: 65,
    chemosynthesisRate: 8.5,
    status: 'active',
    description: 'Active diffuse flow supporting microbial mats at Lōihi',
  },
  {
    id: 'hd-tag',
    name: 'TAG Mound Flow',
    lat: 26.1,
    lng: -44.8,
    flowRate: 20,
    temperature: 40,
    chemosynthesisRate: 3.2,
    status: 'waning',
    description: 'Declining diffuse flow at Mid-Atlantic TAG site',
  },
  {
    id: 'hd-lucky',
    name: 'Lucky Strike Flow',
    lat: 37.2,
    lng: -32.2,
    flowRate: 80,
    temperature: 85,
    chemosynthesisRate: 12.0,
    status: 'pulsing',
    description: 'Variable diffuse flow with episodic pulses',
  },
  {
    id: 'hd-scylla',
    name: 'Scylla Extinct Field',
    lat: -12.0,
    lng: 44.0,
    flowRate: 0,
    temperature: 2,
    chemosynthesisRate: 0,
    status: 'extinct',
    description: 'Extinct diffuse flow field in Indian Ocean',
  },
]

const STATUS_COLORS: Record<HydrothermalDiffuseFlowData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  waning: { label: 'Waning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  pulsing: { label: 'Pulsing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extinct: { label: 'Extinct', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: HydrothermalDiffuseFlowData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HydrothermalDiffuseFlowMonitor() {
  const state = useMapStore((s) => s.hydrothermalDiffuseFlow)
  const setState = useMapStore((s) => s.setHydrothermalDiffuseFlow)

  const flows = useMemo(
    () => (state.flows.length > 0 ? state.flows : SAMPLE_LOCATIONS),
    [state.flows]
  )

  const filteredItems = useMemo(() => {
    return flows.filter((f) => {
      if (state.statusFilter !== 'all' && f.status !== state.statusFilter) return false
      return true
    })
  }, [flows, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFlows: 0, avgFlowRate: 0, avgTemperature: 0, activeCount: 0 }
    }
    const avgFlowRate = filteredItems.reduce((sum, f) => sum + f.flowRate, 0) / filteredItems.length
    const avgTemperature = filteredItems.reduce((sum, f) => sum + f.temperature, 0) / filteredItems.length
    const activeCount = filteredItems.filter((f) => f.status === 'active').length
    return {
      totalFlows: filteredItems.length,
      avgFlowRate: Math.round(avgFlowRate * 10) / 10,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => flows.find((f) => f.id === state.activeFlowId) ?? null,
    [flows, state.activeFlowId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { id: f.id, name: f.name, status: f.status, flowRate: f.flowRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.flows.length === 0) {
      useMapStore.getState().setHydrothermalDiffuseFlow({ flows: SAMPLE_LOCATIONS })
    }
  }, [state.flows.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydrothermalDiffuseFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: Gauge },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showChemosynthesisRate', label: 'Chemosynthesis Rate', icon: FlaskConical },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <DropletsIcon12 className="h-4 w-4 text-orange-400" />
              Hydrothermal Diffuse Flow Monitor
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
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as HydrothermalDiffuseFlowState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="waning">Waning</SelectItem>
                <SelectItem value="pulsing">Pulsing</SelectItem>
                <SelectItem value="extinct">Extinct</SelectItem>
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
              <div className="text-[10px] text-orange-400/70">Total Flows</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalFlows}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-orange-400/60">L/min</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-orange-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Active Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeCount}</div>
              <div className="text-[9px] text-orange-400/60">flows</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Flow List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Flows ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((f) => {
                  const isActive = state.activeFlowId === f.id
                  const statusCfg = STATUS_COLORS[f.status]
                  return (
                    <div
                      key={f.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFlowId: isActive ? null : f.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={f.status} />
                          <span className="text-xs font-medium text-orange-100">{f.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showFlowRate && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-orange-100 font-medium">{f.flowRate} L/min</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-orange-100 font-medium">{f.temperature}°C</span>
                          </div>
                        )}
                        {state.showChemosynthesisRate && (
                          <div>
                            Chemosynthesis:{' '}
                            <span className="text-orange-100 font-medium">{f.chemosynthesisRate} μmol/cm²/hr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No flows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flow Details */}
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
                    <span className="text-orange-400/70">Flow Rate: </span>
                    <span className="font-medium text-amber-400">{activeItem.flowRate} L/min</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Temperature: </span>
                    <span className="font-medium text-red-400">{activeItem.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Chemosynthesis: </span>
                    <span className="font-medium text-green-400">{activeItem.chemosynthesisRate} μmol/cm²/hr</span>
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
