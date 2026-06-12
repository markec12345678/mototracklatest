'use client'

import { useMemo, useState } from 'react'
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
import { useMapStore, type WildfireRiskState, type FireRiskZone } from '@/lib/map-store'
import { Flame, X, Wind, Droplets, Filter, MapPin } from 'lucide-react'

const DANGER_COLORS: Record<FireRiskZone['fireDangerRating'], string> = {
  low: 'bg-green-500/20 text-green-700 border-green-500/40',
  moderate: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/40',
  high: 'bg-orange-500/20 text-orange-700 border-orange-500/40',
  very_high: 'bg-red-500/20 text-red-700 border-red-500/40',
  extreme: 'bg-red-900/20 text-red-900 border-red-900/40',
}

const DANGER_LABELS: Record<FireRiskZone['fireDangerRating'], string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
  extreme: 'Extreme',
}

export default function WildfireRiskAssessor() {
  const wildfireRisk = useMapStore((s) => s.wildfireRisk)
  const setWildfireRisk = useMapStore((s) => s.setWildfireRisk)

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)

  const sampleZones = useMemo<FireRiskZone[]>(() => [
    {
      id: 'fr1',
      name: 'Northern California',
      latitude: 39.0,
      longitude: -122.5,
      fireDangerRating: 'extreme',
      fuelMoisture: 5,
      windSpeed: 45,
      temperature: 42,
      humidity: 8,
      vegetationType: 'Chaparral / Mixed Conifer',
      lastFireDate: '2024-07-15',
    },
    {
      id: 'fr2',
      name: 'Southeastern Australia',
      latitude: -35.5,
      longitude: 149.0,
      fireDangerRating: 'very_high',
      fuelMoisture: 9,
      windSpeed: 55,
      temperature: 39,
      humidity: 12,
      vegetationType: 'Eucalyptus Forest',
      lastFireDate: '2023-12-20',
    },
    {
      id: 'fr3',
      name: 'Mediterranean Basin',
      latitude: 38.0,
      longitude: 23.5,
      fireDangerRating: 'high',
      fuelMoisture: 14,
      windSpeed: 35,
      temperature: 36,
      humidity: 18,
      vegetationType: 'Maquis / Pine Woodland',
      lastFireDate: '2024-08-05',
    },
    {
      id: 'fr4',
      name: 'Western Siberia',
      latitude: 62.0,
      longitude: 75.0,
      fireDangerRating: 'high',
      fuelMoisture: 18,
      windSpeed: 25,
      temperature: 30,
      humidity: 22,
      vegetationType: 'Boreal Forest / Peatland',
      lastFireDate: '2023-06-10',
    },
    {
      id: 'fr5',
      name: 'Central Portugal',
      latitude: 40.2,
      longitude: -8.0,
      fireDangerRating: 'moderate',
      fuelMoisture: 22,
      windSpeed: 20,
      temperature: 32,
      humidity: 30,
      vegetationType: 'Cork Oak / Eucalyptus',
      lastFireDate: '2022-08-17',
    },
    {
      id: 'fr6',
      name: 'Borneo Peatlands',
      latitude: 0.5,
      longitude: 113.0,
      fireDangerRating: 'very_high',
      fuelMoisture: 11,
      windSpeed: 15,
      temperature: 34,
      humidity: 45,
      vegetationType: 'Tropical Peat Swamp Forest',
      lastFireDate: '2024-09-01',
    },
    {
      id: 'fr7',
      name: 'British Columbia',
      latitude: 52.0,
      longitude: -122.0,
      fireDangerRating: 'low',
      fuelMoisture: 35,
      windSpeed: 12,
      temperature: 22,
      humidity: 55,
      vegetationType: 'Temperate Rainforest / Douglas Fir',
      lastFireDate: null,
    },
    {
      id: 'fr8',
      name: 'Amazon Frontier',
      latitude: -10.0,
      longitude: -55.0,
      fireDangerRating: 'moderate',
      fuelMoisture: 28,
      windSpeed: 10,
      temperature: 33,
      humidity: 52,
      vegetationType: 'Tropical Dry Forest / Cerrado',
      lastFireDate: '2023-09-15',
    },
  ], [])

  const fireZones = wildfireRisk.fireZones.length > 0 ? wildfireRisk.fireZones : sampleZones

  const filteredZones = useMemo(() => {
    if (wildfireRisk.dangerFilter === 'all') return fireZones
    return fireZones.filter((z) => z.fireDangerRating === wildfireRisk.dangerFilter)
  }, [fireZones, wildfireRisk.dangerFilter])

  const selectedZone = useMemo(
    () => fireZones.find((z) => z.id === (selectedZoneId ?? wildfireRisk.activeFireZoneId)) ?? null,
    [fireZones, selectedZoneId, wildfireRisk.activeFireZoneId]
  )

  const summaryStats = useMemo(() => {
    const total = fireZones.length
    const highRiskCount = fireZones.filter(
      (z) => z.fireDangerRating === 'high' || z.fireDangerRating === 'very_high' || z.fireDangerRating === 'extreme'
    ).length
    const avgFuelMoisture = fireZones.reduce((sum, z) => sum + z.fuelMoisture, 0) / (total || 1)
    return { total, highRiskCount, avgFuelMoisture: Math.round(avgFuelMoisture * 10) / 10 }
  }, [fireZones])

  if (!wildfireRisk.open) return null

  const toggleSetting = <K extends keyof WildfireRiskState>(key: K) => {
    setWildfireRisk({ [key]: !wildfireRisk[key] } as Partial<WildfireRiskState>)
  }

  return (
    <div className="fixed top-16 right-4 z-[60] w-[380px] max-h-[calc(100vh-5rem)] overflow-hidden">
      <Card className="backdrop-blur-xl bg-background/90 border shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="h-5 w-5 text-orange-500" />
              Wildfire Risk Assessor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setWildfireRisk({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <div className="text-xl font-bold">{summaryStats.total}</div>
              <div className="text-[11px] text-muted-foreground">Total Zones</div>
            </div>
            <div className="rounded-lg bg-red-500/10 p-2 text-center">
              <div className="text-xl font-bold text-red-600">{summaryStats.highRiskCount}</div>
              <div className="text-[11px] text-muted-foreground">High+ Risk</div>
            </div>
            <div className="rounded-lg bg-orange-500/10 p-2 text-center">
              <div className="text-xl font-bold text-orange-600">{summaryStats.avgFuelMoisture}%</div>
              <div className="text-[11px] text-muted-foreground">Avg Fuel Moisture</div>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={wildfireRisk.showDangerRating ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showDangerRating')}
            >
              <Flame className="mr-1 h-3 w-3" />
              Danger
            </Button>
            <Button
              variant={wildfireRisk.showFuelMoisture ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showFuelMoisture')}
            >
              <Droplets className="mr-1 h-3 w-3" />
              Fuel Moisture
            </Button>
            <Button
              variant={wildfireRisk.showWind ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showWind')}
            >
              <Wind className="mr-1 h-3 w-3" />
              Wind
            </Button>
            <Button
              variant={wildfireRisk.showHistory ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => toggleSetting('showHistory')}
            >
              <MapPin className="mr-1 h-3 w-3" />
              History
            </Button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={wildfireRisk.dangerFilter}
              onValueChange={(val) =>
                setWildfireRisk({ dangerFilter: val as WildfireRiskState['dangerFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filter by danger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very_high">Very High</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Zone List */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
            {filteredZones.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">
                No zones match the current filter.
              </div>
            )}
            {filteredZones.map((zone) => (
              <button
                key={zone.id}
                className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                  selectedZone?.id === zone.id ? 'border-primary bg-muted/40' : 'border-border'
                }`}
                onClick={() => setSelectedZoneId(zone.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate mr-2">{zone.name}</span>
                  {wildfireRisk.showDangerRating && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 shrink-0 ${DANGER_COLORS[zone.fireDangerRating]}`}
                    >
                      {DANGER_LABELS[zone.fireDangerRating]}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {wildfireRisk.showFuelMoisture && (
                    <span className="flex items-center gap-0.5">
                      <Droplets className="h-3 w-3" />
                      {zone.fuelMoisture}%
                    </span>
                  )}
                  {wildfireRisk.showWind && (
                    <span className="flex items-center gap-0.5">
                      <Wind className="h-3 w-3" />
                      {zone.windSpeed} km/h
                    </span>
                  )}
                  <span>{zone.temperature}°C</span>
                  <span>{zone.humidity}% hum.</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {zone.vegetationType}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Zone Details */}
          {selectedZone && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedZone.name}
                </h4>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${DANGER_COLORS[selectedZone.fireDangerRating]}`}
                >
                  {DANGER_LABELS[selectedZone.fireDangerRating]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>{' '}
                  <span className="font-medium">{selectedZone.latitude.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>{' '}
                  <span className="font-medium">{selectedZone.longitude.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span className="text-muted-foreground">Fuel Moisture:</span>{' '}
                  <span className="font-medium">{selectedZone.fuelMoisture}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-sky-500" />
                  <span className="text-muted-foreground">Wind:</span>{' '}
                  <span className="font-medium">{selectedZone.windSpeed} km/h</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Temp:</span>{' '}
                  <span className="font-medium">{selectedZone.temperature}°C</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Humidity:</span>{' '}
                  <span className="font-medium">{selectedZone.humidity}%</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Vegetation:</span>{' '}
                  <span className="font-medium">{selectedZone.vegetationType}</span>
                </div>
                {wildfireRisk.showHistory && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Last Fire:</span>{' '}
                    <span className="font-medium">
                      {selectedZone.lastFireDate ?? 'No recorded fire'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
