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
import { useMapStore, type SeaIceExtentState, type SeaIceExtentData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon16, X, Percent, TrendingDown, Clock, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SeaIceExtentData[] = [
  {
    id: 'sie-arctic',
    name: 'Arctic Central',
    lat: 85,
    lng: 0,
    iceConcentration: 95,
    extentAnomaly: -1.2,
    iceAge: 3,
    status: 'declining',
    description: 'Arctic sea ice showing long-term decline',
  },
  {
    id: 'sie-ross',
    name: 'Antarctic Ross Sea',
    lat: -75,
    lng: 170,
    iceConcentration: 85,
    extentAnomaly: 0.3,
    iceAge: 2,
    status: 'stable',
    description: 'Ross Sea ice relatively stable conditions',
  },
  {
    id: 'sie-beaufort',
    name: 'Beaufort Sea',
    lat: 75,
    lng: -140,
    iceConcentration: 60,
    extentAnomaly: -2.5,
    iceAge: 1,
    status: 'record_low',
    description: 'Beaufort Sea at record low ice extent',
  },
  {
    id: 'sie-weddell',
    name: 'Weddell Sea',
    lat: -72,
    lng: -30,
    iceConcentration: 90,
    extentAnomaly: 0.8,
    iceAge: 4,
    status: 'expanding',
    description: 'Weddell Sea showing expanding ice cover',
  },
]

const STATUS_COLORS: Record<SeaIceExtentData['status'], { label: string; color: string; bgClass: string }> = {
  expanding: { label: 'Expanding', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  declining: { label: 'Declining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  record_low: { label: 'Record Low', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: SeaIceExtentData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SeaIceExtentMonitor() {
  const state = useMapStore((s) => s.seaIceExtent)
  const setState = useMapStore((s) => s.setSeaIceExtent)

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
      return { totalZones: 0, avgConcentration: 0, avgAnomaly: 0, avgAge: 0 }
    }
    const avgConcentration = filteredItems.reduce((sum, e) => sum + e.iceConcentration, 0) / filteredItems.length
    const avgAnomaly = filteredItems.reduce((sum, e) => sum + e.extentAnomaly, 0) / filteredItems.length
    const avgAge = filteredItems.reduce((sum, e) => sum + e.iceAge, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgConcentration: Math.round(avgConcentration * 100) / 100,
      avgAnomaly: Math.round(avgAnomaly * 100) / 100,
      avgAge: Math.round(avgAge * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, iceConcentration: e.iceConcentration },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSeaIceExtent({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeaIceExtentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIceConcentration', label: 'Ice Concentration', icon: Percent },
    { key: 'showExtentAnomaly', label: 'Extent Anomaly', icon: TrendingDown },
    { key: 'showIceAge', label: 'Ice Age', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-indigo-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SnowflakeIcon16 className="h-4 w-4 text-cyan-400" />
              Sea Ice Extent Monitor
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
                setState({ statusFilter: v as SeaIceExtentState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="expanding">Expanding</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="record_low">Record Low</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Concentration</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgConcentration}</div>
              <div className="text-[9px] text-slate-400/60">%</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Anomaly</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgAnomaly}</div>
              <div className="text-[9px] text-slate-400/60">M km2</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Ice Age</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgAge}</div>
              <div className="text-[9px] text-slate-400/60">years</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Ice Zones ({filteredItems.length})
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
                        {state.showIceConcentration && (
                          <div>
                            Concentration:{' '}
                            <span className="text-slate-100 font-medium">{e.iceConcentration}%</span>
                          </div>
                        )}
                        {state.showExtentAnomaly && (
                          <div>
                            Anomaly:{' '}
                            <span className="text-slate-100 font-medium">{e.extentAnomaly} M km2</span>
                          </div>
                        )}
                        {state.showIceAge && (
                          <div>
                            Age:{' '}
                            <span className="text-slate-100 font-medium">{e.iceAge} yr</span>
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
                    <span className="text-slate-400/70">Concentration: </span>
                    <span className="font-medium text-cyan-400">{activeItem.iceConcentration}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Anomaly: </span>
                    <span className="font-medium text-indigo-400">{activeItem.extentAnomaly} M km2</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Ice Age: </span>
                    <span className="font-medium text-slate-400">{activeItem.iceAge} years</span>
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
