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
import { useMapStore, type MethaneSeepState, type MethaneSeep } from '@/lib/map-store'
import { Droplets, X, Gauge, Activity, MapPin, Filter, Waves } from 'lucide-react'

const DEMO_SEEPS: MethaneSeep[] = [
  {
    id: 'ms-hakon',
    name: 'Håkon Mosby Mud Volcano',
    lat: 72.0,
    lng: 14.7,
    depth: 1250,
    fluxRate: 380,
    bubbleSize: 'large',
    communityType: 'bacterial_mat',
    microbialActivity: 0.85,
    oceanAcidificationImpact: 0.62,
    seepType: 'mud_volcano',
  },
  {
    id: 'ms-blake',
    name: 'Blake Ridge Seep',
    lat: 32.0,
    lng: -75.0,
    depth: 2150,
    fluxRate: 145,
    bubbleSize: 'medium',
    communityType: 'tube_worm',
    microbialActivity: 0.71,
    oceanAcidificationImpact: 0.48,
    seepType: 'gas_hydrate',
  },
  {
    id: 'ms-costarica',
    name: 'Costa Rica Margin',
    lat: 9.0,
    lng: -84.0,
    depth: 1050,
    fluxRate: 210,
    bubbleSize: 'medium',
    communityType: 'clam_bed',
    microbialActivity: 0.76,
    oceanAcidificationImpact: 0.55,
    seepType: 'cold_seep',
  },
  {
    id: 'ms-oregon',
    name: 'Oregon Margin',
    lat: 44.6,
    lng: -125.0,
    depth: 600,
    fluxRate: 92,
    bubbleSize: 'small',
    communityType: 'bacterial_mat',
    microbialActivity: 0.58,
    oceanAcidificationImpact: 0.35,
    seepType: 'cold_seep',
  },
  {
    id: 'ms-gulf',
    name: 'Gulf of Mexico Seep',
    lat: 27.5,
    lng: -90.5,
    depth: 2200,
    fluxRate: 310,
    bubbleSize: 'large',
    communityType: 'mixed',
    microbialActivity: 0.89,
    oceanAcidificationImpact: 0.72,
    seepType: 'authigenic_carbonate',
  },
  {
    id: 'ms-okhotsk',
    name: 'Sea of Okhotsk Seep',
    lat: 54.0,
    lng: 144.0,
    depth: 820,
    fluxRate: 68,
    bubbleSize: 'small',
    communityType: 'ice_worm',
    microbialActivity: 0.45,
    oceanAcidificationImpact: 0.28,
    seepType: 'pockmark',
  },
]

const COMMUNITY_CONFIG: Record<
  MethaneSeep['communityType'],
  { label: string; color: string; bgClass: string }
> = {
  bacterial_mat: { label: 'Bacterial Mat', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  tube_worm: { label: 'Tube Worm', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  clam_bed: { label: 'Clam Bed', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  ice_worm: { label: 'Ice Worm', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  mixed: { label: 'Mixed', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

const SEEP_TYPE_CONFIG: Record<
  MethaneSeep['seepType'],
  { label: string }
> = {
  cold_seep: { label: 'Cold Seep' },
  mud_volcano: { label: 'Mud Volcano' },
  pockmark: { label: 'Pockmark' },
  gas_hydrate: { label: 'Gas Hydrate' },
  authigenic_carbonate: { label: 'Authigenic Carbonate' },
}

export function MethaneSeepMapper() {
  const state = useMapStore((s) => s.methaneSeep)
  const setState = useMapStore((s) => s.setMethaneSeep)

  const seeps = useMemo(
    () => (state.seeps && state.seeps.length > 0 ? state.seeps : DEMO_SEEPS),
    [state.seeps]
  )

  const filteredSeeps = useMemo(() => {
    return seeps.filter((s) => {
      if (state.typeFilter !== 'all' && s.seepType !== state.typeFilter) return false
      return true
    })
  }, [seeps, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredSeeps.length === 0) {
      return { avgFluxRate: 0, avgMicrobialActivity: 0, avgOceanAcidificationImpact: 0 }
    }
    const avgFluxRate = filteredSeeps.reduce((sum, s) => sum + s.fluxRate, 0) / filteredSeeps.length
    const avgMicrobialActivity = filteredSeeps.reduce((sum, s) => sum + s.microbialActivity, 0) / filteredSeeps.length
    const avgOceanAcidificationImpact = filteredSeeps.reduce((sum, s) => sum + s.oceanAcidificationImpact, 0) / filteredSeeps.length
    return {
      avgFluxRate: Math.round(avgFluxRate * 10) / 10,
      avgMicrobialActivity: Math.round(avgMicrobialActivity * 100) / 100,
      avgOceanAcidificationImpact: Math.round(avgOceanAcidificationImpact * 100) / 100,
    }
  }, [filteredSeeps])

  const activeSeep = useMemo(
    () => seeps.find((s) => s.id === state.activeSeepId) ?? null,
    [seeps, state.activeSeepId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MethaneSeepState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFluxRate', label: 'Flux Rate', icon: Gauge },
    { key: 'showMicrobialActivity', label: 'Microbial Activity', icon: Activity },
    { key: 'showOceanAcidificationImpact', label: 'Ocean Acidification', icon: Waves },
    { key: 'showSeepType', label: 'Seep Type', icon: MapPin },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-teal-700" />
              Methane Seep Mapper
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
              Seep Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({
                  typeFilter: v as MethaneSeepState['typeFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cold_seep">Cold Seep</SelectItem>
                <SelectItem value="mud_volcano">Mud Volcano</SelectItem>
                <SelectItem value="pockmark">Pockmark</SelectItem>
                <SelectItem value="gas_hydrate">Gas Hydrate</SelectItem>
                <SelectItem value="authigenic_carbonate">Authigenic Carbonate</SelectItem>
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
                  <Icon className="h-3 w-3 text-teal-700" />
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
              <div className="text-[10px] text-muted-foreground">Avg Flux Rate</div>
              <div className="text-sm font-semibold">{summary.avgFluxRate}</div>
              <div className="text-[9px] text-muted-foreground">mmol/m²/day</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Microbial</div>
              <div className="text-sm font-semibold text-teal-700">{summary.avgMicrobialActivity}</div>
              <div className="text-[9px] text-muted-foreground">activity index</div>
            </div>
            <div className="rounded-lg border border-border/40 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">Avg Acid. Impact</div>
              <div className="text-sm font-semibold text-amber-700">{summary.avgOceanAcidificationImpact}</div>
              <div className="text-[9px] text-muted-foreground">index</div>
            </div>
          </div>

          <Separator />

          {/* Seep List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Methane Seeps ({filteredSeeps.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredSeeps.map((seep) => {
                  const isActive = state.activeSeepId === seep.id
                  const communityCfg = COMMUNITY_CONFIG[seep.communityType]
                  return (
                    <div
                      key={seep.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-600/50 bg-teal-500/5'
                          : 'border-border/40 hover:border-teal-500/20 hover:bg-teal-500/5'
                      }`}
                      onClick={() =>
                        setState({
                          activeSeepId: isActive ? null : seep.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: communityCfg.color }}
                          />
                          <span className="text-xs font-medium">{seep.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${communityCfg.bgClass}`}
                        >
                          {communityCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        {state.showFluxRate && (
                          <div>
                            Flux:{' '}
                            <span className="text-foreground font-medium">
                              {seep.fluxRate} mmol/m²/day
                            </span>
                          </div>
                        )}
                        {state.showMicrobialActivity && (
                          <div>
                            Microbial:{' '}
                            <span className="text-foreground font-medium">
                              {(seep.microbialActivity * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {state.showOceanAcidificationImpact && (
                          <div>
                            Acid. Impact:{' '}
                            <span className="text-foreground font-medium">
                              {(seep.oceanAcidificationImpact * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {state.showSeepType && (
                          <div>
                            Type:{' '}
                            <span className="text-foreground font-medium">
                              {SEEP_TYPE_CONFIG[seep.seepType].label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredSeeps.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-4">
                    No seeps match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Seep Details */}
          {activeSeep && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg border border-teal-600/20 bg-teal-500/5 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-700" />
                  <span className="text-xs font-semibold">{activeSeep.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${COMMUNITY_CONFIG[activeSeep.communityType].bgClass}`}
                  >
                    {COMMUNITY_CONFIG[activeSeep.communityType].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Coordinates: </span>
                    <span className="font-medium">
                      {activeSeep.lat.toFixed(2)}, {activeSeep.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Depth: </span>
                    <span className="font-medium">{activeSeep.depth} m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flux Rate: </span>
                    <span className="font-medium">{activeSeep.fluxRate} mmol/m²/day</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bubble Size: </span>
                    <span className="font-medium capitalize">{activeSeep.bubbleSize}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Microbial: </span>
                    <span className="font-medium">{(activeSeep.microbialActivity * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Acid. Impact: </span>
                    <span className="font-medium">{(activeSeep.oceanAcidificationImpact * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seep Type: </span>
                    <span className="font-medium">{SEEP_TYPE_CONFIG[activeSeep.seepType].label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Community: </span>
                    <span className="font-medium">{COMMUNITY_CONFIG[activeSeep.communityType].label}</span>
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
