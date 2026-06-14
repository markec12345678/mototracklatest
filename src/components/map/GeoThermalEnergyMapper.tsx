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
import { useMapStore, type GeoThermalEnergyState, type GeoThermalSite } from '@/lib/map-store'
import { Flame as FlameIcon6, X, Thermometer, Zap, ShieldCheck, DollarSign, MapPin, Filter } from 'lucide-react'

const DEMO_SITES: GeoThermalSite[] = [
  {
    id: 'gt-geysers',
    name: 'The Geysers',
    latitude: 38.79,
    longitude: -122.76,
    reservoirTemp: 240,
    flowRate: 850,
    powerPotential: 1517,
    technology: 'dry_steam',
    depth: 2500,
    feasibility: 'proven',
    costPerMWh: 52,
  },
  {
    id: 'gt-lardarello',
    name: 'Larderello',
    latitude: 43.27,
    longitude: 10.87,
    reservoirTemp: 220,
    flowRate: 720,
    powerPotential: 800,
    technology: 'dry_steam',
    depth: 1800,
    feasibility: 'proven',
    costPerMWh: 58,
  },
  {
    id: 'gt-hellisheidi',
    name: 'Hellisheidi',
    latitude: 64.04,
    longitude: -21.40,
    reservoirTemp: 200,
    flowRate: 580,
    powerPotential: 303,
    technology: 'flash',
    depth: 2200,
    feasibility: 'proven',
    costPerMWh: 45,
  },
  {
    id: 'gt-cerro',
    name: 'Cerro Prieto',
    latitude: 32.66,
    longitude: -115.27,
    reservoirTemp: 310,
    flowRate: 960,
    powerPotential: 720,
    technology: 'flash',
    depth: 3500,
    feasibility: 'proven',
    costPerMWh: 48,
  },
  {
    id: 'gt-raft',
    name: 'Raft River',
    latitude: 42.68,
    longitude: -113.22,
    reservoirTemp: 150,
    flowRate: 320,
    powerPotential: 110,
    technology: 'binary',
    depth: 1500,
    feasibility: 'probable',
    costPerMWh: 72,
  },
  {
    id: 'gt-soultz',
    name: 'Soultz-sous-Forêts',
    latitude: 48.93,
    longitude: 7.88,
    reservoirTemp: 200,
    flowRate: 120,
    powerPotential: 25,
    technology: 'enhanced',
    depth: 5000,
    feasibility: 'possible',
    costPerMWh: 120,
  },
]

const FEASIBILITY_CONFIG: Record<
  GeoThermalSite['feasibility'],
  { label: string; color: string; bgClass: string }
> = {
  proven: { label: 'Proven', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  probable: { label: 'Probable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  possible: { label: 'Possible', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  speculative: { label: 'Speculative', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
}

export function GeoThermalEnergyMapper() {
  const state = useMapStore((s) => s.geoThermalEnergy)
  const setState = useMapStore((s) => s.setGeoThermalEnergy)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.techFilter !== 'all' && s.technology !== state.techFilter) return false
      return true
    })
  }, [sites, state.techFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { totalPower: 0, provenCount: 0, avgCost: 0 }
    }
    const totalPower = filteredSites.reduce((sum, s) => sum + s.powerPotential, 0)
    const provenCount = filteredSites.filter((s) => s.feasibility === 'proven').length
    const avgCost = filteredSites.reduce((sum, s) => sum + s.costPerMWh, 0) / filteredSites.length
    return {
      totalPower,
      provenCount,
      avgCost: Math.round(avgCost),
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GeoThermalEnergyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showReservoirTemp', label: 'Reservoir Temp', icon: Thermometer },
    { key: 'showPowerPotential', label: 'Power Potential', icon: Zap },
    { key: 'showFeasibility', label: 'Feasibility', icon: ShieldCheck },
    { key: 'showCostEfficiency', label: 'Cost Efficiency', icon: DollarSign },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlameIcon6 className="h-4 w-4 text-orange-500" />
              GeoThermal Energy Mapper
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
          {/* Technology Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Technology
            </Label>
            <Select
              value={state.techFilter}
              onValueChange={(v) =>
                setState({
                  techFilter: v as GeoThermalEnergyState['techFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technologies</SelectItem>
                <SelectItem value="dry_steam">Dry Steam</SelectItem>
                <SelectItem value="flash">Flash</SelectItem>
                <SelectItem value="binary">Binary</SelectItem>
                <SelectItem value="enhanced">Enhanced (EGS)</SelectItem>
                <SelectItem value="co_production">Co-Production</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-500" />
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
              <div className="text-[10px] text-muted-foreground">Total Power</div>
              <div className="text-sm font-semibold">{summary.totalPower}</div>
              <div className="text-[9px] text-muted-foreground">MW</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Proven Sites</div>
              <div className="text-sm font-semibold text-green-500">{summary.provenCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Cost</div>
              <div className="text-sm font-semibold text-orange-500">${summary.avgCost}</div>
              <div className="text-[9px] text-muted-foreground">/MWh</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Geothermal Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const feasCfg = FEASIBILITY_CONFIG[site.feasibility]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : 'border-border/40 hover:border-orange-500/20 hover:bg-orange-500/5'
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
                            style={{ backgroundColor: feasCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${feasCfg.bgClass}`}
                        >
                          {feasCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showReservoirTemp && (
                          <div>
                            Temp:{' '}
                            <span className="text-foreground font-medium">
                              {site.reservoirTemp}°C
                            </span>
                          </div>
                        )}
                        {state.showPowerPotential && (
                          <div>
                            Power:{' '}
                            <span className="text-foreground font-medium">
                              {site.powerPotential} MW
                            </span>
                          </div>
                        )}
                        {state.showFeasibility && (
                          <div>
                            Depth:{' '}
                            <span className="text-foreground font-medium">
                              {site.depth} m
                            </span>
                          </div>
                        )}
                        {state.showCostEfficiency && (
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
              <div className="space-y-2 rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
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
                    <span className="text-muted-foreground">Reservoir Temp: </span>
                    <span className="font-medium">{activeSite.reservoirTemp}°C</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flow Rate: </span>
                    <span className="font-medium">{activeSite.flowRate} L/s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Power Potential: </span>
                    <span className="font-medium">{activeSite.powerPotential} MW</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Technology: </span>
                    <span className="font-medium">{activeSite.technology.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeSite.depth} m</span>
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
