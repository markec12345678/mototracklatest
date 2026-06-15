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
import { useMapStore, type StratosphericWarmingState, type StratosphericWarmingData } from '@/lib/map-store'
import { Thermometer as ThermometerIcon7, X, Layers, Wind, AlertTriangle, MapPin, Filter, Zap } from 'lucide-react'

const SAMPLE_LOCATIONS: StratosphericWarmingData[] = [
  {
    id: 'sw-arctic-vortex',
    name: 'Arctic Vortex',
    lat: 80.0,
    lng: 0.0,
    temperatureRise: 50,
    windSpeed: 180,
    altitude: 30,
    surfaceImpact: 0.85,
    intensity: 'extreme',
    description: 'Major sudden stratospheric warming',
  },
  {
    id: 'sw-siberian-split',
    name: 'Siberian Split',
    lat: 65.0,
    lng: 90.0,
    temperatureRise: 35,
    windSpeed: 120,
    altitude: 25,
    surfaceImpact: 0.6,
    intensity: 'major',
    description: 'Polar vortex displacement event',
  },
  {
    id: 'sw-canadian-wave',
    name: 'Canadian Wave',
    lat: 60.0,
    lng: -90.0,
    temperatureRise: 20,
    windSpeed: 80,
    altitude: 22,
    surfaceImpact: 0.4,
    intensity: 'moderate',
    description: 'Stratospheric wave breaking event',
  },
  {
    id: 'sw-scandinavian',
    name: 'Scandinavian Displacement',
    lat: 70.0,
    lng: 25.0,
    temperatureRise: 15,
    windSpeed: 60,
    altitude: 28,
    surfaceImpact: 0.3,
    intensity: 'minor',
    description: 'Minor vortex shift event',
  },
]

const STATUS_COLORS: Record<StratosphericWarmingData['intensity'], { label: string; color: string; bgClass: string }> = {
  minor: { label: 'Minor', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  major: { label: 'Major', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extreme: { label: 'Extreme', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ intensity }: { intensity: StratosphericWarmingData['intensity'] }) {
  const cfg = STATUS_COLORS[intensity]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function StratosphericWarmingMonitor() {
  const state = useMapStore((s) => s.stratosphericWarming)
  const setState = useMapStore((s) => s.setStratosphericWarming)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : SAMPLE_LOCATIONS),
    [state.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (state.intensityFilter !== 'all' && e.intensity !== state.intensityFilter) return false
      return true
    })
  }, [events, state.intensityFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { activeEvents: 0, maxTempRise: 0, avgWindSpeed: 0, avgSurfaceImpact: 0 }
    }
    const maxTempRise = Math.max(...filteredEvents.map((e) => e.temperatureRise))
    const avgWindSpeed = filteredEvents.reduce((sum, e) => sum + e.windSpeed, 0) / filteredEvents.length
    const avgSurfaceImpact = filteredEvents.reduce((sum, e) => sum + e.surfaceImpact, 0) / filteredEvents.length
    return {
      activeEvents: filteredEvents.length,
      maxTempRise,
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
      avgSurfaceImpact: Math.round(avgSurfaceImpact * 100) / 100,
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredEvents.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, intensity: e.intensity, temperatureRise: e.temperatureRise },
    })),
  }), [filteredEvents])

  useEffect(() => {
    if (state.events.length === 0) {
      useMapStore.getState().setStratosphericWarming({ events: SAMPLE_LOCATIONS })
    }
  }, [state.events.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof StratosphericWarmingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature Rise', icon: ThermometerIcon7 },
    { key: 'showWindReversal', label: 'Wind Speed', icon: Wind },
    { key: 'showImpact', label: 'Surface Impact', icon: Zap },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-red-950/95 backdrop-blur-xl border border-rose-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-100">
              <ThermometerIcon7 className="h-4 w-4 text-rose-400" />
              Stratospheric Warming Monitor
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
          {/* Intensity Filter */}
          <div>
            <Label className="text-xs text-rose-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Intensity Level
            </Label>
            <Select
              value={state.intensityFilter}
              onValueChange={(v) =>
                setState({ intensityFilter: v as StratosphericWarmingState['intensityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-rose-900/40 border-rose-700/40 text-rose-100 hover:bg-rose-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intensities</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
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
              <div className="text-[10px] text-rose-400/70">Active Events</div>
              <div className="text-sm font-semibold text-rose-200">{summary.activeEvents}</div>
              <div className="text-[9px] text-rose-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Max Temp Rise</div>
              <div className="text-sm font-semibold text-orange-400">{summary.maxTempRise}°C</div>
              <div className="text-[9px] text-rose-400/60">anomaly</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-rose-200">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-rose-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Surface Impact</div>
              <div className="text-sm font-semibold text-rose-200">{summary.avgSurfaceImpact}</div>
              <div className="text-[9px] text-rose-400/60">avg index</div>
            </div>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">
              Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = state.activeEventId === event.id
                  const statusCfg = STATUS_COLORS[event.intensity]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-800/30'
                          : 'border-rose-700/30 hover:border-rose-500/30 hover:bg-rose-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : event.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon intensity={event.intensity} />
                          <span className="text-xs font-medium text-rose-100">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-rose-300/60">
                        {state.showTemperature && (
                          <div>
                            Temp Rise:{' '}
                            <span className="text-rose-100 font-medium">{event.temperatureRise}°C</span>
                          </div>
                        )}
                        {state.showWindReversal && (
                          <div>
                            Wind:{' '}
                            <span className="text-rose-100 font-medium">{event.windSpeed}km/h</span>
                          </div>
                        )}
                        {state.showImpact && (
                          <div>
                            Impact:{' '}
                            <span className="text-rose-100 font-medium">{event.surfaceImpact}</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Altitude:{' '}
                            <span className="text-rose-100 font-medium">{event.altitude}km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-rose-400/50 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeEvent && (
            <>
              <Separator className="bg-rose-700/30" />
              <div className="space-y-2 rounded-lg border border-rose-600/30 bg-rose-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-100">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeEvent.intensity].bgClass}`}
                  >
                    {STATUS_COLORS[activeEvent.intensity].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-rose-300/60 italic">{activeEvent.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-rose-400/70">Coordinates: </span>
                    <span className="font-medium text-rose-100">
                      {activeEvent.lat.toFixed(1)}, {activeEvent.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Temp Rise: </span>
                    <span className="font-medium text-orange-400">{activeEvent.temperatureRise}°C</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Wind Speed: </span>
                    <span className="font-medium text-rose-100">{activeEvent.windSpeed}km/h</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Altitude: </span>
                    <span className="font-medium text-rose-100">{activeEvent.altitude}km</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Surface Impact: </span>
                    <span className="font-medium text-rose-100">{activeEvent.surfaceImpact}</span>
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
