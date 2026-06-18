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
import { useMapStore, type TidalEnergyPotentialState, type TidalEnergyPotentialData } from '@/lib/map-store'
import { Anchor as AnchorIcon4, X, Waves, Gauge, Zap, BarChart3, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TidalEnergyPotentialData[] = [
  {
    id: 'te-fundy',
    name: 'Bay of Fundy',
    lat: 45.300,
    lng: -64.300,
    tidalRange: 16.3,
    currentSpeed: 5.5,
    powerDensity: 45,
    predictability: 98,
    status: 'exceptional',
    description: 'Highest tidal range in the world with massive energy potential',
  },
  {
    id: 'te-pentland',
    name: 'Pentland Firth',
    lat: 58.650,
    lng: -3.400,
    tidalRange: 4.0,
    currentSpeed: 4.0,
    powerDensity: 32,
    predictability: 95,
    status: 'strong',
    description: 'One of the strongest tidal sites in the UK',
  },
  {
    id: 'te-larance',
    name: 'La Rance France',
    lat: 48.630,
    lng: -2.030,
    tidalRange: 8.5,
    currentSpeed: 3.2,
    powerDensity: 18,
    predictability: 97,
    status: 'strong',
    description: 'World first tidal power station in Brittany France',
  },
  {
    id: 'te-uldolmok',
    name: 'Uldolmok Korea',
    lat: 34.350,
    lng: 126.320,
    tidalRange: 5.5,
    currentSpeed: 6.0,
    powerDensity: 38,
    predictability: 93,
    status: 'exceptional',
    description: 'Korean tidal strait with exceptional current speeds',
  },
]

const STATUS_COLORS: Record<TidalEnergyPotentialData['status'], { label: string; color: string; bgClass: string }> = {
  weak: { label: 'Weak', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  strong: { label: 'Strong', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  exceptional: { label: 'Exceptional', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

function TrendIcon({ status }: { status: TidalEnergyPotentialData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TidalEnergyPotentialMonitor() {
  const state = useMapStore((s) => s.tidalEnergyPotential)
  const setState = useMapStore((s) => s.setTidalEnergyPotential)

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
      return { totalSites: 0, avgRange: 0, avgSpeed: 0, avgPower: 0 }
    }
    const avgRange = filteredItems.reduce((sum, e) => sum + e.tidalRange, 0) / filteredItems.length
    const avgSpeed = filteredItems.reduce((sum, e) => sum + e.currentSpeed, 0) / filteredItems.length
    const avgPower = filteredItems.reduce((sum, e) => sum + e.powerDensity, 0) / filteredItems.length
    return {
      totalSites: filteredItems.length,
      avgRange: avgRange.toFixed(1),
      avgSpeed: avgSpeed.toFixed(1),
      avgPower: Math.round(avgPower),
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
      properties: { id: e.id, name: e.name, status: e.status, tidalRange: e.tidalRange },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setTidalEnergyPotential({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TidalEnergyPotentialState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTidalRange', label: 'Tidal Range', icon: Waves },
    { key: 'showCurrentSpeed', label: 'Flow Speed', icon: Gauge },
    { key: 'showPowerDensity', label: 'Power MW', icon: Zap },
    { key: 'showPredictability', label: 'Capacity Factor', icon: BarChart3 },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-teal-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <AnchorIcon4 className="h-4 w-4 text-teal-400" />
              Tidal Energy Potential Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Potential Level
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as TidalEnergyPotentialState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="exceptional">Exceptional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Tidal Range</div>
              <div className="text-sm font-semibold text-teal-300">{summary.avgRange}</div>
              <div className="text-[9px] text-teal-400/60">m avg</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Flow Speed</div>
              <div className="text-sm font-semibold text-cyan-300">{summary.avgSpeed}</div>
              <div className="text-[9px] text-teal-400/60">m/s avg</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Power MW</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgPower}</div>
              <div className="text-[9px] text-teal-400/60">kW/m\u00B2 avg</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Sites</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalSites}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Tidal Sites ({filteredItems.length})
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
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-teal-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showTidalRange && (
                          <div>
                            Tidal Range:{' '}
                            <span className="text-teal-100 font-medium">{e.tidalRange} m</span>
                          </div>
                        )}
                        {state.showCurrentSpeed && (
                          <div>
                            Flow Speed:{' '}
                            <span className="text-teal-100 font-medium">{e.currentSpeed} m/s</span>
                          </div>
                        )}
                        {state.showPowerDensity && (
                          <div>
                            Power:{' '}
                            <span className="text-teal-100 font-medium">{e.powerDensity} kW/m\u00B2</span>
                          </div>
                        )}
                        {state.showPredictability && (
                          <div>
                            Capacity:{' '}
                            <span className="text-teal-100 font-medium">{e.predictability}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Tidal Range: </span>
                    <span className="font-medium text-teal-300">{activeItem.tidalRange} m</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Flow Speed: </span>
                    <span className="font-medium text-cyan-300">{activeItem.currentSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Power: </span>
                    <span className="font-medium text-emerald-400">{activeItem.powerDensity} kW/m\u00B2</span>
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
