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
import { useMapStore, type TropicalCycloneState, type TropicalCyclone } from '@/lib/map-store'
import { CloudLightning, X, Wind, Gauge, Waves, Droplets, MapPin, Filter } from 'lucide-react'

const DEMO_CYCLONES: TropicalCyclone[] = [
  {
    id: 'tc-beryl',
    name: 'Hurricane Beryl',
    latitude: 18.2,
    longitude: -63.5,
    category: 4,
    windSpeed: 230,
    pressure: 945,
    movementSpeed: 22,
    movementDirection: 'WNW',
    rainfallRate: 45,
    stormSurge: 4.2,
    basin: 'atlantic',
  },
  {
    id: 'tc-peak',
    name: 'Typhoon Peak',
    latitude: 22.1,
    longitude: 128.5,
    category: 5,
    windSpeed: 285,
    pressure: 905,
    movementSpeed: 18,
    movementDirection: 'NW',
    rainfallRate: 60,
    stormSurge: 6.8,
    basin: 'pacific_west',
  },
  {
    id: 'tc-ark',
    name: 'Cyclone Ark',
    latitude: -15.3,
    longitude: 58.7,
    category: 3,
    windSpeed: 185,
    pressure: 960,
    movementSpeed: 15,
    movementDirection: 'SW',
    rainfallRate: 38,
    stormSurge: 3.5,
    basin: 'indian_south',
  },
  {
    id: 'tc-diana',
    name: 'Tropical Storm Diana',
    latitude: 15.8,
    longitude: -105.2,
    category: 0,
    windSpeed: 85,
    pressure: 995,
    movementSpeed: 28,
    movementDirection: 'NNW',
    rainfallRate: 25,
    stormSurge: 1.2,
    basin: 'pacific_east',
  },
  {
    id: 'tc-krishna',
    name: 'Cyclone Krishna',
    latitude: 12.5,
    longitude: 82.3,
    category: 2,
    windSpeed: 155,
    pressure: 975,
    movementSpeed: 20,
    movementDirection: 'N',
    rainfallRate: 35,
    stormSurge: 2.8,
    basin: 'indian_north',
  },
  {
    id: 'tc-mara',
    name: 'Cyclone Mara',
    latitude: -18.9,
    longitude: 148.5,
    category: 1,
    windSpeed: 120,
    pressure: 985,
    movementSpeed: 25,
    movementDirection: 'SE',
    rainfallRate: 30,
    stormSurge: 2.0,
    basin: 'australia',
  },
]

const CATEGORY_CONFIG: Record<number, { label: string; color: string; bgClass: string }> = {
  [-1]: { label: 'Tropical Depression', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
  0: { label: 'Tropical Storm', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  1: { label: 'Category 1', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  2: { label: 'Category 2', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  3: { label: 'Category 3', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  4: { label: 'Category 4', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-600 border-red-600/30' },
  5: { label: 'Category 5', color: '#991b1b', bgClass: 'bg-red-800/10 text-red-700 border-red-800/30' },
}

const BASIN_LABELS: Record<TropicalCycloneState['basinFilter'], string> = {
  all: 'All Basins',
  atlantic: 'Atlantic',
  pacific_east: 'East Pacific',
  pacific_west: 'West Pacific',
  indian_north: 'North Indian',
  indian_south: 'South Indian',
  australia: 'Australia',
}

export function TropicalCycloneTracker() {
  const state = useMapStore((s) => s.tropicalCyclone)
  const setState = useMapStore((s) => s.setTropicalCyclone)

  const cyclones = useMemo(
    () => (state.cyclones.length > 0 ? state.cyclones : DEMO_CYCLONES),
    [state.cyclones]
  )

  const filteredCyclones = useMemo(() => {
    return cyclones.filter((c) => {
      if (state.basinFilter !== 'all' && c.basin !== state.basinFilter) return false
      return true
    })
  }, [cyclones, state.basinFilter])

  const summary = useMemo(() => {
    if (filteredCyclones.length === 0) {
      return { avgWindSpeed: 0, strongestCategory: 0, avgStormSurge: 0 }
    }
    const avgWindSpeed =
      filteredCyclones.reduce((sum, c) => sum + c.windSpeed, 0) / filteredCyclones.length
    const strongestCategory = Math.max(...filteredCyclones.map((c) => c.category))
    const avgStormSurge =
      filteredCyclones.reduce((sum, c) => sum + c.stormSurge, 0) / filteredCyclones.length
    return {
      avgWindSpeed: Math.round(avgWindSpeed),
      strongestCategory,
      avgStormSurge: Math.round(avgStormSurge * 10) / 10,
    }
  }, [filteredCyclones])

  const activeCyclone = useMemo(
    () => cyclones.find((c) => c.id === state.activeCycloneId) ?? null,
    [cyclones, state.activeCycloneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TropicalCycloneState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showPressure', label: 'Pressure', icon: Gauge },
    { key: 'showStormSurge', label: 'Storm Surge', icon: Waves },
    { key: 'showRainfall', label: 'Rainfall', icon: Droplets },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudLightning className="h-4 w-4 text-indigo-500" />
              Tropical Cyclone Tracker
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
          {/* Basin Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Ocean Basin
            </Label>
            <Select
              value={state.basinFilter}
              onValueChange={(v) =>
                setState({
                  basinFilter: v as TropicalCycloneState['basinFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BASIN_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
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
              <div className="text-[10px] text-muted-foreground">Avg Wind Speed</div>
              <div className="text-sm font-semibold">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-muted-foreground">km/h</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Strongest</div>
              <div className="text-sm font-semibold text-red-500">Cat {summary.strongestCategory}</div>
              <div className="text-[9px] text-muted-foreground">Saffir-Simpson</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Storm Surge</div>
              <div className="text-sm font-semibold text-indigo-500">{summary.avgStormSurge}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
          </div>

          <Separator />

          {/* Cyclone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Cyclones ({filteredCyclones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCyclones.map((cyclone) => {
                  const isActive = state.activeCycloneId === cyclone.id
                  const catCfg = CATEGORY_CONFIG[cyclone.category] ?? CATEGORY_CONFIG[-1]
                  return (
                    <div
                      key={cyclone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-border/40 hover:border-indigo-500/20 hover:bg-indigo-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeCycloneId: isActive ? null : cyclone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: catCfg.color }}
                          />
                          <span className="text-xs font-medium">{cyclone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${catCfg.bgClass}`}
                        >
                          {catCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {cyclone.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {state.showPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-foreground font-medium">
                              {cyclone.pressure} hPa
                            </span>
                          </div>
                        )}
                        {state.showStormSurge && (
                          <div>
                            Surge:{' '}
                            <span className="text-foreground font-medium">
                              {cyclone.stormSurge} m
                            </span>
                          </div>
                        )}
                        {state.showRainfall && (
                          <div>
                            Rainfall:{' '}
                            <span className="text-foreground font-medium">
                              {cyclone.rainfallRate} mm/hr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredCyclones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No cyclones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Cyclone Details */}
          {activeCyclone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold">{activeCyclone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${CATEGORY_CONFIG[activeCyclone.category]?.bgClass ?? CATEGORY_CONFIG[-1].bgClass}`}
                  >
                    {CATEGORY_CONFIG[activeCyclone.category]?.label ?? 'Unknown'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeCyclone.latitude.toFixed(2)}, {activeCyclone.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activeCyclone.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pressure: </span>
                    <span className="font-medium">{activeCyclone.pressure} hPa</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Movement: </span>
                    <span className="font-medium">
                      {activeCyclone.movementDirection} @ {activeCyclone.movementSpeed} km/h
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Storm Surge: </span>
                    <span className="font-medium">{activeCyclone.stormSurge} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rainfall: </span>
                    <span className="font-medium">{activeCyclone.rainfallRate} mm/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Basin: </span>
                    <span className="font-medium capitalize">
                      {activeCyclone.basin.replace('_', ' ')}
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
