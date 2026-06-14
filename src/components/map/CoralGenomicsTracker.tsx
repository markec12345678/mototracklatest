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
import { useMapStore, type CoralGenomicsState, type CoralGenomicsSite } from '@/lib/map-store'
import { Dna as DnaIcon, X, Gauge, Activity, MapPin, Filter, TrendingUp } from 'lucide-react'

const DEMO_SITES: CoralGenomicsSite[] = [
  {
    id: 'cg-gbr',
    name: 'Great Barrier Reef Australia',
    latitude: -18.29,
    longitude: 147.70,
    speciesType: 'branching',
    geneticDiversity: 0.82,
    bleachingResistance: 0.65,
    adaptationRate: 0.12,
    populationSize: 45000,
    conservationStatus: 'endangered',
  },
  {
    id: 'cg-caribbean',
    name: 'Caribbean Barrier Reef',
    latitude: 18.23,
    longitude: -87.52,
    speciesType: 'massive',
    geneticDiversity: 0.71,
    bleachingResistance: 0.58,
    adaptationRate: 0.09,
    populationSize: 28000,
    conservationStatus: 'critical',
  },
  {
    id: 'cg-redsea',
    name: 'Red Sea Egypt',
    latitude: 24.95,
    longitude: 35.58,
    speciesType: 'plate',
    geneticDiversity: 0.88,
    bleachingResistance: 0.79,
    adaptationRate: 0.18,
    populationSize: 62000,
    conservationStatus: 'vulnerable',
  },
  {
    id: 'cg-triangle',
    name: 'Coral Triangle Indonesia',
    latitude: -1.57,
    longitude: 124.81,
    speciesType: 'encrusting',
    geneticDiversity: 0.94,
    bleachingResistance: 0.72,
    adaptationRate: 0.15,
    populationSize: 95000,
    conservationStatus: 'vulnerable',
  },
  {
    id: 'cg-maldives',
    name: 'Maldives Atolls',
    latitude: 3.20,
    longitude: 73.22,
    speciesType: 'columnar',
    geneticDiversity: 0.76,
    bleachingResistance: 0.61,
    adaptationRate: 0.10,
    populationSize: 35000,
    conservationStatus: 'endangered',
  },
  {
    id: 'cg-flowergarden',
    name: 'Flower Garden Banks USA',
    latitude: 27.88,
    longitude: -93.82,
    speciesType: 'foliose',
    geneticDiversity: 0.69,
    bleachingResistance: 0.83,
    adaptationRate: 0.21,
    populationSize: 18000,
    conservationStatus: 'least_concern',
  },
]

const CONSERVATION_CONFIG: Record<
  CoralGenomicsSite['conservationStatus'],
  { label: string; color: string; bgClass: string }
> = {
  least_concern: { label: 'Least Concern', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  vulnerable: { label: 'Vulnerable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  endangered: { label: 'Endangered', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  critical: { label: 'Critical', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  extinct_in_wild: { label: 'Extinct in Wild', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const SPECIES_CONFIG: Record<
  CoralGenomicsSite['speciesType'],
  { label: string }
> = {
  branching: { label: 'Branching' },
  massive: { label: 'Massive' },
  plate: { label: 'Plate' },
  encrusting: { label: 'Encrusting' },
  columnar: { label: 'Columnar' },
  foliose: { label: 'Foliose' },
}

function formatPopulation(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return n.toString()
}

export function CoralGenomicsTracker() {
  const state = useMapStore((s) => s.coralGenomics)
  const setState = useMapStore((s) => s.setCoralGenomics)

  const sites = useMemo(
    () => (state.sites.length > 0 ? state.sites : DEMO_SITES),
    [state.sites]
  )

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (state.speciesFilter !== 'all' && s.speciesType !== state.speciesFilter) return false
      return true
    })
  }, [sites, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredSites.length === 0) {
      return { avgDiversity: 0, avgBleachingResistance: 0, endangeredCount: 0 }
    }
    const avgDiversity = filteredSites.reduce((sum, s) => sum + s.geneticDiversity, 0) / filteredSites.length
    const avgBleachingResistance = filteredSites.reduce((sum, s) => sum + s.bleachingResistance, 0) / filteredSites.length
    const endangeredCount = filteredSites.filter(
      (s) => s.conservationStatus === 'endangered' || s.conservationStatus === 'critical' || s.conservationStatus === 'extinct_in_wild'
    ).length
    return {
      avgDiversity: Math.round(avgDiversity * 100) / 100,
      avgBleachingResistance: Math.round(avgBleachingResistance * 100) / 100,
      endangeredCount,
    }
  }, [filteredSites])

  const activeSite = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoralGenomicsState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDiversity', label: 'Genetic Diversity', icon: Gauge },
    { key: 'showBleachingResistance', label: 'Bleaching Resistance', icon: Activity },
    { key: 'showAdaptationRate', label: 'Adaptation Rate', icon: TrendingUp },
    { key: 'showConservationStatus', label: 'Conservation Status', icon: Activity },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <DnaIcon className="h-4 w-4 text-pink-500" />
              Coral Genomics Tracker
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
              Species Type
            </Label>
            <Select
              value={state.speciesFilter}
              onValueChange={(v) =>
                setState({
                  speciesFilter: v as CoralGenomicsState['speciesFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="branching">Branching</SelectItem>
                <SelectItem value="massive">Massive</SelectItem>
                <SelectItem value="plate">Plate</SelectItem>
                <SelectItem value="encrusting">Encrusting</SelectItem>
                <SelectItem value="columnar">Columnar</SelectItem>
                <SelectItem value="foliose">Foliose</SelectItem>
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
                  <Icon className="h-3 w-3 text-pink-600" />
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
              <div className="text-[10px] text-muted-foreground">Avg Diversity</div>
              <div className="text-sm font-semibold text-pink-600">{summary.avgDiversity.toFixed(2)}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Bleach Resist.</div>
              <div className="text-sm font-semibold text-pink-600">{summary.avgBleachingResistance.toFixed(2)}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Endangered+</div>
              <div className="text-sm font-semibold text-red-600">{summary.endangeredCount}</div>
              <div className="text-[9px] text-muted-foreground">sites</div>
            </div>
          </div>

          <Separator />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Genomics Sites ({filteredSites.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSites.map((site) => {
                  const isActive = state.activeSiteId === site.id
                  const consCfg = CONSERVATION_CONFIG[site.conservationStatus]
                  return (
                    <div
                      key={site.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-pink-500/50 bg-pink-500/5'
                          : 'border-border/40 hover:border-pink-500/20 hover:bg-pink-500/5'
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
                            style={{ backgroundColor: consCfg.color }}
                          />
                          <span className="text-xs font-medium">{site.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${consCfg.bgClass}`}
                        >
                          {consCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showDiversity && (
                          <div>
                            Diversity:{' '}
                            <span className="text-foreground font-medium">
                              {site.geneticDiversity.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showBleachingResistance && (
                          <div>
                            Bleach Resist.:{' '}
                            <span className="text-foreground font-medium">
                              {site.bleachingResistance.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {state.showAdaptationRate && (
                          <div>
                            Adaptation:{' '}
                            <span className="text-foreground font-medium">
                              {site.adaptationRate.toFixed(2)}/yr
                            </span>
                          </div>
                        )}
                        {state.showConservationStatus && (
                          <div>
                            Population:{' '}
                            <span className="text-foreground font-medium">
                              {formatPopulation(site.populationSize)}
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
              <div className="space-y-2 rounded-lg border border-pink-500/20 bg-pink-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-pink-600" />
                  <span className="text-xs font-semibold">{activeSite.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${CONSERVATION_CONFIG[activeSite.conservationStatus].bgClass}`}
                  >
                    {CONSERVATION_CONFIG[activeSite.conservationStatus].label}
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
                    <span className="font-medium">{SPECIES_CONFIG[activeSite.speciesType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Genetic Diversity: </span>
                    <span className="font-medium">{activeSite.geneticDiversity.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bleach Resistance: </span>
                    <span className="font-medium">{activeSite.bleachingResistance.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Adaptation Rate: </span>
                    <span className="font-medium">{activeSite.adaptationRate.toFixed(2)}/yr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population: </span>
                    <span className="font-medium">{formatPopulation(activeSite.populationSize)}</span>
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
