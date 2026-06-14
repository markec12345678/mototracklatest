'use client'

import { useMemo } from 'react'
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
import { useMapStore, type SeismicHarmonicState, type SeismicHarmonicData } from '@/lib/map-store'
import { Activity as ActivityIcon3, X, BarChart3, Clock, Layers, MapPin, Filter } from 'lucide-react'

interface DemoStation extends SeismicHarmonicData {
  stationType: 'volcanic' | 'tectonic' | 'hydrothermal' | 'induced'
}

const DEMO_STATIONS: DemoStation[] = [
  {
    id: 'shm-yellowstone',
    name: 'Yellowstone',
    lat: 44.4,
    lng: -110.7,
    amplitude: 2.5,
    frequency: 1.2,
    duration: 180,
    depth: 3,
    eventCount: 45,
    status: 'elevated',
    description: 'Elevated harmonic tremor beneath Yellowstone caldera',
    stationType: 'volcanic',
  },
  {
    id: 'shm-reykjanes',
    name: 'Iceland Reykjanes',
    lat: 63.8,
    lng: -22.4,
    amplitude: 4.8,
    frequency: 2.1,
    duration: 240,
    depth: 5,
    eventCount: 120,
    status: 'harmonic',
    description: 'Harmonic tremor indicating magma movement at Reykjanes',
    stationType: 'volcanic',
  },
  {
    id: 'shm-flegrei',
    name: 'Campi Flegrei',
    lat: 40.8,
    lng: 14.1,
    amplitude: 3.2,
    frequency: 0.8,
    duration: 300,
    depth: 2,
    eventCount: 80,
    status: 'elevated',
    description: 'Elevated seismicity at Campi Flegrei caldera complex',
    stationType: 'volcanic',
  },
  {
    id: 'shm-longvalley',
    name: 'Long Valley',
    lat: 37.6,
    lng: -118.9,
    amplitude: 1.5,
    frequency: 0.5,
    duration: 90,
    depth: 8,
    eventCount: 15,
    status: 'low',
    description: 'Low-level seismic activity in Long Valley caldera',
    stationType: 'tectonic',
  },
  {
    id: 'shm-hakone',
    name: 'Hakone Japan',
    lat: 35.2,
    lng: 139.0,
    amplitude: 5.5,
    frequency: 3.0,
    duration: 360,
    depth: 1,
    eventCount: 200,
    status: 'harmonic',
    description: 'Persistent harmonic tremor at Hakone volcanic complex',
    stationType: 'hydrothermal',
  },
  {
    id: 'shm-santorini',
    name: 'Santorini',
    lat: 36.4,
    lng: 25.4,
    amplitude: 6.2,
    frequency: 2.8,
    duration: 420,
    depth: 4,
    eventCount: 350,
    status: 'eruptive',
    description: 'Eruptive harmonic tremor at Santorini volcanic system',
    stationType: 'volcanic',
  },
]

const STATUS_CONFIG: Record<
  SeismicHarmonicData['status'],
  { label: string; color: string; bgClass: string }
> = {
  quiet: { label: 'Quiet', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  elevated: { label: 'Elevated', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  harmonic: { label: 'Harmonic', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  eruptive: { label: 'Eruptive', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const STATION_TYPE_LABELS: Record<DemoStation['stationType'], string> = {
  volcanic: 'Volcanic',
  tectonic: 'Tectonic',
  hydrothermal: 'Hydrothermal',
  induced: 'Induced',
}

export function SeismicHarmonicMonitor() {
  const state = useMapStore((s) => s.seismicHarmonic)
  const setState = useMapStore((s) => s.setSeismicHarmonic)

  const stations = useMemo(
    () => (state.stations.length > 0 ? (state.stations as DemoStation[]) : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.typeFilter !== 'all' && s.stationType !== state.typeFilter) return false
      return true
    })
  }, [stations, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgAmplitude: 0, avgFrequency: 0, harmonicEruptiveCount: 0 }
    }
    const avgAmplitude =
      filteredStations.reduce((sum, s) => sum + s.amplitude, 0) / filteredStations.length
    const avgFrequency =
      filteredStations.reduce((sum, s) => sum + s.frequency, 0) / filteredStations.length
    const harmonicEruptiveCount = filteredStations.filter(
      (s) => s.status === 'harmonic' || s.status === 'eruptive'
    ).length
    return {
      avgAmplitude: Math.round(avgAmplitude * 10) / 10,
      avgFrequency: Math.round(avgFrequency * 100) / 100,
      harmonicEruptiveCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeismicHarmonicState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAmplitude', label: 'Amplitude', icon: BarChart3 },
    { key: 'showFrequency', label: 'Frequency', icon: ActivityIcon3 },
    { key: 'showDuration', label: 'Duration', icon: Clock },
    { key: 'showDepth', label: 'Depth', icon: Layers },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg shadow-orange-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <ActivityIcon3 className="h-4 w-4 text-orange-400" />
              Seismic Harmonic Monitor
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
          {/* Station Type Filter */}
          <div>
            <Label className="text-xs text-orange-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Station Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as SeismicHarmonicState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="volcanic">Volcanic</SelectItem>
                <SelectItem value="tectonic">Tectonic</SelectItem>
                <SelectItem value="hydrothermal">Hydrothermal</SelectItem>
                <SelectItem value="induced">Induced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300">Display Options</Label>
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

          <Separator className="bg-orange-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Avg Amplitude</div>
              <div className="text-sm font-semibold text-orange-300">{summary.avgAmplitude}</div>
              <div className="text-[9px] text-orange-400">mm/s</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Avg Frequency</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgFrequency}</div>
              <div className="text-[9px] text-orange-400">Hz</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400">Harmonic/Eruptive</div>
              <div className="text-sm font-semibold text-red-400">{summary.harmonicEruptiveCount}</div>
              <div className="text-[9px] text-orange-400">stations</div>
            </div>
          </div>

          <Separator className="bg-orange-800/30" />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300">
              Seismic Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const statusCfg = STATUS_CONFIG[station.status]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/60 bg-orange-800/30'
                          : 'border-orange-800/30 hover:border-orange-600/40 hover:bg-orange-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-orange-100">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300">
                        {state.showAmplitude && (
                          <div>
                            Amplitude:{' '}
                            <span className="text-orange-100 font-medium">
                              {station.amplitude} mm/s
                            </span>
                          </div>
                        )}
                        {state.showFrequency && (
                          <div>
                            Frequency:{' '}
                            <span className="text-orange-100 font-medium">
                              {station.frequency} Hz
                            </span>
                          </div>
                        )}
                        {state.showDuration && (
                          <div>
                            Duration:{' '}
                            <span className="text-orange-100 font-medium">
                              {station.duration} min
                            </span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-orange-100 font-medium">
                              {station.depth} km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-orange-400 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator className="bg-orange-800/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeStation.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeStation.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeStation.lat.toFixed(1)}, {activeStation.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400">Amplitude: </span>
                    <span className="font-medium text-red-400">{activeStation.amplitude} mm/s</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Frequency: </span>
                    <span className="font-medium text-orange-200">{activeStation.frequency} Hz</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Duration: </span>
                    <span className="font-medium text-orange-200">{activeStation.duration} min</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Depth: </span>
                    <span className="font-medium text-orange-200">{activeStation.depth} km</span>
                  </div>
                  <div>
                    <span className="text-orange-400">Event Count: </span>
                    <span className="font-medium text-orange-200">{activeStation.eventCount}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-400">Station Type: </span>
                    <span className="font-medium text-orange-200">
                      {(activeStation as DemoStation).stationType ? STATION_TYPE_LABELS[(activeStation as DemoStation).stationType] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-orange-400">Description: </span>
                    <span className="font-medium text-orange-200">{activeStation.description}</span>
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
