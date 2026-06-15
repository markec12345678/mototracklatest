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
import { useMapStore, type SubmarineFanState, type SubmarineFanData } from '@/lib/map-store'
import { Mountain as MountainIcon13, X, Layers, ArrowDown, Ruler, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SubmarineFanData[] = [
  {
    id: 'sf-bengal',
    name: 'Bengal Fan',
    lat: 15.0,
    lng: 85.0,
    sedimentationRate: 45,
    channelDepth: 120,
    fanArea: 3000000,
    status: 'active',
    description: "World's largest submarine fan",
  },
  {
    id: 'sf-amazon',
    name: 'Amazon Fan',
    lat: 5.0,
    lng: -47.0,
    sedimentationRate: 12,
    channelDepth: 80,
    fanArea: 700000,
    status: 'abandoned',
    description: 'Pleistocene fan system',
  },
  {
    id: 'sf-indus',
    name: 'Indus Fan',
    lat: 22.0,
    lng: 65.0,
    sedimentationRate: 28,
    channelDepth: 95,
    fanArea: 1100000,
    status: 'channelized',
    description: 'Active channel-levee system',
  },
  {
    id: 'sf-mississippi',
    name: 'Mississippi Fan',
    lat: 27.0,
    lng: -89.0,
    sedimentationRate: 5,
    channelDepth: 50,
    fanArea: 500000,
    status: 'hemipelagic',
    description: 'Draped by hemipelagic sediment',
  },
]

const STATUS_COLORS: Record<SubmarineFanData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  abandoned: { label: 'Abandoned', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  channelized: { label: 'Channelized', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  hemipelagic: { label: 'Hemipelagic', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
}

function TrendIcon({ status }: { status: SubmarineFanData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubmarineFanMonitor() {
  const state = useMapStore((s) => s.submarineFan)
  const setState = useMapStore((s) => s.setSubmarineFan)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFans: 0, avgSedRate: 0, avgChannelDepth: 0, activeChannelizedCount: 0 }
    }
    const avgSedRate = filteredItems.reduce((sum, e) => sum + e.sedimentationRate, 0) / filteredItems.length
    const avgChannelDepth = filteredItems.reduce((sum, e) => sum + e.channelDepth, 0) / filteredItems.length
    const activeChannelizedCount = filteredItems.filter((e) => e.status === 'active' || e.status === 'channelized').length
    return {
      totalFans: filteredItems.length,
      avgSedRate,
      avgChannelDepth,
      activeChannelizedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, sedimentationRate: e.sedimentationRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSubmarineFan({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubmarineFanState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSedimentationRate', label: 'Sedimentation Rate', icon: Layers },
    { key: 'showChannelDepth', label: 'Channel Depth', icon: ArrowDown },
    { key: 'showFanArea', label: 'Fan Area', icon: Ruler },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-neutral-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <MountainIcon13 className="h-4 w-4 text-slate-400" />
              Submarine Fan
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
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SubmarineFanState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
                <SelectItem value="channelized">Channelized</SelectItem>
                <SelectItem value="hemipelagic">Hemipelagic</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-slate-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Fans</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalFans}</div>
              <div className="text-[9px] text-slate-400/60">mapped</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Sed Rate</div>
              <div className="text-sm font-semibold text-neutral-300">{summary.avgSedRate.toFixed(1)}</div>
              <div className="text-[9px] text-slate-400/60">cm/kyr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Channel Depth</div>
              <div className="text-sm font-semibold text-zinc-300">{summary.avgChannelDepth.toFixed(0)}</div>
              <div className="text-[9px] text-slate-400/60">m</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Active+Channelized</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeChannelizedCount}</div>
              <div className="text-[9px] text-slate-400/60">fans</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Fans ({filteredItems.length})
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
                        {state.showSedimentationRate && (
                          <div>
                            Sed Rate:{' '}
                            <span className="text-slate-100 font-medium">{e.sedimentationRate} cm/kyr</span>
                          </div>
                        )}
                        {state.showChannelDepth && (
                          <div>
                            Channel:{' '}
                            <span className="text-slate-100 font-medium">{e.channelDepth} m</span>
                          </div>
                        )}
                        {state.showFanArea && (
                          <div>
                            Fan Area:{' '}
                            <span className="text-slate-100 font-medium">{e.fanArea.toLocaleString()} km²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No fans match the current filter.
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
                    <span className="text-slate-400/70">Sed Rate: </span>
                    <span className="font-medium text-neutral-300">{activeItem.sedimentationRate} cm/kyr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Channel Depth: </span>
                    <span className="font-medium text-zinc-300">{activeItem.channelDepth} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Fan Area: </span>
                    <span className="font-medium text-slate-400">{activeItem.fanArea.toLocaleString()} km²</span>
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
