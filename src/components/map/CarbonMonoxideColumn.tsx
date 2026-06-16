'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Wind as WindIcon19, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'co-amazon',
    name: 'Amazon Burning',
    lat: -10.0,
    lng: -60.0,
    coPpbv: 580,
    columnMol: 3.8e18,
    altitudeKm: 3.5,
    fireCount: 12480,
    status: 'critical',
    description: 'Extensive dry-season biomass burning across the Amazon releasing massive CO plumes into the troposphere',
  },
  {
    id: 'co-africa',
    name: 'Africa Savanna',
    lat: -5.0,
    lng: 25.0,
    coPpbv: 460,
    columnMol: 3.1e18,
    altitudeKm: 4.2,
    fireCount: 9650,
    status: 'warning',
    description: 'Seasonal savanna fires across central Africa producing large-scale CO emissions transported westward',
  },
  {
    id: 'co-seasia',
    name: 'SE Asia Fires',
    lat: 0.0,
    lng: 110.0,
    coPpbv: 520,
    columnMol: 3.5e18,
    altitudeKm: 4.0,
    fireCount: 7320,
    status: 'critical',
    description: 'Peat and forest fires in Indonesia and SE Asia causing severe regional haze with elevated CO columns',
  },
  {
    id: 'co-siberia',
    name: 'Siberian Wildfire',
    lat: 60.0,
    lng: 100.0,
    coPpbv: 410,
    columnMol: 2.8e18,
    altitudeKm: 6.5,
    fireCount: 5840,
    status: 'warning',
    description: 'Boreal forest wildfires in Siberia injecting CO into the mid-troposphere with long-range transport',
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

export function CarbonMonoxideColumn() {
  const state = useMapStore((s) => s.carbonMonoxideColumn)
  const setState = useMapStore((s) => s.setCarbonMonoxideColumn)

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
      return { avgCo: 0, avgColumn: 0, avgAlt: 0, totalFires: 0 }
    }
    const avgCo = filteredItems.reduce((sum, e) => sum + (e.coPpbv as number), 0) / filteredItems.length
    const avgColumn = filteredItems.reduce((sum, e) => sum + (e.columnMol as number), 0) / filteredItems.length
    const avgAlt = filteredItems.reduce((sum, e) => sum + (e.altitudeKm as number), 0) / filteredItems.length
    const totalFires = filteredItems.reduce((sum, e) => sum + (e.fireCount as number), 0)
    return {
      avgCo: avgCo.toFixed(0),
      avgColumn: (avgColumn / 1e18).toFixed(2),
      avgAlt: avgAlt.toFixed(1),
      totalFires: totalFires.toLocaleString(),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCarbonMonoxideColumn({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-600/95 to-purple-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WindIcon19 className="h-4 w-4 text-violet-200" />
              Carbon Monoxide Column
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
              <div className="text-[10px] text-slate-400/70">CO</div>
              <div className="text-sm font-semibold text-violet-200">{summary.avgCo}</div>
              <div className="text-[9px] text-slate-400/60">ppbv avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Column</div>
              <div className="text-sm font-semibold text-purple-200">{summary.avgColumn}e18</div>
              <div className="text-[9px] text-slate-400/60">mol/m2 avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Altitude</div>
              <div className="text-sm font-semibold text-fuchsia-200">{summary.avgAlt}</div>
              <div className="text-[9px] text-slate-400/60">km avg plume</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Fire Count</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalFires}</div>
              <div className="text-[9px] text-slate-400/60">total active</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              CO Sources ({filteredItems.length})
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
                          CO: <span className="text-slate-100 font-medium">{e.coPpbv as number} ppbv</span>
                        </div>
                        <div>
                          Alt: <span className="text-slate-100 font-medium">{e.altitudeKm as number} km</span>
                        </div>
                        <div>
                          Column: <span className="text-slate-100 font-medium">{((e.columnMol as number) / 1e18).toFixed(2)}e18</span>
                        </div>
                        <div>
                          Fires: <span className="text-slate-100 font-medium">{(e.fireCount as number).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sources match the current filter.
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
                    <span className="text-slate-400/70">CO: </span>
                    <span className="font-medium text-violet-200">{activeItem.coPpbv as number} ppbv</span>
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
