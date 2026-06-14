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
import { useMapStore, type UrbanAirQualityState, type UrbanAirQualityData } from '@/lib/map-store'
import { Wind as WindIcon6, X, Gauge, Cloud, Flame, Leaf, MapPin, Filter } from 'lucide-react'

interface DemoCity extends UrbanAirQualityData {
  qualityLevel: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
}

const DEMO_CITIES: DemoCity[] = [
  {
    id: 'uaq-delhi',
    name: 'Delhi',
    lat: 28.6,
    lng: 77.2,
    aqi: 380,
    pm25: 250,
    no2: 85,
    o3: 45,
    so2: 35,
    status: 'hazardous',
    description: 'Severe air pollution from vehicle emissions and crop burning',
    qualityLevel: 'hazardous',
  },
  {
    id: 'uaq-beijing',
    name: 'Beijing',
    lat: 39.9,
    lng: 116.4,
    aqi: 180,
    pm25: 110,
    no2: 55,
    o3: 65,
    so2: 20,
    status: 'unhealthy',
    description: 'Industrial and coal-related air quality concerns',
    qualityLevel: 'unhealthy',
  },
  {
    id: 'uaq-losangeles',
    name: 'Los Angeles',
    lat: 34,
    lng: -118,
    aqi: 95,
    pm25: 35,
    no2: 40,
    o3: 80,
    so2: 5,
    status: 'moderate',
    description: 'Ozone-dominated smog from vehicle and industrial sources',
    qualityLevel: 'moderate',
  },
  {
    id: 'uaq-london',
    name: 'London',
    lat: 51.5,
    lng: -0.1,
    aqi: 55,
    pm25: 15,
    no2: 35,
    o3: 50,
    so2: 3,
    status: 'moderate',
    description: 'NO2 from diesel vehicles remains a concern',
    qualityLevel: 'moderate',
  },
  {
    id: 'uaq-stockholm',
    name: 'Stockholm',
    lat: 59.3,
    lng: 18,
    aqi: 25,
    pm25: 5,
    no2: 12,
    o3: 35,
    so2: 1,
    status: 'good',
    description: 'Clean air with effective emission controls',
    qualityLevel: 'good',
  },
  {
    id: 'uaq-cairo',
    name: 'Cairo',
    lat: 30,
    lng: 31.2,
    aqi: 220,
    pm25: 150,
    no2: 65,
    o3: 55,
    so2: 25,
    status: 'very_unhealthy',
    description: 'High pollution from industry, traffic, and desert dust',
    qualityLevel: 'very_unhealthy',
  },
]

const STATUS_CONFIG: Record<
  UrbanAirQualityData['status'],
  { label: string; color: string; bgClass: string }
> = {
  good: { label: 'Good', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  unhealthy: { label: 'Unhealthy', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  very_unhealthy: { label: 'Very Unhealthy', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  hazardous: { label: 'Hazardous', color: '#7f1d1d', bgClass: 'bg-red-900/10 text-red-900 border-red-900/30' },
}

const QUALITY_LABELS: Record<DemoCity['qualityLevel'], string> = {
  good: 'Good',
  moderate: 'Moderate',
  unhealthy: 'Unhealthy',
  very_unhealthy: 'Very Unhealthy',
  hazardous: 'Hazardous',
}

export function UrbanAirQualityMonitor() {
  const state = useMapStore((s) => s.urbanAirQuality)
  const setState = useMapStore((s) => s.setUrbanAirQuality)

  const cities = useMemo(
    () => (state.cities.length > 0 ? (state.cities as DemoCity[]) : DEMO_CITIES),
    [state.cities]
  )

  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      if (state.qualityFilter !== 'all' && c.status !== state.qualityFilter) return false
      return true
    })
  }, [cities, state.qualityFilter])

  const summary = useMemo(() => {
    if (filteredCities.length === 0) {
      return { avgAqi: 0, avgPm25: 0, unhealthyCount: 0 }
    }
    const avgAqi =
      filteredCities.reduce((sum, c) => sum + c.aqi, 0) / filteredCities.length
    const avgPm25 =
      filteredCities.reduce((sum, c) => sum + c.pm25, 0) / filteredCities.length
    const unhealthyCount = filteredCities.filter(
      (c) => c.status === 'unhealthy' || c.status === 'very_unhealthy' || c.status === 'hazardous'
    ).length
    return {
      avgAqi: Math.round(avgAqi),
      avgPm25: Math.round(avgPm25),
      unhealthyCount,
    }
  }, [filteredCities])

  const activeCity = useMemo(
    () => cities.find((c) => c.id === state.activeCityId) ?? null,
    [cities, state.activeCityId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof UrbanAirQualityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAQI', label: 'AQI', icon: Gauge },
    { key: 'showPM25', label: 'PM2.5', icon: Cloud },
    { key: 'showNO2', label: 'NO2', icon: Flame },
    { key: 'showO3', label: 'O3', icon: Leaf },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-green-950/80 backdrop-blur-xl border border-green-800/40 rounded-xl shadow-lg shadow-green-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <WindIcon6 className="h-4 w-4 text-green-400" />
              Urban Air Quality Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Quality Filter */}
          <div>
            <Label className="text-xs text-green-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Air Quality
            </Label>
            <Select
              value={state.qualityFilter}
              onValueChange={(v) =>
                setState({
                  qualityFilter: v as UrbanAirQualityState['qualityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality Levels</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="unhealthy">Unhealthy</SelectItem>
                <SelectItem value="very_unhealthy">Very Unhealthy</SelectItem>
                <SelectItem value="hazardous">Hazardous</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-green-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg AQI</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgAqi}</div>
              <div className="text-[9px] text-green-400">index</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Avg PM2.5</div>
              <div className="text-sm font-semibold text-green-300">{summary.avgPm25}</div>
              <div className="text-[9px] text-green-400">&micro;g/m&sup3;</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400">Unhealthy+</div>
              <div className="text-sm font-semibold text-red-400">{summary.unhealthyCount}</div>
              <div className="text-[9px] text-green-400">cities</div>
            </div>
          </div>

          <Separator className="bg-green-800/30" />

          {/* City List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300">
              Monitored Cities ({filteredCities.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCities.map((city) => {
                  const isActive = state.activeCityId === city.id
                  const statusCfg = STATUS_CONFIG[city.status]
                  return (
                    <div
                      key={city.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/60 bg-green-800/30'
                          : 'border-green-800/30 hover:border-green-600/40 hover:bg-green-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeCityId: isActive ? null : city.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-green-100">{city.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300">
                        {state.showAQI && (
                          <div>
                            AQI:{' '}
                            <span className="text-green-100 font-medium">
                              {city.aqi}
                            </span>
                          </div>
                        )}
                        {state.showPM25 && (
                          <div>
                            PM2.5:{' '}
                            <span className="text-green-100 font-medium">
                              {city.pm25} &micro;g/m&sup3;
                            </span>
                          </div>
                        )}
                        {state.showNO2 && (
                          <div>
                            NO2:{' '}
                            <span className="text-green-100 font-medium">
                              {city.no2} ppb
                            </span>
                          </div>
                        )}
                        {state.showO3 && (
                          <div>
                            O3:{' '}
                            <span className="text-green-100 font-medium">
                              {city.o3} ppb
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCities.length === 0 && (
                  <div className="text-center text-xs text-green-400 py-4">
                    No cities match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active City Details */}
          {activeCity && (
            <>
              <Separator className="bg-green-800/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeCity.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeCity.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeCity.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeCity.lat.toFixed(1)}, {activeCity.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400">AQI: </span>
                    <span className="font-medium text-amber-400">{activeCity.aqi}</span>
                  </div>
                  <div>
                    <span className="text-green-400">PM2.5: </span>
                    <span className="font-medium text-green-200">{activeCity.pm25} &micro;g/m&sup3;</span>
                  </div>
                  <div>
                    <span className="text-green-400">NO2: </span>
                    <span className="font-medium text-green-200">{activeCity.no2} ppb</span>
                  </div>
                  <div>
                    <span className="text-green-400">O3: </span>
                    <span className="font-medium text-green-200">{activeCity.o3} ppb</span>
                  </div>
                  <div>
                    <span className="text-green-400">SO2: </span>
                    <span className="font-medium text-green-200">{activeCity.so2} ppb</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-400">Quality Level: </span>
                    <span className="font-medium text-green-200">
                      {(activeCity as DemoCity).qualityLevel ? QUALITY_LABELS[(activeCity as DemoCity).qualityLevel] : 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-400">Description: </span>
                    <span className="font-medium text-green-200">{activeCity.description}</span>
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
