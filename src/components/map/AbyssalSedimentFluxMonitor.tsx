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
import { useMapStore, type AbyssalSedimentFluxState, type AbyssalSedimentFluxData } from '@/lib/map-store'
import { Layers as LayersIcon5, X, Ruler, ArrowDown, ArrowRight, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AbyssalSedimentFluxData[] = [
  {
    id: 'af-pacific-clay',
    name: 'Pacific Red Clay Zone',
    lat: 0.0,
    lng: -170.0,
    sedimentRate: 0.001,
    depth: 5500,
    fluxDirection: 'Downward',
    status: 'depositing',
    description: 'Ultra-slow pelagic clay deposition',
  },
  {
    id: 'af-benguela',
    name: 'Benguela Upwelling Zone',
    lat: -22.0,
    lng: 12.0,
    sedimentRate: 0.15,
    depth: 3000,
    fluxDirection: 'Upward',
    status: 'eroding',
    description: 'High productivity upwelling with bottom current erosion',
  },
  {
    id: 'af-bengal-fan',
    name: 'Bengal Fan Abyssal',
    lat: 10.0,
    lng: 85.0,
    sedimentRate: 0.5,
    depth: 4000,
    fluxDirection: 'Downward',
    status: 'depositing',
    description: 'Massive turbidite deposit from Ganges-Brahmaputra',
  },
  {
    id: 'af-mid-atlantic',
    name: 'Mid-Atlantic Ridge Abyssal',
    lat: 25.0,
    lng: -45.0,
    sedimentRate: 0.02,
    depth: 4500,
    fluxDirection: 'Lateral',
    status: 'stable',
    description: 'Hydrothermal-influenced sediment accumulation',
  },
]

const STATUS_COLORS: Record<AbyssalSedimentFluxData['status'], { label: string; color: string; bgClass: string }> = {
  depositing: { label: 'Depositing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  eroding: { label: 'Eroding', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  turbidite: { label: 'Turbidite', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || { color: '#64748b' }
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AbyssalSedimentFluxMonitor() {
  const state = useMapStore((s) => s.abyssalSedimentFlux)
  const setState = useMapStore((s) => s.setAbyssalSedimentFlux)

  const sites = useMemo(
    () => ((state.sites as any[])?.length > 0 ? (state.sites as any[]) : SAMPLE_LOCATIONS),
    [state.sites]
  )

  const filteredItems = useMemo(() => {
    return sites.filter((s: any) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [sites, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, avgSedimentRate: 0, avgDepth: 0, depositingCount: 0 }
    }
    const avgSedimentRate = filteredItems.reduce((sum, s) => sum + s.sedimentRate, 0) / filteredItems.length
    const avgDepth = filteredItems.reduce((sum, s) => sum + s.depth, 0) / filteredItems.length
    const depositingCount = filteredItems.filter((s) => s.status === 'depositing').length
    return {
      totalSites: filteredItems.length,
      avgSedimentRate: Math.round(avgSedimentRate * 1000) / 1000,
      avgDepth: Math.round(avgDepth),
      depositingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => sites.find((s) => s.id === state.activeSiteId) ?? null,
    [sites, state.activeSiteId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, depth: s.depth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.sites.length === 0) {
      useMapStore.getState().setAbyssalSedimentFlux({ sites: SAMPLE_LOCATIONS })
    }
  }, [state.sites.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSedimentRate', label: 'Sediment Rate', icon: ArrowDown },
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showFluxDirection', label: 'Flux Direction', icon: ArrowRight },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-neutral-950/95 backdrop-blur-xl border border-stone-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-stone-100">
              <LayersIcon5 className="h-4 w-4 text-stone-400" />
              Abyssal Sediment Flux Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-300 hover:text-stone-100 hover:bg-stone-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-stone-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-stone-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-stone-900/40 border-stone-700/40 text-stone-100 hover:bg-stone-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="depositing">Depositing</SelectItem>
                <SelectItem value="eroding">Eroding</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="turbidite">Turbidite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-200">
                  <Icon className="h-3 w-3 text-stone-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-stone-200">{summary.totalSites}</div>
              <div className="text-[9px] text-stone-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Sediment Rate</div>
              <div className="text-sm font-semibold text-neutral-300">{summary.avgSedimentRate}</div>
              <div className="text-[9px] text-stone-400/60">cm/kyr</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgDepth}</div>
              <div className="text-[9px] text-stone-400/60">m</div>
            </div>
            <div className="rounded-lg border border-stone-700/30 bg-stone-900/30 p-2 text-center">
              <div className="text-[10px] text-stone-400/70">Depositing Count</div>
              <div className="text-sm font-semibold text-amber-400">{summary.depositingCount}</div>
              <div className="text-[9px] text-stone-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-stone-700/30" />

          {/* Site List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-stone-300/80">
              Abyssal Sites ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeSiteId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-stone-500/50 bg-stone-800/30'
                          : 'border-stone-700/30 hover:border-stone-500/30 hover:bg-stone-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSiteId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-stone-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-stone-300/60">
                        {state.showSedimentRate && (
                          <div>
                            Sed. Rate:{' '}
                            <span className="text-stone-100 font-medium">{s.sedimentRate} cm/kyr</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-stone-100 font-medium">{s.depth}m</span>
                          </div>
                        )}
                        {state.showFluxDirection && (
                          <div>
                            Flux:{' '}
                            <span className="text-stone-100 font-medium">{s.fluxDirection}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-stone-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Site Details */}
          {activeItem && (
            <>
              <Separator className="bg-stone-700/30" />
              <div className="space-y-2 rounded-lg border border-stone-600/30 bg-stone-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-stone-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-400/70">Coordinates: </span>
                    <span className="font-medium text-stone-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Depth: </span>
                    <span className="font-medium text-amber-400">{activeItem.depth}m</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Sed. Rate: </span>
                    <span className="font-medium text-neutral-300">{activeItem.sedimentRate} cm/kyr</span>
                  </div>
                  <div>
                    <span className="text-stone-400/70">Flux Direction: </span>
                    <span className="font-medium text-blue-400">{activeItem.fluxDirection}</span>
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
