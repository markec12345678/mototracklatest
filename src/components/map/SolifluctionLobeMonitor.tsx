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
import { useMapStore, type SolifluctionLobeState, type SolifluctionLobeData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon13, X, Gauge, Ruler, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SolifluctionLobeData[] = [
  {
    id: 'sl-abisko',
    name: 'Abisko Lobe Field',
    lat: 68.3500,
    lng: 18.8167,
    lobeVelocity: 6.5,
    lobeWidth: 45,
    activeLayerDepth: 180,
    status: 'active',
    description: 'Active solifluction lobes in subarctic Sweden',
  },
  {
    id: 'sl-niigata',
    name: 'Niigata Alpine Lobe',
    lat: 36.9000,
    lng: 138.6000,
    lobeVelocity: 2.1,
    lobeWidth: 28,
    activeLayerDepth: 120,
    status: 'paused',
    description: 'Paused lobe in Japanese alpine zone',
  },
  {
    id: 'sl-iceland',
    name: 'Iceland Palsa Lobe',
    lat: 65.5000,
    lng: -18.0000,
    lobeVelocity: 4.0,
    lobeWidth: 35,
    activeLayerDepth: 150,
    status: 'seasonal',
    description: 'Seasonal solifluction activity',
  },
  {
    id: 'sl-svalbard',
    name: 'Svalbard Permafrost Lobe',
    lat: 78.2000,
    lng: 15.6000,
    lobeVelocity: 0.3,
    lobeWidth: 15,
    activeLayerDepth: 60,
    status: 'stable',
    description: 'Stable lobe in continuous permafrost',
  },
]

const STATUS_COLORS: Record<SolifluctionLobeData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  paused: { label: 'Paused', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  seasonal: { label: 'Seasonal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: SolifluctionLobeData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SolifluctionLobeMonitor() {
  const state = useMapStore((s) => s.solifluctionLobe)
  const setState = useMapStore((s) => s.setSolifluctionLobe)

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
      return { totalLobes: 0, avgLobeVelocity: 0, avgActiveLayerDepth: 0, activeCount: 0 }
    }
    const avgLobeVelocity = filteredItems.reduce((sum, e) => sum + e.lobeVelocity, 0) / filteredItems.length
    const avgActiveLayerDepth = filteredItems.reduce((sum, e) => sum + e.activeLayerDepth, 0) / filteredItems.length
    const activeCount = filteredItems.filter((e) => e.status === 'active').length
    return {
      totalLobes: filteredItems.length,
      avgLobeVelocity: Math.round(avgLobeVelocity * 10) / 10,
      avgActiveLayerDepth: Math.round(avgActiveLayerDepth * 10) / 10,
      activeCount,
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
      properties: { id: e.id, name: e.name, status: e.status, lobeVelocity: e.lobeVelocity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSolifluctionLobe({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SolifluctionLobeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showLobeVelocity', label: 'Lobe Velocity', icon: Gauge },
    { key: 'showLobeWidth', label: 'Lobe Width', icon: Ruler },
    { key: 'showActiveLayerDepth', label: 'Active Layer Depth', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-teal-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <SnowflakeIcon13 className="h-4 w-4 text-cyan-400" />
              Solifluction Lobe Monitor
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SolifluctionLobeState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
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
              <div className="text-[10px] text-cyan-400/70">Total Lobes</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalLobes}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgLobeVelocity}</div>
              <div className="text-[9px] text-cyan-400/60">cm/yr</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Active Layer</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgActiveLayerDepth}</div>
              <div className="text-[9px] text-cyan-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Active</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-cyan-400/60">lobes</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Lobes ({filteredItems.length})
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
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-cyan-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showLobeVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-cyan-100 font-medium">{e.lobeVelocity} cm/yr</span>
                          </div>
                        )}
                        {state.showLobeWidth && (
                          <div>
                            Width:{' '}
                            <span className="text-cyan-100 font-medium">{e.lobeWidth} m</span>
                          </div>
                        )}
                        {state.showActiveLayerDepth && (
                          <div>
                            Active Layer:{' '}
                            <span className="text-cyan-100 font-medium">{e.activeLayerDepth} cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No lobes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Lobe Vel: </span>
                    <span className="font-medium text-teal-400">{activeItem.lobeVelocity} cm/yr</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Lobe Width: </span>
                    <span className="font-medium text-cyan-400">{activeItem.lobeWidth} m</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Active Layer: </span>
                    <span className="font-medium text-red-400">{activeItem.activeLayerDepth} cm</span>
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
