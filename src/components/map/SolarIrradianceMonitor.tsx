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
import { useMapStore, type SolarIrradianceState, type SolarIrradianceData } from '@/lib/map-store'
import { Sun as SunIcon12, X, Zap, ArrowRight, Circle, SunMedium, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SolarIrradianceData[] = [
  {
    id: 'si-sahara',
    name: 'Sahara Solar',
    lat: 23.400,
    lng: 25.660,
    ghi: 2500,
    dni: 2800,
    dhi: 400,
    uvIndex: 12,
    cloudCover: 5,
    status: 'excellent',
    description: 'Highest solar irradiance on Earth with minimal cloud cover',
  },
  {
    id: 'si-mojave',
    name: 'Mojave Desert',
    lat: 35.010,
    lng: -115.470,
    ghi: 2200,
    dni: 2500,
    dhi: 500,
    uvIndex: 10,
    cloudCover: 10,
    status: 'excellent',
    description: 'Major solar farm region in the southwestern United States',
  },
  {
    id: 'si-arabian',
    name: 'Arabian Peninsula',
    lat: 24.000,
    lng: 45.000,
    ghi: 2400,
    dni: 2600,
    dhi: 450,
    uvIndex: 11,
    cloudCover: 8,
    status: 'good',
    description: 'Premium solar energy potential in the Arabian Peninsula',
  },
  {
    id: 'si-atacama',
    name: 'Atacama Desert',
    lat: -24.000,
    lng: -69.500,
    ghi: 2300,
    dni: 2700,
    dhi: 350,
    uvIndex: 13,
    cloudCover: 3,
    status: 'excellent',
    description: 'World highest DNI in the Atacama Desert of Chile',
  },
]

const STATUS_COLORS: Record<SolarIrradianceData['status'], { label: string; color: string; bgClass: string }> = {
  excellent: { label: 'Excellent', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  low: { label: 'Low', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  minimal: { label: 'Minimal', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: SolarIrradianceData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SolarIrradianceMonitor() {
  const state = useMapStore((s) => s.solarIrradiance)
  const setState = useMapStore((s) => s.setSolarIrradiance)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : SAMPLE_LOCATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.regionFilter !== 'all' && state.regionFilter !== '' && s.status !== state.regionFilter) return false
      return true
    })
  }, [stations, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgGHI: 0, avgDNI: 0, avgDHI: 0, peakHours: 0 }
    }
    const avgGHI = filteredStations.reduce((sum, s) => sum + s.ghi, 0) / filteredStations.length
    const avgDNI = filteredStations.reduce((sum, s) => sum + s.dni, 0) / filteredStations.length
    const avgDHI = filteredStations.reduce((sum, s) => sum + s.dhi, 0) / filteredStations.length
    const peakHours = avgGHI / 1000
    return {
      avgGHI: Math.round(avgGHI),
      avgDNI: Math.round(avgDNI),
      avgDHI: Math.round(avgDHI),
      peakHours: peakHours.toFixed(1),
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
      properties: { id: s.id, name: s.name, status: s.status, ghi: s.ghi },
    })),
  }), [filteredStations])

  useEffect(() => {
    if (state.stations.length === 0) {
      useMapStore.getState().setSolarIrradiance({ stations: SAMPLE_LOCATIONS })
    }
  }, [state.stations.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SolarIrradianceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGHI', label: 'GHI W/m\u00B2', icon: Zap },
    { key: 'showDNI', label: 'DNI W/m\u00B2', icon: ArrowRight },
    { key: 'showDHI', label: 'DHI W/m\u00B2', icon: Circle },
    { key: 'showUVIndex', label: 'Peak Hours', icon: SunMedium },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-orange-950/95 backdrop-blur-xl border border-amber-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <SunIcon12 className="h-4 w-4 text-amber-400" />
              Solar Irradiance Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.regionFilter || 'all'}
              onValueChange={(v) =>
                setState({ regionFilter: v as SolarIrradianceState['regionFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">GHI</div>
              <div className="text-sm font-semibold text-orange-300">{summary.avgGHI}</div>
              <div className="text-[9px] text-amber-400/60">W/m\u00B2</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">DNI</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgDNI}</div>
              <div className="text-[9px] text-amber-400/60">W/m\u00B2</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">DHI</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgDHI}</div>
              <div className="text-[9px] text-amber-400/60">W/m\u00B2</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Peak Hours</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.peakHours}</div>
              <div className="text-[9px] text-amber-400/60">h/day</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Solar Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const statusCfg = STATUS_COLORS[station.status]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeStationId: isActive ? null : station.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={station.status} />
                          <span className="text-xs font-medium text-amber-100">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showGHI && (
                          <div>
                            GHI:{' '}
                            <span className="text-amber-100 font-medium">{station.ghi} W/m\u00B2</span>
                          </div>
                        )}
                        {state.showDNI && (
                          <div>
                            DNI:{' '}
                            <span className="text-amber-100 font-medium">{station.dni} W/m\u00B2</span>
                          </div>
                        )}
                        {state.showDHI && (
                          <div>
                            DHI:{' '}
                            <span className="text-amber-100 font-medium">{station.dhi} W/m\u00B2</span>
                          </div>
                        )}
                        {state.showUVIndex && (
                          <div>
                            Peak Hours:{' '}
                            <span className="text-amber-100 font-medium">{(station.ghi / 1000).toFixed(1)} h</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeStation.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeStation.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeStation.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeStation.lat.toFixed(2)}, {activeStation.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">GHI: </span>
                    <span className="font-medium text-orange-300">{activeStation.ghi} W/m\u00B2</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">DNI: </span>
                    <span className="font-medium text-amber-200">{activeStation.dni} W/m\u00B2</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">DHI: </span>
                    <span className="font-medium text-yellow-400">{activeStation.dhi} W/m\u00B2</span>
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
