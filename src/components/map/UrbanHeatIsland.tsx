'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type UrbanHeatIslandState, type HeatZone } from '@/lib/map-store'
import { Thermometer, X, TreePine, Users, Filter, MapPin, Sun } from 'lucide-react'

const SAMPLE_HEAT_ZONES: HeatZone[] = [
  {
    id: 'uh1',
    name: 'Tokyo, Shibuya',
    latitude: 35.658,
    longitude: 139.7016,
    temperature: 38.2,
    heatIndex: 42.5,
    vegetationCover: 12,
    albedo: 0.15,
    population: 2289000,
    coolZoneNearby: true,
  },
  {
    id: 'uh2',
    name: 'Phoenix, Downtown',
    latitude: 33.4484,
    longitude: -112.074,
    temperature: 46.8,
    heatIndex: 49.1,
    vegetationCover: 6,
    albedo: 0.12,
    population: 1680000,
    coolZoneNearby: false,
  },
  {
    id: 'uh3',
    name: 'Delhi, Connaught Place',
    latitude: 28.6315,
    longitude: 77.2167,
    temperature: 44.3,
    heatIndex: 51.7,
    vegetationCover: 9,
    albedo: 0.13,
    population: 32900000,
    coolZoneNearby: true,
  },
  {
    id: 'uh4',
    name: 'Cairo, Nasr City',
    latitude: 30.0444,
    longitude: 31.2357,
    temperature: 42.1,
    heatIndex: 45.8,
    vegetationCover: 5,
    albedo: 0.18,
    population: 21280000,
    coolZoneNearby: false,
  },
  {
    id: 'uh5',
    name: 'New York, Manhattan',
    latitude: 40.758,
    longitude: -73.9855,
    temperature: 36.4,
    heatIndex: 39.2,
    vegetationCover: 18,
    albedo: 0.2,
    population: 1629000,
    coolZoneNearby: true,
  },
  {
    id: 'uh6',
    name: 'Sydney, CBD',
    latitude: -33.8688,
    longitude: 151.2093,
    temperature: 34.7,
    heatIndex: 36.1,
    vegetationCover: 22,
    albedo: 0.22,
    population: 5312000,
    coolZoneNearby: true,
  },
  {
    id: 'uh7',
    name: 'Dubai, Deira',
    latitude: 25.2048,
    longitude: 55.2708,
    temperature: 47.5,
    heatIndex: 52.3,
    vegetationCover: 3,
    albedo: 0.1,
    population: 3490000,
    coolZoneNearby: false,
  },
]

type TempUnit = UrbanHeatIslandState['tempUnit']

function convertTemp(celsius: number, unit: TempUnit): number {
  if (unit === 'fahrenheit') return Math.round(celsius * 1.8 + 32)
  return Math.round(celsius * 10) / 10
}

function formatTemp(value: number, unit: TempUnit): string {
  return `${unit === 'fahrenheit' ? value : value.toFixed(1)}°${unit === 'celsius' ? 'C' : 'F'}`
}

function getTempColor(temp: number): string {
  if (temp >= 45) return '#dc2626'
  if (temp >= 40) return '#ef4444'
  if (temp >= 35) return '#f97316'
  if (temp >= 30) return '#f59e0b'
  if (temp >= 25) return '#eab308'
  return '#3b82f6'
}

function formatPopulation(pop: number): string {
  if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`
  if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`
  return pop.toString()
}

export function UrbanHeatIsland() {
  const urbanHeatIsland = useMapStore((s) => s.urbanHeatIsland)
  const setUrbanHeatIsland = useMapStore((s) => s.setUrbanHeatIsland)

  const heatZones = useMemo(() => {
    return urbanHeatIsland.heatZones.length > 0
      ? urbanHeatIsland.heatZones
      : SAMPLE_HEAT_ZONES
  }, [urbanHeatIsland.heatZones])

  const selectedZone = useMemo(() => {
    if (!urbanHeatIsland.activeHeatZoneId) return null
    return heatZones.find((z) => z.id === urbanHeatIsland.activeHeatZoneId) ?? null
  }, [heatZones, urbanHeatIsland.activeHeatZoneId])

  const summaryStats = useMemo(() => {
    const maxTemp = Math.max(...heatZones.map((z) => z.temperature))
    const avgHeatIndex =
      heatZones.reduce((sum, z) => sum + z.heatIndex, 0) / heatZones.length
    const coolZoneCount = heatZones.filter((z) => z.coolZoneNearby).length
    return { maxTemp, avgHeatIndex, coolZoneCount }
  }, [heatZones])

  if (typeof window === 'undefined') return null
  if (!urbanHeatIsland.open) return null

  const unit = urbanHeatIsland.tempUnit

  const toggleButtons = [
    {
      key: 'showTemperature' as const,
      label: 'Temperature',
      icon: Thermometer,
    },
    {
      key: 'showVegetation' as const,
      label: 'Vegetation',
      icon: TreePine,
    },
    {
      key: 'showCoolZones' as const,
      label: 'Cool Zones',
      icon: Sun,
    },
    {
      key: 'showPopulation' as const,
      label: 'Population',
      icon: Users,
    },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              Urban Heat Island
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setUrbanHeatIsland({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Temperature unit toggle & filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <Select
                value={unit}
                onValueChange={(v) =>
                  setUrbanHeatIsland({ tempUnit: v as TempUnit })
                }
              >
                <SelectTrigger className="h-8 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="celsius">Celsius (°C)</SelectItem>
                  <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-1.5">
            {toggleButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={urbanHeatIsland[key] ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() =>
                  setUrbanHeatIsland({ [key]: !urbanHeatIsland[key] })
                }
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Max Temp</div>
              <div className="text-sm font-semibold" style={{ color: getTempColor(summaryStats.maxTemp) }}>
                {formatTemp(convertTemp(summaryStats.maxTemp, unit), unit)}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Avg Heat Index</div>
              <div className="text-sm font-semibold text-orange-500">
                {formatTemp(convertTemp(summaryStats.avgHeatIndex, unit), unit)}
              </div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground mb-0.5">Cool Zones</div>
              <div className="text-sm font-semibold text-blue-500">
                {summaryStats.coolZoneCount}/{heatZones.length}
              </div>
            </div>
          </div>

          {/* Heat zones list */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Heat Zones
            </div>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {heatZones.map((zone) => {
                const isActive = urbanHeatIsland.activeHeatZoneId === zone.id
                const tempColor = getTempColor(zone.temperature)
                const temp = convertTemp(zone.temperature, unit)
                const heatIdx = convertTemp(zone.heatIndex, unit)

                return (
                  <div
                    key={zone.id}
                    className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
                    }`}
                    onClick={() =>
                      setUrbanHeatIsland({
                        activeHeatZoneId: isActive ? null : zone.id,
                      })
                    }
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: tempColor }}
                        />
                        {zone.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {zone.coolZoneNearby && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1 border-blue-400 text-blue-500"
                          >
                            Cool Zone
                          </Badge>
                        )}
                        <span
                          className="text-xs font-semibold"
                          style={{ color: tempColor }}
                        >
                          {formatTemp(temp, unit)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                      {urbanHeatIsland.showTemperature && (
                        <>
                          <div>
                            Heat Index:{' '}
                            <span className="text-foreground">
                              {formatTemp(heatIdx, unit)}
                            </span>
                          </div>
                        </>
                      )}
                      {urbanHeatIsland.showVegetation && (
                        <div>
                          Veg Cover:{' '}
                          <span className="text-foreground">
                            {zone.vegetationCover}%
                          </span>
                        </div>
                      )}
                      {urbanHeatIsland.showPopulation && (
                        <div>
                          Pop:{' '}
                          <span className="text-foreground">
                            {formatPopulation(zone.population)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected zone details */}
          {selectedZone && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-red-500" />
                  {selectedZone.name}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5"
                  style={{
                    borderColor: getTempColor(selectedZone.temperature),
                    color: getTempColor(selectedZone.temperature),
                  }}
                >
                  {formatTemp(
                    convertTemp(selectedZone.temperature, unit),
                    unit
                  )}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-border/30 p-2">
                  <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Thermometer className="h-2.5 w-2.5" />
                    Temperature
                  </div>
                  <div
                    className="font-semibold"
                    style={{ color: getTempColor(selectedZone.temperature) }}
                  >
                    {formatTemp(
                      convertTemp(selectedZone.temperature, unit),
                      unit
                    )}
                  </div>
                </div>
                <div className="rounded-md border border-border/30 p-2">
                  <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Thermometer className="h-2.5 w-2.5" />
                    Heat Index
                  </div>
                  <div className="font-semibold text-orange-500">
                    {formatTemp(
                      convertTemp(selectedZone.heatIndex, unit),
                      unit
                    )}
                  </div>
                </div>
                <div className="rounded-md border border-border/30 p-2">
                  <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                    <TreePine className="h-2.5 w-2.5" />
                    Vegetation Cover
                  </div>
                  <div className="font-semibold text-green-600">
                    {selectedZone.vegetationCover}%
                  </div>
                </div>
                <div className="rounded-md border border-border/30 p-2">
                  <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Sun className="h-2.5 w-2.5" />
                    Albedo
                  </div>
                  <div className="font-semibold text-amber-600">
                    {selectedZone.albedo.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-md border border-border/30 p-2">
                  <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                    <Users className="h-2.5 w-2.5" />
                    Population
                  </div>
                  <div className="font-semibold">
                    {formatPopulation(selectedZone.population)}
                  </div>
                </div>
                <div className="rounded-md border border-border/30 p-2">
                  <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    Cool Zone
                  </div>
                  <div
                    className={`font-semibold ${
                      selectedZone.coolZoneNearby
                        ? 'text-blue-500'
                        : 'text-red-500'
                    }`}
                  >
                    {selectedZone.coolZoneNearby ? 'Nearby' : 'None'}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground">
                Coordinates: {selectedZone.latitude.toFixed(4)},{' '}
                {selectedZone.longitude.toFixed(4)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
