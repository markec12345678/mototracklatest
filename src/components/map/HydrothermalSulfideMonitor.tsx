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
import { useMapStore, type HydrothermalSulfideState, type HydrothermalSulfideData } from '@/lib/map-store'
import { Flame as FlameIcon11, X, Layers, Activity, Thermometer, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: HydrothermalSulfideData[] = [
  {
    id: 'hs-tag',
    name: 'TAG Vent',
    lat: 26.1,
    lng: -44.8,
    mineralContent: 85,
    temperature: 363,
    activity: 'active',
    sulfideDeposit: 50000,
    depth: 3625,
    description: 'Trans-Atlantic Geotraverse active vent',
  },
  {
    id: 'hs-snakepit',
    name: 'Snake Pit',
    lat: 23.0,
    lng: -45.0,
    mineralContent: 72,
    temperature: 330,
    activity: 'pulsing',
    sulfideDeposit: 35000,
    depth: 3450,
    description: 'Pulsating sulfide mound system',
  },
  {
    id: 'hs-lostcity',
    name: 'Lost City',
    lat: 30.1,
    lng: -42.1,
    mineralContent: 45,
    temperature: 90,
    activity: 'active',
    sulfideDeposit: 80000,
    depth: 800,
    description: 'Off-axis alkaline hydrothermal field',
  },
  {
    id: 'hs-salem',
    name: 'Salem Vent',
    lat: -12.0,
    lng: 44.3,
    mineralContent: 60,
    temperature: 280,
    activity: 'dormant',
    sulfideDeposit: 20000,
    depth: 2800,
    description: 'Dormant sulfide chimney field',
  },
]

const STATUS_COLORS: Record<HydrothermalSulfideData['activity'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  pulsing: { label: 'Pulsing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  dormant: { label: 'Dormant', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  extinct: { label: 'Extinct', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

function TrendIcon({ activity }: { activity: HydrothermalSulfideData['activity'] }) {
  const cfg = STATUS_COLORS[activity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HydrothermalSulfideMonitor() {
  const state = useMapStore((s) => s.hydrothermalSulfide)
  const setState = useMapStore((s) => s.setHydrothermalSulfide)

  const vents = useMemo(
    () => (state.vents.length > 0 ? state.vents : SAMPLE_LOCATIONS),
    [state.vents]
  )

  const filteredVents = useMemo(() => {
    return vents.filter((v) => {
      if (state.activityFilter !== 'all' && v.activity !== state.activityFilter) return false
      return true
    })
  }, [vents, state.activityFilter])

  const summary = useMemo(() => {
    if (filteredVents.length === 0) {
      return { totalVents: 0, avgTemperature: 0, avgMineralContent: 0, totalDeposits: 0 }
    }
    const avgTemperature = filteredVents.reduce((sum, v) => sum + v.temperature, 0) / filteredVents.length
    const avgMineralContent = filteredVents.reduce((sum, v) => sum + v.mineralContent, 0) / filteredVents.length
    const totalDeposits = filteredVents.reduce((sum, v) => sum + v.sulfideDeposit, 0)
    return {
      totalVents: filteredVents.length,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgMineralContent: Math.round(avgMineralContent * 10) / 10,
      totalDeposits,
    }
  }, [filteredVents])

  const activeVent = useMemo(
    () => vents.find((v) => v.id === state.activeVentId) ?? null,
    [vents, state.activeVentId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredVents.map((v) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [v.lng, v.lat] },
      properties: { id: v.id, name: v.name, activity: v.activity, temperature: v.temperature },
    })),
  }), [filteredVents])

  useEffect(() => {
    if (state.vents.length === 0) {
      useMapStore.getState().setHydrothermalSulfide({ vents: SAMPLE_LOCATIONS })
    }
  }, [state.vents.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydrothermalSulfideState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMineralContent', label: 'Mineral Content', icon: Layers },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showActivity', label: 'Activity Status', icon: AlertTriangle },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-stone-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <FlameIcon11 className="h-4 w-4 text-orange-400" />
              Hydrothermal Sulfide Monitor
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
          {/* Activity Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Activity Status
            </Label>
            <Select
              value={state.activityFilter}
              onValueChange={(v) =>
                setState({ activityFilter: v as HydrothermalSulfideState['activityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pulsing">Pulsing</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
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
              <div className="text-[10px] text-orange-400/70">Total Vents</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalVents}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-orange-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Mineral Content</div>
              <div className="text-sm font-semibold text-orange-200">{summary.avgMineralContent}%</div>
              <div className="text-[9px] text-orange-400/60">concentration</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Total Deposits</div>
              <div className="text-sm font-semibold text-orange-200">{(summary.totalDeposits / 1000).toFixed(0)}k</div>
              <div className="text-[9px] text-orange-400/60">tonnes</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Vent List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Vents ({filteredVents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredVents.map((vent) => {
                  const isActive = state.activeVentId === vent.id
                  const statusCfg = STATUS_COLORS[vent.activity]
                  return (
                    <div
                      key={vent.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeVentId: isActive ? null : vent.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon activity={vent.activity} />
                          <span className="text-xs font-medium text-orange-100">{vent.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showMineralContent && (
                          <div>
                            Mineral:{' '}
                            <span className="text-orange-100 font-medium">{vent.mineralContent}%</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-orange-100 font-medium">{vent.temperature}°C</span>
                          </div>
                        )}
                        {state.showActivity && (
                          <div>
                            Deposit:{' '}
                            <span className="text-orange-100 font-medium">{vent.sulfideDeposit}t</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Depth:{' '}
                            <span className="text-orange-100 font-medium">{vent.depth}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredVents.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No vents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Vent Details */}
          {activeVent && (
            <>
              <Separator className="bg-orange-700/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeVent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeVent.activity].bgClass}`}
                  >
                    {STATUS_COLORS[activeVent.activity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-orange-300/60 italic">{activeVent.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400/70">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeVent.lat.toFixed(1)}, {activeVent.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Temperature: </span>
                    <span className="font-medium text-red-400">{activeVent.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Mineral: </span>
                    <span className="font-medium text-orange-100">{activeVent.mineralContent}%</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Sulfide Deposit: </span>
                    <span className="font-medium text-orange-100">{activeVent.sulfideDeposit.toLocaleString()}t</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Depth: </span>
                    <span className="font-medium text-orange-100">{activeVent.depth}m</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Activity: </span>
                    <span className="font-medium text-orange-100">{activeVent.activity}</span>
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
