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
import { useMapStore, type LunarTidalForceState, type LunarTidalForceData } from '@/lib/map-store'
import { Moon as MoonIcon2, X, Layers, Activity, Waves, MapPin, Filter, Mountain } from 'lucide-react'

const SAMPLE_LOCATIONS: LunarTidalForceData[] = [
  {
    id: 'lt-fundy',
    name: 'Bay of Fundy',
    lat: 45.2,
    lng: -64.3,
    tidalRange: 16.3,
    lunarPhase: 'spring',
    currentSpeed: 4.5,
    gravitationalPull: 1.12,
    description: 'World highest tidal range',
  },
  {
    id: 'lt-montstmichel',
    name: 'Mont Saint-Michel',
    lat: 48.6,
    lng: -1.5,
    tidalRange: 14.0,
    lunarPhase: 'spring',
    currentSpeed: 2.8,
    gravitationalPull: 1.08,
    description: 'Extreme tidal flat dynamics',
  },
  {
    id: 'lt-turnagain',
    name: 'Turnagain Arm',
    lat: 60.9,
    lng: -149.5,
    tidalRange: 10.0,
    lunarPhase: 'neap',
    currentSpeed: 3.2,
    gravitationalPull: 0.95,
    description: 'Bore tide phenomenon',
  },
  {
    id: 'lt-derby',
    name: 'Derby King Sound',
    lat: -17.0,
    lng: 123.5,
    tidalRange: 11.0,
    lunarPhase: 'perigee',
    currentSpeed: 3.8,
    gravitationalPull: 1.15,
    description: 'Extreme perigean spring tide zone',
  },
]

const STATUS_COLORS: Record<LunarTidalForceData['lunarPhase'], { label: string; color: string; bgClass: string }> = {
  spring: { label: 'Spring', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  neap: { label: 'Neap', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  perigee: { label: 'Perigee', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  apogee: { label: 'Apogee', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

function TrendIcon({ lunarPhase }: { lunarPhase: LunarTidalForceData['lunarPhase'] }) {
  const cfg = STATUS_COLORS[lunarPhase]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function LunarTidalForceMonitor() {
  const state = useMapStore((s) => s.lunarTidalForce)
  const setState = useMapStore((s) => s.setLunarTidalForce)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : SAMPLE_LOCATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.phaseFilter !== 'all' && s.lunarPhase !== state.phaseFilter) return false
      return true
    })
  }, [stations, state.phaseFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { totalStations: 0, maxTidalRange: 0, avgCurrentSpeed: 0, avgGravitationalPull: 0 }
    }
    const maxTidalRange = Math.max(...filteredStations.map((s) => s.tidalRange))
    const avgCurrentSpeed = filteredStations.reduce((sum, s) => sum + s.currentSpeed, 0) / filteredStations.length
    const avgGravitationalPull = filteredStations.reduce((sum, s) => sum + s.gravitationalPull, 0) / filteredStations.length
    return {
      totalStations: filteredStations.length,
      maxTidalRange: Math.round(maxTidalRange * 10) / 10,
      avgCurrentSpeed: Math.round(avgCurrentSpeed * 10) / 10,
      avgGravitationalPull: Math.round(avgGravitationalPull * 100) / 100,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredStations.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, lunarPhase: s.lunarPhase, tidalRange: s.tidalRange },
    })),
  }), [filteredStations])

  useEffect(() => {
    if (state.stations.length === 0) {
      useMapStore.getState().setLunarTidalForce({ stations: SAMPLE_LOCATIONS })
    }
  }, [state.stations.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LunarTidalForceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTidalRange', label: 'Tidal Range', icon: Waves },
    { key: 'showLunarPhase', label: 'Lunar Phase', icon: MoonIcon2 },
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-slate-950/95 backdrop-blur-xl border border-indigo-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <MoonIcon2 className="h-4 w-4 text-indigo-400" />
              Lunar Tidal Force Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-indigo-100">
          {/* Phase Filter */}
          <div>
            <Label className="text-xs text-indigo-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Lunar Phase
            </Label>
            <Select
              value={state.phaseFilter}
              onValueChange={(v) =>
                setState({ phaseFilter: v as LunarTidalForceState['phaseFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="neap">Neap</SelectItem>
                <SelectItem value="perigee">Perigee</SelectItem>
                <SelectItem value="apogee">Apogee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                  <Icon className="h-3 w-3 text-indigo-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Total Stations</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.totalStations}</div>
              <div className="text-[9px] text-indigo-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Max Tidal Range</div>
              <div className="text-sm font-semibold text-blue-400">{summary.maxTidalRange}</div>
              <div className="text-[9px] text-indigo-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Current Speed</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.avgCurrentSpeed}</div>
              <div className="text-[9px] text-indigo-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Gravitational Pull</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgGravitationalPull}</div>
              <div className="text-[9px] text-indigo-400/60">relative</div>
            </div>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">
              Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const statusCfg = STATUS_COLORS[station.lunarPhase]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-800/30'
                          : 'border-indigo-700/30 hover:border-indigo-500/30 hover:bg-indigo-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeStationId: isActive ? null : station.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon lunarPhase={station.lunarPhase} />
                          <span className="text-xs font-medium text-indigo-100">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300/60">
                        {state.showTidalRange && (
                          <div>
                            Tidal Range:{' '}
                            <span className="text-indigo-100 font-medium">{station.tidalRange}m</span>
                          </div>
                        )}
                        {state.showLunarPhase && (
                          <div>
                            Lunar Phase:{' '}
                            <span className="text-indigo-100 font-medium">{station.lunarPhase}</span>
                          </div>
                        )}
                        {state.showCurrentSpeed && (
                          <div>
                            Current:{' '}
                            <span className="text-indigo-100 font-medium">{station.currentSpeed}m/s</span>
                          </div>
                        )}
                        {state.showTidalRange && (
                          <div>
                            Gravity:{' '}
                            <span className="text-indigo-100 font-medium">{station.gravitationalPull}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-indigo-400/50 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator className="bg-indigo-700/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeStation.lunarPhase].bgClass}`}
                  >
                    {STATUS_COLORS[activeStation.lunarPhase].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-indigo-300/60 italic">{activeStation.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400/70">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeStation.lat.toFixed(1)}, {activeStation.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Tidal Range: </span>
                    <span className="font-medium text-blue-400">{activeStation.tidalRange}m</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Current Speed: </span>
                    <span className="font-medium text-indigo-100">{activeStation.currentSpeed}m/s</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Gravity Pull: </span>
                    <span className="font-medium text-purple-400">{activeStation.gravitationalPull}</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Lunar Phase: </span>
                    <span className="font-medium text-indigo-100">{activeStation.lunarPhase}</span>
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
