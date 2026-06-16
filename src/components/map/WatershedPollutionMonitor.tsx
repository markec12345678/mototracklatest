'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Biohazard as BiohazardIcon2, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'wp-mississippi',
    name: 'Mississippi Basin',
    lat: 38.000,
    lng: -90.000,
    pollutionIndex: 78,
    sourceCount: 1240,
    affectedKm: 3200,
    trend: 'rising',
    status: 'critical',
    description: 'Agricultural runoff hypoxia zone in Gulf of Mexico with nitrate loading issues',
  },
  {
    id: 'wp-rhine',
    name: 'Rhine Basin',
    lat: 50.000,
    lng: 8.000,
    pollutionIndex: 42,
    sourceCount: 380,
    affectedKm: 870,
    trend: 'falling',
    status: 'moderate',
    description: 'Industrial legacy pollution recovering under strict EU water framework directives',
  },
  {
    id: 'wp-ganges',
    name: 'Ganges Basin',
    lat: 25.300,
    lng: 83.000,
    pollutionIndex: 86,
    sourceCount: 2100,
    affectedKm: 2520,
    trend: 'rising',
    status: 'critical',
    description: 'Sewage and industrial effluent contamination along sacred river system',
  },
  {
    id: 'wp-danube',
    name: 'Danube Basin',
    lat: 47.000,
    lng: 20.000,
    pollutionIndex: 54,
    sourceCount: 620,
    affectedKm: 1070,
    trend: 'stable',
    status: 'warning',
    description: 'Cross-border watershed with mixed agricultural and mining inputs under monitoring',
  },
]

const STATUS_COLORS: Record<string, { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

const TREND_COLORS: Record<string, string> = {
  rising: 'text-red-300',
  falling: 'text-green-300',
  stable: 'text-slate-300',
}

function TrendIcon({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? STATUS_COLORS.stable
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WatershedPollutionMonitor() {
  const state = useMapStore((s) => s.watershedPollution)
  const setState = useMapStore((s) => s.setWatershedPollution)

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
      return { avgIndex: 0, totalSources: 0, totalAffected: 0 }
    }
    const avgIndex = filteredItems.reduce((sum, e) => sum + (e.pollutionIndex as number), 0) / filteredItems.length
    const totalSources = filteredItems.reduce((sum, e) => sum + (e.sourceCount as number), 0)
    const totalAffected = filteredItems.reduce((sum, e) => sum + (e.affectedKm as number), 0)
    return {
      avgIndex: Math.round(avgIndex),
      totalSources: totalSources.toLocaleString(),
      totalAffected: totalAffected.toLocaleString(),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWatershedPollution({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-600/95 to-orange-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <BiohazardIcon2 className="h-4 w-4 text-amber-200" />
              Watershed Pollution Monitor
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
              <div className="text-[10px] text-slate-400/70">Pollution</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgIndex}</div>
              <div className="text-[9px] text-slate-400/60">index avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Sources</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalSources}</div>
              <div className="text-[9px] text-slate-400/60">count total</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Affected</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalAffected}</div>
              <div className="text-[9px] text-slate-400/60">km total</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{filteredItems.length}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Watersheds ({filteredItems.length})
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
                          Index: <span className="text-slate-100 font-medium">{e.pollutionIndex}</span>
                        </div>
                        <div>
                          Sources: <span className="text-slate-100 font-medium">{(e.sourceCount as number).toLocaleString()}</span>
                        </div>
                        <div>
                          Affected: <span className="text-slate-100 font-medium">{(e.affectedKm as number).toLocaleString()} km</span>
                        </div>
                        <div>
                          Trend: <span className={`font-medium ${TREND_COLORS[e.trend as string] ?? 'text-slate-100'}`}>{e.trend as string}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No watersheds match the current filter.
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
                    <span className="text-slate-400/70">Pollution: </span>
                    <span className="font-medium text-amber-200">{activeItem.pollutionIndex as number}</span>
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
