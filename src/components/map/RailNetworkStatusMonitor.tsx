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
import { useMapStore, type RailNetworkStatusState, type RailNetworkStatusData } from '@/lib/map-store'
import { TrainFront as TrainIcon, X, TrainTrack, Gauge, AlertTriangle, Users } from 'lucide-react'

const SAMPLE_LOCATIONS: RailNetworkStatusData[] = [
  {
    id: 'rns-shinkansen',
    name: 'Shinkansen',
    lat: 35.681,
    lng: 139.767,
    trainCount: 340,
    avgSpeed: 265,
    delayIndex: 8,
    trackUtilization: 92,
    status: 'normal',
    description: 'Tokaido Shinkansen operating at peak efficiency with minimal delays',
  },
  {
    id: 'rns-eurostar',
    name: 'Eurostar',
    lat: 51.530,
    lng: -0.123,
    trainCount: 28,
    avgSpeed: 230,
    delayIndex: 22,
    trackUtilization: 78,
    status: 'delayed',
    description: 'Eurostar services experiencing delays due to Channel Tunnel checks',
  },
  {
    id: 'rns-amtrak',
    name: 'Amtrak NE',
    lat: 40.750,
    lng: -73.990,
    trainCount: 145,
    avgSpeed: 180,
    delayIndex: 35,
    trackUtilization: 85,
    status: 'delayed',
    description: 'Northeast Corridor with recurring delays from aging infrastructure',
  },
  {
    id: 'rns-ice',
    name: 'ICE Germany',
    lat: 50.110,
    lng: 8.680,
    trainCount: 210,
    avgSpeed: 220,
    delayIndex: 15,
    trackUtilization: 88,
    status: 'normal',
    description: 'ICE network running with high punctuality across major corridors',
  },
]

const STATUS_COLORS: Record<RailNetworkStatusData['status'], { label: string; color: string; bgClass: string }> = {
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  delayed: { label: 'Delayed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  disrupted: { label: 'Disrupted', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  suspended: { label: 'Suspended', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

function TrendIcon({ status }: { status: RailNetworkStatusData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RailNetworkStatusMonitor() {
  const state = useMapStore((s) => s.railNetworkStatus)
  const setState = useMapStore((s) => s.setRailNetworkStatus)

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
      return { avgPunctuality: 0, avgSpeed: 0, totalDisruptions: 0, totalRidershipK: 0 }
    }
    const avgSpeed = filteredItems.reduce((sum, e) => sum + e.avgSpeed, 0) / filteredItems.length
    const avgPunctuality = filteredItems.reduce((sum, e) => sum + (100 - e.delayIndex), 0) / filteredItems.length
    const totalDisruptions = filteredItems.filter((e) => e.status === 'disrupted').length
    const totalRidershipK = filteredItems.reduce((sum, e) => sum + e.trainCount, 0)
    return {
      avgPunctuality: Math.round(avgPunctuality),
      avgSpeed: avgSpeed.toFixed(0),
      totalDisruptions,
      totalRidershipK,
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
      properties: { id: e.id, name: e.name, status: e.status, avgSpeed: e.avgSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setRailNetworkStatus({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RailNetworkStatusState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTrainCount', label: 'Train Count', icon: TrainTrack },
    { key: 'showAvgSpeed', label: 'Avg Speed', icon: Gauge },
    { key: 'showDelayIndex', label: 'Delay Index', icon: AlertTriangle },
    { key: 'showTrackUtilization', label: 'Track Util', icon: Users },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-zinc-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <TrainIcon className="h-4 w-4 text-stone-400" />
              Rail Network Status
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
              <AlertTriangle className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as RailNetworkStatusState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="disrupted">Disrupted</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Punctuality %</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgPunctuality}%</div>
              <div className="text-[9px] text-slate-400/60">on-time rate</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-stone-300">{summary.avgSpeed}</div>
              <div className="text-[9px] text-slate-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Disruptions</div>
              <div className="text-sm font-semibold text-red-400">{summary.totalDisruptions}</div>
              <div className="text-[9px] text-slate-400/60">active</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Ridership K</div>
              <div className="text-sm font-semibold text-zinc-300">{summary.totalRidershipK}</div>
              <div className="text-[9px] text-slate-400/60">daily trains</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Rail Networks ({filteredItems.length})
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
                        {state.showTrainCount && (
                          <div>
                            Trains:{' '}
                            <span className="text-slate-100 font-medium">{e.trainCount}</span>
                          </div>
                        )}
                        {state.showAvgSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-slate-100 font-medium">{e.avgSpeed} km/h</span>
                          </div>
                        )}
                        {state.showDelayIndex && (
                          <div>
                            Delay:{' '}
                            <span className="text-slate-100 font-medium">{e.delayIndex}</span>
                          </div>
                        )}
                        {state.showTrackUtilization && (
                          <div>
                            Utilization:{' '}
                            <span className="text-slate-100 font-medium">{e.trackUtilization}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No networks match the current filter.
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
                  <TrainTrack className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Trains: </span>
                    <span className="font-medium text-stone-300">{activeItem.trainCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Speed: </span>
                    <span className="font-medium text-zinc-300">{activeItem.avgSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Utilization: </span>
                    <span className="font-medium text-green-400">{activeItem.trackUtilization}%</span>
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
