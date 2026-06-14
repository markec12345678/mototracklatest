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
import { useMapStore, type SolarIrradianceState, type SolarIrradianceStation } from '@/lib/map-store'
import { Sun as SunIcon4, X, Gauge, Clock, MapPin, Filter } from 'lucide-react'

const DEMO_STATIONS: SolarIrradianceStation[] = [
  {
    id: 'si-sahara',
    name: 'Sahara Desert',
    latitude: 23.42,
    longitude: 25.66,
    globalHorizontalIrradiance: 6.5,
    directNormalIrradiance: 7.2,
    diffuseHorizontalIrradiance: 0.9,
    sunshineDuration: 3600,
    cloudCover: 8,
    uvIndex: 11,
    solarPotential: 'excellent',
  },
  {
    id: 'si-saudi',
    name: 'Saudi Arabia',
    latitude: 24.71,
    longitude: 46.68,
    globalHorizontalIrradiance: 6.1,
    directNormalIrradiance: 6.8,
    diffuseHorizontalIrradiance: 1.0,
    sunshineDuration: 3400,
    cloudCover: 12,
    uvIndex: 10,
    solarPotential: 'excellent',
  },
  {
    id: 'si-mojave',
    name: 'Mojave Desert',
    latitude: 35.01,
    longitude: -115.47,
    globalHorizontalIrradiance: 5.8,
    directNormalIrradiance: 6.5,
    diffuseHorizontalIrradiance: 1.1,
    sunshineDuration: 3200,
    cloudCover: 15,
    uvIndex: 9,
    solarPotential: 'high',
  },
  {
    id: 'si-outback',
    name: 'Australia Outback',
    latitude: -25.27,
    longitude: 133.78,
    globalHorizontalIrradiance: 5.9,
    directNormalIrradiance: 6.6,
    diffuseHorizontalIrradiance: 1.2,
    sunshineDuration: 3300,
    cloudCover: 14,
    uvIndex: 10,
    solarPotential: 'high',
  },
  {
    id: 'si-arizona',
    name: 'Arizona USA',
    latitude: 33.45,
    longitude: -111.95,
    globalHorizontalIrradiance: 5.5,
    directNormalIrradiance: 6.2,
    diffuseHorizontalIrradiance: 1.3,
    sunshineDuration: 3100,
    cloudCover: 18,
    uvIndex: 8,
    solarPotential: 'moderate',
  },
  {
    id: 'si-spain',
    name: 'Southern Spain',
    latitude: 37.39,
    longitude: -5.98,
    globalHorizontalIrradiance: 5.0,
    directNormalIrradiance: 5.5,
    diffuseHorizontalIrradiance: 1.5,
    sunshineDuration: 2900,
    cloudCover: 22,
    uvIndex: 7,
    solarPotential: 'moderate',
  },
]

const POTENTIAL_CONFIG: Record<
  SolarIrradianceStation['solarPotential'],
  { label: string; color: string; bgClass: string }
> = {
  excellent: { label: 'Excellent', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high: { label: 'High', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  moderate: { label: 'Moderate', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  minimal: { label: 'Minimal', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

export function SolarIrradianceMapper() {
  const state = useMapStore((s) => s.solarIrradiance)
  const setState = useMapStore((s) => s.setSolarIrradiance)

  const stations = useMemo(
    () => (state.stations.length > 0 ? state.stations : DEMO_STATIONS),
    [state.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (state.potentialFilter !== 'all' && s.solarPotential !== state.potentialFilter) return false
      return true
    })
  }, [stations, state.potentialFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgGHI: 0, avgSunshine: 0, highPotentialCount: 0 }
    }
    const avgGHI = filteredStations.reduce((sum, s) => sum + s.globalHorizontalIrradiance, 0) / filteredStations.length
    const avgSunshine = filteredStations.reduce((sum, s) => sum + s.sunshineDuration, 0) / filteredStations.length
    const highPotentialCount = filteredStations.filter(
      (s) => s.solarPotential === 'excellent' || s.solarPotential === 'high'
    ).length
    return {
      avgGHI: Math.round(avgGHI * 100) / 100,
      avgSunshine: Math.round(avgSunshine),
      highPotentialCount,
    }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === state.activeStationId) ?? null,
    [stations, state.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SolarIrradianceState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGHI', label: 'Global Horizontal Irradiance', icon: Gauge },
    { key: 'showDNI', label: 'Direct Normal Irradiance', icon: SunIcon4 },
    { key: 'showSunshineDuration', label: 'Sunshine Duration', icon: Clock },
    { key: 'showSolarPotential', label: 'Solar Potential', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SunIcon4 className="h-4 w-4 text-amber-500" />
              Solar Irradiance Mapper
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Potential Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Solar Potential
            </Label>
            <Select
              value={state.potentialFilter}
              onValueChange={(v) =>
                setState({
                  potentialFilter: v as SolarIrradianceState['potentialFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Potential Levels</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <Icon className="h-3 w-3 text-amber-500" />
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

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg GHI</div>
              <div className="text-sm font-semibold">{summary.avgGHI}</div>
              <div className="text-[9px] text-muted-foreground">kWh/m²/day</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Sunshine</div>
              <div className="text-sm font-semibold text-amber-600">{summary.avgSunshine}</div>
              <div className="text-[9px] text-muted-foreground">hrs/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Excellent/High</div>
              <div className="text-sm font-semibold text-amber-500">{summary.highPotentialCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Solar Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = state.activeStationId === station.id
                  const potentialCfg = POTENTIAL_CONFIG[station.solarPotential]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-border/40 hover:border-amber-500/20 hover:bg-amber-500/5'
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
                            style={{ backgroundColor: potentialCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${potentialCfg.bgClass}`}
                        >
                          {potentialCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showGHI && (
                          <div>
                            GHI:{' '}
                            <span className="text-foreground font-medium">
                              {station.globalHorizontalIrradiance} kWh/m²
                            </span>
                          </div>
                        )}
                        {state.showDNI && (
                          <div>
                            DNI:{' '}
                            <span className="text-foreground font-medium">
                              {station.directNormalIrradiance} kWh/m²
                            </span>
                          </div>
                        )}
                        {state.showSunshineDuration && (
                          <div>
                            Sunshine:{' '}
                            <span className="text-foreground font-medium">
                              {station.sunshineDuration} hrs
                            </span>
                          </div>
                        )}
                        {state.showSolarPotential && (
                          <div>
                            UV Index:{' '}
                            <span className="text-foreground font-medium">
                              {station.uvIndex}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStations.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Station Details */}
          {activeStation && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${POTENTIAL_CONFIG[activeStation.solarPotential].bgClass}`}
                  >
                    {POTENTIAL_CONFIG[activeStation.solarPotential].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeStation.latitude.toFixed(2)}, {activeStation.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">GHI: </span>
                    <span className="font-medium">{activeStation.globalHorizontalIrradiance} kWh/m²/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DNI: </span>
                    <span className="font-medium">{activeStation.directNormalIrradiance} kWh/m²/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Diffuse HI: </span>
                    <span className="font-medium">{activeStation.diffuseHorizontalIrradiance} kWh/m²/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sunshine: </span>
                    <span className="font-medium">{activeStation.sunshineDuration} hrs/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cloud Cover: </span>
                    <span className="font-medium">{activeStation.cloudCover}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">UV Index: </span>
                    <span className="font-medium">{activeStation.uvIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Potential: </span>
                    <span className="font-medium capitalize">{activeStation.solarPotential}</span>
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
