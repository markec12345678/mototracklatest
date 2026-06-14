'use client'

import { useEffect, useMemo } from 'react'
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
import { useMapStore, type SoilCarbonData, type SoilCarbonState } from '@/lib/map-store'
import { Sprout as SproutIcon2, X, Gauge, TrendingUp, MapPin, Filter, AlertTriangle } from 'lucide-react'

const DEMO_SITES: SoilCarbonData[] = [
  {
    id: 'sc-iowa-corn',
    name: 'Iowa Corn Belt',
    lat: 42.0,
    lng: -93.5,
    carbonStock: 85,
    organicMatter: 3.8,
    microbialActivity: 72,
    sequestrationRate: 0.3,
    bulkDensity: 1.25,
    status: 'stable',
    description: 'USA - Deep mollisol soils, intensive agriculture',
  },
  {
    id: 'sc-amazon-dark',
    name: 'Amazon Dark Earth',
    lat: -3.0,
    lng: -60.0,
    carbonStock: 150,
    organicMatter: 8.5,
    microbialActivity: 95,
    sequestrationRate: 1.2,
    bulkDensity: 0.95,
    status: 'high_sequestration',
    description: 'Brazil - Terra Preta anthropogenic soil',
  },
  {
    id: 'sc-euro-cher',
    name: 'European Chernozem',
    lat: 48.0,
    lng: 22.0,
    carbonStock: 120,
    organicMatter: 5.2,
    microbialActivity: 80,
    sequestrationRate: 0.5,
    bulkDensity: 1.10,
    status: 'stable',
    description: "Ukraine - World's most fertile soil",
  },
  {
    id: 'sc-sahel-deg',
    name: 'Sahel Degraded',
    lat: 14.0,
    lng: 2.0,
    carbonStock: 15,
    organicMatter: 0.8,
    microbialActivity: 22,
    sequestrationRate: -0.4,
    bulkDensity: 1.65,
    status: 'critical',
    description: 'Niger - Desertification and carbon loss',
  },
  {
    id: 'sc-scottish-peat',
    name: 'Scottish Peatland',
    lat: 57.0,
    lng: -4.0,
    carbonStock: 280,
    organicMatter: 42,
    microbialActivity: 45,
    sequestrationRate: 0.8,
    bulkDensity: 0.15,
    status: 'high_sequestration',
    description: 'Scotland - Deep peat carbon store',
  },
  {
    id: 'sc-aus-mallee',
    name: 'Australian Mallee',
    lat: -34.0,
    lng: 140.0,
    carbonStock: 35,
    organicMatter: 1.5,
    microbialActivity: 38,
    sequestrationRate: -0.2,
    bulkDensity: 1.45,
    status: 'depleting',
    description: 'South Australia - Dryland cropping',
  },
]

const SITE_TYPE_MAP: Record<string, SoilCarbonState['typeFilter']> = {
  'sc-iowa-corn': 'agricultural',
  'sc-amazon-dark': 'forest',
  'sc-euro-cher': 'grassland',
  'sc-sahel-deg': 'grassland',
  'sc-scottish-peat': 'wetland',
  'sc-aus-mallee': 'agricultural',
}

const STATUS_CONFIG: Record<
  SoilCarbonData['status'],
  { label: string; color: string; bgClass: string }
> = {
  high_sequestration: { label: 'High Seq.', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  depleting: { label: 'Depleting', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function SoilCarbonMonitor() {
  const state = useMapStore((s) => s.soilCarbon)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  useEffect(() => {
    if (useMapStore.getState().soilCarbon.sites.length === 0) {
      useMapStore.getState().setSoilCarbon({ sites: DEMO_SITES })
    }
  }, [])

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.typeFilter !== 'all' && SITE_TYPE_MAP[s.id] !== state.typeFilter) return false
      return true
    })
  }, [sites, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgCarbonStock: 0, avgSequestrationRate: 0, atRiskCount: 0 }
    }
    const avgCarbonStock = filteredSites.reduce((sum, s) => sum + s.carbonStock, 0) / filteredSites.length
    const avgSequestrationRate = filteredSites.reduce((sum, s) => sum + s.sequestrationRate, 0) / filteredSites.length
    const atRiskCount = filteredSites.filter(
      (s) => s.status === 'depleting' || s.status === 'degraded' || s.status === 'critical'
    ).length
    return {
      avgCarbonStock: Math.round(avgCarbonStock * 10) / 10,
      avgSequestrationRate: Math.round(avgSequestrationRate * 100) / 100,
      atRiskCount,
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
    { key: 'showOrganicMatter', label: 'Organic Matter', icon: SproutIcon2 },
    { key: 'showMicrobialActivity', label: 'Microbial Activity', icon: TrendingUp },
    { key: 'showSequestrationRate', label: 'Sequestration Rate', icon: AlertTriangle },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden text-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <SproutIcon2 className="h-4 w-4 text-amber-400" />
              Soil Carbon Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => useMapStore.getState().setSoilCarbon({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Land Type Filter */}
          <div>
            <Label className="text-xs text-amber-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Land Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                useMapStore.getState().setSoilCarbon({
                  typeFilter: v as SoilCarbonState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="grassland">Grassland</SelectItem>
                <SelectItem value="wetland">Wetland</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => useMapStore.getState().setSoilCarbon({ [key]: checked })}
                  className="scale-75"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Carbon Stock</div>
              <div className="text-sm font-semibold text-amber-100">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-amber-400">tC/ha</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg Seq. Rate</div>
              <div className="text-sm font-semibold text-amber-100">{summary.avgSequestrationRate}</div>
              <div className="text-[9px] text-amber-400">tC/ha/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">At Risk</div>
              <div className="text-sm font-semibold text-red-400">{summary.atRiskCount}</div>
              <div className="text-[9px] text-amber-400">sites</div>
            </div>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">
              Soil Carbon Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const statusCfg = STATUS_CONFIG[site.status]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/20'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/10'
                      }`}
                      onClick={() =>
                        useMapStore.getState().setSoilCarbon({
                          activeSiteId: isActive ? null : site.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-amber-100">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-400">
                        {state.showCarbonStock && (
                          <div>
                            Carbon:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.carbonStock} tC/ha
                            </span>
                          </div>
                        )}
                        {state.showOrganicMatter && (
                          <div>
                            Organic:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.organicMatter}%
                            </span>
                          </div>
                        )}
                        {state.showMicrobialActivity && (
                          <div>
                            Microbial:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.microbialActivity}
                            </span>
                          </div>
                        )}
                        {state.showSequestrationRate && (
                          <div>
                            Seq. Rate:{' '}
                            <span className="text-amber-100 font-medium">
                              {site.sequestrationRate > 0 ? '+' : ''}{site.sequestrationRate.toFixed(1)} tC/ha/yr
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSites.length === 0 && (
                  <div className="text-center text-xs text-amber-400 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeSite && (
            <>
              <Separator className="bg-amber-800/30" />
              <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSite.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSite.status].label}
                  </Badge>
                </div>
                <div className="text-[10px] text-amber-300 italic mb-1.5">{activeSite.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400">Coordinates: </span>
                    <span className="text-amber-100 font-medium">
                      {activeSite.lat.toFixed(1)}, {activeSite.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400">Carbon Stock: </span>
                    <span className="text-amber-100 font-medium">{activeSite.carbonStock} tC/ha</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Organic Matter: </span>
                    <span className="text-amber-100 font-medium">{activeSite.organicMatter}%</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Microbial Act.: </span>
                    <span className="text-amber-100 font-medium">{activeSite.microbialActivity}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Seq. Rate: </span>
                    <span className="text-amber-100 font-medium">
                      {activeSite.sequestrationRate > 0 ? '+' : ''}{activeSite.sequestrationRate.toFixed(1)} tC/ha/yr
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400">Bulk Density: </span>
                    <span className="text-amber-100 font-medium">{activeSite.bulkDensity.toFixed(2)} g/cm³</span>
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
