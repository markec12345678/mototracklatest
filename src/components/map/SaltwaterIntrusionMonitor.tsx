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
import { useMapStore, type SaltwaterIntrusionState, type SaltwaterZone } from '@/lib/map-store'
import { Droplet as DropletIcon2, X, Ruler, Waves, Users, TrendingUp, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: SaltwaterZone[] = [
  {
    id: 'sw-florida',
    name: 'Florida Biscayne Aquifer',
    latitude: 25.77,
    longitude: -80.19,
    intrusionDistance: 18.5,
    salinityLevel: 4200,
    freshwaterDepth: 35,
    pumpingRate: 950,
    affectedPopulation: 2800000,
    aquiferType: 'unconfined',
    trendDirection: 'advancing',
  },
  {
    id: 'sw-bangladesh',
    name: 'Bengal Delta Aquifer',
    latitude: 22.36,
    longitude: 89.55,
    intrusionDistance: 42.0,
    salinityLevel: 8500,
    freshwaterDepth: 60,
    pumpingRate: 2200,
    affectedPopulation: 35000000,
    aquiferType: 'alluvial',
    trendDirection: 'rapid_advance',
  },
  {
    id: 'sw-netherlands',
    name: 'Rhine-Meuse Delta',
    latitude: 51.92,
    longitude: 4.49,
    intrusionDistance: 12.0,
    salinityLevel: 3100,
    freshwaterDepth: 80,
    pumpingRate: 1400,
    affectedPopulation: 950000,
    aquiferType: 'confined',
    trendDirection: 'stable',
  },
  {
    id: 'sw-tunisia',
    name: 'Tunisian Coastal Aquifer',
    latitude: 36.81,
    longitude: 10.17,
    intrusionDistance: 28.0,
    salinityLevel: 6800,
    freshwaterDepth: 45,
    pumpingRate: 750,
    affectedPopulation: 1200000,
    aquiferType: 'karst',
    trendDirection: 'advancing',
  },
  {
    id: 'sw-sydney',
    name: 'Sydney Basin Aquifer',
    latitude: -33.87,
    longitude: 151.21,
    intrusionDistance: 8.5,
    salinityLevel: 2800,
    freshwaterDepth: 55,
    pumpingRate: 1100,
    affectedPopulation: 680000,
    aquiferType: 'confined',
    trendDirection: 'retreating',
  },
  {
    id: 'sw-manila',
    name: 'Manila Coastal Aquifer',
    latitude: 14.60,
    longitude: 120.98,
    intrusionDistance: 22.0,
    salinityLevel: 5600,
    freshwaterDepth: 40,
    pumpingRate: 1800,
    affectedPopulation: 5200000,
    aquiferType: 'alluvial',
    trendDirection: 'rapid_advance',
  },
]

const TREND_CONFIG: Record<
  SaltwaterZone['trendDirection'],
  { label: string; color: string; bgClass: string }
> = {
  retreating: { label: 'Retreating', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  advancing: { label: 'Advancing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  rapid_advance: { label: 'Rapid Advance', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SaltwaterIntrusionMonitor() {
  const state = useMapStore((s) => s.saltwaterIntrusion)
  const setState = useMapStore((s) => s.setSaltwaterIntrusion)

  const zones = useMemo(
    () => (state.zones.length > 0 ? state.zones : DEMO_ZONES),
    [state.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (state.trendFilter !== 'all' && z.trendDirection !== state.trendFilter) return false
      return true
    })
  }, [zones, state.trendFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { maxIntrusion: 0, totalAffected: 0, advancingCount: 0 }
    }
    const maxIntrusion = Math.max(...filteredZones.map((z) => z.intrusionDistance))
    const totalAffected = filteredZones.reduce((sum, z) => sum + z.affectedPopulation, 0)
    const advancingCount = filteredZones.filter(
      (z) => z.trendDirection === 'advancing' || z.trendDirection === 'rapid_advance'
    ).length
    return {
      maxIntrusion: Math.round(maxIntrusion * 10) / 10,
      totalAffected,
      advancingCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === state.activeZoneId) ?? null,
    [zones, state.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SaltwaterIntrusionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIntrusionDistance', label: 'Intrusion Distance', icon: Ruler },
    { key: 'showSalinityLevel', label: 'Salinity Level', icon: Waves },
    { key: 'showAffectedPopulation', label: 'Affected Population', icon: Users },
    { key: 'showTrend', label: 'Trend Direction', icon: TrendingUp },
  ]

  const formatPopulation = (pop: number) => {
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`
    return `${pop}`
  }

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DropletIcon2 className="h-4 w-4 text-cyan-500" />
              Saltwater Intrusion Monitor
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
          {/* Trend Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Trend Direction
            </Label>
            <Select
              value={state.trendFilter}
              onValueChange={(v) =>
                setState({
                  trendFilter: v as SaltwaterIntrusionState['trendFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trends</SelectItem>
                <SelectItem value="retreating">Retreating</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="advancing">Advancing</SelectItem>
                <SelectItem value="rapid_advance">Rapid Advance</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Max Intrusion</div>
              <div className="text-sm font-semibold">{summary.maxIntrusion}</div>
              <div className="text-[9px] text-muted-foreground">km</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Affected Pop.</div>
              <div className="text-sm font-semibold text-cyan-500">{formatPopulation(summary.totalAffected)}</div>
              <div className="text-[9px] text-muted-foreground">people</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Advancing+</div>
              <div className="text-sm font-semibold text-red-500">{summary.advancingCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Intrusion Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = state.activeZoneId === zone.id
                  const trendCfg = TREND_CONFIG[zone.trendDirection]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-500/5'
                          : 'border-border/40 hover:border-cyan-500/20 hover:bg-cyan-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: trendCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${trendCfg.bgClass}`}
                        >
                          {trendCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showIntrusionDistance && (
                          <div>
                            Distance:{' '}
                            <span className="text-foreground font-medium">
                              {zone.intrusionDistance} km
                            </span>
                          </div>
                        )}
                        {state.showSalinityLevel && (
                          <div>
                            Salinity:{' '}
                            <span className="text-foreground font-medium">
                              {zone.salinityLevel} mg/L
                            </span>
                          </div>
                        )}
                        {state.showAffectedPopulation && (
                          <div>
                            Population:{' '}
                            <span className="text-foreground font-medium">
                              {formatPopulation(zone.affectedPopulation)}
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Aquifer:{' '}
                            <span className="text-foreground font-medium">
                              {zone.aquiferType}
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
              <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${TREND_CONFIG[activeZone.trendDirection].bgClass}`}
                  >
                    {TREND_CONFIG[activeZone.trendDirection].label}
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
                    <span className="text-muted-foreground">Intrusion: </span>
                    <span className="font-medium">{activeZone.intrusionDistance} km</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Salinity: </span>
                    <span className="font-medium">{activeZone.salinityLevel} mg/L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">FW Depth: </span>
                    <span className="font-medium">{activeZone.freshwaterDepth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pumping Rate: </span>
                    <span className="font-medium">{activeZone.pumpingRate} ML/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population: </span>
                    <span className="font-medium">{formatPopulation(activeZone.affectedPopulation)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aquifer Type: </span>
                    <span className="font-medium">{activeZone.aquiferType}</span>
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
