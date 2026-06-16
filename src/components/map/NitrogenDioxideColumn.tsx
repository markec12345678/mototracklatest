'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { CloudFog as CloudFogIcon3, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'no2-china',
    name: 'Eastern China',
    lat: 35.0,
    lng: 115.0,
    no2Column: 18500,
    tropospheric: 92,
    trendPct: -8.5,
    source: 'Industrial/Urban',
    status: 'critical',
    description: 'Dense industrial and urban emissions from coal combustion and vehicle exhaust across eastern China',
  },
  {
    id: 'no2-povalley',
    name: 'Po Valley Italy',
    lat: 45.0,
    lng: 10.0,
    no2Column: 12400,
    tropospheric: 78,
    trendPct: -3.2,
    source: 'Transport/Industry',
    status: 'warning',
    description: 'Confined Po Valley basin with persistent winter NO2 accumulation from traffic and industrial sources',
  },
  {
    id: 'no2-benelux',
    name: 'Benelux',
    lat: 50.0,
    lng: 5.0,
    no2Column: 10800,
    tropospheric: 71,
    trendPct: -5.1,
    source: 'Shipping/Urban',
    status: 'warning',
    description: 'Major port and shipping corridor region with high density transportation and industrial NO2 emissions',
  },
  {
    id: 'no2-neus',
    name: 'NE US Corridor',
    lat: 40.0,
    lng: -75.0,
    no2Column: 8600,
    tropospheric: 64,
    trendPct: -6.8,
    source: 'Vehicle/Power',
    status: 'moderate',
    description: 'Northeast US urban corridor showing declining NO2 from power plant controls and vehicle standards',
  },
]

const STATUS_COLORS: Record<string, { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.stable
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function NitrogenDioxideColumn() {
  const state = useMapStore((s) => s.nitrogenDioxideColumn)
  const setState = useMapStore((s) => s.setNitrogenDioxideColumn)

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
      return { avgColumn: 0, avgTropo: 0, avgTrend: 0, sites: 0 }
    }
    const avgColumn = filteredItems.reduce((sum, e) => sum + (e.no2Column as number), 0) / filteredItems.length
    const avgTropo = filteredItems.reduce((sum, e) => sum + (e.tropospheric as number), 0) / filteredItems.length
    const avgTrend = filteredItems.reduce((sum, e) => sum + (e.trendPct as number), 0) / filteredItems.length
    return {
      avgColumn: Math.round(avgColumn).toLocaleString(),
      avgTropo: avgTropo.toFixed(0),
      avgTrend: avgTrend.toFixed(1),
      sites: filteredItems.length,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setNitrogenDioxideColumn({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-600/95 to-red-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CloudFogIcon3 className="h-4 w-4 text-rose-200" />
              Nitrogen Dioxide Column
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
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <select
              className="mt-1 w-full h-8 text-xs bg-slate-900/40 border border-slate-700/40 rounded-md px-2 text-slate-100"
              value={state.statusFilter || 'all'}
              onChange={(e) => setState({ statusFilter: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="moderate">Moderate</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">NO2 Column</div>
              <div className="text-sm font-semibold text-rose-200">{summary.avgColumn}</div>
              <div className="text-[9px] text-slate-400/60">umol/m2 avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Tropospheric</div>
              <div className="text-sm font-semibold text-red-200">{summary.avgTropo}%</div>
              <div className="text-[9px] text-slate-400/60">column share</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Trend</div>
              <div className="text-sm font-semibold text-pink-200">{summary.avgTrend}%</div>
              <div className="text-[9px] text-slate-400/60">annual change</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Active Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.sites}</div>
              <div className="text-[9px] text-slate-400/60">NO2 hotspots</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              NO2 Hotspots ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status as string] ?? STATUS_COLORS.stable
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
                          <TrendIcon status={e.status as string} />
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
                        <div>
                          NO2: <span className="text-slate-100 font-medium">{(e.no2Column as number).toLocaleString()} umol/m2</span>
                        </div>
                        <div>
                          Tropo: <span className="text-slate-100 font-medium">{e.tropospheric as number}%</span>
                        </div>
                        <div>
                          Trend: <span className="text-slate-100 font-medium">{e.trendPct as number}%</span>
                        </div>
                        <div>
                          Source: <span className="text-slate-100 font-medium">{e.source as string}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No hotspots match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status as string]?.bgClass ?? STATUS_COLORS.stable.bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status as string]?.label ?? 'Stable'}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description as string}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {(activeItem.lat as number).toFixed(2)}, {(activeItem.lng as number).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">NO2: </span>
                    <span className="font-medium text-rose-200">{(activeItem.no2Column as number).toLocaleString()} umol/m2</span>
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
