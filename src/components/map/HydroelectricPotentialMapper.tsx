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
import { useMapStore, type HydroelectricPotentialState, type HydroelectricSite } from '@/lib/map-store'
import { Waves as WavesIcon7, X, Zap, Battery, Leaf, ShieldCheck, MapPin, Filter } from 'lucide-react'

const DEMO_SITES: HydroelectricSite[] = [
  {
    id: 'he-itaipu',
    name: 'Itaipu Dam, Brazil',
    latitude: -25.41,
    longitude: -54.59,
    flowRate: 12000,
    headHeight: 120,
    powerPotential: 14000,
    siteType: 'reservoir',
    capacityFactor: 0.72,
    environmentalImpact: 'moderate',
    feasibility: 'proven',
  },
  {
    id: 'he-threegorges',
    name: 'Three Gorges, China',
    latitude: 30.82,
    longitude: 111.00,
    flowRate: 15000,
    headHeight: 80,
    powerPotential: 22500,
    siteType: 'reservoir',
    capacityFactor: 0.45,
    environmentalImpact: 'severe',
    feasibility: 'proven',
  },
  {
    id: 'he-niagara',
    name: 'Niagara Falls, USA',
    latitude: 43.08,
    longitude: -79.07,
    flowRate: 5800,
    headHeight: 50,
    powerPotential: 4400,
    siteType: 'run_of_river',
    capacityFactor: 0.68,
    environmentalImpact: 'low',
    feasibility: 'proven',
  },
  {
    id: 'he-iceland',
    name: 'Iceland Run-of-River',
    latitude: 64.13,
    longitude: -21.90,
    flowRate: 250,
    headHeight: 200,
    powerPotential: 300,
    siteType: 'run_of_river',
    capacityFactor: 0.85,
    environmentalImpact: 'minimal',
    feasibility: 'probable',
  },
  {
    id: 'he-norway',
    name: 'Norwegian Fjord',
    latitude: 61.50,
    longitude: 7.10,
    flowRate: 800,
    headHeight: 350,
    powerPotential: 1200,
    siteType: 'pumped_storage',
    capacityFactor: 0.62,
    environmentalImpact: 'low',
    feasibility: 'probable',
  },
  {
    id: 'he-himalayan',
    name: 'Himalayan Micro',
    latitude: 28.20,
    longitude: 84.10,
    flowRate: 50,
    headHeight: 150,
    powerPotential: 45,
    siteType: 'micro',
    capacityFactor: 0.55,
    environmentalImpact: 'minimal',
    feasibility: 'possible',
  },
]

const FEASIBILITY_CONFIG: Record<
  HydroelectricSite['feasibility'],
  { label: string; color: string; bgClass: string }
> = {
  proven: { label: 'Proven', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  probable: { label: 'Probable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  possible: { label: 'Possible', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  speculative: { label: 'Speculative', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
}

const SITE_TYPE_CONFIG: Record<
  HydroelectricSite['siteType'],
  { label: string }
> = {
  run_of_river: { label: 'Run-of-River' },
  reservoir: { label: 'Reservoir' },
  pumped_storage: { label: 'Pumped Storage' },
  micro: { label: 'Micro Hydro' },
  tidal: { label: 'Tidal' },
}

const ENV_IMPACT_CONFIG: Record<
  HydroelectricSite['environmentalImpact'],
  { label: string }
> = {
  minimal: { label: 'Minimal' },
  low: { label: 'Low' },
  moderate: { label: 'Moderate' },
  high: { label: 'High' },
  severe: { label: 'Severe' },
}

export function HydroelectricPotentialMapper() {
  const state = useMapStore((s) => s.hydroelectricPotential)
  const setState = useMapStore((s) => s.setHydroelectricPotential)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.typeFilter !== 'all' && s.siteType !== state.typeFilter) return false
      return true
    })
  }, [sites, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgPower: 0, avgCapacity: 0, provenCount: 0 }
    }
    const avgPower = filteredSites.reduce((sum, s) => sum + s.powerPotential, 0) / filteredSites.length
    const avgCapacity = filteredSites.reduce((sum, s) => sum + s.capacityFactor, 0) / filteredSites.length
    const provenCount = filteredSites.filter(
      (s) => s.feasibility === 'proven'
    ).length
    return {
      avgPower: Math.round(avgPower),
      avgCapacity: Math.round(avgCapacity * 100) / 100,
      provenCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydroelectricPotentialState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPowerPotential', label: 'Power Potential', icon: Zap },
    { key: 'showCapacityFactor', label: 'Capacity Factor', icon: Battery },
    { key: 'showEnvironmentalImpact', label: 'Env. Impact', icon: Leaf },
    { key: 'showFeasibility', label: 'Feasibility', icon: ShieldCheck },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <WavesIcon7 className="h-4 w-4 text-emerald-600" />
              Hydroelectric Potential Mapper
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
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Site Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as HydroelectricPotentialState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="run_of_river">Run-of-River</SelectItem>
                <SelectItem value="reservoir">Reservoir</SelectItem>
                <SelectItem value="pumped_storage">Pumped Storage</SelectItem>
                <SelectItem value="micro">Micro Hydro</SelectItem>
                <SelectItem value="tidal">Tidal</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Power</div>
              <div className="text-sm font-semibold">{summary.avgPower}</div>
              <div className="text-[9px] text-muted-foreground">MW</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Capacity</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.avgCapacity}</div>
              <div className="text-[9px] text-muted-foreground">factor</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Proven</div>
              <div className="text-sm font-semibold text-green-600">{summary.provenCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Hydroelectric Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
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
                        setState({
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
                        {state.showPowerPotential && (
                          <div>
                            Power: <span className="text-foreground font-medium">{site.powerPotential} MW</span>
                          </div>
                        )}
                        {state.showCapacityFactor && (
                          <div>
                            Capacity: <span className="text-foreground font-medium">{(site.capacityFactor * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {state.showEnvironmentalImpact && (
                          <div>
                            Env. Impact: <span className="text-foreground font-medium">{ENV_IMPACT_CONFIG[site.environmentalImpact].label}</span>
                          </div>
                        )}
                        {state.showFeasibility && (
                          <div>
                            Type: <span className="text-foreground font-medium">{SITE_TYPE_CONFIG[site.siteType].label}</span>
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
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
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
                    <span className="text-muted-foreground">Power Potential: </span>
                    <span className="font-medium">{activeSite.powerPotential} MW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flow Rate: </span>
                    <span className="font-medium">{activeSite.flowRate} m³/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Head Height: </span>
                    <span className="font-medium">{activeSite.headHeight} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity Factor: </span>
                    <span className="font-medium">{(activeSite.capacityFactor * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Site Type: </span>
                    <span className="font-medium">{SITE_TYPE_CONFIG[activeSite.siteType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Env. Impact: </span>
                    <span className="font-medium">{ENV_IMPACT_CONFIG[activeSite.environmentalImpact].label}</span>
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
