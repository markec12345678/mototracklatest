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
import { useMapStore, type PeatlandCarbonState, type PeatlandSite } from '@/lib/map-store'
import { TreePine as TreePineIcon4, X, Gauge, Droplets, MapPin, Filter } from 'lucide-react'

const DEMO_SITES: PeatlandSite[] = [
  {
    id: 'pc-wsiberian',
    name: 'West Siberian Peatland',
    latitude: 60.00,
    longitude: 75.00,
    peatDepth: 4.2,
    carbonStock: 3200,
    waterTableDepth: 0.3,
    emissionRate: 2.8,
    area: 58000,
    degradationLevel: 'light',
    restorationFeasibility: 'high',
  },
  {
    id: 'pc-indonesian',
    name: 'Indonesian Tropical Peatland',
    latitude: -1.50,
    longitude: 112.00,
    peatDepth: 8.5,
    carbonStock: 6100,
    waterTableDepth: 1.2,
    emissionRate: 12.4,
    area: 210000,
    degradationLevel: 'severe',
    restorationFeasibility: 'moderate',
  },
  {
    id: 'pc-hudsonbay',
    name: 'Hudson Bay Lowlands',
    latitude: 55.00,
    longitude: -85.00,
    peatDepth: 3.1,
    carbonStock: 2400,
    waterTableDepth: 0.2,
    emissionRate: 1.5,
    area: 37000,
    degradationLevel: 'pristine',
    restorationFeasibility: 'high',
  },
  {
    id: 'pc-flowcountry',
    name: 'UK Flow Country',
    latitude: 58.38,
    longitude: -3.92,
    peatDepth: 5.8,
    carbonStock: 3800,
    waterTableDepth: 0.5,
    emissionRate: 4.2,
    area: 4000,
    degradationLevel: 'moderate',
    restorationFeasibility: 'high',
  },
  {
    id: 'pc-borneo',
    name: 'Borneo Peat Swamp',
    latitude: 1.50,
    longitude: 114.00,
    peatDepth: 9.2,
    carbonStock: 7200,
    waterTableDepth: 1.8,
    emissionRate: 18.6,
    area: 65000,
    degradationLevel: 'destroyed',
    restorationFeasibility: 'low',
  },
  {
    id: 'pc-patagonia',
    name: 'Patagonian Peatland',
    latitude: -52.00,
    longitude: -70.00,
    peatDepth: 2.8,
    carbonStock: 1800,
    waterTableDepth: 0.1,
    emissionRate: 0.9,
    area: 12000,
    degradationLevel: 'pristine',
    restorationFeasibility: 'high',
  },
]

const DEGRADATION_CONFIG: Record<
  PeatlandSite['degradationLevel'],
  { label: string; color: string; bgClass: string }
> = {
  pristine: { label: 'Pristine', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  light: { label: 'Light', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  severe: { label: 'Severe', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  destroyed: { label: 'Destroyed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const RESTORATION_CONFIG: Record<
  PeatlandSite['restorationFeasibility'],
  { label: string; color: string; bgClass: string }
> = {
  high: { label: 'High', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  low: { label: 'Low', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  none: { label: 'None', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function PeatlandCarbonTracker() {
  const state = useMapStore((s) => s.peatlandCarbon)
  const setState = useMapStore((s) => s.setPeatlandCarbon)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.degradationFilter !== 'all' && s.degradationLevel !== state.degradationFilter) return false
      return true
    })
  }, [sites, state.degradationFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgCarbonStock: 0, avgEmissionRate: 0, degradedCount: 0 }
    }
    const avgCarbonStock = filteredSites.reduce((sum, s) => sum + s.carbonStock, 0) / filteredSites.length
    const avgEmissionRate = filteredSites.reduce((sum, s) => sum + s.emissionRate, 0) / filteredSites.length
    const degradedCount = filteredSites.filter(
      (s) => s.degradationLevel === 'severe' || s.degradationLevel === 'destroyed'
    ).length
    return {
      avgCarbonStock: Math.round(avgCarbonStock),
      avgEmissionRate: Math.round(avgEmissionRate * 10) / 10,
      degradedCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PeatlandCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Gauge },
    { key: 'showWaterTable', label: 'Water Table Depth', icon: Droplets },
    { key: 'showEmissionRate', label: 'Emission Rate', icon: TreePineIcon4 },
    { key: 'showDegradation', label: 'Degradation Level', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreePineIcon4 className="h-4 w-4 text-emerald-600" />
              Peatland Carbon Tracker
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
          {/* Degradation Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Degradation Level
            </Label>
            <Select
              value={state.degradationFilter}
              onValueChange={(v) =>
                setState({
                  degradationFilter: v as PeatlandCarbonState['degradationFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degradation Levels</SelectItem>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="destroyed">Destroyed</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Carbon</div>
              <div className="text-sm font-semibold">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-muted-foreground">tC/ha</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Emission</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.avgEmissionRate}</div>
              <div className="text-[9px] text-muted-foreground">tCO₂/ha/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Severe/Destr.</div>
              <div className="text-sm font-semibold text-red-600">{summary.degradedCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Peatland Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const degradCfg = DEGRADATION_CONFIG[site.degradationLevel]
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
                            style={{ backgroundColor: degradCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${degradCfg.bgClass}`}
                        >
                          {degradCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showCarbonStock && (
                          <div>
                            Carbon:{' '}
                            <span className="text-foreground font-medium">
                              {site.carbonStock} tC/ha
                            </span>
                          </div>
                        )}
                        {state.showWaterTable && (
                          <div>
                            Water Table:{' '}
                            <span className="text-foreground font-medium">
                              {site.waterTableDepth} m
                            </span>
                          </div>
                        )}
                        {state.showEmissionRate && (
                          <div>
                            Emission:{' '}
                            <span className="text-foreground font-medium">
                              {site.emissionRate} tCO₂/ha/yr
                            </span>
                          </div>
                        )}
                        {state.showDegradation && (
                          <div>
                            Peat Depth:{' '}
                            <span className="text-foreground font-medium">
                              {site.peatDepth} m
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
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${DEGRADATION_CONFIG[activeSite.degradationLevel].bgClass}`}
                  >
                    {DEGRADATION_CONFIG[activeSite.degradationLevel].label}
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
                    <span className="text-muted-foreground">Peat Depth: </span>
                    <span className="font-medium">{activeSite.peatDepth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Stock: </span>
                    <span className="font-medium">{activeSite.carbonStock} tC/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Water Table: </span>
                    <span className="font-medium">{activeSite.waterTableDepth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Emission Rate: </span>
                    <span className="font-medium">{activeSite.emissionRate} tCO₂/ha/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Area: </span>
                    <span className="font-medium">{activeSite.area.toLocaleString()} ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Degradation: </span>
                    <span className="font-medium capitalize">{activeSite.degradationLevel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Restoration: </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] h-4 px-1 ${RESTORATION_CONFIG[activeSite.restorationFeasibility].bgClass}`}
                    >
                      {RESTORATION_CONFIG[activeSite.restorationFeasibility].label}
                    </Badge>
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
