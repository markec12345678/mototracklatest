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
import { useMapStore, type PodzolProfileState, type PodzolProfileData } from '@/lib/map-store'
import { Layers as LayersIcon8, X, ArrowDown, Leaf, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PodzolProfileData[] = [
  {
    id: 'pp-scandinavia',
    name: 'Scandinavian Podzol',
    lat: 64.0000,
    lng: 20.0000,
    eluviationDepth: 25,
    illuviationDepth: 55,
    organicLayer: 12,
    status: 'active',
    description: 'Active podzolization under conifer',
  },
  {
    id: 'pp-siberia',
    name: 'Siberian Taiga Podzol',
    lat: 58.0000,
    lng: 90.0000,
    eluviationDepth: 18,
    illuviationDepth: 40,
    organicLayer: 8,
    status: 'developing',
    description: 'Developing podzol in boreal forest',
  },
  {
    id: 'pp-florida',
    name: 'Florida Spodosol',
    lat: 28.0000,
    lng: -81.5000,
    eluviationDepth: 10,
    illuviationDepth: 22,
    organicLayer: 3,
    status: 'degraded',
    description: 'Degraded spodosol from drainage',
  },
  {
    id: 'pp-australia',
    name: 'SE Australia Podzol',
    lat: -37.0000,
    lng: 146.0000,
    eluviationDepth: 5,
    illuviationDepth: 12,
    organicLayer: 2,
    status: 'buried',
    description: 'Buried paleo-podzol profile',
  },
]

const STATUS_COLORS: Record<PodzolProfileData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  developing: { label: 'Developing', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  degraded: { label: 'Degraded', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  buried: { label: 'Buried', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: PodzolProfileData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PodzolProfileMonitor() {
  const state = useMapStore((s) => s.podzolProfile)
  const setState = useMapStore((s) => s.setPodzolProfile)

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
      return { totalPaths: 0, avgEluviationDepth: 0, avgIlluviationDepth: 0, degradedBuriedCount: 0 }
    }
    const avgEluviationDepth = filteredItems.reduce((sum, e) => sum + e.eluviationDepth, 0) / filteredItems.length
    const avgIlluviationDepth = filteredItems.reduce((sum, e) => sum + e.illuviationDepth, 0) / filteredItems.length
    const degradedBuriedCount = filteredItems.filter((e) => e.status === 'degraded' || e.status === 'buried').length
    return {
      totalPaths: filteredItems.length,
      avgEluviationDepth: Math.round(avgEluviationDepth * 10) / 10,
      avgIlluviationDepth: Math.round(avgIlluviationDepth * 10) / 10,
      degradedBuriedCount,
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
      properties: { id: e.id, name: e.name, status: e.status, eluviationDepth: e.eluviationDepth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPodzolProfile({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PodzolProfileState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showEluviationDepth', label: 'Eluviation Depth', icon: ArrowDown },
    { key: 'showIlluviationDepth', label: 'Illuviation Depth', icon: LayersIcon8 },
    { key: 'showOrganicLayer', label: 'Organic Layer', icon: Leaf },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-sky-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <LayersIcon8 className="h-4 w-4 text-cyan-400" />
              Podzol Profile Monitor
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
                setState({ statusFilter: v as PodzolProfileState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="developing">Developing</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
                <SelectItem value="buried">Buried</SelectItem>
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
              <div className="text-[10px] text-cyan-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Eluviation</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgEluviationDepth}</div>
              <div className="text-[9px] text-cyan-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Illuviation</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgIlluviationDepth}</div>
              <div className="text-[9px] text-cyan-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Degraded+Buried</div>
              <div className="text-sm font-semibold text-red-400">{summary.degradedBuriedCount}</div>
              <div className="text-[9px] text-cyan-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Sites ({filteredItems.length})
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
                        {state.showEluviationDepth && (
                          <div>
                            Eluviation:{' '}
                            <span className="text-cyan-100 font-medium">{e.eluviationDepth} cm</span>
                          </div>
                        )}
                        {state.showIlluviationDepth && (
                          <div>
                            Illuviation:{' '}
                            <span className="text-cyan-100 font-medium">{e.illuviationDepth} cm</span>
                          </div>
                        )}
                        {state.showOrganicLayer && (
                          <div>
                            Organic Layer:{' '}
                            <span className="text-cyan-100 font-medium">{e.organicLayer} cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-cyan-400/70">Eluviation: </span>
                    <span className="font-medium text-sky-400">{activeItem.eluviationDepth} cm</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Illuviation: </span>
                    <span className="font-medium text-cyan-400">{activeItem.illuviationDepth} cm</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Organic Layer: </span>
                    <span className="font-medium text-red-400">{activeItem.organicLayer} cm</span>
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
