'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type KelpForestSite, type KelpForestState } from '@/lib/map-store'
import { Leaf, X, Thermometer, Fish, Filter, MapPin } from 'lucide-react'

const SAMPLE_SITES: KelpForestSite[] = [
  {
    id: 'kf-1',
    name: 'Monterey Bay',
    latitude: 36.6,
    longitude: -121.9,
    canopyCoverage: 78.5,
    healthIndex: 0.82,
    species: 'Macrocystis pyrifera',
    waterTemp: 13.2,
    nutrientLevel: 6.4,
    urchinDensity: 3.1,
    restorationStatus: 'healthy',
  },
  {
    id: 'kf-2',
    name: 'Channel Islands',
    latitude: 34.0,
    longitude: -119.5,
    canopyCoverage: 92.3,
    healthIndex: 0.95,
    species: 'Macrocystis pyrifera',
    waterTemp: 14.8,
    nutrientLevel: 7.1,
    urchinDensity: 1.2,
    restorationStatus: 'pristine',
  },
  {
    id: 'kf-3',
    name: 'Tasmania',
    latitude: -43.0,
    longitude: 147.5,
    canopyCoverage: 35.6,
    healthIndex: 0.38,
    species: 'Ecklonia radiata',
    waterTemp: 17.4,
    nutrientLevel: 3.2,
    urchinDensity: 18.7,
    restorationStatus: 'declining',
  },
  {
    id: 'kf-4',
    name: 'Patagonia',
    latitude: -46.5,
    longitude: -67.5,
    canopyCoverage: 64.2,
    healthIndex: 0.71,
    species: 'Macrocystis pyrifera',
    waterTemp: 10.5,
    nutrientLevel: 8.2,
    urchinDensity: 4.5,
    restorationStatus: 'healthy',
  },
  {
    id: 'kf-5',
    name: 'Norway Coast',
    latitude: 63.5,
    longitude: 8.5,
    canopyCoverage: 45.1,
    healthIndex: 0.52,
    species: 'Laminaria hyperborea',
    waterTemp: 8.9,
    nutrientLevel: 5.8,
    urchinDensity: 12.3,
    restorationStatus: 'declining',
  },
  {
    id: 'kf-6',
    name: 'Scottish Highlands',
    latitude: 57.5,
    longitude: -5.5,
    canopyCoverage: 12.4,
    healthIndex: 0.15,
    species: 'Laminaria digitata',
    waterTemp: 11.2,
    nutrientLevel: 4.1,
    urchinDensity: 28.9,
    restorationStatus: 'barren',
  },
]

const STATUS_CONFIG: Record<
  KelpForestSite['restorationStatus'],
  { bg: string; text: string; border: string; dot: string }
> = {
  pristine: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    dot: 'bg-green-500',
  },
  healthy: {
    bg: 'bg-lime-100 dark:bg-lime-900/30',
    text: 'text-lime-800 dark:text-lime-300',
    border: 'border-lime-300 dark:border-lime-700',
    dot: 'bg-lime-500',
  },
  declining: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    dot: 'bg-orange-500',
  },
  barren: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    dot: 'bg-red-500',
  },
}

export default function KelpForestMonitor() {
  const kelpForest = useMapStore((s) => s.kelpForest)
  const setKelpForest = useMapStore((s) => s.setKelpForest)

  const sites = useMemo(() => {
    const source = kelpForest.kelpSites.length > 0 ? kelpForest.kelpSites : SAMPLE_SITES
    return source
  }, [kelpForest.kelpSites])

  const filteredSites = useMemo(() => {
    let result = sites
    if (kelpForest.statusFilter !== 'all') {
      result = result.filter((s) => s.restorationStatus === kelpForest.statusFilter)
    }
    return result
  }, [sites, kelpForest.statusFilter])

  const selectedSite = useMemo(() => {
    if (!kelpForest.activeSiteId) return null
    return sites.find((s) => s.id === kelpForest.activeSiteId) ?? null
  }, [sites, kelpForest.activeSiteId])

  const summary = useMemo(() => {
    const avgCoverage =
      sites.length > 0 ? sites.reduce((sum, s) => sum + s.canopyCoverage, 0) / sites.length : 0
    const decliningCount = sites.filter(
      (s) => s.restorationStatus === 'declining' || s.restorationStatus === 'barren'
    ).length
    const avgHealth =
      sites.length > 0 ? sites.reduce((sum, s) => sum + s.healthIndex, 0) / sites.length : 0
    return { avgCoverage, decliningCount, avgHealth }
  }, [sites])

  if (!kelpForest.open) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-[420px] max-h-[calc(100vh-2rem)] overflow-hidden">
      <Card className="shadow-2xl border-border/60 backdrop-blur-sm bg-background/95">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-lime-500" />
              <CardTitle className="text-lg">Kelp Forest Monitor</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setKelpForest({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-lime-50 dark:bg-lime-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Avg Coverage</p>
              <p className="text-lg font-bold text-lime-600 dark:text-lime-400">
                {summary.avgCoverage.toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Declining</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {summary.decliningCount}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-2.5 text-center">
              <p className="text-xs text-muted-foreground">Avg Health</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {summary.avgHealth.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Display Options
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="kf-show-coverage"
                  checked={kelpForest.showCoverage}
                  onCheckedChange={(v) => setKelpForest({ showCoverage: v })}
                />
                <Label htmlFor="kf-show-coverage" className="text-xs cursor-pointer">
                  Canopy Coverage
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="kf-show-health"
                  checked={kelpForest.showHealth}
                  onCheckedChange={(v) => setKelpForest({ showHealth: v })}
                />
                <Label htmlFor="kf-show-health" className="text-xs cursor-pointer">
                  Health Index
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="kf-show-species"
                  checked={kelpForest.showSpecies}
                  onCheckedChange={(v) => setKelpForest({ showSpecies: v })}
                />
                <Label htmlFor="kf-show-species" className="text-xs cursor-pointer">
                  Species
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="kf-show-restoration"
                  checked={kelpForest.showRestoration}
                  onCheckedChange={(v) => setKelpForest({ showRestoration: v })}
                />
                <Label htmlFor="kf-show-restoration" className="text-xs cursor-pointer">
                  Restoration
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Filter by Status
              </p>
            </div>
            <Select
              value={kelpForest.statusFilter}
              onValueChange={(v) =>
                setKelpForest({
                  statusFilter: v as KelpForestState['statusFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="barren">Barren</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Forest Sites ({filteredSites.length})
            </p>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {filteredSites.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No sites match the current filter.
                </p>
              )}
              {filteredSites.map((site) => {
                const sc = STATUS_CONFIG[site.restorationStatus]
                const isSelected = kelpForest.activeSiteId === site.id
                return (
                  <button
                    key={site.id}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                    onClick={() =>
                      setKelpForest({
                        activeSiteId: isSelected ? null : site.id,
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${sc.dot}`} />
                        <span className="text-sm font-medium truncate">{site.name}</span>
                      </div>
                      {kelpForest.showRestoration && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}
                        >
                          {site.restorationStatus}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {kelpForest.showCoverage && (
                        <span className="flex items-center gap-0.5">
                          <Leaf className="h-3 w-3" />
                          {site.canopyCoverage.toFixed(1)}%
                        </span>
                      )}
                      {kelpForest.showHealth && (
                        <span>Health {site.healthIndex.toFixed(2)}</span>
                      )}
                      <span className="flex items-center gap-0.5">
                        <Thermometer className="h-3 w-3" />
                        {site.waterTemp.toFixed(1)}°C
                      </span>
                      {kelpForest.showSpecies && (
                        <span className="flex items-center gap-0.5">
                          <Fish className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{site.species}</span>
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Site Details */}
          {selectedSite && (
            <>
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{selectedSite.name}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Canopy Coverage
                    </p>
                    <p className="text-sm font-bold text-lime-600 dark:text-lime-400">
                      {selectedSite.canopyCoverage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Health Index
                    </p>
                    <p className="text-sm font-medium">{selectedSite.healthIndex.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Species
                    </p>
                    <p className="text-sm font-medium">{selectedSite.species}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Water Temp
                    </p>
                    <p className="text-sm font-medium">
                      {selectedSite.waterTemp.toFixed(1)}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Nutrient Level
                    </p>
                    <p className="text-sm font-medium">{selectedSite.nutrientLevel.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Urchin Density
                    </p>
                    <p className="text-sm font-medium">
                      {selectedSite.urchinDensity.toFixed(1)}/m²
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Restoration Status
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-0.5 ${STATUS_CONFIG[selectedSite.restorationStatus].bg} ${STATUS_CONFIG[selectedSite.restorationStatus].text} ${STATUS_CONFIG[selectedSite.restorationStatus].border}`}
                    >
                      {selectedSite.restorationStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Coordinates
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSite.latitude.toFixed(2)}°,{' '}
                    {selectedSite.longitude.toFixed(2)}°
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
