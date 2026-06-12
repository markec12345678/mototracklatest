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
import { useMapStore, type HailStormState, type HailStormEvent } from '@/lib/map-store'
import { CloudHail as CloudHailIcon, X, Circle, Wind, AlertTriangle, MapPin, Filter } from 'lucide-react'

const DEMO_EVENTS: HailStormEvent[] = [
  {
    id: 'hs-dallas',
    name: 'Dallas Supercell',
    latitude: 32.78,
    longitude: -96.80,
    maxHailSize: 10.2,
    windSpeed: 130,
    duration: '45 min',
    damage: 'catastrophic',
    area: 850,
    supercellType: 'HP Supercell',
  },
  {
    id: 'hs-tornadoalley',
    name: 'Tornado Alley',
    latitude: 35.22,
    longitude: -97.44,
    maxHailSize: 7.6,
    windSpeed: 95,
    duration: '30 min',
    damage: 'severe',
    area: 520,
    supercellType: 'Classic Supercell',
  },
  {
    id: 'hs-munich',
    name: 'Munich Storm',
    latitude: 48.14,
    longitude: 11.58,
    maxHailSize: 5.0,
    windSpeed: 78,
    duration: '20 min',
    damage: 'moderate',
    area: 280,
    supercellType: 'Multicell',
  },
  {
    id: 'hs-brisbane',
    name: 'Brisbane Hail',
    latitude: -27.47,
    longitude: 153.03,
    maxHailSize: 8.5,
    windSpeed: 110,
    duration: '35 min',
    damage: 'severe',
    area: 420,
    supercellType: 'HP Supercell',
  },
  {
    id: 'hs-pampas',
    name: 'Pampas Storm',
    latitude: -34.60,
    longitude: -58.38,
    maxHailSize: 4.2,
    windSpeed: 65,
    duration: '15 min',
    damage: 'minor',
    area: 150,
    supercellType: 'Single Cell',
  },
  {
    id: 'hs-delhi',
    name: 'Delhi Storm',
    latitude: 28.61,
    longitude: 77.21,
    maxHailSize: 3.0,
    windSpeed: 55,
    duration: '10 min',
    damage: 'none',
    area: 80,
    supercellType: 'Multicell',
  },
]

const DAMAGE_CONFIG: Record<
  HailStormEvent['damage'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  minor: { label: 'Minor', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  catastrophic: { label: 'Catastrophic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function HailStormTracker() {
  const hailStorm = useMapStore((s) => s.hailStorm)
  const setHailStorm = useMapStore((s) => s.setHailStorm)

  const events = useMemo(
    () => (hailStorm.events.length > 0 ? hailStorm.events : DEMO_EVENTS),
    [hailStorm.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (hailStorm.damageFilter !== 'all' && e.damage !== hailStorm.damageFilter) return false
      return true
    })
  }, [events, hailStorm.damageFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { avgHailSize: 0, severeCount: 0, avgWindSpeed: 0 }
    }
    const avgHailSize =
      filteredEvents.reduce((sum, e) => sum + e.maxHailSize, 0) / filteredEvents.length
    const severeCount = filteredEvents.filter(
      (e) => e.damage === 'severe' || e.damage === 'catastrophic'
    ).length
    const avgWindSpeed =
      filteredEvents.reduce((sum, e) => sum + e.windSpeed, 0) / filteredEvents.length
    return {
      avgHailSize: Math.round(avgHailSize * 10) / 10,
      severeCount,
      avgWindSpeed: Math.round(avgWindSpeed),
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === hailStorm.activeEventId) ?? null,
    [events, hailStorm.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!hailStorm.open) return null

  const overlayToggles: { key: keyof HailStormState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showHailSize', label: 'Hail Size', icon: Circle },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showDamage', label: 'Damage', icon: AlertTriangle },
    { key: 'showArea', label: 'Area', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudHailIcon className="h-4 w-4 text-indigo-500" />
              Hail Storm Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setHailStorm({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Damage Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Damage Level
            </Label>
            <Select
              value={hailStorm.damageFilter}
              onValueChange={(v) =>
                setHailStorm({
                  damageFilter: v as HailStormState['damageFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="catastrophic">Catastrophic</SelectItem>
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
                  <Icon className="h-3 w-3 text-indigo-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={hailStorm[key] as boolean}
                  onCheckedChange={(checked) => setHailStorm({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Hail Size</div>
              <div className="text-sm font-semibold">{summary.avgHailSize}</div>
              <div className="text-[9px] text-muted-foreground">cm</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe/Catastrophic</div>
              <div className="text-sm font-semibold text-red-500">{summary.severeCount}</div>
              <div className="text-[9px] text-muted-foreground">events</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-indigo-500">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-muted-foreground">km/h</div>
            </div>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Hail Storm Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = hailStorm.activeEventId === event.id
                  const damageCfg = DAMAGE_CONFIG[event.damage]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-border/40 hover:border-indigo-500/20 hover:bg-indigo-500/5'
                      }`}
                      onClick={() =>
                        setHailStorm({
                          activeEventId: isActive ? null : event.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: damageCfg.color }}
                          />
                          <span className="text-xs font-medium">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${damageCfg.bgClass}`}
                        >
                          {damageCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {hailStorm.showHailSize && (
                          <div>
                            Hail:{' '}
                            <span className="text-foreground font-medium">
                              {event.maxHailSize} cm
                            </span>
                          </div>
                        )}
                        {hailStorm.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {event.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {hailStorm.showDamage && (
                          <div>
                            Duration:{' '}
                            <span className="text-foreground font-medium">
                              {event.duration}
                            </span>
                          </div>
                        )}
                        {hailStorm.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-foreground font-medium">
                              {event.area} km²
                            </span>
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
              <div className="space-y-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DAMAGE_CONFIG[activeEvent.damage].bgClass}`}
                  >
                    {DAMAGE_CONFIG[activeEvent.damage].label}
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
                    <span className="text-muted-foreground">Max Hail Size: </span>
                    <span className="font-medium">{activeEvent.maxHailSize} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activeEvent.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration: </span>
                    <span className="font-medium">{activeEvent.duration}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeEvent.area} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Supercell Type: </span>
                    <span className="font-medium">{activeEvent.supercellType}</span>
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
