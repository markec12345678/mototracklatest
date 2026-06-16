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
import { useMapStore, type BiomeTransitionState, type BiomeTransitionData } from '@/lib/map-store'
import { Layers as LayersIcon9, X, Ruler, TrendingUp, ArrowRight, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: BiomeTransitionData[] = [
  {
    id: 'bt-sahel',
    name: 'Sahel Ecotone',
    lat: 14.0000,
    lng: 0.0000,
    transitionWidth: 500,
    speciesTurnover: 45,
    shiftRate: 25,
    status: 'shifting',
    description: 'Sahara-Savanna transition shifting south',
  },
  {
    id: 'bt-treeline',
    name: 'Alpine Treeline',
    lat: 46.0000,
    lng: 10.0000,
    transitionWidth: 200,
    speciesTurnover: 60,
    shiftRate: 15,
    status: 'expanding',
    description: 'Treeline expanding upslope with warming',
  },
  {
    id: 'bt-tundra',
    name: 'Boreal-Tundra Edge',
    lat: 65.0000,
    lng: -140.0000,
    transitionWidth: 300,
    speciesTurnover: 35,
    shiftRate: 8,
    status: 'stable',
    description: 'Relatively stable biome boundary',
  },
  {
    id: 'bt-savanna',
    name: 'Forest-Savanna Mosaic',
    lat: -8.0000,
    lng: 28.0000,
    transitionWidth: 150,
    speciesTurnover: 55,
    shiftRate: 35,
    status: 'contracting',
    description: 'Forest contracting from savanna edge',
  },
]

const STATUS_COLORS: Record<BiomeTransitionData['status'], { label: string; color: string; bgClass: string }> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  shifting: { label: 'Shifting', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  expanding: { label: 'Expanding', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  contracting: { label: 'Contracting', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: BiomeTransitionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function BiomeTransitionMonitor() {
  const state = useMapStore((s) => s.biomeTransition)
  const setState = useMapStore((s) => s.setBiomeTransition)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalPaths: 0, avgTransitionWidth: 0, avgSpeciesTurnover: 0, avgShiftRate: 0 }
    }
    const avgTransitionWidth = filteredItems.reduce((sum, e) => sum + e.transitionWidth, 0) / filteredItems.length
    const avgSpeciesTurnover = filteredItems.reduce((sum, e) => sum + e.speciesTurnover, 0) / filteredItems.length
    const avgShiftRate = filteredItems.reduce((sum, e) => sum + e.shiftRate, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgTransitionWidth: Math.round(avgTransitionWidth * 100) / 100,
      avgSpeciesTurnover: Math.round(avgSpeciesTurnover * 100) / 100,
      avgShiftRate: Math.round(avgShiftRate * 100) / 100,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, transitionWidth: e.transitionWidth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setBiomeTransition({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BiomeTransitionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTransitionWidth', label: 'Ruler', icon: Ruler },
    { key: 'showSpeciesTurnover', label: 'TrendingUp', icon: TrendingUp },
    { key: 'showShiftRate', label: 'ArrowRight', icon: ArrowRight },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-yellow-950/95 to-amber-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <LayersIcon9 className="h-4 w-4 text-yellow-400" />
              Biome Transition Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as BiomeTransitionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="shifting">Shifting</SelectItem>
                <SelectItem value="expanding">Expanding</SelectItem>
                <SelectItem value="contracting">Contracting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-yellow-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Transitions</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Width</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgTransitionWidth}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Turnover</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgSpeciesTurnover}%</div>
              <div className="text-[9px] text-slate-400/60">species</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Shift Rate</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgShiftRate}</div>
              <div className="text-[9px] text-slate-400/60">km/decade</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Transitions ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showTransitionWidth && (
                          <div>
                            Width:{' '}
                            <span className="text-slate-100 font-medium">{e.transitionWidth} km</span>
                          </div>
                        )}
                        {state.showSpeciesTurnover && (
                          <div>
                            Turnover:{' '}
                            <span className="text-slate-100 font-medium">{e.speciesTurnover}%</span>
                          </div>
                        )}
                        {state.showShiftRate && (
                          <div>
                            Shift Rate:{' '}
                            <span className="text-slate-100 font-medium">{e.shiftRate} km/dec</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No transitions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Width: </span>
                    <span className="font-medium text-yellow-400">{activeItem.transitionWidth} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Turnover: </span>
                    <span className="font-medium text-amber-400">{activeItem.speciesTurnover}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Shift Rate: </span>
                    <span className="font-medium text-slate-400">{activeItem.shiftRate} km/dec</span>
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
