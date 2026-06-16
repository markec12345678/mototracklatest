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
import { useMapStore, type LivestockMovementState, type LivestockMovementData } from '@/lib/map-store'
import { Footprints as FootprintsIcon3, X, Activity, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: LivestockMovementData[] = [
  {
    id: 'lm-texas',
    name: 'Texas Ranch',
    lat: 31.500,
    lng: -100.500,
    herdCount: 2500,
    avgSpeed: 2.8,
    grazingArea: 480,
    healthIndex: 82,
    status: 'healthy',
    description: 'Large cattle herd in excellent condition across South Texas rangeland',
  },
  {
    id: 'lm-outback',
    name: 'Australian Outback',
    lat: -23.700,
    lng: 133.880,
    herdCount: 1800,
    avgSpeed: 4.2,
    grazingArea: 1200,
    healthIndex: 58,
    status: 'alert',
    description: 'Cattle dispersed over vast distance due to drought conditions',
  },
  {
    id: 'lm-sahel',
    name: 'Sahel Pastoral',
    lat: 14.000,
    lng: 1.000,
    herdCount: 4500,
    avgSpeed: 5.5,
    grazingArea: 890,
    healthIndex: 38,
    status: 'critical',
    description: 'Pastoral herds in crisis as grazing land degrades rapidly',
  },
  {
    id: 'lm-mongolia',
    name: 'Mongolia Steppe',
    lat: 47.000,
    lng: 105.000,
    herdCount: 3200,
    avgSpeed: 3.5,
    grazingArea: 650,
    healthIndex: 71,
    status: 'normal',
    description: 'Nomadic herds following traditional seasonal migration routes',
  },
]

const STATUS_COLORS: Record<LivestockMovementData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  alert: { label: 'Alert', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  normal: { label: 'Normal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  healthy: { label: 'Healthy', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: LivestockMovementData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function LivestockMovementMonitor() {
  const state = useMapStore((s) => s.livestockMovement)
  const setState = useMapStore((s) => s.setLivestockMovement)

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
      return { totalZones: 0, totalHerd: 0, avgSpeed: 0, avgHealth: 0 }
    }
    const totalHerd = filteredItems.reduce((sum, e) => sum + e.herdCount, 0)
    const avgSpeed = filteredItems.reduce((sum, e) => sum + e.avgSpeed, 0) / filteredItems.length
    const avgHealth = filteredItems.reduce((sum, e) => sum + e.healthIndex, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      totalHerd,
      avgSpeed: avgSpeed.toFixed(1),
      avgHealth: Math.round(avgHealth),
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
      properties: { id: e.id, name: e.name, status: e.status, herdCount: e.herdCount },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setLivestockMovement({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LivestockMovementState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showHerdCount', label: 'Herd Count', icon: Activity },
    { key: 'showAvgSpeed', label: 'Avg Speed', icon: TrendingUp },
    { key: 'showGrazingArea', label: 'Grazing Area', icon: FootprintsIcon3 },
    { key: 'showHealthIndex', label: 'Health Index', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <FootprintsIcon3 className="h-4 w-4 text-orange-400" />
              Livestock Movement Monitor
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
                setState({ statusFilter: v as LivestockMovementState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Herd</div>
              <div className="text-sm font-semibold text-orange-400">{summary.totalHerd.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400/60">animals</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgSpeed} km/h</div>
              <div className="text-[9px] text-slate-400/60">movement</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Health</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgHealth}/100</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Herd Zones ({filteredItems.length})
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
                        {state.showHerdCount && (
                          <div>
                            Herd: <span className="text-slate-100 font-medium">{e.herdCount.toLocaleString()}</span>
                          </div>
                        )}
                        {state.showAvgSpeed && (
                          <div>
                            Speed: <span className="text-slate-100 font-medium">{e.avgSpeed} km/h</span>
                          </div>
                        )}
                        {state.showGrazingArea && (
                          <div>
                            Grazing: <span className="text-slate-100 font-medium">{e.grazingArea} km2</span>
                          </div>
                        )}
                        {state.showHealthIndex && (
                          <div>
                            Health: <span className="text-slate-100 font-medium">{e.healthIndex}/100</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
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
                    <span className="text-slate-400/70">Herd: </span>
                    <span className="font-medium text-orange-400">{activeItem.herdCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Speed: </span>
                    <span className="font-medium text-red-400">{activeItem.avgSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Health: </span>
                    <span className="font-medium text-slate-200">{activeItem.healthIndex}/100</span>
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
