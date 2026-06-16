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
import { useMapStore, type HabitatCorridorState, type HabitatCorridorData } from '@/lib/map-store'
import { TreePine as TreePineIcon9, X, Ruler, Link, X as XIcon, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HabitatCorridorData[] = [
  {
    id: 'hc-yellowstone',
    name: 'Yellowstone-to-Yukon',
    lat: 48.0000,
    lng: -112.0000,
    corridorWidth: 120,
    connectivityIndex: 0.85,
    barrierCount: 8,
    status: 'intact',
    description: 'Intact large-scale wildlife corridor',
  },
  {
    id: 'hc-amazon',
    name: 'Amazon Forest Corridor',
    lat: -5.0000,
    lng: -55.0000,
    corridorWidth: 45,
    connectivityIndex: 0.55,
    barrierCount: 22,
    status: 'degraded',
    description: 'Degraded corridor from road fragmentation',
  },
  {
    id: 'hc-india',
    name: 'Western Ghats Link',
    lat: 12.0000,
    lng: 76.0000,
    corridorWidth: 8,
    connectivityIndex: 0.28,
    barrierCount: 45,
    status: 'fragmented',
    description: 'Highly fragmented hill corridor',
  },
  {
    id: 'hc-sumatra',
    name: 'Sumatra Forest Link',
    lat: -1.0000,
    lng: 102.0000,
    corridorWidth: 1,
    connectivityIndex: 0.05,
    barrierCount: 85,
    status: 'severed',
    description: 'Severed by palm oil plantations',
  },
]

const STATUS_COLORS: Record<HabitatCorridorData['status'], { label: string; color: string; bgClass: string }> = {
  intact: { label: 'Intact', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  degraded: { label: 'Degraded', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  fragmented: { label: 'Fragmented', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severed: { label: 'Severed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: HabitatCorridorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HabitatCorridorMonitor() {
  const state = useMapStore((s) => s.habitatCorridor)
  const setState = useMapStore((s) => s.setHabitatCorridor)

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
      return { totalPaths: 0, avgCorridorWidth: 0, avgConnectivityIndex: 0, avgBarrierCount: 0 }
    }
    const avgCorridorWidth = filteredItems.reduce((sum, e) => sum + e.corridorWidth, 0) / filteredItems.length
    const avgConnectivityIndex = filteredItems.reduce((sum, e) => sum + e.connectivityIndex, 0) / filteredItems.length
    const avgBarrierCount = filteredItems.reduce((sum, e) => sum + e.barrierCount, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgCorridorWidth: Math.round(avgCorridorWidth * 100) / 100,
      avgConnectivityIndex: Math.round(avgConnectivityIndex * 100) / 100,
      avgBarrierCount: Math.round(avgBarrierCount * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, corridorWidth: e.corridorWidth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setHabitatCorridor({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HabitatCorridorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCorridorWidth', label: 'Ruler', icon: Ruler },
    { key: 'showConnectivityIndex', label: 'Link', icon: Link },
    { key: 'showBarrierCount', label: 'X', icon: XIcon },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <TreePineIcon9 className="h-4 w-4 text-emerald-400" />
              Habitat Corridor Monitor
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
                setState({ statusFilter: v as HabitatCorridorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="fragmented">Fragmented</SelectItem>
                <SelectItem value="severed">Severed</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Corridors</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Width</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgCorridorWidth}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Connectivity</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgConnectivityIndex}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Barriers</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgBarrierCount}</div>
              <div className="text-[9px] text-slate-400/60">count</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Corridors ({filteredItems.length})
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
                        {state.showCorridorWidth && (
                          <div>
                            Width:{' '}
                            <span className="text-slate-100 font-medium">{e.corridorWidth} km</span>
                          </div>
                        )}
                        {state.showConnectivityIndex && (
                          <div>
                            Connectivity:{' '}
                            <span className="text-slate-100 font-medium">{e.connectivityIndex}</span>
                          </div>
                        )}
                        {state.showBarrierCount && (
                          <div>
                            Barriers:{' '}
                            <span className="text-slate-100 font-medium">{e.barrierCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No corridors match the current filter.
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
                    <span className="font-medium text-emerald-400">{activeItem.corridorWidth} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Connectivity: </span>
                    <span className="font-medium text-green-400">{activeItem.connectivityIndex}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Barriers: </span>
                    <span className="font-medium text-slate-400">{activeItem.barrierCount}</span>
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
