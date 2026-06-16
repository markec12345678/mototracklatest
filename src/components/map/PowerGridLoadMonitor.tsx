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
import { useMapStore, type PowerGridLoadState, type PowerGridLoadData } from '@/lib/map-store'
import { Zap as ZapIcon5, X, Activity, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PowerGridLoadData[] = [
  {
    id: 'pg-pjm',
    name: 'PJM Interconnect',
    lat: 39.950,
    lng: -75.170,
    gridLoad: 87,
    peakDemand: 148,
    frequency: 60.02,
    reserveMargin: 12,
    status: 'high',
    description: 'High grid load during summer peak demand in Eastern US interconnect',
  },
  {
    id: 'pg-entsoe',
    name: 'European ENTSO-E',
    lat: 50.100,
    lng: 8.680,
    gridLoad: 62,
    peakDemand: 420,
    frequency: 50.01,
    reserveMargin: 28,
    status: 'normal',
    description: 'Normal grid operation across continental European synchronous area',
  },
  {
    id: 'pg-tokyo',
    name: 'Tokyo Electric',
    lat: 35.682,
    lng: 139.692,
    gridLoad: 94,
    peakDemand: 58,
    frequency: 50.03,
    reserveMargin: 5,
    status: 'overloaded',
    description: 'Overloaded grid conditions during extreme heat wave in Tokyo metro',
  },
  {
    id: 'pg-ercot',
    name: 'ERCOT Texas',
    lat: 31.000,
    lng: -97.000,
    gridLoad: 42,
    peakDemand: 78,
    frequency: 59.99,
    reserveMargin: 35,
    status: 'low',
    description: 'Low demand period with ample reserve capacity in Texas grid',
  },
]

const STATUS_COLORS: Record<PowerGridLoadData['status'], { label: string; color: string; bgClass: string }> = {
  overloaded: { label: 'Overloaded', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  high: { label: 'High', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  normal: { label: 'Normal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  low: { label: 'Low', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: PowerGridLoadData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PowerGridLoadMonitor() {
  const state = useMapStore((s) => s.powerGridLoad)
  const setState = useMapStore((s) => s.setPowerGridLoad)

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
      return { totalGrids: 0, avgLoad: 0, avgFrequency: 0, avgReserve: 0 }
    }
    const avgLoad = filteredItems.reduce((sum, e) => sum + e.gridLoad, 0) / filteredItems.length
    const avgFrequency = filteredItems.reduce((sum, e) => sum + e.frequency, 0) / filteredItems.length
    const avgReserve = filteredItems.reduce((sum, e) => sum + e.reserveMargin, 0) / filteredItems.length
    return {
      totalGrids: filteredItems.length,
      avgLoad: Math.round(avgLoad),
      avgFrequency: avgFrequency.toFixed(2),
      avgReserve: Math.round(avgReserve),
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
      properties: { id: e.id, name: e.name, status: e.status, gridLoad: e.gridLoad },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setPowerGridLoad({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PowerGridLoadState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGridLoad', label: 'Grid Load %', icon: Gauge },
    { key: 'showPeakDemand', label: 'Peak Demand', icon: ZapIcon5 },
    { key: 'showFrequency', label: 'Frequency', icon: Activity },
    { key: 'showReserveMargin', label: 'Reserve Margin', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-yellow-950/95 to-amber-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ZapIcon5 className="h-4 w-4 text-yellow-400" />
              Power Grid Load Monitor
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
                setState({ statusFilter: v as PowerGridLoadState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="overloaded">Overloaded</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-yellow-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Grids</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalGrids}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Load</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgLoad}%</div>
              <div className="text-[9px] text-slate-400/60">capacity</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Freq</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgFrequency}</div>
              <div className="text-[9px] text-slate-400/60">Hz</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Reserve</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgReserve}%</div>
              <div className="text-[9px] text-slate-400/60">margin</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Grid Regions ({filteredItems.length})
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
                        {state.showGridLoad && (
                          <div>
                            Load:{' '}
                            <span className="text-slate-100 font-medium">{e.gridLoad}%</span>
                          </div>
                        )}
                        {state.showPeakDemand && (
                          <div>
                            Peak:{' '}
                            <span className="text-slate-100 font-medium">{e.peakDemand} GW</span>
                          </div>
                        )}
                        {state.showFrequency && (
                          <div>
                            Freq:{' '}
                            <span className="text-slate-100 font-medium">{e.frequency} Hz</span>
                          </div>
                        )}
                        {state.showReserveMargin && (
                          <div>
                            Reserve:{' '}
                            <span className="text-slate-100 font-medium">{e.reserveMargin}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No grids match the current filter.
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
                    <span className="text-slate-400/70">Grid Load: </span>
                    <span className="font-medium text-yellow-400">{activeItem.gridLoad}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Frequency: </span>
                    <span className="font-medium text-amber-400">{activeItem.frequency} Hz</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Reserve: </span>
                    <span className="font-medium text-slate-200">{activeItem.reserveMargin}%</span>
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
