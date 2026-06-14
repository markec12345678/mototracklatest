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
import { useMapStore, type RainfallPatternState, type RainfallRegion } from '@/lib/map-store'
import { CloudRain as CloudRainIcon2, X, Droplets, TrendingUp, Layers, Activity, MapPin, Filter } from 'lucide-react'

const DEMO_REGIONS: RainfallRegion[] = [
  {
    id: 'rp-amazon',
    name: 'Amazon Basin',
    latitude: -3.47,
    longitude: -62.22,
    annualRainfall: 2300,
    seasonalVariation: 35,
    intensityIndex: 7.8,
    droughtFrequency: 12,
    floodFrequency: 28,
    monsoonDependency: 25,
    precipitationType: 'convective',
    trend: 'decreasing',
  },
  {
    id: 'rp-monsoon-india',
    name: 'Monsoon India',
    latitude: 20.59,
    longitude: 78.96,
    annualRainfall: 1170,
    seasonalVariation: 82,
    intensityIndex: 8.5,
    droughtFrequency: 22,
    floodFrequency: 35,
    monsoonDependency: 88,
    precipitationType: 'monsoon',
    trend: 'highly_variable',
  },
  {
    id: 'rp-sahara',
    name: 'Sahara Fringe',
    latitude: 23.42,
    longitude: 10.17,
    annualRainfall: 85,
    seasonalVariation: 65,
    intensityIndex: 2.1,
    droughtFrequency: 78,
    floodFrequency: 2,
    monsoonDependency: 15,
    precipitationType: 'convective',
    trend: 'decreasing',
  },
  {
    id: 'rp-uk',
    name: 'British Isles',
    latitude: 54.38,
    longitude: -3.44,
    annualRainfall: 1220,
    seasonalVariation: 18,
    intensityIndex: 4.2,
    droughtFrequency: 8,
    floodFrequency: 15,
    monsoonDependency: 0,
    precipitationType: 'frontal',
    trend: 'increasing',
  },
  {
    id: 'rp-se-asia',
    name: 'SE Asia Tropical',
    latitude: 4.21,
    longitude: 101.98,
    annualRainfall: 2850,
    seasonalVariation: 42,
    intensityIndex: 9.1,
    droughtFrequency: 5,
    floodFrequency: 42,
    monsoonDependency: 65,
    precipitationType: 'monsoon',
    trend: 'stable',
  },
  {
    id: 'rp-andes',
    name: 'Andes Orographic',
    latitude: -12.05,
    longitude: -75.32,
    annualRainfall: 950,
    seasonalVariation: 48,
    intensityIndex: 6.3,
    droughtFrequency: 18,
    floodFrequency: 12,
    monsoonDependency: 35,
    precipitationType: 'orographic',
    trend: 'increasing',
  },
]

const TREND_CONFIG: Record<
  RainfallRegion['trend'],
  { label: string; color: string; bgClass: string }
> = {
  increasing: { label: 'Increasing', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  decreasing: { label: 'Decreasing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  highly_variable: { label: 'Highly Variable', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_LABELS: Record<RainfallRegion['precipitationType'], string> = {
  convective: 'Convective',
  orographic: 'Orographic',
  cyclonic: 'Cyclonic',
  frontal: 'Frontal',
  monsoon: 'Monsoon',
}

export function RainfallPatternAnalyzer() {
  const state = useMapStore((s) => s.rainfallPattern)
  const setState = useMapStore((s) => s.setRainfallPattern)

  const regions = useMemo(
    () => (state.regions.length > 0 ? state.regions : DEMO_REGIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.typeFilter !== 'all' && r.precipitationType !== state.typeFilter) return false
      return true
    })
  }, [regions, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { avgRainfall: 0, avgIntensity: 0, highVariationCount: 0 }
    }
    const avgRainfall = filteredRegions.reduce((sum, r) => sum + r.annualRainfall, 0) / filteredRegions.length
    const avgIntensity = filteredRegions.reduce((sum, r) => sum + r.intensityIndex, 0) / filteredRegions.length
    const highVariationCount = filteredRegions.filter(
      (r) => r.seasonalVariation > 60 || r.trend === 'highly_variable'
    ).length
    return {
      avgRainfall: Math.round(avgRainfall),
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      highVariationCount,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RainfallPatternState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAnnualRainfall', label: 'Annual Rainfall', icon: Droplets },
    { key: 'showSeasonalVariation', label: 'Seasonal Variation', icon: TrendingUp },
    { key: 'showIntensityIndex', label: 'Intensity Index', icon: Activity },
    { key: 'showTrend', label: 'Trend', icon: Layers },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <CloudRainIcon2 className="h-4 w-4 text-teal-600" />
              Rainfall Pattern Analyzer
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
              Precipitation Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as RainfallPatternState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="convective">Convective</SelectItem>
                <SelectItem value="orographic">Orographic</SelectItem>
                <SelectItem value="cyclonic">Cyclonic</SelectItem>
                <SelectItem value="frontal">Frontal</SelectItem>
                <SelectItem value="monsoon">Monsoon</SelectItem>
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
                  <Icon className="h-3 w-3 text-teal-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Rainfall</div>
              <div className="text-sm font-semibold">{summary.avgRainfall}</div>
              <div className="text-[9px] text-muted-foreground">mm/yr</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Intensity</div>
              <div className="text-sm font-semibold text-teal-600">{summary.avgIntensity}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">High Variation</div>
              <div className="text-sm font-semibold text-orange-600">{summary.highVariationCount}</div>
              <div className="text-[9px] text-muted-foreground">regions</div>
            </div>
          </div>

          <Separator />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Rainfall Regions ({filteredRegions.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRegions.map((region) => {
                  const isActive = state.activeRegionId === region.id
                  const trendCfg = TREND_CONFIG[region.trend]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeRegionId: isActive ? null : region.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: trendCfg.color }}
                          />
                          <span className="text-xs font-medium">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${trendCfg.bgClass}`}
                        >
                          {trendCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showAnnualRainfall && (
                          <div>
                            Rainfall:{' '}
                            <span className="text-foreground font-medium">
                              {region.annualRainfall} mm
                            </span>
                          </div>
                        )}
                        {state.showSeasonalVariation && (
                          <div>
                            Variation:{' '}
                            <span className="text-foreground font-medium">
                              {region.seasonalVariation}%
                            </span>
                          </div>
                        )}
                        {state.showIntensityIndex && (
                          <div>
                            Intensity:{' '}
                            <span className="text-foreground font-medium">
                              {region.intensityIndex}
                            </span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {TYPE_LABELS[region.precipitationType]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-xs font-semibold">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${TREND_CONFIG[activeRegion.trend].bgClass}`}
                  >
                    {TREND_CONFIG[activeRegion.trend].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeRegion.latitude.toFixed(2)}, {activeRegion.longitude.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Annual Rainfall: </span>
                    <span className="font-medium">{activeRegion.annualRainfall} mm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seasonal Variation: </span>
                    <span className="font-medium">{activeRegion.seasonalVariation}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Intensity Index: </span>
                    <span className="font-medium">{activeRegion.intensityIndex}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Drought Freq: </span>
                    <span className="font-medium">{activeRegion.droughtFrequency}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flood Freq: </span>
                    <span className="font-medium">{activeRegion.floodFrequency}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Monsoon Dep: </span>
                    <span className="font-medium">{activeRegion.monsoonDependency}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Precip Type: </span>
                    <span className="font-medium">{TYPE_LABELS[activeRegion.precipitationType]}</span>
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
