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
import { useMapStore, type DeepWaterCoralState, type DeepWaterCoralData } from '@/lib/map-store'
import { Fish as FishIcon4, X, Layers, Activity, MapPin, Filter, Heart } from 'lucide-react'

const SAMPLE_LOCATIONS: DeepWaterCoralData[] = [
  {
    id: 'dw-florida',
    name: 'Florida Deep Reef',
    lat: 25.0,
    lng: -79.5,
    depth: 600,
    healthIndex: 0.82,
    speciesCount: 45,
    status: 'good',
    area: 120,
    description: 'Oculina coral mound province',
  },
  {
    id: 'dw-norwegian',
    name: 'Norwegian Lophelia',
    lat: 64.0,
    lng: 8.0,
    depth: 400,
    healthIndex: 0.75,
    speciesCount: 60,
    status: 'stressed',
    area: 200,
    description: 'Largest cold-water coral reef system',
  },
  {
    id: 'dw-australian',
    name: 'Australian Canyon',
    lat: -18.0,
    lng: 115.0,
    depth: 900,
    healthIndex: 0.92,
    speciesCount: 35,
    status: 'pristine',
    area: 80,
    description: 'Pristine deep canyon coral community',
  },
  {
    id: 'dw-azores',
    name: 'Azores Seamount',
    lat: 37.0,
    lng: -30.0,
    depth: 750,
    healthIndex: 0.55,
    speciesCount: 28,
    status: 'degraded',
    area: 50,
    description: 'Fishing-impacted seamount corals',
  },
]

const STATUS_COLORS: Record<DeepWaterCoralData['status'], { label: string; color: string; bgClass: string }> = {
  pristine: { label: 'Pristine', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stressed: { label: 'Stressed', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  degraded: { label: 'Degraded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: DeepWaterCoralData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DeepWaterCoralMonitor() {
  const state = useMapStore((s) => s.deepWaterCoral)
  const setState = useMapStore((s) => s.setDeepWaterCoral)

  const reefs = useMemo(
    () => (state.reefs.length > 0 ? state.reefs : SAMPLE_LOCATIONS),
    [state.reefs]
  )

  const filteredReefs = useMemo(() => {
    return reefs.filter((r) => {
      if (state.healthFilter !== 'all' && r.status !== state.healthFilter) return false
      return true
    })
  }, [reefs, state.healthFilter])

  const summary = useMemo(() => {
    if (filteredReefs.length === 0) {
      return { totalReefs: 0, avgDepth: 0, avgHealthIndex: 0, totalSpecies: 0 }
    }
    const avgDepth = filteredReefs.reduce((sum, r) => sum + r.depth, 0) / filteredReefs.length
    const avgHealthIndex = filteredReefs.reduce((sum, r) => sum + r.healthIndex, 0) / filteredReefs.length
    const totalSpecies = filteredReefs.reduce((sum, r) => sum + r.speciesCount, 0)
    return {
      totalReefs: filteredReefs.length,
      avgDepth: Math.round(avgDepth),
      avgHealthIndex: Math.round(avgHealthIndex * 100) / 100,
      totalSpecies,
    }
  }, [filteredReefs])

  const activeReef = useMemo(
    () => reefs.find((r) => r.id === state.activeReefId) ?? null,
    [reefs, state.activeReefId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredReefs.map((r) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      properties: { id: r.id, name: r.name, status: r.status, depth: r.depth },
    })),
  }), [filteredReefs])

  useEffect(() => {
    if (state.reefs.length === 0) {
      useMapStore.getState().setDeepWaterCoral({ reefs: SAMPLE_LOCATIONS })
    }
  }, [state.reefs.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DeepWaterCoralState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDepth', label: 'Depth', icon: Layers },
    { key: 'showHealth', label: 'Health Index', icon: Heart },
    { key: 'showSpecies', label: 'Species Count', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-slate-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <FishIcon4 className="h-4 w-4 text-cyan-400" />
              Deep Water Coral Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Health Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Health Status
            </Label>
            <Select
              value={state.healthFilter}
              onValueChange={(v) =>
                setState({ healthFilter: v as DeepWaterCoralState['healthFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="stressed">Stressed</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Reefs</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalReefs}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgDepth}</div>
              <div className="text-[9px] text-cyan-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Health Index</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgHealthIndex}</div>
              <div className="text-[9px] text-cyan-400/60">index</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Species</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalSpecies}</div>
              <div className="text-[9px] text-cyan-400/60">species</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Reef List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Coral Reefs ({filteredReefs.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredReefs.map((reef) => {
                  const isActive = state.activeReefId === reef.id
                  const statusCfg = STATUS_COLORS[reef.status]
                  return (
                    <div
                      key={reef.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeReefId: isActive ? null : reef.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={reef.status} />
                          <span className="text-xs font-medium text-cyan-100">{reef.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-cyan-100 font-medium">{reef.depth}m</span>
                          </div>
                        )}
                        {state.showHealth && (
                          <div>
                            Health:{' '}
                            <span className="text-cyan-100 font-medium">{reef.healthIndex}</span>
                          </div>
                        )}
                        {state.showSpecies && (
                          <div>
                            Species:{' '}
                            <span className="text-cyan-100 font-medium">{reef.speciesCount}</span>
                          </div>
                        )}
                        {state.showArea && (
                          <div>
                            Area:{' '}
                            <span className="text-cyan-100 font-medium">{reef.area}km²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredReefs.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No reefs match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Reef Details */}
          {activeReef && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeReef.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeReef.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeReef.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeReef.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeReef.lat.toFixed(1)}, {activeReef.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Depth: </span>
                    <span className="font-medium text-cyan-100">{activeReef.depth}m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Health Index: </span>
                    <span className="font-medium text-blue-400">{activeReef.healthIndex}</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Species: </span>
                    <span className="font-medium text-cyan-100">{activeReef.speciesCount}</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Area: </span>
                    <span className="font-medium text-cyan-100">{activeReef.area}km²</span>
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
