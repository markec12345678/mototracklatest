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
import { useMapStore, type StormSurgeState, type StormSurgeZone } from '@/lib/map-store'
import { Waves as WavesIcon2, X, Wind, Users, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_ZONES: StormSurgeZone[] = [
  {
    id: 'ss-gulf-coast',
    name: 'Gulf Coast Lowlands',
    latitude: 29.76,
    longitude: -95.37,
    surgeHeight: 4.2,
    windSpeed: 165,
    pressureDrop: 42,
    coastalPopulation: 2450000,
    evacuationLevel: 'warning',
    historicalMax: 5.8,
  },
  {
    id: 'ss-miami-dade',
    name: 'Miami-Dade Shoreline',
    latitude: 25.76,
    longitude: -80.19,
    surgeHeight: 3.1,
    windSpeed: 120,
    pressureDrop: 28,
    coastalPopulation: 3120000,
    evacuationLevel: 'watch',
    historicalMax: 4.6,
  },
  {
    id: 'ss-outer-banks',
    name: 'Outer Banks Barrier',
    latitude: 35.56,
    longitude: -75.47,
    surgeHeight: 2.4,
    windSpeed: 95,
    pressureDrop: 18,
    coastalPopulation: 350000,
    evacuationLevel: 'advisory',
    historicalMax: 3.9,
  },
  {
    id: 'ss-bangladesh',
    name: 'Bengal Delta Coast',
    latitude: 22.35,
    longitude: 89.5,
    surgeHeight: 6.8,
    windSpeed: 220,
    pressureDrop: 65,
    coastalPopulation: 8500000,
    evacuationLevel: 'emergency',
    historicalMax: 9.1,
  },
  {
    id: 'ss-norfolk',
    name: 'Norfolk Hamptons',
    latitude: 36.85,
    longitude: -76.29,
    surgeHeight: 1.5,
    windSpeed: 60,
    pressureDrop: 10,
    coastalPopulation: 420000,
    evacuationLevel: 'none',
    historicalMax: 2.8,
  },
  {
    id: 'ss-tokyo-bay',
    name: 'Tokyo Bay Area',
    latitude: 35.62,
    longitude: 139.78,
    surgeHeight: 3.9,
    windSpeed: 145,
    pressureDrop: 35,
    coastalPopulation: 5800000,
    evacuationLevel: 'warning',
    historicalMax: 5.2,
  },
]

const EVACUATION_CONFIG: Record<
  StormSurgeZone['evacuationLevel'],
  { label: string; color: string; bgClass: string }
> = {
  none: { label: 'None', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  advisory: { label: 'Advisory', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  watch: { label: 'Watch', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  warning: { label: 'Warning', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  emergency: { label: 'Emergency', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function StormSurgePredictor() {
  const stormSurge = useMapStore((s) => s.stormSurge)
  const setStormSurge = useMapStore((s) => s.setStormSurge)

  const zones = useMemo(
    () => (stormSurge.zones.length > 0 ? stormSurge.zones : DEMO_ZONES),
    [stormSurge.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (stormSurge.evacuationFilter !== 'all' && z.evacuationLevel !== stormSurge.evacuationFilter) return false
      return true
    })
  }, [zones, stormSurge.evacuationFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { maxSurgeHeight: 0, warningEmergencyCount: 0, totalPopulationAtRisk: 0 }
    }
    const maxSurgeHeight = Math.max(...filteredZones.map((z) => z.surgeHeight))
    const warningEmergencyCount = filteredZones.filter(
      (z) => z.evacuationLevel === 'warning' || z.evacuationLevel === 'emergency'
    ).length
    const totalPopulationAtRisk = filteredZones.reduce((sum, z) => sum + z.coastalPopulation, 0)
    return {
      maxSurgeHeight: Math.round(maxSurgeHeight * 10) / 10,
      warningEmergencyCount,
      totalPopulationAtRisk,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === stormSurge.activeZoneId) ?? null,
    [zones, stormSurge.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!stormSurge.open) return null

  const overlayToggles: { key: keyof StormSurgeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSurgeHeight', label: 'Surge Height', icon: WavesIcon2 },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showPopulation', label: 'Population', icon: Users },
    { key: 'showEvacuation', label: 'Evacuation', icon: AlertTriangle },
  ]

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`
    return pop.toString()
  }

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon2 className="h-4 w-4 text-sky-500" />
              Storm Surge Predictor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setStormSurge({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Evacuation Level Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Evacuation Level
            </Label>
            <Select
              value={stormSurge.evacuationFilter}
              onValueChange={(v) =>
                setStormSurge({
                  evacuationFilter: v as StormSurgeState['evacuationFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
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
                  <Icon className="h-3 w-3 text-sky-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={stormSurge[key] as boolean}
                  onCheckedChange={(checked) => setStormSurge({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Surge</div>
              <div className="text-sm font-semibold text-sky-500">{summary.maxSurgeHeight}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Warn/Emerg</div>
              <div className="text-sm font-semibold text-red-500">{summary.warningEmergencyCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Pop at Risk</div>
              <div className="text-sm font-semibold text-orange-500">{formatPopulation(summary.totalPopulationAtRisk)}</div>
              <div className="text-[9px] text-muted-foreground">people</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Surge Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = stormSurge.activeZoneId === zone.id
                  const evacCfg = EVACUATION_CONFIG[zone.evacuationLevel]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-500/5'
                          : 'border-border/40 hover:border-sky-500/20 hover:bg-sky-500/5'
                      }`}
                      onClick={() =>
                        setStormSurge({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: evacCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${evacCfg.bgClass}`}
                        >
                          {evacCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {stormSurge.showSurgeHeight && (
                          <div>
                            Surge:{' '}
                            <span className="text-foreground font-medium">
                              {zone.surgeHeight} m
                            </span>
                          </div>
                        )}
                        {stormSurge.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-foreground font-medium">
                              {zone.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {stormSurge.showPopulation && (
                          <div>
                            Pop:{' '}
                            <span className="text-foreground font-medium">
                              {formatPopulation(zone.coastalPopulation)}
                            </span>
                          </div>
                        )}
                        {stormSurge.showEvacuation && (
                          <div>
                            Evac:{' '}
                            <span className="text-foreground font-medium">
                              {evacCfg.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredZones.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Zone Details */}
          {activeZone && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${EVACUATION_CONFIG[activeZone.evacuationLevel].bgClass}`}
                  >
                    {EVACUATION_CONFIG[activeZone.evacuationLevel].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeZone.latitude.toFixed(2)}, {activeZone.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Surge Height: </span>
                    <span className="font-medium">{activeZone.surgeHeight} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind Speed: </span>
                    <span className="font-medium">{activeZone.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pressure Drop: </span>
                    <span className="font-medium">{activeZone.pressureDrop} hPa</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population: </span>
                    <span className="font-medium">{formatPopulation(activeZone.coastalPopulation)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Historical Max: </span>
                    <span className="font-medium">{activeZone.historicalMax} m</span>
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
