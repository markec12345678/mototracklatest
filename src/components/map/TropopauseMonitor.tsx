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
import { useMapStore, type TropopauseData, type TropopauseState } from '@/lib/map-store'
import { ArrowUpFromLine as ArrowUpIcon2, X, Thermometer, MapPin, Filter, Layers, Activity } from 'lucide-react'

const DEMO_STATIONS: TropopauseData[] = [
  {
    id: 'tp-twp',
    name: 'Tropical Western Pacific',
    lat: 0.0,
    lng: 155.0,
    height: 17.2,
    temperature: -82,
    ozoneConcentration: 80,
    pressure: 95,
    lapseRateTropopause: -2.0,
    status: 'normal',
    description: 'Warm pool region - highest tropopause globally',
  },
  {
    id: 'tp-mna',
    name: 'Mid-Latitude North Atlantic',
    lat: 45.0,
    lng: -30.0,
    height: 11.5,
    temperature: -60,
    ozoneConcentration: 150,
    pressure: 220,
    lapseRateTropopause: -6.5,
    status: 'normal',
    description: 'North Atlantic jet stream region',
  },
  {
    id: 'tp-arc',
    name: 'Arctic Tropopause Fold',
    lat: 70.0,
    lng: 25.0,
    height: 8.0,
    temperature: -55,
    ozoneConcentration: 350,
    pressure: 350,
    lapseRateTropopause: -4.0,
    status: 'fold',
    description: 'Stratospheric intrusion event',
  },
  {
    id: 'tp-tp',
    name: 'Tibetan Plateau',
    lat: 32.0,
    lng: 88.0,
    height: 15.8,
    temperature: -78,
    ozoneConcentration: 100,
    pressure: 130,
    lapseRateTropopause: -3.5,
    status: 'elevated',
    description: 'Heat pump effect - elevated tropopause',
  },
  {
    id: 'tp-ant',
    name: 'Antarctic Vortex Region',
    lat: -78.0,
    lng: 0.0,
    height: 7.5,
    temperature: -50,
    ozoneConcentration: 420,
    pressure: 380,
    lapseRateTropopause: -5.0,
    status: 'depressed',
    description: 'Polar vortex subsidence zone',
  },
  {
    id: 'tp-eur',
    name: 'Double Tropopause Europe',
    lat: 50.0,
    lng: 10.0,
    height: 10.2,
    temperature: -58,
    ozoneConcentration: 280,
    pressure: 260,
    lapseRateTropopause: -1.5,
    status: 'double',
    description: 'Dynamic tropopause structure over Central Europe',
  },
]

const STATUS_CONFIG: Record<
  TropopauseData['status'],
  { label: string; color: string; bgClass: string }
> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  elevated: { label: 'Elevated', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  depressed: { label: 'Depressed', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  fold: { label: 'Fold', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  double: { label: 'Double', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
}

function getRegionForLat(lat: number): 'tropical' | 'midlatitude' | 'polar' {
  const absLat = Math.abs(lat)
  if (absLat <= 23.5) return 'tropical'
  if (absLat <= 66.5) return 'midlatitude'
  return 'polar'
}

export function TropopauseMonitor() {
  const state = useMapStore((s) => s.tropopause)
  const setState = useMapStore((s) => s.setTropopause)

  useEffect(() => {
    if (useMapStore.getState().tropopause.stations.length === 0) {
      useMapStore.getState().setTropopause({ stations: DEMO_STATIONS })
    }
  }, [])

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.regionFilter !== 'all') {
        const region = getRegionForLat(s.lat)
        if (region !== state.regionFilter) return false
      }
      return true
    })
  }, [stations, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgHeight: 0, avgTemperature: 0, anomalyCount: 0 }
    }
    const avgHeight = filteredStations.reduce((sum, s) => sum + s.height, 0) / filteredStations.length
    const avgTemperature = filteredStations.reduce((sum, s) => sum + s.temperature, 0) / filteredStations.length
    const anomalyCount = filteredStations.filter(
      (s) => s.status === 'fold' || s.status === 'double'
    ).length
    return {
      avgHeight: Math.round(avgHeight * 10) / 10,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      anomalyCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TropopauseState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showHeight', label: 'Height', icon: ArrowUpIcon2 },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showOzoneConcentration', label: 'Ozone Concentration', icon: Layers },
    { key: 'showPressure', label: 'Pressure', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-violet-950/95 to-indigo-950/95 backdrop-blur-xl border border-violet-500/20 rounded-xl shadow-lg overflow-hidden text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-200">
              <ArrowUpIcon2 className="h-4 w-4 text-violet-400" />
              Tropopause Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-white hover:bg-violet-800/50"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-violet-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({
                  regionFilter: v as TropopauseState['regionFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/50 border-violet-500/30 text-violet-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="tropical">Tropical</SelectItem>
                <SelectItem value="midlatitude">Mid-Latitude</SelectItem>
                <SelectItem value="polar">Polar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-500/20" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-500/20" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-violet-500/20 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-300">Avg Height</div>
              <div className="text-sm font-semibold text-violet-100">{summary.avgHeight}</div>
              <div className="text-[9px] text-violet-400">km</div>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-300">Avg Temp</div>
              <div className="text-sm font-semibold text-violet-100">{summary.avgTemperature}°C</div>
              <div className="text-[9px] text-violet-400">temperature</div>
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-300">Anomalies</div>
              <div className="text-sm font-semibold text-purple-400">{summary.anomalyCount}</div>
              <div className="text-[9px] text-violet-400">fold+double</div>
            </div>
          </div>

          <Separator className="bg-violet-500/20" />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300">
              Tropopause Stations ({filteredStations.length})
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
                          ? 'border-violet-400/50 bg-violet-800/30'
                          : 'border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-900/20'
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
                          <span className="text-xs font-medium text-violet-100">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300">
                        {state.showHeight && (
                          <div>
                            Height:{' '}
                            <span className="text-violet-100 font-medium">
                              {station.height} km
                            </span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-violet-100 font-medium">
                              {station.temperature}°C
                            </span>
                          </div>
                        )}
                        {state.showOzoneConcentration && (
                          <div>
                            Ozone:{' '}
                            <span className="text-violet-100 font-medium">
                              {station.ozoneConcentration} ppb
                            </span>
                          </div>
                        )}
                        {state.showPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-violet-100 font-medium">
                              {station.pressure} hPa
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-violet-400 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator className="bg-violet-500/20" />
              <div className="space-y-2 rounded-lg border border-violet-500/30 bg-violet-800/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeStation.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeStation.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300 italic">{activeStation.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeStation.lat.toFixed(1)}, {activeStation.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400">Height: </span>
                    <span className="font-medium text-violet-100">{activeStation.height} km</span>
                  </div>
                  <div>
                    <span className="text-violet-400">Temperature: </span>
                    <span className="font-medium text-violet-100">{activeStation.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-violet-400">Ozone: </span>
                    <span className="font-medium text-violet-100">{activeStation.ozoneConcentration} ppb</span>
                  </div>
                  <div>
                    <span className="text-violet-400">Pressure: </span>
                    <span className="font-medium text-violet-100">{activeStation.pressure} hPa</span>
                  </div>
                  <div>
                    <span className="text-violet-400">Lapse Rate: </span>
                    <span className="font-medium text-violet-100">{activeStation.lapseRateTropopause} K/km</span>
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
