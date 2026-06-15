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
import { useMapStore, type UrbanHeatVentilationState, type UrbanHeatVentilationData } from '@/lib/map-store'
import { Wind as WindIcon9, X, Wind, Thermometer, MapPin, Filter, Activity } from 'lucide-react'

const SAMPLE_LOCATIONS: UrbanHeatVentilationData[] = [
  {
    id: 'uhv-stuttgart',
    name: 'Stuttgart Killesberg',
    lat: 48.8,
    lng: 9.2,
    airflowRate: 3.5,
    temperatureReduction: 4.5,
    pollutionRemoval: 35,
    efficiency: 'good',
    buildingHeight: 25,
    description: 'Hill-to-valley ventilation corridor',
  },
  {
    id: 'uhv-tokyo',
    name: 'Tokyo Sumida',
    lat: 35.7,
    lng: 139.8,
    airflowRate: 1.2,
    temperatureReduction: 1.5,
    pollutionRemoval: 12,
    efficiency: 'poor',
    buildingHeight: 45,
    description: 'Dense urban canyon restricting airflow',
  },
  {
    id: 'uhv-singapore',
    name: 'Singapore Marina',
    lat: 1.3,
    lng: 103.9,
    airflowRate: 2.8,
    temperatureReduction: 3.0,
    pollutionRemoval: 28,
    efficiency: 'excellent',
    buildingHeight: 15,
    description: 'Marina Bay waterfront ventilation',
  },
  {
    id: 'uhv-delhi',
    name: 'Delhi Ridge',
    lat: 28.6,
    lng: 77.2,
    airflowRate: 0.5,
    temperatureReduction: 0.8,
    pollutionRemoval: 5,
    efficiency: 'stagnant',
    buildingHeight: 60,
    description: 'Stagnant air zone with extreme heat',
  },
]

const STATUS_COLORS: Record<UrbanHeatVentilationData['efficiency'], { label: string; color: string; bgClass: string }> = {
  excellent: { label: 'Excellent', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  poor: { label: 'Poor', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  stagnant: { label: 'Stagnant', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ efficiency }: { efficiency: UrbanHeatVentilationData['efficiency'] }) {
  const cfg = STATUS_COLORS[efficiency]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function UrbanHeatVentilationMonitor() {
  const state = useMapStore((s) => s.urbanHeatVentilation)
  const setState = useMapStore((s) => s.setUrbanHeatVentilation)

  const corridors = useMemo(
    () => (state.corridors.length > 0 ? state.corridors : SAMPLE_LOCATIONS),
    [state.corridors]
  )

  const filteredCorridors = useMemo(() => {
    return corridors.filter((c) => {
      if (state.efficiencyFilter !== 'all' && c.efficiency !== state.efficiencyFilter) return false
      return true
    })
  }, [corridors, state.efficiencyFilter])

  const summary = useMemo(() => {
    if (filteredCorridors.length === 0) {
      return { totalCorridors: 0, avgAirflow: 0, avgTempReduction: 0, avgPollutionRemoval: 0 }
    }
    const avgAirflow = filteredCorridors.reduce((sum, c) => sum + c.airflowRate, 0) / filteredCorridors.length
    const avgTempReduction = filteredCorridors.reduce((sum, c) => sum + c.temperatureReduction, 0) / filteredCorridors.length
    const avgPollutionRemoval = filteredCorridors.reduce((sum, c) => sum + c.pollutionRemoval, 0) / filteredCorridors.length
    return {
      totalCorridors: filteredCorridors.length,
      avgAirflow: Math.round(avgAirflow * 10) / 10,
      avgTempReduction: Math.round(avgTempReduction * 10) / 10,
      avgPollutionRemoval: Math.round(avgPollutionRemoval * 10) / 10,
    }
  }, [filteredCorridors])

  const activeCorridor = useMemo(
    () => corridors.find((c) => c.id === state.activeCorridorId) ?? null,
    [corridors, state.activeCorridorId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredCorridors.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name, efficiency: c.efficiency, airflowRate: c.airflowRate },
    })),
  }), [filteredCorridors])

  useEffect(() => {
    if (state.corridors.length === 0) {
      useMapStore.getState().setUrbanHeatVentilation({ corridors: SAMPLE_LOCATIONS })
    }
  }, [state.corridors.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UrbanHeatVentilationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAirflow', label: 'Airflow Rate', icon: Wind },
    { key: 'showTemperature', label: 'Temp Reduction', icon: Thermometer },
    { key: 'showPollution', label: 'Pollution Removal', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-orange-950/95 backdrop-blur-xl border border-rose-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-100">
              <WindIcon9 className="h-4 w-4 text-rose-400" />
              Urban Heat Ventilation Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-300 hover:text-rose-100 hover:bg-rose-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-rose-100">
          {/* Efficiency Filter */}
          <div>
            <Label className="text-xs text-rose-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Efficiency Level
            </Label>
            <Select
              value={state.efficiencyFilter}
              onValueChange={(v) =>
                setState({ efficiencyFilter: v as UrbanHeatVentilationState['efficiencyFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-rose-900/40 border-rose-700/40 text-rose-100 hover:bg-rose-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Efficiencies</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="stagnant">Stagnant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <Icon className="h-3 w-3 text-rose-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-rose-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Total Corridors</div>
              <div className="text-sm font-semibold text-rose-200">{summary.totalCorridors}</div>
              <div className="text-[9px] text-rose-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Airflow</div>
              <div className="text-sm font-semibold text-rose-200">{summary.avgAirflow}</div>
              <div className="text-[9px] text-rose-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Temp Reduction</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgTempReduction}</div>
              <div className="text-[9px] text-rose-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Pollution Removal</div>
              <div className="text-sm font-semibold text-rose-200">{summary.avgPollutionRemoval}</div>
              <div className="text-[9px] text-rose-400/60">%</div>
            </div>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Corridor List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">
              Corridors ({filteredCorridors.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCorridors.map((corridor) => {
                  const isActive = state.activeCorridorId === corridor.id
                  const statusCfg = STATUS_COLORS[corridor.efficiency]
                  return (
                    <div
                      key={corridor.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-800/30'
                          : 'border-rose-700/30 hover:border-rose-500/30 hover:bg-rose-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCorridorId: isActive ? null : corridor.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon efficiency={corridor.efficiency} />
                          <span className="text-xs font-medium text-rose-100">{corridor.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-rose-300/60">
                        {state.showAirflow && (
                          <div>
                            Airflow:{' '}
                            <span className="text-rose-100 font-medium">{corridor.airflowRate}m/s</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp Reduction:{' '}
                            <span className="text-rose-100 font-medium">{corridor.temperatureReduction}°C</span>
                          </div>
                        )}
                        {state.showPollution && (
                          <div>
                            Pollution Removal:{' '}
                            <span className="text-rose-100 font-medium">{corridor.pollutionRemoval}%</span>
                          </div>
                        )}
                        {state.showAirflow && (
                          <div>
                            Building Height:{' '}
                            <span className="text-rose-100 font-medium">{corridor.buildingHeight}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCorridors.length === 0 && (
                  <div className="text-center text-xs text-rose-400/50 py-4">
                    No corridors match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Corridor Details */}
          {activeCorridor && (
            <>
              <Separator className="bg-rose-700/30" />
              <div className="space-y-2 rounded-lg border border-rose-600/30 bg-rose-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-100">{activeCorridor.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeCorridor.efficiency].bgClass}`}
                  >
                    {STATUS_COLORS[activeCorridor.efficiency].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-rose-300/60 italic">{activeCorridor.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-rose-400/70">Coordinates: </span>
                    <span className="font-medium text-rose-100">
                      {activeCorridor.lat.toFixed(1)}, {activeCorridor.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Airflow: </span>
                    <span className="font-medium text-rose-100">{activeCorridor.airflowRate}m/s</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Temp Reduction: </span>
                    <span className="font-medium text-cyan-400">{activeCorridor.temperatureReduction}°C</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Pollution Removal: </span>
                    <span className="font-medium text-rose-100">{activeCorridor.pollutionRemoval}%</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Building Height: </span>
                    <span className="font-medium text-orange-400">{activeCorridor.buildingHeight}m</span>
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
