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
import { useMapStore, type VolcanicIslandState, type VolcanicIsland } from '@/lib/map-store'
import { Mountain as MountainIcon2, X, Activity, Flame, Users, Filter, MapPin } from 'lucide-react'

const DEMO_ISLANDS: VolcanicIsland[] = [
  {
    id: 'vi-kilauea',
    name: 'Kīlauea Island',
    latitude: 19.41,
    longitude: -155.29,
    islandAge: 300,
    lastEruption: '2024-12-15T08:00:00Z',
    eruptionType: 'effusive',
    area: 1430,
    elevation: 1247,
    activityLevel: 'erupting',
    population: 950,
  },
  {
    id: 'vi-santorini',
    name: 'Santorini',
    latitude: 36.39,
    longitude: 25.46,
    islandAge: 3600,
    lastEruption: '1950-01-10T00:00:00Z',
    eruptionType: 'explosive',
    area: 73,
    elevation: 567,
    activityLevel: 'fumarolic',
    population: 15230,
  },
  {
    id: 'vi-sthelens',
    name: 'Mount St. Helens Isle',
    latitude: 46.2,
    longitude: -122.18,
    islandAge: 40000,
    lastEruption: '2008-07-10T00:00:00Z',
    eruptionType: 'explosive',
    area: 500,
    elevation: 2549,
    activityLevel: 'dormant',
    population: 0,
  },
  {
    id: 'vi-eyjafjallajokull',
    name: 'Eyjafjallajökull',
    latitude: 63.63,
    longitude: -19.62,
    islandAge: 800000,
    lastEruption: '2010-04-14T00:00:00Z',
    eruptionType: 'phreatomagmatic',
    area: 100,
    elevation: 1651,
    activityLevel: 'unrest',
    population: 25,
  },
  {
    id: 'vi-stromboli',
    name: 'Stromboli',
    latitude: 38.79,
    longitude: 15.21,
    islandAge: 200000,
    lastEruption: '2025-02-20T12:30:00Z',
    eruptionType: 'strombolian',
    area: 12.6,
    elevation: 924,
    activityLevel: 'erupting',
    population: 400,
  },
  {
    id: 'vi-yellowstone',
    name: 'Yellowstone Caldera Isle',
    latitude: 44.43,
    longitude: -110.67,
    islandAge: 640000,
    lastEruption: '640000-01-01T00:00:00Z',
    eruptionType: 'explosive',
    area: 2849,
    elevation: 2805,
    activityLevel: 'fumarolic',
    population: 1200,
  },
]

const ACTIVITY_CONFIG: Record<
  VolcanicIsland['activityLevel'],
  { label: string; color: string; bgClass: string }
> = {
  dormant: { label: 'Dormant', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
  fumarolic: { label: 'Fumarolic', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  unrest: { label: 'Unrest', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  erupting: { label: 'Erupting', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function VolcanicIslandMonitor() {
  const volcanicIsland = useMapStore((s) => s.volcanicIsland)
  const setVolcanicIsland = useMapStore((s) => s.setVolcanicIsland)

  const islands = useMemo(
    () => (volcanicIsland.islands.length > 0 ? volcanicIsland.islands : DEMO_ISLANDS),
    [volcanicIsland.islands]
  )

  const filteredIslands = useMemo(() => {
    return islands.filter((i) => {
      if (volcanicIsland.activityFilter !== 'all' && i.activityLevel !== volcanicIsland.activityFilter) return false
      return true
    })
  }, [islands, volcanicIsland.activityFilter])

  const summary = useMemo(() => {
    if (filteredIslands.length === 0) {
      return { eruptingUnrestCount: 0, avgElevation: 0, maxAge: 0 }
    }
    const eruptingUnrestCount = filteredIslands.filter(
      (i) => i.activityLevel === 'erupting' || i.activityLevel === 'unrest'
    ).length
    const avgElevation =
      filteredIslands.reduce((sum, i) => sum + i.elevation, 0) / filteredIslands.length
    const maxAge = Math.max(...filteredIslands.map((i) => i.islandAge))
    return {
      eruptingUnrestCount,
      avgElevation: Math.round(avgElevation),
      maxAge,
    }
  }, [filteredIslands])

  const activeIsland = useMemo(
    () => islands.find((i) => i.id === volcanicIsland.activeIslandId) ?? null,
    [islands, volcanicIsland.activeIslandId]
  )

  if (typeof window === 'undefined') return null
  if (!volcanicIsland.open) return null

  const overlayToggles: { key: keyof VolcanicIslandState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showActivity', label: 'Activity Level', icon: Activity },
    { key: 'showEruptionType', label: 'Eruption Type', icon: Flame },
    { key: 'showElevation', label: 'Elevation', icon: MountainIcon2 },
    { key: 'showPopulation', label: 'Population', icon: Users },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MountainIcon2 className="h-4 w-4 text-red-500" />
              Volcanic Island Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setVolcanicIsland({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Activity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Activity Level
            </Label>
            <Select
              value={volcanicIsland.activityFilter}
              onValueChange={(v) =>
                setVolcanicIsland({
                  activityFilter: v as VolcanicIslandState['activityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="fumarolic">Fumarolic</SelectItem>
                <SelectItem value="unrest">Unrest</SelectItem>
                <SelectItem value="erupting">Erupting</SelectItem>
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
                  <Icon className="h-3 w-3 text-red-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={volcanicIsland[key] as boolean}
                  onCheckedChange={(checked) => setVolcanicIsland({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Erupting/Unrest</div>
              <div className="text-sm font-semibold text-red-500">{summary.eruptingUnrestCount}</div>
              <div className="text-[9px] text-muted-foreground">islands</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Elevation</div>
              <div className="text-sm font-semibold">{summary.avgElevation}</div>
              <div className="text-[9px] text-muted-foreground">m</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Age</div>
              <div className="text-sm font-semibold text-orange-500">{summary.maxAge.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground">years</div>
            </div>
          </div>

          <Separator />

          {/* Island List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Volcanic Islands ({filteredIslands.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredIslands.map((island) => {
                  const isActive = volcanicIsland.activeIslandId === island.id
                  const actCfg = ACTIVITY_CONFIG[island.activityLevel]
                  return (
                    <div
                      key={island.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-border/40 hover:border-red-500/20 hover:bg-red-500/5'
                      }`}
                      onClick={() =>
                        setVolcanicIsland({
                          activeIslandId: isActive ? null : island.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: actCfg.color }}
                          />
                          <span className="text-xs font-medium">{island.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${actCfg.bgClass}`}
                        >
                          {actCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {volcanicIsland.showActivity && (
                          <div>
                            Activity:{' '}
                            <span className="text-foreground font-medium">
                              {actCfg.label}
                            </span>
                          </div>
                        )}
                        {volcanicIsland.showEruptionType && (
                          <div>
                            Eruption:{' '}
                            <span className="text-foreground font-medium capitalize">
                              {island.eruptionType}
                            </span>
                          </div>
                        )}
                        {volcanicIsland.showElevation && (
                          <div>
                            Elevation:{' '}
                            <span className="text-foreground font-medium">
                              {island.elevation} m
                            </span>
                          </div>
                        )}
                        {volcanicIsland.showPopulation && (
                          <div>
                            Pop:{' '}
                            <span className="text-foreground font-medium">
                              {island.population.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredIslands.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No islands match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Island Details */}
          {activeIsland && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-semibold">{activeIsland.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${ACTIVITY_CONFIG[activeIsland.activityLevel].bgClass}`}
                  >
                    {ACTIVITY_CONFIG[activeIsland.activityLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeIsland.latitude.toFixed(2)}, {activeIsland.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Elevation: </span>
                    <span className="font-medium">{activeIsland.elevation} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Island Age: </span>
                    <span className="font-medium">{activeIsland.islandAge.toLocaleString()} yrs</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeIsland.area.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Eruption Type: </span>
                    <span className="font-medium capitalize">{activeIsland.eruptionType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population: </span>
                    <span className="font-medium">{activeIsland.population.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Last Eruption: </span>
                    <span className="font-medium">
                      {new Date(activeIsland.lastEruption).toLocaleString()}
                    </span>
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
