'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { CloudRain as CloudRainIcon9, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'fc-netherlands',
    name: 'Netherlands Delta',
    lat: 51.500,
    lng: 4.000,
    pumpCapacity: 54000,
    gateStatus: 'closed',
    waterLevelM: 2.4,
    alertLevel: 'low',
    status: 'stable',
    description: 'Delta Works flood barrier network protecting lowlands from North Sea storm surge',
  },
  {
    id: 'fc-bangladesh',
    name: 'Bangladesh Delta',
    lat: 23.700,
    lng: 90.350,
    pumpCapacity: 18200,
    gateStatus: 'open',
    waterLevelM: 6.8,
    alertLevel: 'high',
    status: 'critical',
    description: 'Ganges-Brahmaputra delta with monsoon-driven flooding and embankment network',
  },
  {
    id: 'fc-tokyo',
    name: 'Tokyo Flood',
    lat: 35.682,
    lng: 139.692,
    pumpCapacity: 78000,
    gateStatus: 'standby',
    waterLevelM: 3.2,
    alertLevel: 'medium',
    status: 'warning',
    description: 'World largest underground discharge channel protecting Tokyo metro from typhoons',
  },
  {
    id: 'fc-neworleans',
    name: 'New Orleans',
    lat: 29.951,
    lng: -90.071,
    pumpCapacity: 41000,
    gateStatus: 'standby',
    waterLevelM: 4.1,
    alertLevel: 'medium',
    status: 'moderate',
    description: 'Hurricane storm surge protection system with pump stations and levee closures',
  },
]

const STATUS_COLORS: Record<string, { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const ALERT_COLORS: Record<string, string> = {
  high: 'text-red-300',
  medium: 'text-amber-300',
  low: 'text-green-300',
}

const GATE_COLORS: Record<string, string> = {
  closed: 'text-green-300',
  standby: 'text-amber-300',
  open: 'text-red-300',
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.stable
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function FloodControlSystemMonitor() {
  const state = useMapStore((s) => s.floodControlSystem)
  const setState = useMapStore((s) => s.setFloodControlSystem)

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
      return { totalPump: 0, avgWater: 0, openCount: 0, maxAlert: 'low' }
    }
    const totalPump = filteredItems.reduce((sum, e) => sum + (e.pumpCapacity as number), 0)
    const avgWater = filteredItems.reduce((sum, e) => sum + (e.waterLevelM as number), 0) / filteredItems.length
    const openCount = filteredItems.filter((e) => (e.gateStatus as string) === 'open').length
    const alertOrder = ['high', 'medium', 'low']
    let maxAlert = 'low'
    filteredItems.forEach((e) => {
      if (alertOrder.indexOf(e.alertLevel as string) < alertOrder.indexOf(maxAlert)) {
        maxAlert = e.alertLevel as string
      }
    })
    return {
      totalPump: totalPump.toLocaleString(),
      avgWater: avgWater.toFixed(1),
      openCount,
      maxAlert,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setFloodControlSystem({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-600/95 to-blue-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CloudRainIcon9 className="h-4 w-4 text-indigo-200" />
              Flood Control System Monitor
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
              <div className="text-[10px] text-slate-400/70">Pump Cap</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.totalPump}</div>
              <div className="text-[9px] text-slate-400/60">m3/hr total</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Water Lvl</div>
              <div className="text-sm font-semibold text-blue-200">{summary.avgWater}</div>
              <div className="text-[9px] text-slate-400/60">m avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Open Gates</div>
              <div className="text-sm font-semibold text-amber-200">{summary.openCount}</div>
              <div className="text-[9px] text-slate-400/60">discharging</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Max Alert</div>
              <div className={`text-sm font-semibold ${ALERT_COLORS[summary.maxAlert] ?? 'text-slate-200'}`}>{summary.maxAlert}</div>
              <div className="text-[9px] text-slate-400/60">overall</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Flood Systems ({filteredItems.length})
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
                          Pump: <span className="text-slate-100 font-medium">{(e.pumpCapacity as number).toLocaleString()} m3/hr</span>
                        </div>
                        <div>
                          Gate: <span className={`font-medium ${GATE_COLORS[e.gateStatus as string] ?? 'text-slate-100'}`}>{e.gateStatus as string}</span>
                        </div>
                        <div>
                          Water: <span className="text-slate-100 font-medium">{e.waterLevelM} m</span>
                        </div>
                        <div>
                          Alert: <span className={`font-medium ${ALERT_COLORS[e.alertLevel as string] ?? 'text-slate-100'}`}>{e.alertLevel as string}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No systems match the current filter.
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
                    <span className="text-slate-400/70">Water Level: </span>
                    <span className="font-medium text-blue-200">{activeItem.waterLevelM as number} m</span>
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
