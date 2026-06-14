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
import { useMapStore, type SolarIrradianceState, type SolarIrradianceData } from '@/lib/map-store'
import { Sun as SunIcon7, X, Zap, ArrowRight, Circle, ShieldAlert, MapPin, Filter } from 'lucide-react'

const DEMO_STATIONS: SolarIrradianceData[] = [
  {
    id: 'si-1', name: 'Sahara Desert', lat: 25, lng: 0, ghi: 2500, dni: 2800, dhi: 400, uvIndex: 12, cloudCover: 5, status: 'excellent', description: 'Highest solar irradiance on Earth with minimal cloud cover',
  },
  {
    id: 'si-2', name: 'Arabian Desert', lat: 22, lng: 50, ghi: 2400, dni: 2600, dhi: 450, uvIndex: 11, cloudCover: 8, status: 'excellent', description: 'Premium solar energy potential in the Arabian Peninsula',
  },
  {
    id: 'si-3', name: 'Mojave Desert', lat: 35, lng: -116, ghi: 2200, dni: 2500, dhi: 500, uvIndex: 10, cloudCover: 10, status: 'good', description: 'Major solar farm region in the southwestern United States',
  },
  {
    id: 'si-4', name: 'Mediterranean', lat: 40, lng: 15, ghi: 1800, dni: 2000, dhi: 600, uvIndex: 8, cloudCover: 25, status: 'moderate', description: 'Good solar potential with seasonal variation',
  },
  {
    id: 'si-5', name: 'Northern Europe', lat: 55, lng: 10, ghi: 1000, dni: 900, dhi: 500, uvIndex: 4, cloudCover: 60, status: 'low', description: 'Limited solar irradiance due to high latitude and clouds',
  },
  {
    id: 'si-6', name: 'Antarctic', lat: -75, lng: 0, ghi: 300, dni: 200, dhi: 200, uvIndex: 1, cloudCover: 80, status: 'minimal', description: 'Minimal solar irradiance with extreme seasonal variation',
  },
]

const STATUS_CONFIG: Record<SolarIrradianceData['status'], { label: string; color: string; bgClass: string }> = {
  excellent: { label: 'Excellent', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  good: { label: 'Good', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  low: { label: 'Low', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  minimal: { label: 'Minimal', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SolarIrradianceMonitor() {
  const state = useMapStore((s) => s.solarIrradiance)
  const setState = useMapStore((s) => s.setSolarIrradiance)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.regionFilter !== 'all') return true
      return true
    })
  }, [stations, state.regionFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgGHI: 0, avgDNI: 0, excellentCount: 0 }
    }
    const avgGHI = filteredStations.reduce((sum, s) => sum + s.ghi, 0) / filteredStations.length
    const avgDNI = filteredStations.reduce((sum, s) => sum + s.dni, 0) / filteredStations.length
    const excellentCount = filteredStations.filter((s) => s.status === 'excellent').length
    return {
      avgGHI: Math.round(avgGHI),
      avgDNI: Math.round(avgDNI),
      excellentCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SolarIrradianceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGHI', label: 'GHI', icon: Zap },
    { key: 'showDNI', label: 'DNI', icon: ArrowRight },
    { key: 'showDHI', label: 'DHI', icon: Circle },
    { key: 'showUVIndex', label: 'UV Index', icon: ShieldAlert },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-yellow-950/95 to-orange-950/95 backdrop-blur-xl border border-yellow-800/40 rounded-xl shadow-lg shadow-yellow-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-yellow-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-yellow-100">
              <SunIcon7 className="h-4 w-4 text-yellow-400" />
              Solar Irradiance Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-yellow-100">
          {/* Region Filter */}
          <div>
            <Label className="text-xs text-yellow-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Region
            </Label>
            <Select
              value={state.regionFilter}
              onValueChange={(v) =>
                setState({ regionFilter: v as SolarIrradianceState['regionFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-yellow-900/40 border-yellow-700/40 text-yellow-100 hover:bg-yellow-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="desert">Desert</SelectItem>
                <SelectItem value="tropical">Tropical</SelectItem>
                <SelectItem value="temperate">Temperate</SelectItem>
                <SelectItem value="polar">Polar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-yellow-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-yellow-200">
                  <Icon className="h-3 w-3 text-yellow-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-yellow-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-yellow-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400">Avg GHI</div>
              <div className="text-sm font-semibold text-orange-300">{summary.avgGHI}</div>
              <div className="text-[9px] text-yellow-400">kWh/m&sup2;</div>
            </div>
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400">Avg DNI</div>
              <div className="text-sm font-semibold text-yellow-300">{summary.avgDNI}</div>
              <div className="text-[9px] text-yellow-400">kWh/m&sup2;</div>
            </div>
            <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/30 p-2 text-center">
              <div className="text-[10px] text-yellow-400">Excellent</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.excellentCount}</div>
              <div className="text-[9px] text-yellow-400">stations</div>
            </div>
          </div>

          <Separator className="bg-yellow-800/30" />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-yellow-300">
              Solar Stations ({filteredStations.length})
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
                          ? 'border-yellow-500/60 bg-yellow-800/30'
                          : 'border-yellow-800/30 hover:border-yellow-600/40 hover:bg-yellow-900/20'
                      }`}
                      onClick={() =>
                        setState({ activeStationId: isActive ? null : station.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-yellow-100">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-yellow-300">
                        {state.showGHI && (
                          <div>
                            GHI: <span className="text-yellow-100 font-medium">{station.ghi}</span>
                          </div>
                        )}
                        {state.showDNI && (
                          <div>
                            DNI: <span className="text-yellow-100 font-medium">{station.dni}</span>
                          </div>
                        )}
                        {state.showDHI && (
                          <div>
                            DHI: <span className="text-yellow-100 font-medium">{station.dhi}</span>
                          </div>
                        )}
                        {state.showUVIndex && (
                          <div>
                            UV: <span className="text-yellow-100 font-medium">{station.uvIndex}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-yellow-400 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator className="bg-yellow-800/30" />
              <div className="space-y-2 rounded-lg border border-yellow-600/30 bg-yellow-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-100">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeStation.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeStation.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-yellow-400">Coordinates: </span>
                    <span className="font-medium text-yellow-100">
                      {activeStation.lat.toFixed(1)}, {activeStation.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-400">GHI: </span>
                    <span className="font-medium text-orange-300">{activeStation.ghi} kWh/m&sup2;</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">DNI: </span>
                    <span className="font-medium text-yellow-200">{activeStation.dni} kWh/m&sup2;</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">DHI: </span>
                    <span className="font-medium text-yellow-200">{activeStation.dhi} kWh/m&sup2;</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">UV Index: </span>
                    <span className="font-medium text-red-400">{activeStation.uvIndex}</span>
                  </div>
                  <div>
                    <span className="text-yellow-400">Cloud Cover: </span>
                    <span className="font-medium text-yellow-200">{activeStation.cloudCover}%</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-yellow-400">Description: </span>
                    <span className="font-medium text-yellow-200">{activeStation.description}</span>
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
