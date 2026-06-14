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
import { useMapStore, type InvasiveSpeciesState, type InvasiveSpeciesData } from '@/lib/map-store'
import { Bug as BugIcon2, X, TrendingUp, ShieldAlert, Wrench, Leaf, MapPin, Filter } from 'lucide-react'

const DEMO_SPECIES: InvasiveSpeciesData[] = [
  {
    id: 'is-asian-hornet',
    name: 'Asian Hornet',
    lat: 48.0,
    lng: 2.0,
    spreadRate: 85,
    impactScore: 82,
    controlEffort: 45,
    nativeDecline: 35,
    introductionYear: 2004,
    status: 'spreading',
    description: 'Vespa velutina - Threat to European honeybees',
  },
  {
    id: 'is-zebra-mussel',
    name: 'Zebra Mussel',
    lat: 42.0,
    lng: -83.0,
    spreadRate: 120,
    impactScore: 90,
    controlEffort: 35,
    nativeDecline: 55,
    introductionYear: 1988,
    status: 'widespread',
    description: 'Dreissena polymorpha - Great Lakes ecosystem disruption',
  },
  {
    id: 'is-cane-toad',
    name: 'Cane Toad',
    lat: -19.0,
    lng: 146.0,
    spreadRate: 55,
    impactScore: 75,
    controlEffort: 20,
    nativeDecline: 45,
    introductionYear: 1935,
    status: 'widespread',
    description: 'Rhinella marina - Australian ecosystem disaster',
  },
  {
    id: 'is-emerald-ash-borer',
    name: 'Emerald Ash Borer',
    lat: 42.5,
    lng: -83.5,
    spreadRate: 30,
    impactScore: 88,
    controlEffort: 40,
    nativeDecline: 65,
    introductionYear: 2002,
    status: 'spreading',
    description: 'Agrilus planipennis - North American ash tree killer',
  },
  {
    id: 'is-lionfish',
    name: 'Lionfish',
    lat: 18.0,
    lng: -66.0,
    spreadRate: 95,
    impactScore: 78,
    controlEffort: 25,
    nativeDecline: 50,
    introductionYear: 1992,
    status: 'established',
    description: 'Pterois volitans - Caribbean reef invasion',
  },
  {
    id: 'is-kudzu',
    name: 'Kudzu',
    lat: 33.0,
    lng: -85.0,
    spreadRate: 45,
    impactScore: 70,
    controlEffort: 15,
    nativeDecline: 40,
    introductionYear: 1876,
    status: 'intractable',
    description: 'Pueraria montana - The vine that ate the South',
  },
]

const SPECIES_CATEGORY: Record<string, InvasiveSpeciesState['categoryFilter']> = {
  'is-asian-hornet': 'insect',
  'is-zebra-mussel': 'aquatic',
  'is-cane-toad': 'animal',
  'is-emerald-ash-borer': 'insect',
  'is-lionfish': 'aquatic',
  'is-kudzu': 'plant',
}

const STATUS_CONFIG: Record<
  InvasiveSpeciesData['status'],
  { label: string; color: string; bgClass: string }
> = {
  contained: { label: 'Contained', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  spreading: { label: 'Spreading', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  established: { label: 'Established', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  widespread: { label: 'Widespread', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  intractable: { label: 'Intractable', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const CATEGORY_LABELS: Record<InvasiveSpeciesState['categoryFilter'], string> = {
  all: 'All Categories',
  plant: 'Plant',
  animal: 'Animal',
  aquatic: 'Aquatic',
  insect: 'Insect',
  pathogen: 'Pathogen',
}

export function InvasiveSpeciesTracker() {
  const state = useMapStore((s) => s.invasiveSpecies)
  const setState = useMapStore((s) => s.setInvasiveSpecies)

  useEffect(() => {
    if (useMapStore.getState().invasiveSpecies.species.length === 0) {
      useMapStore.getState().setInvasiveSpecies({ species: DEMO_SPECIES })
    }
  }, [])

  const speciesList = useMemo(
    () => (state.species.length > 0 ? state.species : DEMO_SPECIES),
    [state.species]
  )

  const filteredSpecies = useMemo(() => {
    return speciesList.filter((s) => {
      if (state.categoryFilter !== 'all') {
        const cat = SPECIES_CATEGORY[s.id]
        if (cat !== state.categoryFilter) return false
      }
      return true
    })
  }, [speciesList, state.categoryFilter])

  const summary = useMemo(() => {
    if (filteredSpecies.length === 0) {
      return { avgSpreadRate: 0, avgImpactScore: 0, criticalCount: 0 }
    }
    const avgSpreadRate =
      filteredSpecies.reduce((sum, s) => sum + s.spreadRate, 0) / filteredSpecies.length
    const avgImpactScore =
      filteredSpecies.reduce((sum, s) => sum + s.impactScore, 0) / filteredSpecies.length
    const criticalCount = filteredSpecies.filter(
      (s) => s.status === 'widespread' || s.status === 'intractable'
    ).length
    return {
      avgSpreadRate: Math.round(avgSpreadRate * 10) / 10,
      avgImpactScore: Math.round(avgImpactScore * 10) / 10,
      criticalCount,
    }
  }, [filteredSpecies])

  const activeSpecies = useMemo(
    () => speciesList.find((s) => s.id === state.activeSpeciesId) ?? null,
    [speciesList, state.activeSpeciesId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof InvasiveSpeciesState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpread', label: 'Spread Rate', icon: TrendingUp },
    { key: 'showImpact', label: 'Impact Score', icon: ShieldAlert },
    { key: 'showControlEffort', label: 'Control Effort', icon: Wrench },
    { key: 'showNativeDecline', label: 'Native Decline', icon: Leaf },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-b from-amber-950/95 to-brown-950/95 backdrop-blur-xl border border-amber-800/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <BugIcon2 className="h-4 w-4 text-amber-400" />
              Invasive Species Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Category Filter */}
          <div>
            <Label className="text-xs text-amber-300/70 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Category
            </Label>
            <Select
              value={state.categoryFilter}
              onValueChange={(v) =>
                setState({
                  categoryFilter: v as InvasiveSpeciesState['categoryFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/30 border-amber-700/30 text-amber-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/20" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/70">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
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

          <Separator className="bg-amber-700/20" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-2 text-center">
              <div className="text-[10px] text-amber-300/60">Avg Spread Rate</div>
              <div className="text-sm font-semibold text-amber-100">{summary.avgSpreadRate}</div>
              <div className="text-[9px] text-amber-300/60">km/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-2 text-center">
              <div className="text-[10px] text-amber-300/60">Avg Impact Score</div>
              <div className="text-sm font-semibold text-amber-100">{summary.avgImpactScore}</div>
              <div className="text-[9px] text-amber-300/60">/ 100</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/20 p-2 text-center">
              <div className="text-[10px] text-amber-300/60">Critical</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-amber-300/60">species</div>
            </div>
          </div>

          <Separator className="bg-amber-700/20" />

          {/* Species List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/70">
              Invasive Species ({filteredSpecies.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSpecies.map((sp) => {
                  const isActive = state.activeSpeciesId === sp.id
                  const statusCfg = STATUS_CONFIG[sp.status]
                  return (
                    <div
                      key={sp.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/20'
                          : 'border-amber-700/20 hover:border-amber-500/30 hover:bg-amber-800/10'
                      }`}
                      onClick={() =>
                        setState({
                          activeSpeciesId: isActive ? null : sp.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-amber-100">{sp.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showSpread && (
                          <div>
                            Spread:{' '}
                            <span className="text-amber-100 font-medium">
                              {sp.spreadRate} km/yr
                            </span>
                          </div>
                        )}
                        {state.showImpact && (
                          <div>
                            Impact:{' '}
                            <span className="text-amber-100 font-medium">
                              {sp.impactScore}/100
                            </span>
                          </div>
                        )}
                        {state.showControlEffort && (
                          <div>
                            Control:{' '}
                            <span className="text-amber-100 font-medium">
                              {sp.controlEffort}%
                            </span>
                          </div>
                        )}
                        {state.showNativeDecline && (
                          <div>
                            Decline:{' '}
                            <span className="text-amber-100 font-medium">
                              {sp.nativeDecline}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSpecies.length === 0 && (
                  <div className="text-center text-xs text-amber-300/50 py-4">
                    No species match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Species Details */}
          {activeSpecies && (
            <>
              <Separator className="bg-amber-700/20" />
              <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-800/15 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeSpecies.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeSpecies.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeSpecies.status].label}
                  </Badge>
                </div>
                <div className="text-[10px] italic text-amber-300/60">{activeSpecies.description}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-300/60">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeSpecies.lat.toFixed(1)}, {activeSpecies.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-300/60">Introduced: </span>
                    <span className="font-medium text-amber-100">{activeSpecies.introductionYear}</span>
                  </div>
                  <div>
                    <span className="text-amber-300/60">Spread Rate: </span>
                    <span className="font-medium text-amber-100">{activeSpecies.spreadRate} km/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-300/60">Impact Score: </span>
                    <span className="font-medium text-amber-100">{activeSpecies.impactScore}/100</span>
                  </div>
                  <div>
                    <span className="text-amber-300/60">Control Effort: </span>
                    <span className="font-medium text-amber-100">{activeSpecies.controlEffort}%</span>
                  </div>
                  <div>
                    <span className="text-amber-300/60">Native Decline: </span>
                    <span className="font-medium text-amber-100">{activeSpecies.nativeDecline}%</span>
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
