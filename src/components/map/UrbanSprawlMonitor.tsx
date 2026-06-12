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
import { useMapStore, type UrbanSprawlState, type UrbanSprawlZone } from '@/lib/map-store'
import { Building2 as Building2Icon, X, TrendingUp, Users, TreePine, AlertTriangle, Filter, MapPin } from 'lucide-react'

const DEMO_ZONES: UrbanSprawlZone[] = [
  {
    id: 'us-lagos',
    name: 'Lagos Metropolitan',
    latitude: 6.52,
    longitude: 3.38,
    growthRate: 6.2,
    populationDensity: 15000,
    landUseChange: 34,
    greenSpaceLoss: 22,
    infraStrain: 'critical',
    yearEstablished: 1985,
    sprawlArea: 1171,
  },
  {
    id: 'us-delhi',
    name: 'Delhi NCR',
    latitude: 28.61,
    longitude: 77.21,
    growthRate: 4.8,
    populationDensity: 22000,
    landUseChange: 28,
    greenSpaceLoss: 18,
    infraStrain: 'high',
    yearEstablished: 1990,
    sprawlArea: 1484,
  },
  {
    id: 'us-jakarta',
    name: 'Jakarta Metro',
    latitude: -6.21,
    longitude: 106.85,
    growthRate: 3.9,
    populationDensity: 16000,
    landUseChange: 31,
    greenSpaceLoss: 25,
    infraStrain: 'critical',
    yearEstablished: 1980,
    sprawlArea: 662,
  },
  {
    id: 'us-phoenix',
    name: 'Phoenix Metro',
    latitude: 33.45,
    longitude: -112.07,
    growthRate: 5.1,
    populationDensity: 1200,
    landUseChange: 42,
    greenSpaceLoss: 30,
    infraStrain: 'moderate',
    yearEstablished: 1975,
    sprawlArea: 2340,
  },
  {
    id: 'us-nairobi',
    name: 'Nairobi Metro',
    latitude: -1.29,
    longitude: 36.82,
    growthRate: 5.8,
    populationDensity: 4500,
    landUseChange: 26,
    greenSpaceLoss: 15,
    infraStrain: 'high',
    yearEstablished: 1995,
    sprawlArea: 696,
  },
  {
    id: 'us-houston',
    name: 'Houston Metro',
    latitude: 29.76,
    longitude: -95.37,
    growthRate: 3.2,
    populationDensity: 950,
    landUseChange: 38,
    greenSpaceLoss: 28,
    infraStrain: 'low',
    yearEstablished: 1970,
    sprawlArea: 2670,
  },
]

const STRAIN_CONFIG: Record<
  UrbanSprawlZone['infraStrain'],
  { label: string; color: string; bgClass: string }
> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  high: { label: 'High', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function UrbanSprawlMonitor() {
  const urbanSprawl = useMapStore((s) => s.urbanSprawl)
  const setUrbanSprawl = useMapStore((s) => s.setUrbanSprawl)

  const zones = useMemo(
    () => (urbanSprawl.zones.length > 0 ? urbanSprawl.zones : DEMO_ZONES),
    [urbanSprawl.zones]
  )

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      if (urbanSprawl.strainFilter !== 'all' && z.infraStrain !== urbanSprawl.strainFilter) return false
      return true
    })
  }, [zones, urbanSprawl.strainFilter])

  const summary = useMemo(() => {
    if (filteredZones.length === 0) {
      return { avgGrowthRate: 0, criticalHighCount: 0, avgGreenSpaceLoss: 0 }
    }
    const avgGrowthRate =
      filteredZones.reduce((sum, z) => sum + z.growthRate, 0) / filteredZones.length
    const criticalHighCount = filteredZones.filter(
      (z) => z.infraStrain === 'critical' || z.infraStrain === 'high'
    ).length
    const avgGreenSpaceLoss =
      filteredZones.reduce((sum, z) => sum + z.greenSpaceLoss, 0) / filteredZones.length
    return {
      avgGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      criticalHighCount,
      avgGreenSpaceLoss: Math.round(avgGreenSpaceLoss * 10) / 10,
    }
  }, [filteredZones])

  const activeZone = useMemo(
    () => zones.find((z) => z.id === urbanSprawl.activeZoneId) ?? null,
    [zones, urbanSprawl.activeZoneId]
  )

  if (typeof window === 'undefined') return null
  if (!urbanSprawl.open) return null

  const overlayToggles: { key: keyof UrbanSprawlState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGrowthRate', label: 'Growth Rate', icon: TrendingUp },
    { key: 'showDensity', label: 'Population Density', icon: Users },
    { key: 'showGreenSpace', label: 'Green Space Loss', icon: TreePine },
    { key: 'showInfraStrain', label: 'Infra Strain', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2Icon className="h-4 w-4 text-rose-500" />
              Urban Sprawl Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setUrbanSprawl({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Strain Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Infrastructure Strain
            </Label>
            <Select
              value={urbanSprawl.strainFilter}
              onValueChange={(v) =>
                setUrbanSprawl({
                  strainFilter: v as UrbanSprawlState['strainFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
                  <Icon className="h-3 w-3 text-rose-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={urbanSprawl[key] as boolean}
                  onCheckedChange={(checked) => setUrbanSprawl({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Growth</div>
              <div className="text-sm font-semibold">{summary.avgGrowthRate}</div>
              <div className="text-[9px] text-muted-foreground">%/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Critical/High</div>
              <div className="text-sm font-semibold text-red-500">{summary.criticalHighCount}</div>
              <div className="text-[9px] text-muted-foreground">zones</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Green Loss</div>
              <div className="text-sm font-semibold text-orange-500">{summary.avgGreenSpaceLoss}</div>
              <div className="text-[9px] text-muted-foreground">%</div>
            </div>
          </div>

          <Separator />

          {/* Zone List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Sprawl Zones ({filteredZones.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredZones.map((zone) => {
                  const isActive = urbanSprawl.activeZoneId === zone.id
                  const strainCfg = STRAIN_CONFIG[zone.infraStrain]
                  return (
                    <div
                      key={zone.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-rose-500/50 bg-rose-500/5'
                          : 'border-border/40 hover:border-rose-500/20 hover:bg-rose-500/5'
                      }`}
                      onClick={() =>
                        setUrbanSprawl({
                          activeZoneId: isActive ? null : zone.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: strainCfg.color }}
                          />
                          <span className="text-xs font-medium">{zone.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${strainCfg.bgClass}`}
                        >
                          {strainCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {urbanSprawl.showGrowthRate && (
                          <div>
                            Growth:{' '}
                            <span className="text-foreground font-medium">
                              {zone.growthRate}%/yr
                            </span>
                          </div>
                        )}
                        {urbanSprawl.showDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-foreground font-medium">
                              {zone.populationDensity.toLocaleString()}/km²
                            </span>
                          </div>
                        )}
                        {urbanSprawl.showGreenSpace && (
                          <div>
                            Green Loss:{' '}
                            <span className="text-foreground font-medium">
                              {zone.greenSpaceLoss}%
                            </span>
                          </div>
                        )}
                        {urbanSprawl.showInfraStrain && (
                          <div>
                            Land Use:{' '}
                            <span className="text-foreground font-medium">
                              {zone.landUseChange}%
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
              <div className="space-y-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-xs font-semibold">{activeZone.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STRAIN_CONFIG[activeZone.infraStrain].bgClass}`}
                  >
                    {STRAIN_CONFIG[activeZone.infraStrain].label}
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
                    <span className="text-muted-foreground">Growth Rate: </span>
                    <span className="font-medium">{activeZone.growthRate}%/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pop. Density: </span>
                    <span className="font-medium">{activeZone.populationDensity.toLocaleString()}/km²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Land Use Change: </span>
                    <span className="font-medium">{activeZone.landUseChange}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Green Space Loss: </span>
                    <span className="font-medium">{activeZone.greenSpaceLoss}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Infra Strain: </span>
                    <span className="font-medium">{STRAIN_CONFIG[activeZone.infraStrain].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year Established: </span>
                    <span className="font-medium">{activeZone.yearEstablished}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sprawl Area: </span>
                    <span className="font-medium">{activeZone.sprawlArea.toLocaleString()} km²</span>
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
