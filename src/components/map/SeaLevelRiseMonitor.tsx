'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Waves as WavesIcon25, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'slr-pacific',
    name: 'Pacific Gauge',
    lat: 0.0,
    lng: -170.0,
    riseMmYr: 3.9,
    thermalExpMm: 1.4,
    iceMeltMm: 1.8,
    totalMm: 98.6,
    status: 'critical',
    description: 'Pacific tide gauge tracking accelerated rise from thermal expansion and ice loss',
  },
  {
    id: 'slr-atlantic',
    name: 'Atlantic Coast',
    lat: 35.0,
    lng: -75.0,
    riseMmYr: 3.2,
    thermalExpMm: 1.2,
    iceMeltMm: 1.5,
    totalMm: 82.4,
    status: 'warning',
    description: 'US East Coast hotspot with amplified rise from Gulf Stream weakening',
  },
  {
    id: 'slr-indian',
    name: 'Indian Ocean',
    lat: -20.0,
    lng: 80.0,
    riseMmYr: 2.8,
    thermalExpMm: 1.1,
    iceMeltMm: 1.3,
    totalMm: 71.8,
    status: 'moderate',
    description: 'Indian Ocean basin showing steady rise with regional variability',
  },
  {
    id: 'slr-arctic',
    name: 'Arctic Ocean',
    lat: 80.0,
    lng: 0.0,
    riseMmYr: 2.1,
    thermalExpMm: 0.9,
    iceMeltMm: 1.0,
    totalMm: 54.3,
    status: 'stable',
    description: 'Arctic gauges affected by glacial isostatic rebound offsetting rise signals',
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

export function SeaLevelRiseMonitor() {
  const state = useMapStore((s) => s.seaLevelRiseTrack)
  const setState = useMapStore((s) => s.setSeaLevelRiseTrack)

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
      return { avgRise: 0, avgThermal: 0, avgIceMelt: 0, avgTotal: 0 }
    }
    const avgRise = filteredItems.reduce((sum, e) => sum + (e.riseMmYr as number), 0) / filteredItems.length
    const avgThermal = filteredItems.reduce((sum, e) => sum + (e.thermalExpMm as number), 0) / filteredItems.length
    const avgIceMelt = filteredItems.reduce((sum, e) => sum + (e.iceMeltMm as number), 0) / filteredItems.length
    const avgTotal = filteredItems.reduce((sum, e) => sum + (e.totalMm as number), 0) / filteredItems.length
    return {
      avgRise: avgRise.toFixed(1),
      avgThermal: avgThermal.toFixed(1),
      avgIceMelt: avgIceMelt.toFixed(1),
      avgTotal: avgTotal.toFixed(1),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSeaLevelRiseTrack({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-600/95 to-cyan-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WavesIcon25 className="h-4 w-4 text-cyan-200" />
              Sea Level Rise Tracker
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
              <div className="text-[10px] text-slate-400/70">Rise</div>
              <div className="text-sm font-semibold text-blue-200">{summary.avgRise}</div>
              <div className="text-[9px] text-slate-400/60">mm/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Thermal Exp</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgThermal}</div>
              <div className="text-[9px] text-slate-400/60">mm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Ice Melt</div>
              <div className="text-sm font-semibold text-sky-200">{summary.avgIceMelt}</div>
              <div className="text-[9px] text-slate-400/60">mm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgTotal}</div>
              <div className="text-[9px] text-slate-400/60">mm since 1993</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Tide Gauges ({filteredItems.length})
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
                          Rise: <span className="text-slate-100 font-medium">{e.riseMmYr} mm/yr</span>
                        </div>
                        <div>
                          Thermal: <span className="text-slate-100 font-medium">{e.thermalExpMm} mm</span>
                        </div>
                        <div>
                          Ice Melt: <span className="text-slate-100 font-medium">{e.iceMeltMm} mm</span>
                        </div>
                        <div>
                          Total: <span className="text-slate-100 font-medium">{e.totalMm} mm</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No gauges match the current filter.
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
                    <span className="text-slate-400/70">Rise Rate: </span>
                    <span className="font-medium text-blue-200">{activeItem.riseMmYr} mm/yr</span>
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
