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
import { useMapStore, type VolcanicLaharState, type VolcanicLaharData } from '@/lib/map-store'
import { Flame as FlameIcon12, X, Layers, Activity, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: VolcanicLaharData[] = [
  {
    id: 'vl-pinatubo',
    name: 'Pinatubo Channel',
    lat: 15.1,
    lng: 120.4,
    volume: 500,
    velocity: 60,
    reachDistance: 40,
    triggerType: 'rainfall',
    risk: 'extreme',
    description: 'Typhoon-triggered lahar from 1991 eruption',
  },
  {
    id: 'vl-ruapehu',
    name: 'Ruapehu Crater',
    lat: -39.3,
    lng: 175.6,
    volume: 50,
    velocity: 30,
    reachDistance: 15,
    triggerType: 'dam_break',
    risk: 'high',
    description: 'Crater lake breakout lahar risk',
  },
  {
    id: 'vl-cotopaxi',
    name: 'Cotopaxi Drainage',
    lat: -0.7,
    lng: -78.4,
    volume: 200,
    velocity: 45,
    reachDistance: 30,
    triggerType: 'glacial_melt',
    risk: 'extreme',
    description: 'Glacial melt lahar hazard from ice-capped volcano',
  },
  {
    id: 'vl-unzen',
    name: 'Unzen Flow',
    lat: 32.8,
    lng: 130.3,
    volume: 80,
    velocity: 35,
    reachDistance: 10,
    triggerType: 'pyroclastic',
    risk: 'high',
    description: 'Pyroclastic flow-triggered debris avalanche',
  },
]

const STATUS_COLORS: Record<VolcanicLaharData['risk'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ risk }: { risk: VolcanicLaharData['risk'] }) {
  const cfg = STATUS_COLORS[risk]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VolcanicLaharMonitor() {
  const state = useMapStore((s) => s.volcanicLahar)
  const setState = useMapStore((s) => s.setVolcanicLahar)

  const flows = useMemo(
    () => (state.flows.length > 0 ? state.flows : SAMPLE_LOCATIONS),
    [state.flows]
  )

  const filteredFlows = useMemo(() => {
    return flows.filter((f) => {
      if (state.riskFilter !== 'all' && f.risk !== state.riskFilter) return false
      return true
    })
  }, [flows, state.riskFilter])

  const summary = useMemo(() => {
    if (filteredFlows.length === 0) {
      return { totalFlows: 0, avgVelocity: 0, maxVolume: 0, maxRisk: 'low' as const }
    }
    const avgVelocity = filteredFlows.reduce((sum, f) => sum + f.velocity, 0) / filteredFlows.length
    const maxVolume = Math.max(...filteredFlows.map((f) => f.volume))
    const riskOrder: Record<VolcanicLaharData['risk'], number> = { low: 0, moderate: 1, high: 2, extreme: 3 }
    const maxRisk = filteredFlows.reduce((max, f) => riskOrder[f.risk] > riskOrder[max] ? f.risk : max, 'low' as VolcanicLaharData['risk'])
    return {
      totalFlows: filteredFlows.length,
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      maxVolume,
      maxRisk,
    }
  }, [filteredFlows])

  const activeFlow = useMemo(
    () => flows.find((f) => f.id === state.activeFlowId) ?? null,
    [flows, state.activeFlowId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredFlows.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { id: f.id, name: f.name, risk: f.risk, velocity: f.velocity },
    })),
  }), [filteredFlows])

  useEffect(() => {
    if (state.flows.length === 0) {
      useMapStore.getState().setVolcanicLahar({ flows: SAMPLE_LOCATIONS })
    }
  }, [state.flows.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicLaharState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVolume', label: 'Volume', icon: Layers },
    { key: 'showVelocity', label: 'Velocity', icon: Activity },
    { key: 'showRisk', label: 'Risk Level', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-stone-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <FlameIcon12 className="h-4 w-4 text-red-400" />
              Volcanic Lahar Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Risk Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Risk Level
            </Label>
            <Select
              value={state.riskFilter}
              onValueChange={(v) =>
                setState({ riskFilter: v as VolcanicLaharState['riskFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Flows</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalFlows}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgVelocity}</div>
              <div className="text-[9px] text-red-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Max Volume</div>
              <div className="text-sm font-semibold text-red-200">{summary.maxVolume}M m³</div>
              <div className="text-[9px] text-red-400/60">largest flow</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Max Risk</div>
              <div className="text-sm font-semibold text-red-200">{STATUS_COLORS[summary.maxRisk].label}</div>
              <div className="text-[9px] text-red-400/60">highest level</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Flow List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Lahar Flows ({filteredFlows.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredFlows.map((flow) => {
                  const isActive = state.activeFlowId === flow.id
                  const statusCfg = STATUS_COLORS[flow.risk]
                  return (
                    <div
                      key={flow.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFlowId: isActive ? null : flow.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon risk={flow.risk} />
                          <span className="text-xs font-medium text-red-100">{flow.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-red-100 font-medium">{flow.volume}M m³</span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-red-100 font-medium">{flow.velocity}km/h</span>
                          </div>
                        )}
                        {state.showRisk && (
                          <div>
                            Reach:{' '}
                            <span className="text-red-100 font-medium">{flow.reachDistance}km</span>
                          </div>
                        )}
                        {state.showRisk && (
                          <div>
                            Trigger:{' '}
                            <span className="text-red-100 font-medium">{flow.triggerType.replace('_', ' ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredFlows.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No lahar flows match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Flow Details */}
          {activeFlow && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeFlow.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeFlow.risk].bgClass}`}
                  >
                    {STATUS_COLORS[activeFlow.risk].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeFlow.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeFlow.lat.toFixed(1)}, {activeFlow.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Volume: </span>
                    <span className="font-medium text-red-100">{activeFlow.volume}M m³</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Velocity: </span>
                    <span className="font-medium text-orange-400">{activeFlow.velocity}km/h</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Reach: </span>
                    <span className="font-medium text-red-100">{activeFlow.reachDistance}km</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Trigger: </span>
                    <span className="font-medium text-red-100">{activeFlow.triggerType.replace('_', ' ')}</span>
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
