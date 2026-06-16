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
import { useMapStore, type GridStabilityIndexState, type GridStabilityIndexData } from '@/lib/map-store'
import { Activity as ActivityIcon9, X, Zap, Gauge, BarChart3, Shield, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GridStabilityIndexData[] = [
  {
    id: 'gs-ercot',
    name: 'ERCOT Grid',
    lat: 31.000,
    lng: -97.000,
    frequency: 60.02,
    voltageDeviation: 3,
    loadBalance: 88,
    reserveMargin: 22,
    status: 'optimal',
    description: 'Texas independent grid with high renewable penetration',
  },
  {
    id: 'gs-european',
    name: 'European Grid',
    lat: 50.000,
    lng: 10.000,
    frequency: 50.01,
    voltageDeviation: 2,
    loadBalance: 92,
    reserveMargin: 28,
    status: 'optimal',
    description: 'Continental European synchronous grid ENTSO-E',
  },
  {
    id: 'gs-japan',
    name: 'Japan Grid',
    lat: 35.700,
    lng: 139.700,
    frequency: 50.03,
    voltageDeviation: 4,
    loadBalance: 85,
    reserveMargin: 18,
    status: 'stable',
    description: 'Japanese dual-frequency grid system 50/60 Hz',
  },
  {
    id: 'gs-australian',
    name: 'Australian NEM',
    lat: -27.000,
    lng: 133.000,
    frequency: 50.04,
    voltageDeviation: 5,
    loadBalance: 82,
    reserveMargin: 15,
    status: 'warning',
    description: 'National Electricity Market with long transmission lines',
  },
]

const STATUS_COLORS: Record<GridStabilityIndexData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  optimal: { label: 'Optimal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

function TrendIcon({ status }: { status: GridStabilityIndexData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GridStabilityIndexMonitor() {
  const state = useMapStore((s) => s.gridStabilityIndex)
  const setState = useMapStore((s) => s.setGridStabilityIndex)

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
      return { totalGrids: 0, avgFreq: '0', avgVoltage: 0, avgLoad: 0 }
    }
    const avgFreq = filteredItems.reduce((sum, e) => sum + e.frequency, 0) / filteredItems.length
    const avgVoltage = filteredItems.reduce((sum, e) => sum + e.voltageDeviation, 0) / filteredItems.length
    const avgLoad = filteredItems.reduce((sum, e) => sum + e.loadBalance, 0) / filteredItems.length
    return {
      totalGrids: filteredItems.length,
      avgFreq: avgFreq.toFixed(2),
      avgVoltage: avgVoltage.toFixed(1),
      avgLoad: Math.round(avgLoad),
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
      properties: { id: e.id, name: e.name, status: e.status, frequency: e.frequency },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setGridStabilityIndex({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GridStabilityIndexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFrequency', label: 'Frequency Hz', icon: Zap },
    { key: 'showVoltageDeviation', label: 'Voltage PU', icon: Gauge },
    { key: 'showLoadBalance', label: 'RoCoF', icon: BarChart3 },
    { key: 'showReserveMargin', label: 'Inertia Level', icon: Shield },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <ActivityIcon9 className="h-4 w-4 text-violet-400" />
              Grid Stability Index Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as GridStabilityIndexState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Frequency</div>
              <div className="text-sm font-semibold text-violet-300">{summary.avgFreq}</div>
              <div className="text-[9px] text-violet-400/60">Hz avg</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Voltage</div>
              <div className="text-sm font-semibold text-purple-300">{summary.avgVoltage}</div>
              <div className="text-[9px] text-violet-400/60">PU dev avg</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Load Balance</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgLoad}%</div>
              <div className="text-[9px] text-violet-400/60">avg</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Grids</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalGrids}</div>
              <div className="text-[9px] text-violet-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
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
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-violet-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showFrequency && (
                          <div>
                            Frequency:{' '}
                            <span className="text-violet-100 font-medium">{e.frequency} Hz</span>
                          </div>
                        )}
                        {state.showVoltageDeviation && (
                          <div>
                            Voltage:{' '}
                            <span className="text-violet-100 font-medium">{e.voltageDeviation} PU</span>
                          </div>
                        )}
                        {state.showLoadBalance && (
                          <div>
                            RoCoF:{' '}
                            <span className="text-violet-100 font-medium">{(e.voltageDeviation * 0.1).toFixed(2)} Hz/s</span>
                          </div>
                        )}
                        {state.showReserveMargin && (
                          <div>
                            Inertia:{' '}
                            <span className="text-violet-100 font-medium">{e.reserveMargin} GW\u00B7s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No grids match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Frequency: </span>
                    <span className="font-medium text-violet-300">{activeItem.frequency} Hz</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Voltage: </span>
                    <span className="font-medium text-purple-300">{activeItem.voltageDeviation} PU</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Load Balance: </span>
                    <span className="font-medium text-indigo-300">{activeItem.loadBalance}%</span>
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
