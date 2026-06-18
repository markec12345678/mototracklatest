'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Split as SplitIcon4, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'fl-sanandreas',
    name: 'San Andreas Fault',
    lat: 36.000,
    lng: -120.000,
    slipRate: 34,
    creep: 28,
    stress: 14.2,
    recurrence: 220,
    status: 'critical',
    description: 'High stress accumulation and observed aseismic creep along the southern San Andreas transform fault',
  },
  {
    id: 'fl-alpine',
    name: 'Alpine Fault NZ',
    lat: -43.500,
    lng: 170.000,
    slipRate: 27,
    creep: 5,
    stress: 18.5,
    recurrence: 300,
    status: 'critical',
    description: 'Major plate boundary Alpine Fault in New Zealand nearing end of its seismic cycle with high stress',
  },
  {
    id: 'fl-anatolian',
    name: 'Anatolian Fault',
    lat: 39.000,
    lng: 33.000,
    slipRate: 22,
    creep: 12,
    stress: 11.8,
    recurrence: 250,
    status: 'warning',
    description: 'Active right lateral Anatolian Fault system showing creep and elevated stress near major population centers',
  },
  {
    id: 'fl-riftvalley',
    name: 'Rift Valley Fault',
    lat: -3.000,
    lng: 36.000,
    slipRate: 8,
    creep: 4,
    stress: 6.4,
    recurrence: 450,
    status: 'moderate',
    description: 'East African Rift Valley normal fault system with slow extension and moderate seismic hazard potential',
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

export function FaultLineActivity() {
  const state = useMapStore((s) => s.faultLineActivity)
  const setState = useMapStore((s) => s.setFaultLineActivity)

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
      return { faults: 0, avgSlip: 0, avgCreep: 0, maxStress: 0 }
    }
    const avgSlip = filteredItems.reduce((sum, e) => sum + (e.slipRate as number), 0) / filteredItems.length
    const avgCreep = filteredItems.reduce((sum, e) => sum + (e.creep as number), 0) / filteredItems.length
    const maxStress = Math.max(...filteredItems.map((e) => e.stress as number))
    return {
      faults: filteredItems.length,
      avgSlip: avgSlip.toFixed(1),
      avgCreep: avgCreep.toFixed(1),
      maxStress: maxStress.toFixed(1),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setFaultLineActivity({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-600/95 to-violet-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SplitIcon4 className="h-4 w-4 text-purple-200" />
              Fault Line Activity
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
              <div className="text-[10px] text-slate-400/70">Faults</div>
              <div className="text-sm font-semibold text-purple-200">{summary.faults}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Slip Rate</div>
              <div className="text-sm font-semibold text-violet-200">{summary.avgSlip}</div>
              <div className="text-[9px] text-slate-400/60">avg mm/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Creep</div>
              <div className="text-sm font-semibold text-fuchsia-200">{summary.avgCreep}</div>
              <div className="text-[9px] text-slate-400/60">avg mm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Stress</div>
              <div className="text-sm font-semibold text-slate-200">{summary.maxStress}</div>
              <div className="text-[9px] text-slate-400/60">max MPa</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Fault Zones ({filteredItems.length})
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
                          Slip Rate: <span className="text-slate-100 font-medium">{e.slipRate} mm/yr</span>
                        </div>
                        <div>
                          Creep: <span className="text-slate-100 font-medium">{e.creep} mm</span>
                        </div>
                        <div>
                          Stress: <span className="text-slate-100 font-medium">{e.stress} MPa</span>
                        </div>
                        <div>
                          Recurrence: <span className="text-slate-100 font-medium">{e.recurrence} yrs</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No fault zones match the current filter.
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
                    <span className="text-slate-400/70">Slip Rate: </span>
                    <span className="font-medium text-purple-200">{activeItem.slipRate as number} mm/yr</span>
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
