'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { ArrowDown as ArrowDownIcon8, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'sm-mexicocity',
    name: 'Mexico City',
    lat: 19.432,
    lng: -99.133,
    subsidence: 280,
    area: 1250,
    cause: 'Aquifer Depletion',
    impactLevel: 'Severe',
    status: 'critical',
    description: 'Severe land subsidence in Mexico City due to extensive groundwater extraction from lake bed aquifer system',
  },
  {
    id: 'sm-jakarta',
    name: 'Jakarta',
    lat: -6.200,
    lng: 106.845,
    subsidence: 150,
    area: 980,
    cause: 'Groundwater Extraction',
    impactLevel: 'Severe',
    status: 'critical',
    description: 'Rapid coastal subsidence in Jakarta caused by intensive groundwater pumping and urban development load',
  },
  {
    id: 'sm-venice',
    name: 'Venice',
    lat: 45.440,
    lng: 12.320,
    subsidence: 12,
    area: 85,
    cause: 'Aquifer Compaction',
    impactLevel: 'Moderate',
    status: 'moderate',
    description: 'Slow ongoing subsidence in Venice amplified by groundwater withdrawal and Adriatic tectonic settling',
  },
  {
    id: 'sm-beijing',
    name: 'Beijing',
    lat: 39.904,
    lng: 116.407,
    subsidence: 110,
    area: 1450,
    cause: 'Aquifer Depletion',
    impactLevel: 'High',
    status: 'warning',
    description: 'Significant subsidence in Beijing from large scale aquifer depletion across the North China Plain',
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

export function SubsidenceMonitor() {
  const state = useMapStore((s) => s.subsidenceMonitorTrack)
  const setState = useMapStore((s) => s.setSubsidenceMonitorTrack)

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
      return { cities: 0, maxSubsidence: 0, totalArea: 0, severeCount: 0 }
    }
    const maxSubsidence = Math.max(...filteredItems.map((e) => e.subsidence as number))
    const totalArea = filteredItems.reduce((sum, e) => sum + (e.area as number), 0)
    const severeCount = filteredItems.filter((e) => (e.impactLevel as string) === 'Severe').length
    return {
      cities: filteredItems.length,
      maxSubsidence,
      totalArea: totalArea.toLocaleString(),
      severeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSubsidenceMonitorTrack({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-600/95 to-zinc-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ArrowDownIcon8 className="h-4 w-4 text-stone-200" />
              Subsidence Monitor
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
              <div className="text-[10px] text-slate-400/70">Cities</div>
              <div className="text-sm font-semibold text-stone-200">{summary.cities}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Subsidence</div>
              <div className="text-sm font-semibold text-zinc-200">{summary.maxSubsidence}</div>
              <div className="text-[9px] text-slate-400/60">max mm/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Area</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalArea}</div>
              <div className="text-[9px] text-slate-400/60">km2 affected</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Severe</div>
              <div className="text-sm font-semibold text-red-200">{summary.severeCount}</div>
              <div className="text-[9px] text-slate-400/60">impact zones</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Subsidence Sites ({filteredItems.length})
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
                          Subsidence: <span className="text-slate-100 font-medium">{e.subsidence} mm/yr</span>
                        </div>
                        <div>
                          Area: <span className="text-slate-100 font-medium">{e.area} km2</span>
                        </div>
                        <div>
                          Cause: <span className="text-slate-100 font-medium">{e.cause}</span>
                        </div>
                        <div>
                          Impact: <span className="text-slate-100 font-medium">{e.impactLevel}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No subsidence sites match the current filter.
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
                    <span className="text-slate-400/70">Subsidence: </span>
                    <span className="font-medium text-stone-200">{activeItem.subsidence as number} mm/yr</span>
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
