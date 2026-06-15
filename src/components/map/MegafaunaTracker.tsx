'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MegafaunaTrackingState, type MegafaunaTrackingData } from '@/lib/map-store'
import { Footprints as FootprintsIcon2, X, Users, TrendingUp, TreePine, MapPin } from 'lucide-react'

const SAMPLE_LOCATIONS: MegafaunaTrackingData[] = [
  {
    id: 'mf-african-elephant',
    name: 'African Elephant Herd',
    lat: -2.5,
    lng: 35.0,
    species: 'Loxodonta africana',
    population: 1200,
    trend: 'declining',
    habitatStatus: 'stressed',
    description: 'Savanna elephant population under poaching pressure',
  },
  {
    id: 'mf-blue-whale',
    name: 'Blue Whale Pod',
    lat: -45.0,
    lng: -130.0,
    species: 'Balaenoptera musculus',
    population: 85,
    trend: 'increasing',
    habitatStatus: 'optimal',
    description: 'Recovering blue whale population in Pacific',
  },
  {
    id: 'mf-siberian-tiger',
    name: 'Siberian Tiger',
    lat: 46.0,
    lng: 134.0,
    species: 'Panthera tigris altaica',
    population: 580,
    trend: 'stable',
    habitatStatus: 'stressed',
    description: 'Amur tiger population in Russian Far East',
  },
  {
    id: 'mf-gorilla',
    name: 'Mountain Gorilla',
    lat: -1.3,
    lng: 29.6,
    species: 'Gorilla beringei beringei',
    population: 1063,
    trend: 'increasing',
    habitatStatus: 'optimal',
    description: 'Conservation success story in Virunga mountains',
  },
]

const TREND_COLORS: Record<MegafaunaTrackingData['trend'], { label: string; color: string; bgClass: string }> = {
  increasing: { label: 'Increasing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  declining: { label: 'Declining', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const HABITAT_COLORS: Record<MegafaunaTrackingData['habitatStatus'], { label: string; color: string; bgClass: string }> = {
  optimal: { label: 'Optimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stressed: { label: 'Stressed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ trend }: { trend: MegafaunaTrackingData['trend'] }) {
  const cfg = TREND_COLORS[trend]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MegafaunaTracker() {
  const state = useMapStore((s) => s.megafaunaTracking)
  const setState = useMapStore((s) => s.setMegafaunaTracking)

  const animals = useMemo(
    () => (state.animals.length > 0 ? state.animals : SAMPLE_LOCATIONS),
    [state.animals]
  )

  const filteredItems = useMemo(() => {
    if (state.speciesFilter === 'all') return animals
    return animals.filter((a) => a.species === state.speciesFilter)
  }, [animals, state.speciesFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSpecies: 0, totalPopulation: 0, speciesAtRisk: 0, conservationWins: 0 }
    }
    const totalPopulation = filteredItems.reduce((sum, a) => sum + a.population, 0)
    const speciesAtRisk = filteredItems.filter((a) => a.trend === 'declining' || a.habitatStatus === 'critical').length
    const conservationWins = filteredItems.filter((a) => a.trend === 'increasing').length
    return {
      totalSpecies: filteredItems.length,
      totalPopulation,
      speciesAtRisk,
      conservationWins,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => animals.find((a) => a.id === state.activeAnimalId) ?? null,
    [animals, state.activeAnimalId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((a) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [a.lng, a.lat] },
      properties: { id: a.id, name: a.name, trend: a.trend, population: a.population },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.animals.length === 0) {
      useMapStore.getState().setMegafaunaTracking({ animals: SAMPLE_LOCATIONS })
    }
  }, [state.animals.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MegafaunaTrackingState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPopulation', label: 'Population', icon: Users },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
    { key: 'showHabitat', label: 'Habitat', icon: TreePine },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <FootprintsIcon2 className="h-4 w-4 text-emerald-400" />
              Megafauna Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Species Badges */}
          <div>
            <Label className="text-xs text-emerald-300/80">Species</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <Badge
                variant="outline"
                className={`text-[10px] h-6 cursor-pointer ${state.speciesFilter === 'all' ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-100' : 'bg-emerald-900/30 border-emerald-700/30 text-emerald-300/70'}`}
                onClick={() => setState({ speciesFilter: 'all' })}
              >
                All Species
              </Badge>
              {animals.map((a) => (
                <Badge
                  key={a.id}
                  variant="outline"
                  className={`text-[10px] h-6 cursor-pointer ${state.speciesFilter === a.species ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-100' : 'bg-emerald-900/30 border-emerald-700/30 text-emerald-300/70'}`}
                  onClick={() => setState({ speciesFilter: a.species })}
                >
                  {a.name.split(' ').slice(0, 2).join(' ')}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Species</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalSpecies}</div>
              <div className="text-[9px] text-emerald-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Population</div>
              <div className="text-sm font-semibold text-green-400">{summary.totalPopulation.toLocaleString()}</div>
              <div className="text-[9px] text-emerald-400/60">individuals</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Species at Risk</div>
              <div className="text-sm font-semibold text-red-400">{summary.speciesAtRisk}</div>
              <div className="text-[9px] text-emerald-400/60">declining/critical</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Conservation Wins</div>
              <div className="text-sm font-semibold text-green-400">{summary.conservationWins}</div>
              <div className="text-[9px] text-emerald-400/60">increasing</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Animal List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Tracked Megafauna ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((a) => {
                  const isActive = state.activeAnimalId === a.id
                  const trendCfg = TREND_COLORS[a.trend]
                  const habitatCfg = HABITAT_COLORS[a.habitatStatus]
                  return (
                    <div
                      key={a.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeAnimalId: isActive ? null : a.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon trend={a.trend} />
                          <span className="text-xs font-medium text-emerald-100">{a.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 ${trendCfg.bgClass}`}
                          >
                            {trendCfg.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 ${habitatCfg.bgClass}`}
                          >
                            {habitatCfg.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showPopulation && (
                          <div>
                            Population:{' '}
                            <span className="text-emerald-100 font-medium">{a.population.toLocaleString()}</span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Trend:{' '}
                            <span className="text-emerald-100 font-medium">{a.trend}</span>
                          </div>
                        )}
                        {state.showHabitat && (
                          <div>
                            Habitat:{' '}
                            <span className="text-emerald-100 font-medium">{a.habitatStatus}</span>
                          </div>
                        )}
                        <div>
                          Species:{' '}
                          <span className="text-emerald-100 font-medium italic text-[9px]">{a.species}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No species match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Animal Details */}
          {activeItem && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${TREND_COLORS[activeItem.trend].bgClass}`}
                  >
                    {TREND_COLORS[activeItem.trend].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Population: </span>
                    <span className="font-medium text-green-400">{activeItem.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Trend: </span>
                    <span className="font-medium text-emerald-200">{activeItem.trend}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Habitat: </span>
                    <span className="font-medium text-amber-400">{activeItem.habitatStatus}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-emerald-400/70">Species: </span>
                    <span className="font-medium text-emerald-200 italic">{activeItem.species}</span>
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
