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
import { useMapStore, type UrbanTreeCanopyState, type UrbanTreeZone } from '@/lib/map-store'
import { TreeDeciduous as TreeDeciduousIcon3, X, TreePine, Thermometer, Wind, Users, MapPin, Filter } from 'lucide-react'

const DEMO_ZONES: UrbanTreeZone[] = [
  {
    id: 'ut-seattle',
    name: 'Seattle Downtown',
    latitude: 47.61,
    longitude: -122.33,
    canopyCoverage: 28.5,
    treeCount: 45200,
    dominantSpecies: 'Douglas Fir',
    avgTreeHeight: 12.4,
    heatMitigation: 3.2,
    airQualityImprovement: 15.8,
    equityScore: 'high',
  },
  {
    id: 'ut-atlanta',
    name: 'Atlanta Midtown',
    latitude: 33.78,
    longitude: -84.38,
    canopyCoverage: 48.2,
    treeCount: 89300,
    dominantSpecies: 'Southern Oak',
    avgTreeHeight: 14.8,
    heatMitigation: 4.7,
    airQualityImprovement: 22.3,
    equityScore: 'high',
  },
  {
    id: 'ut-detroit',
    name: 'Detroit East Side',
    latitude: 42.33,
    longitude: -83.01,
    canopyCoverage: 18.4,
    treeCount: 22100,
    dominantSpecies: 'Maple',
    avgTreeHeight: 9.6,
    heatMitigation: 1.8,
    airQualityImprovement: 8.2,
    equityScore: 'low',
  },
  {
    id: 'ut-phoenix',
    name: 'Phoenix Central',
    latitude: 33.45,
    longitude: -112.07,
    canopyCoverage: 8.2,
    treeCount: 12400,
    dominantSpecies: 'Palo Verde',
    avgTreeHeight: 6.3,
    heatMitigation: 1.2,
    airQualityImprovement: 5.1,
    equityScore: 'deficit',
  },
  {
    id: 'ut-boston',
    name: 'Boston Roxbury',
    latitude: 42.33,
    longitude: -71.09,
    canopyCoverage: 22.7,
    treeCount: 31800,
    dominantSpecies: 'Red Maple',
    avgTreeHeight: 10.2,
    heatMitigation: 2.4,
    airQualityImprovement: 12.1,
    equityScore: 'moderate',
  },
  {
    id: 'ut-houston',
    name: 'Houston Sunnyside',
    latitude: 29.69,
    longitude: -95.37,
    canopyCoverage: 12.1,
    treeCount: 18600,
    dominantSpecies: 'Pecan',
    avgTreeHeight: 8.9,
    heatMitigation: 1.6,
    airQualityImprovement: 7.4,
    equityScore: 'deficit',
  },
]

const EQUITY_CONFIG: Record<
  UrbanTreeZone['equityScore'],
  { label: string; color: string; bgClass: string }
> = {
  high: { label: 'High', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  low: { label: 'Low', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  deficit: { label: 'Deficit', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function UrbanTreeCanopyAnalyzer() {
  const urbanTreeCanopy = useMapStore((s) => s.urbanTreeCanopy)
  const setUrbanTreeCanopy = useMapStore((s) => s.setUrbanTreeCanopy)

  const zones = useMemo(
    () => (urbanTreeCanopy.zones.length > 0 ? urbanTreeCanopy.zones : DEMO_ZONES),
    [urbanTreeCanopy.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (urbanTreeCanopy.equityFilter !== 'all' && z.equityScore !== urbanTreeCanopy.equityFilter) return false
      return true
    })
  }, [zones, urbanTreeCanopy.equityFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgCanopy: 0, totalTrees: 0, deficitCount: 0 }
    }
    const avgCanopy = filteredZones.reduce((sum, z) => sum + z.canopyCoverage, 0) / filteredZones.length
    const totalTrees = filteredZones.reduce((sum, z) => sum + z.treeCount, 0)
    const deficitCount = filteredZones.filter((z) => z.equityScore === 'deficit').length
    return {
      avgCanopy: Math.round(avgCanopy * 10) / 10,
      totalTrees,
      deficitCount,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === urbanTreeCanopy.activeZoneId) ?? null,
    [zones, urbanTreeCanopy.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!urbanTreeCanopy.open) return null

  const overlayToggles: { key: keyof UrbanTreeCanopyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCanopyCoverage', label: 'Canopy Coverage', icon: TreePine },
    { key: 'showTreeCount', label: 'Tree Count', icon: TreeDeciduousIcon3 },
    { key: 'showHeatMitigation', label: 'Heat Mitigation', icon: Thermometer },
    { key: 'showEquityScore', label: 'Equity Score', icon: Users },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreeDeciduousIcon3 className="h-4 w-4 text-emerald-600" />
              Urban Tree Canopy Analyzer
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setUrbanTreeCanopy({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Equity Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Equity Score
            </Label>
            <Select
              value={urbanTreeCanopy.equityFilter}
              onValueChange={(v) =>
                setUrbanTreeCanopy({
                  equityFilter: v as UrbanTreeCanopyState['equityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equity Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="deficit">Deficit</SelectItem>
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
                  <Icon className="h-3 w-3 text-emerald-600" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={urbanTreeCanopy[key] as boolean}
                  onCheckedChange={(checked) => setUrbanTreeCanopy({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Canopy</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.avgCanopy}</div>
              <div className="text-[9px] text-muted-foreground">%</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Trees</div>
              <div className="text-sm font-semibold">{(summary.totalTrees / 1000).toFixed(1)}k</div>
              <div className="text-[9px] text-muted-foreground">trees</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Deficit</div>
              <div className="text-sm font-semibold text-red-500">{summary.deficitCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Urban Tree Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = urbanTreeCanopy.activeZoneId === zone.id
                  const equityCfg = EQUITY_CONFIG[zone.equityScore]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setUrbanTreeCanopy({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: equityCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${equityCfg.bgClass}`}
                        >
                          {equityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {urbanTreeCanopy.showCanopyCoverage && (
                          <div>
                            Canopy:{' '}
                            <span className="text-foreground font-medium">
                              {zone.canopyCoverage}%
                            </span>
                          </div>
                        )}
                        {urbanTreeCanopy.showTreeCount && (
                          <div>
                            Trees:{' '}
                            <span className="text-foreground font-medium">
                              {(zone.treeCount / 1000).toFixed(1)}k
                            </span>
                          </div>
                        )}
                        {urbanTreeCanopy.showHeatMitigation && (
                          <div>
                            Heat Mit.:{' '}
                            <span className="text-foreground font-medium">
                              {zone.heatMitigation}°C
                            </span>
                          </div>
                        )}
                        {urbanTreeCanopy.showEquityScore && (
                          <div>
                            Species:{' '}
                            <span className="text-foreground font-medium">
                              {zone.dominantSpecies}
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
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${EQUITY_CONFIG[activeZone.equityScore].bgClass}`}
                  >
                    {EQUITY_CONFIG[activeZone.equityScore].label}
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
                    <span className="text-muted-foreground">Canopy: </span>
                    <span className="font-medium">{activeZone.canopyCoverage}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tree Count: </span>
                    <span className="font-medium">{activeZone.treeCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dominant: </span>
                    <span className="font-medium">{activeZone.dominantSpecies}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Height: </span>
                    <span className="font-medium">{activeZone.avgTreeHeight} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Heat Mit.: </span>
                    <span className="font-medium">{activeZone.heatMitigation}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Air Quality: </span>
                    <span className="font-medium">{activeZone.airQualityImprovement}%</span>
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
