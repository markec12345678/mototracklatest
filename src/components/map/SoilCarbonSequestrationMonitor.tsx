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
import { useMapStore, type SoilCarbonState, type CarbonSequestrationSite } from '@/lib/map-store'
import { Sprout as SproutIcon, X, Gauge, TrendingUp, MapPin, Filter, AlertTriangle } from 'lucide-react'

const DEMO_SITES: CarbonSequestrationSite[] = [
  {
    id: 'sc-siberian-peat',
    name: 'Siberian Peatlands Russia',
    latitude: 62.0,
    longitude: 90.0,
    soilType: 'peat',
    carbonStock: 1450,
    sequestrationRate: 0.85,
    organicMatter: 42,
    bulkDensity: 0.12,
    saturationLevel: 'near_saturated',
  },
  {
    id: 'sc-us-prairie',
    name: 'US Prairie Mollisols',
    latitude: 41.0,
    longitude: -96.0,
    soilType: 'mollisol',
    carbonStock: 320,
    sequestrationRate: 0.45,
    organicMatter: 28,
    bulkDensity: 1.25,
    saturationLevel: 'moderately_saturated',
  },
  {
    id: 'sc-japanese-andisol',
    name: 'Japanese Andisols',
    latitude: 36.0,
    longitude: 138.0,
    soilType: 'andisol',
    carbonStock: 210,
    sequestrationRate: 0.62,
    organicMatter: 35,
    bulkDensity: 0.75,
    saturationLevel: 'undersaturated',
  },
  {
    id: 'sc-scottish-histosol',
    name: 'Scottish Histosols',
    latitude: 57.0,
    longitude: -4.0,
    soilType: 'histosol',
    carbonStock: 890,
    sequestrationRate: 0.38,
    organicMatter: 55,
    bulkDensity: 0.18,
    saturationLevel: 'saturated',
  },
  {
    id: 'sc-indian-vertisol',
    name: 'Indian Vertisols',
    latitude: 20.0,
    longitude: 78.0,
    soilType: 'vertisol',
    carbonStock: 85,
    sequestrationRate: 0.22,
    organicMatter: 12,
    bulkDensity: 1.45,
    saturationLevel: 'moderately_saturated',
  },
  {
    id: 'sc-french-alfisol',
    name: 'French Alfisols',
    latitude: 47.0,
    longitude: 2.0,
    soilType: 'alfisol',
    carbonStock: 125,
    sequestrationRate: 0.55,
    organicMatter: 22,
    bulkDensity: 1.30,
    saturationLevel: 'supersaturated',
  },
]

const SATURATION_CONFIG: Record<
  CarbonSequestrationSite['saturationLevel'],
  { label: string; color: string; bgClass: string }
> = {
  undersaturated: { label: 'Undersaturated', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderately_saturated: { label: 'Moderately Saturated', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  near_saturated: { label: 'Near Saturated', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  saturated: { label: 'Saturated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  supersaturated: { label: 'Supersaturated', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SOIL_CONFIG: Record<
  CarbonSequestrationSite['soilType'],
  { label: string; unit: string }
> = {
  peat: { label: 'Peat', unit: 'tC/ha' },
  mollisol: { label: 'Mollisol', unit: 'tC/ha' },
  andisol: { label: 'Andisol', unit: 'tC/ha' },
  histosol: { label: 'Histosol', unit: 'tC/ha' },
  vertisol: { label: 'Vertisol', unit: 'tC/ha' },
  alfisol: { label: 'Alfisol', unit: 'tC/ha' },
}

export function SoilCarbonSequestrationMonitor() {
  const state = useMapStore((s) => s.soilCarbon)
  const setState = useMapStore((s) => s.setSoilCarbon)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.soilFilter !== 'all' && s.soilType !== state.soilFilter) return false
      return true
    })
  }, [sites, state.soilFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgCarbonStock: 0, avgSequestrationRate: 0, saturatedCount: 0 }
    }
    const avgCarbonStock = filteredSites.reduce((sum, s) => sum + s.carbonStock, 0) / filteredSites.length
    const avgSequestrationRate = filteredSites.reduce((sum, s) => sum + s.sequestrationRate, 0) / filteredSites.length
    const saturatedCount = filteredSites.filter(
      (s) => s.saturationLevel === 'saturated' || s.saturationLevel === 'supersaturated'
    ).length
    return {
      avgCarbonStock: Math.round(avgCarbonStock),
      avgSequestrationRate: Math.round(avgSequestrationRate * 100) / 100,
      saturatedCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SoilCarbonState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Gauge },
    { key: 'showSequestrationRate', label: 'Sequestration Rate', icon: TrendingUp },
    { key: 'showOrganicMatter', label: 'Organic Matter', icon: SproutIcon },
    { key: 'showSaturation', label: 'Saturation Level', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <SproutIcon className="h-4 w-4 text-green-700" />
              Soil Carbon Sequestration Monitor
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
          {/* Soil Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Soil Type
            </Label>
            <Select
              value={state.soilFilter}
              onValueChange={(v) =>
                setState({
                  soilFilter: v as SoilCarbonState['soilFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Soil Types</SelectItem>
                <SelectItem value="peat">Peat</SelectItem>
                <SelectItem value="mollisol">Mollisol</SelectItem>
                <SelectItem value="andisol">Andisol</SelectItem>
                <SelectItem value="histosol">Histosol</SelectItem>
                <SelectItem value="vertisol">Vertisol</SelectItem>
                <SelectItem value="alfisol">Alfisol</SelectItem>
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
                  <Icon className="h-3 w-3 text-green-700" />
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
              <div className="text-[10px] text-muted-foreground">Avg Carbon Stock</div>
              <div className="text-sm font-semibold">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-muted-foreground">tC/ha</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Seq. Rate</div>
              <div className="text-sm font-semibold text-green-700">{summary.avgSequestrationRate}</div>
              <div className="text-[9px] text-muted-foreground">tC/ha/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Sat./Super.</div>
              <div className="text-sm font-semibold text-red-600">{summary.saturatedCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Sequestration Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const satCfg = SATURATION_CONFIG[site.saturationLevel]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-700/50 bg-green-700/5'
                          : 'border-border/40 hover:border-green-700/20 hover:bg-green-700/5'
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
                            style={{ backgroundColor: satCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${satCfg.bgClass}`}
                        >
                          {satCfg.label}
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
                        {state.showSequestrationRate && (
                          <div>
                            Seq. Rate:{' '}
                            <span className="text-foreground font-medium">
                              {site.sequestrationRate.toFixed(2)} tC/ha/yr
                            </span>
                          </div>
                        )}
                        {state.showOrganicMatter && (
                          <div>
                            Organic:{' '}
                            <span className="text-foreground font-medium">
                              {site.organicMatter}%
                            </span>
                          </div>
                        )}
                        {state.showSaturation && (
                          <div>
                            Saturation:{' '}
                            <span className="text-foreground font-medium">
                              {satCfg.label}
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
              <div className="space-y-2 rounded-lg border border-green-700/20 bg-green-700/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-700" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${SATURATION_CONFIG[activeSite.saturationLevel].bgClass}`}
                  >
                    {SATURATION_CONFIG[activeSite.saturationLevel].label}
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
                    <span className="text-muted-foreground">Soil Type: </span>
                    <span className="font-medium">{SOIL_CONFIG[activeSite.soilType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Stock: </span>
                    <span className="font-medium">{activeSite.carbonStock} tC/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seq. Rate: </span>
                    <span className="font-medium">{activeSite.sequestrationRate.toFixed(2)} tC/ha/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organic Matter: </span>
                    <span className="font-medium">{activeSite.organicMatter}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bulk Density: </span>
                    <span className="font-medium">{activeSite.bulkDensity.toFixed(2)} g/cm³</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Saturation: </span>
                    <span className="font-medium">{SATURATION_CONFIG[activeSite.saturationLevel].label}</span>
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
