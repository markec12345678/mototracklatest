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
import { useMapStore, type SeaLevelRiseState, type SeaLevelStation } from '@/lib/map-store'
import { Waves, X, TrendingUp, Users, Filter, MapPin } from 'lucide-react'

const DEMO_STATIONS: SeaLevelStation[] = [
  {
    id: 'sl-venice',
    name: 'Venice Tide Gauge',
    latitude: 45.44,
    longitude: 12.32,
    currentRise: 2.4,
    projected2050: 18.0,
    projected2100: 52.0,
    trend: 0.12,
    coastalImpact: 'significant',
    population: 260000,
  },
  {
    id: 'sl-maldives',
    name: 'Maldives',
    latitude: 3.2,
    longitude: 73.22,
    currentRise: 3.6,
    projected2050: 24.0,
    projected2100: 78.0,
    trend: 0.18,
    coastalImpact: 'severe',
    population: 540000,
  },
  {
    id: 'sl-tuvalu',
    name: 'Tuvalu',
    latitude: -7.11,
    longitude: 177.65,
    currentRise: 3.9,
    projected2050: 26.0,
    projected2100: 82.0,
    trend: 0.20,
    coastalImpact: 'severe',
    population: 12000,
  },
  {
    id: 'sl-miami',
    name: 'Miami',
    latitude: 25.76,
    longitude: -80.19,
    currentRise: 2.8,
    projected2050: 20.0,
    projected2100: 62.0,
    trend: 0.14,
    coastalImpact: 'significant',
    population: 470000,
  },
  {
    id: 'sl-sundarbans',
    name: 'Bangladesh Sundarbans',
    latitude: 22.0,
    longitude: 89.0,
    currentRise: 3.2,
    projected2050: 22.0,
    projected2100: 70.0,
    trend: 0.16,
    coastalImpact: 'severe',
    population: 4200000,
  },
  {
    id: 'sl-netherlands',
    name: 'Netherlands',
    latitude: 52.13,
    longitude: 4.3,
    currentRise: 1.8,
    projected2050: 15.0,
    projected2100: 45.0,
    trend: 0.09,
    coastalImpact: 'moderate',
    population: 8500000,
  },
]

const IMPACT_CONFIG: Record<
  SeaLevelStation['coastalImpact'],
  { label: string; color: string; bgClass: string }
> = {
  minimal: { label: 'Minimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  significant: { label: 'Significant', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SeaLevelRiseProjector() {
  const seaLevelRise = useMapStore((s) => s.seaLevelRise)
  const setSeaLevelRise = useMapStore((s) => s.setSeaLevelRise)

  const stations = useMemo(
    () => (seaLevelRise.stations.length > 0 ? seaLevelRise.stations : DEMO_STATIONS),
    [seaLevelRise.stations]
  )

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      if (seaLevelRise.impactFilter !== 'all' && s.coastalImpact !== seaLevelRise.impactFilter) return false
      return true
    })
  }, [stations, seaLevelRise.impactFilter])

  const summary = useMemo(() => {
    if (filteredStations.length === 0) {
      return { maxCurrentRise: 0, severeCount: 0, totalPopulation: 0 }
    }
    const maxCurrentRise = Math.max(...filteredStations.map((s) => s.currentRise))
    const severeCount = filteredStations.filter(
      (s) => s.coastalImpact === 'severe'
    ).length
    const totalPopulation = filteredStations.reduce((sum, s) => sum + s.population, 0)
    return { maxCurrentRise, severeCount, totalPopulation }
  }, [filteredStations])

  const activeStation = useMemo(
    () => stations.find((s) => s.id === seaLevelRise.activeStationId) ?? null,
    [stations, seaLevelRise.activeStationId]
  )

  if (typeof window === 'undefined') return null
  if (!seaLevelRise.open) return null

  const overlayToggles: { key: keyof SeaLevelRiseState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCurrent', label: 'Current Rise', icon: Waves },
    { key: 'showProjection', label: 'Projections', icon: TrendingUp },
    { key: 'showImpact', label: 'Coastal Impact', icon: MapPin },
    { key: 'showPopulation', label: 'Population', icon: Users },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-500" />
              Sea Level Rise Projector
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSeaLevelRise({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Impact Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Coastal Impact
            </Label>
            <Select
              value={seaLevelRise.impactFilter}
              onValueChange={(v) =>
                setSeaLevelRise({
                  impactFilter: v as SeaLevelRiseState['impactFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impacts</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="significant">Significant</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
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
                  <Icon className="h-3 w-3 text-cyan-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={seaLevelRise[key] as boolean}
                  onCheckedChange={(checked) => setSeaLevelRise({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Max Current Rise</div>
              <div className="text-sm font-semibold text-red-500">{summary.maxCurrentRise}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe Impact</div>
              <div className="text-sm font-semibold text-orange-500">{summary.severeCount}</div>
              <div className="text-[9px] text-muted-foreground">stations</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Pop. at Risk</div>
              <div className="text-sm font-semibold">
                {(summary.totalPopulation / 1000000).toFixed(1)}M
              </div>
              <div className="text-[9px] text-muted-foreground">people</div>
            </div>
          </div>

          <Separator />

          {/* Station List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tide Gauge Stations ({filteredStations.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStations.map((station) => {
                  const isActive = seaLevelRise.activeStationId === station.id
                  const impactCfg = IMPACT_CONFIG[station.coastalImpact]
                  return (
                    <div
                      key={station.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setSeaLevelRise({
                          activeStationId: isActive ? null : station.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: impactCfg.color }}
                          />
                          <span className="text-xs font-medium">{station.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${impactCfg.bgClass}`}
                        >
                          {impactCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {seaLevelRise.showCurrent && (
                          <div>
                            Current:{' '}
                            <span className="text-foreground font-medium">
                              {station.currentRise} mm/yr
                            </span>
                          </div>
                        )}
                        {seaLevelRise.showProjection && (
                          <div>
                            2050:{' '}
                            <span className="text-foreground font-medium">
                              {station.projected2050} cm
                            </span>
                          </div>
                        )}
                        {seaLevelRise.showImpact && (
                          <div>
                            2100:{' '}
                            <span className="text-foreground font-medium">
                              {station.projected2100} cm
                            </span>
                          </div>
                        )}
                        {seaLevelRise.showPopulation && (
                          <div>
                            Pop.:{' '}
                            <span className="text-foreground font-medium">
                              {station.population >= 1000000
                                ? `${(station.population / 1000000).toFixed(1)}M`
                                : station.population >= 1000
                                ? `${(station.population / 1000).toFixed(0)}K`
                                : station.population.toLocaleString()}
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
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeStation.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${IMPACT_CONFIG[activeStation.coastalImpact].bgClass}`}
                  >
                    {IMPACT_CONFIG[activeStation.coastalImpact].label}
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
                    <span className="text-muted-foreground">Current Rise: </span>
                    <span className="font-medium">{activeStation.currentRise} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">2050 Projection: </span>
                    <span className="font-medium">{activeStation.projected2050} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">2100 Projection: </span>
                    <span className="font-medium">{activeStation.projected2100} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trend: </span>
                    <span className="font-medium">{activeStation.trend} mm/yr²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population: </span>
                    <span className="font-medium">{activeStation.population.toLocaleString()}</span>
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
