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
import { useMapStore, type TransitRidershipState, type TransitRidershipData } from '@/lib/map-store'
import { Users as UsersIcon, X, MapPin, BarChart3, DollarSign, Clock } from 'lucide-react'

const SAMPLE_LOCATIONS: TransitRidershipData[] = [
  {
    id: 'tr-tokyo',
    name: 'Tokyo Metro',
    lat: 35.681,
    lng: 139.767,
    dailyRiders: 8700,
    onTimeRate: 98,
    routeCount: 13,
    crowdingIndex: 88,
    status: 'overcrowded',
    description: 'Tokyo Metro operating at extreme capacity during morning peak hours',
  },
  {
    id: 'tr-nyc',
    name: 'NYC Subway',
    lat: 40.748,
    lng: -73.987,
    dailyRiders: 5600,
    onTimeRate: 72,
    routeCount: 26,
    crowdingIndex: 75,
    status: 'high',
    description: 'NYC Subway with moderate delays and high ridership on key lines',
  },
  {
    id: 'tr-london',
    name: 'London Tube',
    lat: 51.508,
    lng: -0.090,
    dailyRiders: 4800,
    onTimeRate: 88,
    routeCount: 11,
    crowdingIndex: 68,
    status: 'high',
    description: 'London Underground running with good punctuality and busy corridors',
  },
  {
    id: 'tr-moscow',
    name: 'Moscow Metro',
    lat: 55.756,
    lng: 37.617,
    dailyRiders: 6200,
    onTimeRate: 95,
    routeCount: 15,
    crowdingIndex: 82,
    status: 'overcrowded',
    description: 'Moscow Metro at near-capacity with world-class frequency and reliability',
  },
]

const STATUS_COLORS: Record<TransitRidershipData['status'], { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  normal: { label: 'Normal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  high: { label: 'High', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  overcrowded: { label: 'Overcrowded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: TransitRidershipData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TransitRidershipMonitor() {
  const state = useMapStore((s) => s.transitRidership)
  const setState = useMapStore((s) => s.setTransitRidership)

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
      return { totalRiders: 0, avgPeakLoad: 0, avgRevenue: 0, avgOnTime: 0 }
    }
    const totalRiders = filteredItems.reduce((sum, e) => sum + e.dailyRiders, 0)
    const avgPeakLoad = filteredItems.reduce((sum, e) => sum + e.crowdingIndex, 0) / filteredItems.length
    const avgOnTime = filteredItems.reduce((sum, e) => sum + e.onTimeRate, 0) / filteredItems.length
    return {
      totalRiders: (totalRiders / 1000).toFixed(1),
      avgPeakLoad: Math.round(avgPeakLoad),
      avgRevenue: ((totalRiders * 2.5) / 1000).toFixed(0),
      avgOnTime: Math.round(avgOnTime),
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
      properties: { id: e.id, name: e.name, status: e.status, dailyRiders: e.dailyRiders },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setTransitRidership({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TransitRidershipState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showDailyRiders', label: 'Daily Riders', icon: UsersIcon },
    { key: 'showOnTimeRate', label: 'On-time %', icon: Clock },
    { key: 'showRouteCount', label: 'Route Count', icon: MapPin },
    { key: 'showCrowdingIndex', label: 'Peak Load', icon: BarChart3 },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-fuchsia-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <UsersIcon className="h-4 w-4 text-purple-400" />
              Transit Ridership
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
              <BarChart3 className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as TransitRidershipState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="overcrowded">Overcrowded</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-purple-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Daily Riders</div>
              <div className="text-sm font-semibold text-purple-400">{summary.totalRiders}M</div>
              <div className="text-[9px] text-slate-400/60">thousands</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Peak Load</div>
              <div className="text-sm font-semibold text-fuchsia-400">{summary.avgPeakLoad}%</div>
              <div className="text-[9px] text-slate-400/60">crowding index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Fare Revenue</div>
              <div className="text-sm font-semibold text-slate-200">${summary.avgRevenue}k</div>
              <div className="text-[9px] text-slate-400/60">estimated daily</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">On-time %</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgOnTime}%</div>
              <div className="text-[9px] text-slate-400/60">punctuality</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Transit Systems ({filteredItems.length})
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
                        {state.showDailyRiders && (
                          <div>
                            Riders:{' '}
                            <span className="text-slate-100 font-medium">{e.dailyRiders.toLocaleString()}k</span>
                          </div>
                        )}
                        {state.showOnTimeRate && (
                          <div>
                            On-time:{' '}
                            <span className="text-slate-100 font-medium">{e.onTimeRate}%</span>
                          </div>
                        )}
                        {state.showRouteCount && (
                          <div>
                            Routes:{' '}
                            <span className="text-slate-100 font-medium">{e.routeCount}</span>
                          </div>
                        )}
                        {state.showCrowdingIndex && (
                          <div>
                            Crowding:{' '}
                            <span className="text-slate-100 font-medium">{e.crowdingIndex}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No transit systems match the current filter.
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
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
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
                    <span className="text-slate-400/70">Riders: </span>
                    <span className="font-medium text-purple-400">{activeItem.dailyRiders.toLocaleString()}k</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">On-time: </span>
                    <span className="font-medium text-green-400">{activeItem.onTimeRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Crowding: </span>
                    <span className="font-medium text-fuchsia-400">{activeItem.crowdingIndex}%</span>
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
