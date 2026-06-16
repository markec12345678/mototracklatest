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
import { useMapStore, type PortCongestionMapState, type PortCongestionMapData } from '@/lib/map-store'
import { Ship as ShipIcon6, X, Anchor, Clock, BarChart3, Container } from 'lucide-react'

const SAMPLE_LOCATIONS: PortCongestionMapData[] = [
  {
    id: 'pcm-shanghai',
    name: 'Shanghai Port',
    lat: 31.230,
    lng: 121.490,
    vesselCount: 142,
    avgWaitTime: 36,
    berthUtilization: 94,
    throughputTEU: 85000,
    status: 'critical',
    description: 'Shanghai Yangshan deep water port experiencing severe vessel queue',
  },
  {
    id: 'pcm-singapore',
    name: 'Singapore PSA',
    lat: 1.264,
    lng: 103.820,
    vesselCount: 98,
    avgWaitTime: 18,
    berthUtilization: 82,
    throughputTEU: 72000,
    status: 'congested',
    description: 'PSA Singapore terminals with moderate congestion and stacking delays',
  },
  {
    id: 'pcm-rotterdam',
    name: 'Rotterdam Euromax',
    lat: 51.924,
    lng: 4.480,
    vesselCount: 56,
    avgWaitTime: 8,
    berthUtilization: 68,
    throughputTEU: 48000,
    status: 'moderate',
    description: 'Rotterdam Euromax terminal operating at moderate capacity with normal flow',
  },
  {
    id: 'pcm-lasanpedro',
    name: 'LA San Pedro',
    lat: 33.730,
    lng: -118.270,
    vesselCount: 78,
    avgWaitTime: 24,
    berthUtilization: 88,
    throughputTEU: 55000,
    status: 'congested',
    description: 'Los Angeles San Pedro Bay complex with extended dwell times',
  },
]

const STATUS_COLORS: Record<PortCongestionMapData['status'], { label: string; color: string; bgClass: string }> = {
  clear: { label: 'Clear', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  congested: { label: 'Congested', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: PortCongestionMapData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PortCongestionMapMonitor() {
  const state = useMapStore((s) => s.portCongestionMap)
  const setState = useMapStore((s) => s.setPortCongestionMap)

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
      return { totalVessels: 0, avgWait: 0, avgBerth: 0, totalTEU: 0 }
    }
    const avgWait = filteredItems.reduce((sum, e) => sum + e.avgWaitTime, 0) / filteredItems.length
    const avgBerth = filteredItems.reduce((sum, e) => sum + e.berthUtilization, 0) / filteredItems.length
    const totalTEU = filteredItems.reduce((sum, e) => sum + e.throughputTEU, 0)
    return {
      totalVessels: filteredItems.reduce((sum, e) => sum + e.vesselCount, 0),
      avgWait: avgWait.toFixed(1),
      avgBerth: Math.round(avgBerth),
      totalTEU: (totalTEU / 1000).toFixed(0),
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
      properties: { id: e.id, name: e.name, status: e.status, vesselCount: e.vesselCount },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPortCongestionMap({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PortCongestionMapState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVesselCount', label: 'Vessel Queue', icon: Anchor },
    { key: 'showAvgWaitTime', label: 'Avg Wait hrs', icon: Clock },
    { key: 'showBerthUtilization', label: 'Berth Usage', icon: BarChart3 },
    { key: 'showThroughputTEU', label: 'Throughput TEU', icon: Container },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ShipIcon6 className="h-4 w-4 text-teal-400" />
              Port Congestion Map
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
              <Anchor className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as PortCongestionMapState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="clear">Clear</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="congested">Congested</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Vessel Queue</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalVessels}</div>
              <div className="text-[9px] text-slate-400/60">vessels</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Wait</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgWait}</div>
              <div className="text-[9px] text-slate-400/60">hours</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Berth Usage</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgBerth}%</div>
              <div className="text-[9px] text-slate-400/60">utilization</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Throughput TEU</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.totalTEU}k</div>
              <div className="text-[9px] text-slate-400/60">daily</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Port Zones ({filteredItems.length})
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
                        {state.showVesselCount && (
                          <div>
                            Vessels:{' '}
                            <span className="text-slate-100 font-medium">{e.vesselCount}</span>
                          </div>
                        )}
                        {state.showAvgWaitTime && (
                          <div>
                            Avg Wait:{' '}
                            <span className="text-slate-100 font-medium">{e.avgWaitTime} hrs</span>
                          </div>
                        )}
                        {state.showBerthUtilization && (
                          <div>
                            Berth:{' '}
                            <span className="text-slate-100 font-medium">{e.berthUtilization}%</span>
                          </div>
                        )}
                        {state.showThroughputTEU && (
                          <div>
                            TEU:{' '}
                            <span className="text-slate-100 font-medium">{(e.throughputTEU / 1000).toFixed(0)}k</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No ports match the current filter.
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
                  <Anchor className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Vessels: </span>
                    <span className="font-medium text-teal-400">{activeItem.vesselCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Wait Time: </span>
                    <span className="font-medium text-amber-400">{activeItem.avgWaitTime} hrs</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Throughput: </span>
                    <span className="font-medium text-cyan-400">{(activeItem.throughputTEU / 1000).toFixed(0)}k TEU</span>
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
