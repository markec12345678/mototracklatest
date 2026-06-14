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
import { useMapStore, type MangroveRestorationProgressState, type MangroveRestorationSite } from '@/lib/map-store'
import { TreePine as TreePineIcon5, X, Gauge, Activity, MapPin, Filter, TrendingUp } from 'lucide-react'

const DEMO_SITES: MangroveRestorationSite[] = [
  {
    id: 'mr-sundarbans',
    name: 'Sundarbans Bangladesh',
    latitude: 22.02,
    longitude: 89.02,
    speciesMix: 'rhizophora',
    survivalRate: 78.5,
    canopyCoverage: 62.3,
    carbonSequestered: 45.2,
    yearsSincePlanting: 8,
    progress: 'thriving',
  },
  {
    id: 'mr-gazibay',
    name: 'Gazi Bay Kenya',
    latitude: -4.42,
    longitude: 39.50,
    speciesMix: 'avicennia',
    survivalRate: 65.2,
    canopyCoverage: 48.7,
    carbonSequestered: 28.9,
    yearsSincePlanting: 5,
    progress: 'establishing',
  },
  {
    id: 'mr-mumbai',
    name: 'Mumbai Coastal India',
    latitude: 19.08,
    longitude: 72.88,
    speciesMix: 'sonneratia',
    survivalRate: 42.1,
    canopyCoverage: 25.8,
    carbonSequestered: 8.5,
    yearsSincePlanting: 3,
    progress: 'struggling',
  },
  {
    id: 'mr-kutch',
    name: 'Gulf of Kutch India',
    latitude: 22.47,
    longitude: 69.07,
    speciesMix: 'bruguiera',
    survivalRate: 85.3,
    canopyCoverage: 71.2,
    carbonSequestered: 52.8,
    yearsSincePlanting: 12,
    progress: 'mature',
  },
  {
    id: 'mr-mekong',
    name: 'Mekong Delta Vietnam',
    latitude: 10.02,
    longitude: 105.78,
    speciesMix: 'mixed',
    survivalRate: 55.8,
    canopyCoverage: 38.4,
    carbonSequestered: 15.3,
    yearsSincePlanting: 4,
    progress: 'establishing',
  },
  {
    id: 'mr-yucatan',
    name: 'Yucatan Mexico',
    latitude: 20.97,
    longitude: -89.62,
    speciesMix: 'laguncularia',
    survivalRate: 28.4,
    canopyCoverage: 12.1,
    carbonSequestered: 2.1,
    yearsSincePlanting: 2,
    progress: 'failed',
  },
]

const PROGRESS_CONFIG: Record<
  MangroveRestorationSite['progress'],
  { label: string; color: string; bgClass: string }
> = {
  failed: { label: 'Failed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  struggling: { label: 'Struggling', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  establishing: { label: 'Establishing', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  thriving: { label: 'Thriving', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  mature: { label: 'Mature', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

const SPECIES_CONFIG: Record<
  MangroveRestorationSite['speciesMix'],
  { label: string }
> = {
  rhizophora: { label: 'Rhizophora' },
  avicennia: { label: 'Avicennia' },
  sonneratia: { label: 'Sonneratia' },
  bruguiera: { label: 'Bruguiera' },
  mixed: { label: 'Mixed' },
  laguncularia: { label: 'Laguncularia' },
}

export function MangroveRestorationProgress() {
  const state = useMapStore((s) => s.mangroveRestorationProgress)
  const setState = useMapStore((s) => s.setMangroveRestorationProgress)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.speciesFilter !== 'all' && s.speciesMix !== state.speciesFilter) return false
      return true
    })
  }, [sites, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgSurvivalRate: 0, avgCanopyCoverage: 0, strugglingCount: 0 }
    }
    const avgSurvivalRate = filteredSites.reduce((sum, s) => sum + s.survivalRate, 0) / filteredSites.length
    const avgCanopyCoverage = filteredSites.reduce((sum, s) => sum + s.canopyCoverage, 0) / filteredSites.length
    const strugglingCount = filteredSites.filter(
      (s) => s.progress === 'struggling' || s.progress === 'failed'
    ).length
    return {
      avgSurvivalRate: Math.round(avgSurvivalRate * 10) / 10,
      avgCanopyCoverage: Math.round(avgCanopyCoverage * 10) / 10,
      strugglingCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MangroveRestorationProgressState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSurvivalRate', label: 'Survival Rate', icon: Gauge },
    { key: 'showCanopyCoverage', label: 'Canopy Coverage', icon: Activity },
    { key: 'showCarbonSequestered', label: 'Carbon Sequestered', icon: TrendingUp },
    { key: 'showProgress', label: 'Progress', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TreePineIcon5 className="h-4 w-4 text-emerald-500" />
              Mangrove Restoration Progress
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
          {/* Species Filter */}
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Species Mix
            </Label>
            <Select
              value={state.speciesFilter}
              onValueChange={(v) =>
                setState({
                  speciesFilter: v as MangroveRestorationProgressState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="rhizophora">Rhizophora</SelectItem>
                <SelectItem value="avicennia">Avicennia</SelectItem>
                <SelectItem value="sonneratia">Sonneratia</SelectItem>
                <SelectItem value="bruguiera">Bruguiera</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="laguncularia">Laguncularia</SelectItem>
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
              <div className="text-[10px] text-muted-foreground">Avg Survival Rate</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.avgSurvivalRate.toFixed(1)}%</div>
              <div className="text-[9px] text-muted-foreground">survival</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Canopy</div>
              <div className="text-sm font-semibold text-emerald-600">{summary.avgCanopyCoverage.toFixed(1)}%</div>
              <div className="text-[9px] text-muted-foreground">coverage</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Struggling/Failed</div>
              <div className="text-sm font-semibold text-red-600">{summary.strugglingCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Restoration Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const progCfg = PROGRESS_CONFIG[site.progress]
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
                            style={{ backgroundColor: progCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${progCfg.bgClass}`}
                        >
                          {progCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showSurvivalRate && (
                          <div>
                            Survival:{' '}
                            <span className="text-foreground font-medium">
                              {site.survivalRate.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {state.showCanopyCoverage && (
                          <div>
                            Canopy:{' '}
                            <span className="text-foreground font-medium">
                              {site.canopyCoverage.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {state.showCarbonSequestered && (
                          <div>
                            Carbon:{' '}
                            <span className="text-foreground font-medium">
                              {site.carbonSequestered.toFixed(1)} t/ha
                            </span>
                          </div>
                        )}
                        {state.showProgress && (
                          <div>
                            Years:{' '}
                            <span className="text-foreground font-medium">
                              {site.yearsSincePlanting} yr
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
                    className={`text-[10px] h-5 ml-auto ${PROGRESS_CONFIG[activeSite.progress].bgClass}`}
                  >
                    {PROGRESS_CONFIG[activeSite.progress].label}
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
                    <span className="text-muted-foreground">Species: </span>
                    <span className="font-medium">{SPECIES_CONFIG[activeSite.speciesMix].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Survival Rate: </span>
                    <span className="font-medium">{activeSite.survivalRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Canopy Coverage: </span>
                    <span className="font-medium">{activeSite.canopyCoverage.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Carbon Sequestered: </span>
                    <span className="font-medium">{activeSite.carbonSequestered.toFixed(1)} t/ha</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Years Planted: </span>
                    <span className="font-medium">{activeSite.yearsSincePlanting} yr</span>
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
