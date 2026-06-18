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
import { useMapStore, type PermafrostActiveLayerState, type PermafrostActiveLayerData } from '@/lib/map-store'
import { Thermometer as ThermometerIcon22, X, Layers, TrendingUp, ArrowDown, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PermafrostActiveLayerData[] = [
  {
    id: 'pal-barrow',
    name: 'Barrow AK',
    lat: 71,
    lng: -157,
    activeLayerDepth: 55,
    groundTemperature: -8,
    thawRate: 2.5,
    status: 'stable',
    description: 'North Slope Alaska permafrost monitoring site',
  },
  {
    id: 'pal-yakutsk',
    name: 'Yakutsk',
    lat: 62,
    lng: 130,
    activeLayerDepth: 180,
    groundTemperature: -5,
    thawRate: 5,
    status: 'deepening',
    description: 'Siberian permafrost with deepening active layer',
  },
  {
    id: 'pal-abisko',
    name: 'Abisko',
    lat: 68,
    lng: 19,
    activeLayerDepth: 120,
    groundTemperature: -1,
    thawRate: 8,
    status: 'deepening',
    description: 'Swedish subarctic site with rapid thaw progression',
  },
  {
    id: 'pal-svalbard',
    name: 'Svalbard',
    lat: 78,
    lng: 16,
    activeLayerDepth: 250,
    groundTemperature: 2,
    thawRate: 15,
    status: 'absent',
    description: 'High Arctic site with degraded permafrost',
  },
]

const STATUS_COLORS: Record<PermafrostActiveLayerData['status'], { label: string; color: string; bgClass: string }> = {
  deepening: { label: 'Deepening', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  shallow: { label: 'Shallow', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  absent: { label: 'Absent', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: PermafrostActiveLayerData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PermafrostActiveLayerMonitor() {
  const state = useMapStore((s) => s.permafrostActiveLayer)
  const setState = useMapStore((s) => s.setPermafrostActiveLayer)

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
      return { totalSites: 0, avgDepth: 0, avgTemp: 0, avgThawRate: 0 }
    }
    const avgDepth = filteredItems.reduce((sum, e) => sum + e.activeLayerDepth, 0) / filteredItems.length
    const avgTemp = filteredItems.reduce((sum, e) => sum + e.groundTemperature, 0) / filteredItems.length
    const avgThawRate = filteredItems.reduce((sum, e) => sum + e.thawRate, 0) / filteredItems.length
    return {
      totalSites: filteredItems.length,
      avgDepth: Math.round(avgDepth * 100) / 100,
      avgTemp: Math.round(avgTemp * 100) / 100,
      avgThawRate: Math.round(avgThawRate * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, activeLayerDepth: e.activeLayerDepth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPermafrostActiveLayer({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PermafrostActiveLayerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showActiveLayerDepth', label: 'Active Layer Depth', icon: Layers },
    { key: 'showGroundTemperature', label: 'Ground Temperature', icon: ThermometerIcon22 },
    { key: 'showThawRate', label: 'Thaw Rate', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ThermometerIcon22 className="h-4 w-4 text-blue-400" />
              Permafrost Active Layer Monitor
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
                setState({ statusFilter: v as PermafrostActiveLayerState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="deepening">Deepening</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="shallow">Shallow</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalSites}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgDepth}</div>
              <div className="text-[9px] text-slate-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgTemp}</div>
              <div className="text-[9px] text-slate-400/60">C</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Thaw Rate</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgThawRate}</div>
              <div className="text-[9px] text-slate-400/60">cm/year</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
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
                        {state.showActiveLayerDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-slate-100 font-medium">{e.activeLayerDepth} cm</span>
                          </div>
                        )}
                        {state.showGroundTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-slate-100 font-medium">{e.groundTemperature} C</span>
                          </div>
                        )}
                        {state.showThawRate && (
                          <div>
                            Thaw Rate:{' '}
                            <span className="text-slate-100 font-medium">{e.thawRate} cm/yr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-slate-400/70">Depth: </span>
                    <span className="font-medium text-blue-400">{activeItem.activeLayerDepth} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Temperature: </span>
                    <span className="font-medium text-cyan-400">{activeItem.groundTemperature} C</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Thaw Rate: </span>
                    <span className="font-medium text-slate-400">{activeItem.thawRate} cm/year</span>
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
