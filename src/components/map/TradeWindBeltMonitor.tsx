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
import { useMapStore, type TradeWindBeltState, type TradeWindBeltData } from '@/lib/map-store'
import { Ship as ShipIcon5, X, Wind, MapPin, Gauge, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TradeWindBeltData[] = [
  {
    id: 'twb-atlantic',
    name: 'Atlantic Trade Winds',
    lat: 15.0000,
    lng: -35.0000,
    windSpeed: 8.5,
    convergenceZone: 5,
    consistency: 90,
    status: 'strong',
    description: 'Strong steady Atlantic NE trades',
  },
  {
    id: 'twb-pacific',
    name: 'Pacific Trade Wind Belt',
    lat: 12.0000,
    lng: -150.0000,
    windSpeed: 6.0,
    convergenceZone: 8,
    consistency: 72,
    status: 'moderate',
    description: 'Moderate Pacific easterly trades',
  },
  {
    id: 'twb-indian',
    name: 'Indian Ocean Trades',
    lat: -10.0000,
    lng: 70.0000,
    windSpeed: 4.5,
    convergenceZone: 12,
    consistency: 45,
    status: 'variable',
    description: 'Variable monsoon-modified trades',
  },
  {
    id: 'twb-collapsed',
    name: 'ENSO Collapsed Trades',
    lat: 5.0000,
    lng: -160.0000,
    windSpeed: 1.0,
    convergenceZone: 2,
    consistency: 15,
    status: 'collapsed',
    description: 'Collapsed trades during strong El Nino',
  },
]

const STATUS_COLORS: Record<TradeWindBeltData['status'], { label: string; color: string; bgClass: string }> = {
  strong: { label: 'Strong', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  variable: { label: 'Variable', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: TradeWindBeltData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TradeWindBeltMonitor() {
  const state = useMapStore((s) => s.tradeWindBelt)
  const setState = useMapStore((s) => s.setTradeWindBelt)

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
      return { totalPaths: 0, avgWindSpeed: 0, avgConvergenceZone: 0, avgConsistency: 0 }
    }
    const avgWindSpeed = filteredItems.reduce((sum, e) => sum + e.windSpeed, 0) / filteredItems.length
    const avgConvergenceZone = filteredItems.reduce((sum, e) => sum + e.convergenceZone, 0) / filteredItems.length
    const avgConsistency = filteredItems.reduce((sum, e) => sum + e.consistency, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgWindSpeed: Math.round(avgWindSpeed * 100) / 100,
      avgConvergenceZone: Math.round(avgConvergenceZone * 100) / 100,
      avgConsistency: Math.round(avgConsistency),
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
      properties: { id: e.id, name: e.name, status: e.status, windSpeed: e.windSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setTradeWindBelt({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TradeWindBeltState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showConvergenceZone', label: 'Convergence Zone', icon: MapPin },
    { key: 'showConsistency', label: 'Consistency', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ShipIcon5 className="h-4 w-4 text-emerald-400" />
              Trade Wind Belt Monitor
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
                setState({ statusFilter: v as TradeWindBeltState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="variable">Variable</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Belts</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-slate-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg ITCZ Width</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgConvergenceZone}</div>
              <div className="text-[9px] text-slate-400/60">deg lat</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Consistency</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgConsistency}%</div>
              <div className="text-[9px] text-slate-400/60">reliability</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Belts ({filteredItems.length})
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
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-slate-100 font-medium">{e.windSpeed} m/s</span>
                          </div>
                        )}
                        {state.showConvergenceZone && (
                          <div>
                            ITCZ:{' '}
                            <span className="text-slate-100 font-medium">{e.convergenceZone} deg lat</span>
                          </div>
                        )}
                        {state.showConsistency && (
                          <div>
                            Consistency:{' '}
                            <span className="text-slate-100 font-medium">{e.consistency}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No belts match the current filter.
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
                    <span className="text-slate-400/70">Wind Speed: </span>
                    <span className="font-medium text-emerald-400">{activeItem.windSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">ITCZ Width: </span>
                    <span className="font-medium text-teal-400">{activeItem.convergenceZone} deg lat</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Consistency: </span>
                    <span className="font-medium text-slate-400">{activeItem.consistency}%</span>
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
