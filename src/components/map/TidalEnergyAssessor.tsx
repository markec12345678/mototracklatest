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
import { useMapStore, type TidalEnergyState, type TidalEnergySite } from '@/lib/map-store'
import { Waves as WavesIcon4, X, Zap as ZapIcon, Thermometer as ThermometerIcon, DollarSign as DollarSignIcon, MapPin, Filter } from 'lucide-react'

const DEMO_SITES: TidalEnergySite[] = [
  {
    id: 'te-rance',
    name: 'Rance Tidal Barrage',
    latitude: 48.62,
    longitude: -2.03,
    tidalRange: 8.2,
    peakFlowVelocity: 3.4,
    averagePower: 57,
    capacity: 240,
    technology: 'barrage',
    environmentalImpact: 'moderate',
    feasibility: 'proven',
    costPerMWh: 120,
  },
  {
    id: 'te-pentland',
    name: 'Pentland Firth Stream',
    latitude: 58.65,
    longitude: -3.38,
    tidalRange: 4.1,
    peakFlowVelocity: 5.2,
    averagePower: 89,
    capacity: 398,
    technology: 'stream',
    environmentalImpact: 'low',
    feasibility: 'proven',
    costPerMWh: 150,
  },
  {
    id: 'te-sihwa',
    name: 'Sihwa Lake Tidal',
    latitude: 37.38,
    longitude: 126.93,
    tidalRange: 5.6,
    peakFlowVelocity: 2.8,
    averagePower: 23,
    capacity: 254,
    technology: 'barrage',
    environmentalImpact: 'moderate',
    feasibility: 'proven',
    costPerMWh: 115,
  },
  {
    id: 'te-bayofundy',
    name: 'Bay of Fundy Dynamic',
    latitude: 45.20,
    longitude: -64.30,
    tidalRange: 14.5,
    peakFlowVelocity: 4.6,
    averagePower: 45,
    capacity: 300,
    technology: 'dynamic',
    environmentalImpact: 'low',
    feasibility: 'potential',
    costPerMWh: 180,
  },
  {
    id: 'te-swansea',
    name: 'Swansea Bay Lagoon',
    latitude: 51.62,
    longitude: -3.95,
    tidalRange: 7.2,
    peakFlowVelocity: 2.1,
    averagePower: 12,
    capacity: 320,
    technology: 'lagoon',
    environmentalImpact: 'low',
    feasibility: 'potential',
    costPerMWh: 200,
  },
  {
    id: 'te-kaipara',
    name: 'Kaipara Harbour',
    latitude: -36.47,
    longitude: 174.24,
    tidalRange: 3.8,
    peakFlowVelocity: 3.1,
    averagePower: 18,
    capacity: 200,
    technology: 'stream',
    environmentalImpact: 'low',
    feasibility: 'speculative',
    costPerMWh: 220,
  },
]

const FEASIBILITY_CONFIG: Record<
  TidalEnergySite['feasibility'],
  { label: string; color: string; bgClass: string }
> = {
  proven: { label: 'Proven', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  potential: { label: 'Potential', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  speculative: { label: 'Speculative', color: '#9ca3af', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
}

export function TidalEnergyAssessor() {
  const tidalEnergy = useMapStore((s) => s.tidalEnergy)
  const setTidalEnergy = useMapStore((s) => s.setTidalEnergy)

  const sites = useMemo(
    () => (tidalEnergy.sites.length > 0 ? tidalEnergy.sites : DEMO_SITES),
    [tidalEnergy.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (tidalEnergy.techFilter !== 'all' && s.technology !== tidalEnergy.techFilter) return false
      return true
    })
  }, [sites, tidalEnergy.techFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgTidalRange: 0, totalPowerCapacity: 0, provenCount: 0 }
    }
    const avgTidalRange =
      filteredSites.reduce((sum, s) => sum + s.tidalRange, 0) / filteredSites.length
    const totalPowerCapacity = filteredSites.reduce((sum, s) => sum + s.capacity, 0)
    const provenCount = filteredSites.filter((s) => s.feasibility === 'proven').length
    return {
      avgTidalRange: Math.round(avgTidalRange * 10) / 10,
      totalPowerCapacity,
      provenCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === tidalEnergy.activeSiteId) ?? null,
    [sites, tidalEnergy.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!tidalEnergy.open) return null

  const overlayToggles: { key: keyof TidalEnergyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTidalRange', label: 'Tidal Range', icon: WavesIcon4 },
    { key: 'showPowerOutput', label: 'Power Output', icon: ZapIcon },
    { key: 'showFeasibility', label: 'Feasibility', icon: ThermometerIcon },
    { key: 'showCostEfficiency', label: 'Cost Efficiency', icon: DollarSignIcon },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon4 className="h-4 w-4 text-emerald-500" />
              Tidal Energy Assessor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setTidalEnergy({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Technology Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Technology
            </Label>
            <Select
              value={tidalEnergy.techFilter}
              onValueChange={(v) =>
                setTidalEnergy({
                  techFilter: v as TidalEnergyState['techFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technologies</SelectItem>
                <SelectItem value="barrage">Barrage</SelectItem>
                <SelectItem value="stream">Stream</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
                <SelectItem value="lagoon">Lagoon</SelectItem>
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
                  <Icon className="h-3 w-3 text-emerald-500" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={tidalEnergy[key] as boolean}
                  onCheckedChange={(checked) => setTidalEnergy({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Tidal Range</div>
              <div className="text-sm font-semibold">{summary.avgTidalRange}</div>
              <div className="text-[9px] text-muted-foreground">meters</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Total Capacity</div>
              <div className="text-sm font-semibold text-emerald-500">{summary.totalPowerCapacity}</div>
              <div className="text-[9px] text-muted-foreground">MW</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Proven Sites</div>
              <div className="text-sm font-semibold text-green-600">{summary.provenCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Tidal Energy Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = tidalEnergy.activeSiteId === site.id
                  const feasibilityCfg = FEASIBILITY_CONFIG[site.feasibility]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : 'border-border/40 hover:border-emerald-500/20 hover:bg-emerald-500/5'
                      }`}
                      onClick={() =>
                        setTidalEnergy({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: feasibilityCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${feasibilityCfg.bgClass}`}
                        >
                          {feasibilityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {tidalEnergy.showTidalRange && (
                          <div>
                            Range:{' '}
                            <span className="text-foreground font-medium">
                              {site.tidalRange} m
                            </span>
                          </div>
                        )}
                        {tidalEnergy.showPowerOutput && (
                          <div>
                            Capacity:{' '}
                            <span className="text-foreground font-medium">
                              {site.capacity} MW
                            </span>
                          </div>
                        )}
                        {tidalEnergy.showFeasibility && (
                          <div>
                            Flow:{' '}
                            <span className="text-foreground font-medium">
                              {site.peakFlowVelocity} m/s
                            </span>
                          </div>
                        )}
                        {tidalEnergy.showCostEfficiency && (
                          <div>
                            Cost:{' '}
                            <span className="text-foreground font-medium">
                              ${site.costPerMWh}/MWh
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${FEASIBILITY_CONFIG[activeSite.feasibility].bgClass}`}
                  >
                    {FEASIBILITY_CONFIG[activeSite.feasibility].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSite.latitude.toFixed(2)}, {activeSite.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Technology: </span>
                    <span className="font-medium capitalize">{activeSite.technology}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tidal Range: </span>
                    <span className="font-medium">{activeSite.tidalRange} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak Flow: </span>
                    <span className="font-medium">{activeSite.peakFlowVelocity} m/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Power: </span>
                    <span className="font-medium">{activeSite.averagePower} MW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity: </span>
                    <span className="font-medium">{activeSite.capacity} MW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Env. Impact: </span>
                    <span className="font-medium capitalize">{activeSite.environmentalImpact}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost: </span>
                    <span className="font-medium">${activeSite.costPerMWh}/MWh</span>
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
