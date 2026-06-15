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
import { useMapStore, type LaharFlowTrackerState, type LaharFlowTrackerData } from '@/lib/map-store'
import { CloudRain as CloudRainIcon6, X, ArrowRight, Beaker, Waves, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: LaharFlowTrackerData[] = [
  {
    id: 'lf-rainier',
    name: 'Mt. Rainier Lahar Path',
    lat: 46.8523,
    lng: -121.7603,
    flowVelocity: 25,
    sedimentConcentration: 65,
    flowVolume: 500000,
    status: 'active',
    description: 'Osceola Mudflow path',
  },
  {
    id: 'lf-pinatubo',
    name: 'Mt. Pinatubo Lahar',
    lat: 15.142,
    lng: 120.3493,
    flowVelocity: 15,
    sedimentConcentration: 55,
    flowVolume: 300000,
    status: 'advancing',
    description: 'Typhoon-triggered flows',
  },
  {
    id: 'lf-ruapehu',
    name: 'Ruapehu Crater Lake',
    lat: -39.28,
    lng: 175.5633,
    flowVelocity: 8,
    sedimentConcentration: 40,
    flowVolume: 150000,
    status: 'channelized',
    description: 'Known lahar paths',
  },
  {
    id: 'lf-kelut',
    name: 'Kelut Volcano Lahar',
    lat: -7.9333,
    lng: 112.3083,
    flowVelocity: 0.5,
    sedimentConcentration: 10,
    flowVolume: 50000,
    status: 'deposited',
    description: 'Historic lahar deposits',
  },
]

const STATUS_COLORS: Record<LaharFlowTrackerData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  advancing: { label: 'Advancing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  channelized: { label: 'Channelized', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  deposited: { label: 'Deposited', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: LaharFlowTrackerData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function LaharFlowTracker() {
  const state = useMapStore((s) => s.laharFlowTracker)
  const setState = useMapStore((s) => s.setLaharFlowTracker)

  const flows = useMemo(
    () => (state.flows.length > 0 ? state.flows : SAMPLE_LOCATIONS),
    [state.flows]
  )

  const filteredItems = useMemo(() => {
    return flows.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [flows, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFlows: 0, maxVelocity: 0, totalVolume: 0, activeAdvancingCount: 0 }
    }
    const maxVelocity = Math.max(...filteredItems.map((e) => e.flowVelocity))
    const totalVolume = filteredItems.reduce((sum, e) => sum + e.flowVolume, 0)
    const activeAdvancingCount = filteredItems.filter((e) => e.status === 'active' || e.status === 'advancing').length
    return {
      totalFlows: filteredItems.length,
      maxVelocity,
      totalVolume,
      activeAdvancingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => flows.find((e) => e.id === state.activeFlowId) ?? null,
    [flows, state.activeFlowId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, flowVelocity: e.flowVelocity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.flows.length === 0) {
      useMapStore.getState().setLaharFlowTracker({ flows: SAMPLE_LOCATIONS })
    }
  }, [state.flows.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LaharFlowTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowVelocity', label: 'Flow Velocity', icon: ArrowRight },
    { key: 'showSedimentConcentration', label: 'Sediment Concentration', icon: Beaker },
    { key: 'showFlowVolume', label: 'Flow Volume', icon: Waves },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <CloudRainIcon6 className="h-4 w-4 text-orange-400" />
              Lahar Flow Tracker
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
                setState({ statusFilter: v as LaharFlowTrackerState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="advancing">Advancing</SelectItem>
                <SelectItem value="channelized">Channelized</SelectItem>
                <SelectItem value="deposited">Deposited</SelectItem>
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
              <div className="text-[10px] text-orange-400/70">Max Velocity</div>
              <div className="text-sm font-semibold text-orange-400">{summary.maxVelocity}</div>
              <div className="text-[9px] text-orange-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Total Volume</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.totalVolume.toLocaleString()}</div>
              <div className="text-[9px] text-orange-400/60">m³</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Active+Advancing</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeAdvancingCount}</div>
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
                {filteredItems.map((e) => {
                  const isActive = state.activeFlowId === e.id
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
                        setState({ activeFlowId: isActive ? null : e.id })
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
                        {state.showFlowVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-orange-100 font-medium">{e.flowVelocity} m/s</span>
                          </div>
                        )}
                        {state.showSedimentConcentration && (
                          <div>
                            Sediment:{' '}
                            <span className="text-orange-100 font-medium">{e.sedimentConcentration}%</span>
                          </div>
                        )}
                        {state.showFlowVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-orange-100 font-medium">{e.flowVolume.toLocaleString()} m³</span>
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
                    <span className="text-orange-400/70">Velocity: </span>
                    <span className="font-medium text-orange-400">{activeItem.flowVelocity} m/s</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Sediment: </span>
                    <span className="font-medium text-yellow-400">{activeItem.sedimentConcentration}%</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Volume: </span>
                    <span className="font-medium text-red-400">{activeItem.flowVolume.toLocaleString()} m³</span>
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
