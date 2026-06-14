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
import { useMapStore, type PhenologyState, type PhenologyEvent } from '@/lib/map-store'
import { Leaf as LeafIcon, X, CalendarDays, Thermometer, ShieldCheck, Database, MapPin, Filter } from 'lucide-react'

const DEMO_EVENTS: PhenologyEvent[] = [
  {
    id: 'pheno-cherry',
    name: 'Cherry Blossom Bloom',
    latitude: 35.68,
    longitude: 139.69,
    eventType: 'bloom',
    species: 'Prunus serrulata',
    observedDate: '2024-03-22',
    expectedDate: '2024-03-29',
    dayOffset: -7,
    temperatureAnomaly: 1.8,
    confidence: 'high',
    dataSource: 'citizen_science',
  },
  {
    id: 'pheno-swift',
    name: 'Swift Migration Arrival',
    latitude: 51.51,
    longitude: -0.13,
    eventType: 'migration_arrival',
    species: 'Apus apus',
    observedDate: '2024-05-01',
    expectedDate: '2024-05-07',
    dayOffset: -6,
    temperatureAnomaly: 0.9,
    confidence: 'high',
    dataSource: 'station',
  },
  {
    id: 'pheno-maple',
    name: 'Maple Leaf-Out',
    latitude: 45.50,
    longitude: -73.57,
    eventType: 'leaf_out',
    species: 'Acer saccharum',
    observedDate: '2024-04-28',
    expectedDate: '2024-04-20',
    dayOffset: 8,
    temperatureAnomaly: -1.2,
    confidence: 'moderate',
    dataSource: 'camera',
  },
  {
    id: 'pheno-bear',
    name: 'Bear Hibernation End',
    latitude: 44.43,
    longitude: -110.59,
    eventType: 'hibernation',
    species: 'Ursus arctos',
    observedDate: '2024-03-15',
    expectedDate: '2024-04-01',
    dayOffset: -17,
    temperatureAnomaly: 2.5,
    confidence: 'moderate',
    dataSource: 'satellite',
  },
  {
    id: 'pheno-apple',
    name: 'Apple Fruiting',
    latitude: 47.38,
    longitude: 8.54,
    eventType: 'fruiting',
    species: 'Malus domestica',
    observedDate: '2024-09-05',
    expectedDate: '2024-09-12',
    dayOffset: -7,
    temperatureAnomaly: 1.4,
    confidence: 'high',
    dataSource: 'station',
  },
  {
    id: 'pheno-frost',
    name: 'First Frost Event',
    latitude: 55.75,
    longitude: 37.62,
    eventType: 'frost',
    species: 'General',
    observedDate: '2024-10-28',
    expectedDate: '2024-10-15',
    dayOffset: 13,
    temperatureAnomaly: -0.8,
    confidence: 'low',
    dataSource: 'citizen_science',
  },
]

const CONFIDENCE_CONFIG: Record<
  PhenologyEvent['confidence'],
  { label: string; color: string; bgClass: string }
> = {
  high: { label: 'High', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  low: { label: 'Low', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const DATA_SOURCE_CONFIG: Record<
  PhenologyEvent['dataSource'],
  { label: string; bgClass: string }
> = {
  citizen_science: { label: 'Citizen Science', bgClass: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  satellite: { label: 'Satellite', bgClass: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30' },
  station: { label: 'Station', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  camera: { label: 'Camera', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
}

const EVENT_TYPE_LABELS: Record<PhenologyEvent['eventType'], string> = {
  bloom: 'Bloom',
  leaf_out: 'Leaf Out',
  fruiting: 'Fruiting',
  migration_arrival: 'Migration Arrival',
  migration_departure: 'Migration Departure',
  hibernation: 'Hibernation',
  frost: 'Frost',
}

export function PhenologyTracker() {
  const phenology = useMapStore((s) => s.phenology)
  const setPhenology = useMapStore((s) => s.setPhenology)

  const events = useMemo(
    () => (phenology.events.length > 0 ? phenology.events : DEMO_EVENTS),
    [phenology.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (phenology.typeFilter !== 'all' && e.eventType !== phenology.typeFilter) return false
      return true
    })
  }, [events, phenology.typeFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { avgDayOffset: 0, avgTempAnomaly: 0, highConfidenceCount: 0 }
    }
    const avgDayOffset =
      filteredEvents.reduce((sum, e) => sum + e.dayOffset, 0) / filteredEvents.length
    const avgTempAnomaly =
      filteredEvents.reduce((sum, e) => sum + e.temperatureAnomaly, 0) / filteredEvents.length
    const highConfidenceCount = filteredEvents.filter((e) => e.confidence === 'high').length
    return {
      avgDayOffset: Math.round(avgDayOffset * 10) / 10,
      avgTempAnomaly: Math.round(avgTempAnomaly * 10) / 10,
      highConfidenceCount,
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === phenology.activeEventId) ?? null,
    [events, phenology.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!phenology.open) return null

  const overlayToggles: { key: keyof PhenologyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDayOffset', label: 'Day Offset', icon: CalendarDays },
    { key: 'showTemperatureAnomaly', label: 'Temp Anomaly', icon: Thermometer },
    { key: 'showConfidence', label: 'Confidence', icon: ShieldCheck },
    { key: 'showDataSource', label: 'Data Source', icon: Database },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <LeafIcon className="h-4 w-4 text-lime-500" />
              Phenology Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPhenology({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Event Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Event Type
            </Label>
            <Select
              value={phenology.typeFilter}
              onValueChange={(v) =>
                setPhenology({
                  typeFilter: v as PhenologyState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="bloom">Bloom</SelectItem>
                <SelectItem value="leaf_out">Leaf Out</SelectItem>
                <SelectItem value="fruiting">Fruiting</SelectItem>
                <SelectItem value="migration_arrival">Migration Arrival</SelectItem>
                <SelectItem value="migration_departure">Migration Departure</SelectItem>
                <SelectItem value="hibernation">Hibernation</SelectItem>
                <SelectItem value="frost">Frost</SelectItem>
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
                  <Icon className="h-3 w-3 text-lime-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={phenology[key] as boolean}
                  onCheckedChange={(checked) => setPhenology({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Day Offset</div>
              <div className="text-sm font-semibold text-lime-500">{summary.avgDayOffset}</div>
              <div className="text-[9px] text-muted-foreground">days</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Temp Anomaly</div>
              <div className="text-sm font-semibold">{summary.avgTempAnomaly}</div>
              <div className="text-[9px] text-muted-foreground">°C</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Confidence</div>
              <div className="text-sm font-semibold text-green-500">{summary.highConfidenceCount}</div>
              <div className="text-[9px] text-muted-foreground">events</div>
            </div>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Phenology Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = phenology.activeEventId === event.id
                  const confCfg = CONFIDENCE_CONFIG[event.confidence]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-lime-500/50 bg-lime-500/5'
                          : 'border-border/40 hover:border-lime-500/20 hover:bg-lime-500/5'
                      }`}
                      onClick={() =>
                        setPhenology({
                          activeEventId: isActive ? null : event.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: confCfg.color }}
                          />
                          <span className="text-xs font-medium">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${confCfg.bgClass}`}
                        >
                          {confCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {phenology.showDayOffset && (
                          <div>
                            Offset:{' '}
                            <span className="text-foreground font-medium">
                              {event.dayOffset > 0 ? '+' : ''}{event.dayOffset} days
                            </span>
                          </div>
                        )}
                        {phenology.showTemperatureAnomaly && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {event.temperatureAnomaly > 0 ? '+' : ''}{event.temperatureAnomaly} °C
                            </span>
                          </div>
                        )}
                        {phenology.showConfidence && (
                          <div>
                            Confidence:{' '}
                            <span className="text-foreground font-medium">
                              {CONFIDENCE_CONFIG[event.confidence].label}
                            </span>
                          </div>
                        )}
                        {phenology.showDataSource && (
                          <div>
                            Source:{' '}
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1 ${DATA_SOURCE_CONFIG[event.dataSource].bgClass}`}
                            >
                              {DATA_SOURCE_CONFIG[event.dataSource].label}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeEvent && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-lime-500/20 bg-lime-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-lime-500" />
                  <span className="text-xs font-semibold">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${CONFIDENCE_CONFIG[activeEvent.confidence].bgClass}`}
                  >
                    {CONFIDENCE_CONFIG[activeEvent.confidence].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeEvent.latitude.toFixed(2)}, {activeEvent.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Species: </span>
                    <span className="font-medium">{activeEvent.species}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Event Type: </span>
                    <span className="font-medium">{EVENT_TYPE_LABELS[activeEvent.eventType]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Day Offset: </span>
                    <span className="font-medium">
                      {activeEvent.dayOffset > 0 ? '+' : ''}{activeEvent.dayOffset} days
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temp Anomaly: </span>
                    <span className="font-medium">
                      {activeEvent.temperatureAnomaly > 0 ? '+' : ''}{activeEvent.temperatureAnomaly} °C
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Observed: </span>
                    <span className="font-medium">{activeEvent.observedDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected: </span>
                    <span className="font-medium">{activeEvent.expectedDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data Source: </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] h-5 ${DATA_SOURCE_CONFIG[activeEvent.dataSource].bgClass}`}
                    >
                      {DATA_SOURCE_CONFIG[activeEvent.dataSource].label}
                    </Badge>
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
