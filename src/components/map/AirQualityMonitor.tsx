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
import { useMapStore, type AirQualityState, type AirQualityStation } from '@/lib/map-store'
import { Wind as WindIcon3, X, MapPin, Gauge, Cloud, Filter } from 'lucide-react'

const DEMO_STATIONS: AirQualityStation[] = [
  {
    id: 'aq-beijing',
    name: 'Beijing',
    latitude: 39.91,
    longitude: 116.39,
    aqi: 178,
    pm25: 98.5,
    pm10: 145.2,
    o3: 62.3,
    no2: 54.8,
    category: 'unhealthy',
    dominantPollutant: 'PM2.5',
  },
  {
    id: 'aq-delhi',
    name: 'Delhi',
    latitude: 28.61,
    longitude: 77.21,
    aqi: 245,
    pm25: 152.7,
    pm10: 210.4,
    o3: 48.1,
    no2: 72.3,
    category: 'very_unhealthy',
    dominantPollutant: 'PM2.5',
  },
  {
    id: 'aq-la',
    name: 'Los Angeles',
    latitude: 34.05,
    longitude: -118.24,
    aqi: 82,
    pm25: 28.3,
    pm10: 52.1,
    o3: 75.6,
    no2: 31.2,
    category: 'moderate',
    dominantPollutant: 'O3',
  },
  {
    id: 'aq-london',
    name: 'London',
    latitude: 51.51,
    longitude: -0.13,
    aqi: 42,
    pm25: 12.4,
    pm10: 28.7,
    o3: 38.5,
    no2: 29.1,
    category: 'good',
    dominantPollutant: 'NO2',
  },
  {
    id: 'aq-saopaulo',
    name: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
    aqi: 125,
    pm25: 58.9,
    pm10: 82.4,
    o3: 55.2,
    no2: 41.7,
    category: 'unhealthy_sensitive',
    dominantPollutant: 'O3',
  },
  {
    id: 'aq-cairo',
    name: 'Cairo',
    latitude: 30.04,
    longitude: 31.24,
    aqi: 310,
    pm25: 198.6,
    pm10: 285.3,
    o3: 42.8,
    no2: 68.5,
    category: 'hazardous',
    dominantPollutant: 'PM10',
  },
]

const CATEGORY_CONFIG: Record<
  AirQualityStation['category'],
  { label: string; color: string; bgClass: string }
> = {
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  unhealthy_sensitive: { label: 'Unhealthy (SG)', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  unhealthy: { label: 'Unhealthy', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  very_unhealthy: { label: 'Very Unhealthy', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  hazardous: { label: 'Hazardous', color: '#7f1d1d', bgClass: 'bg-red-900/10 text-red-800 dark:text-red-300 border-red-800/30' },
}

export function AirQualityMonitor() {
  const airQuality = useMapStore((s) => s.airQuality)
  const setAirQuality = useMapStore((s) => s.setAirQuality)

  const stations = useMemo(
    () => (airQuality.stations.length > 0 ? airQuality.stations : DEMO_STATIONS),
    [airQuality.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (airQuality.categoryFilter !== 'all' && s.category !== airQuality.categoryFilter) return false
      return true
    })
  }, [stations, airQuality.categoryFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { avgAqi: 0, goodCount: 0, worstAqi: 0 }
    }
    const avgAqi = filteredStations.reduce((sum, s) => sum + s.aqi, 0) / filteredStations.length
    const goodCount = filteredStations.filter((s) => s.category === 'good' || s.category === 'moderate').length
    const worstAqi = Math.max(...filteredStations.map((s) => s.aqi))
    return { avgAqi: Math.round(avgAqi), goodCount, worstAqi }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === airQuality.activeStationId) ?? null,
    [stations, airQuality.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!airQuality.open) return null

  const overlayToggles: { key: keyof AirQualityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAQI', label: 'AQI', icon: Gauge },
    { key: 'showPM25', label: 'PM2.5', icon: Cloud },
    { key: 'showO3', label: 'Ozone (O3)', icon: WindIcon3 },
    { key: 'showDominantPollutant', label: 'Dominant Pollutant', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WindIcon3 className="h-4 w-4 text-purple-500" />
              Air Quality Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setAirQuality({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Category Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              AQI Category
            </Label>
            <Select
              value={airQuality.categoryFilter}
              onValueChange={(v) =>
                setAirQuality({
                  categoryFilter: v as AirQualityState['categoryFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="unhealthy_sensitive">Unhealthy (Sensitive)</SelectItem>
                <SelectItem value="unhealthy">Unhealthy</SelectItem>
                <SelectItem value="very_unhealthy">Very Unhealthy</SelectItem>
                <SelectItem value="hazardous">Hazardous</SelectItem>
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
                  <Icon className="h-3 w-3 text-purple-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={airQuality[key] as boolean}
                  onCheckedChange={(checked) => setAirQuality({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg AQI</div>
              <div className="text-sm font-semibold text-purple-500">{summary.avgAqi}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Good/Moderate</div>
              <div className="text-sm font-semibold text-green-500">{summary.goodCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Worst AQI</div>
              <div className="text-sm font-semibold text-red-500">{summary.worstAqi}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Monitoring Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = airQuality.activeStationId === station.id
                  const catCfg = CATEGORY_CONFIG[station.category]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-purple-500/50 bg-purple-500/5'
                          : 'border-border/40 hover:border-purple-500/20 hover:bg-purple-500/5'
                      }`}
                      onClick={() =>
                        setAirQuality({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: catCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${catCfg.bgClass}`}
                        >
                          {catCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {airQuality.showAQI && (
                          <div>
                            AQI:{' '}
                            <span className="text-foreground font-medium">
                              {station.aqi}
                            </span>
                          </div>
                        )}
                        {airQuality.showPM25 && (
                          <div>
                            PM2.5:{' '}
                            <span className="text-foreground font-medium">
                              {station.pm25} µg/m³
                            </span>
                          </div>
                        )}
                        {airQuality.showO3 && (
                          <div>
                            O3:{' '}
                            <span className="text-foreground font-medium">
                              {station.o3} ppb
                            </span>
                          </div>
                        )}
                        {airQuality.showDominantPollutant && (
                          <div>
                            Dominant:{' '}
                            <span className="text-foreground font-medium">
                              {station.dominantPollutant}
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
              <div className="space-y-2 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${CATEGORY_CONFIG[activeStation.category].bgClass}`}
                  >
                    {CATEGORY_CONFIG[activeStation.category].label}
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
                    <span className="text-muted-foreground">AQI: </span>
                    <span className="font-medium">{activeStation.aqi}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PM2.5: </span>
                    <span className="font-medium">{activeStation.pm25} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PM10: </span>
                    <span className="font-medium">{activeStation.pm10} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">O3: </span>
                    <span className="font-medium">{activeStation.o3} ppb</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">NO2: </span>
                    <span className="font-medium">{activeStation.no2} ppb</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Dominant Pollutant: </span>
                    <span className="font-medium">{activeStation.dominantPollutant}</span>
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
