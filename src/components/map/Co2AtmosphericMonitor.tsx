'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { Cloud as CloudIcon7, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'co2-maunaloa',
    name: 'Mauna Loa',
    lat: 19.536,
    lng: -155.576,
    co2ppm: 421.4,
    ch4ppb: 1923,
    n2oppb: 336.7,
    growthRate: 2.4,
    status: 'critical',
    description: 'Keeling Curve observatory recording longest continuous CO2 record on Earth',
  },
  {
    id: 'co2-barrow',
    name: 'Barrow AK',
    lat: 71.323,
    lng: -156.612,
    co2ppm: 419.8,
    ch4ppb: 1895,
    n2oppb: 334.2,
    growthRate: 2.1,
    status: 'warning',
    description: 'Arctic monitoring station capturing high latitude carbon cycle signals',
  },
  {
    id: 'co2-capegrim',
    name: 'Cape Grim',
    lat: -40.683,
    lng: 144.689,
    co2ppm: 417.2,
    ch4ppb: 1857,
    n2oppb: 332.8,
    growthRate: 1.9,
    status: 'moderate',
    description: 'Baseline air monitoring in clean marine Southern Ocean air sector',
  },
  {
    id: 'co2-southpole',
    name: 'South Pole',
    lat: -89.998,
    lng: -139.0,
    co2ppm: 414.6,
    ch4ppb: 1722,
    n2oppb: 329.5,
    growthRate: 1.6,
    status: 'stable',
    description: 'Polar observatory tracking well mixed background greenhouse gas levels',
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

export function Co2AtmosphericMonitor() {
  const state = useMapStore((s) => s.co2Atmospheric)
  const setState = useMapStore((s) => s.setCo2Atmospheric)

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
      return { avgCo2: 0, avgCh4: 0, avgN2o: 0, avgGrowth: 0 }
    }
    const avgCo2 = filteredItems.reduce((sum, e) => sum + (e.co2ppm as number), 0) / filteredItems.length
    const avgCh4 = filteredItems.reduce((sum, e) => sum + (e.ch4ppb as number), 0) / filteredItems.length
    const avgN2o = filteredItems.reduce((sum, e) => sum + (e.n2oppb as number), 0) / filteredItems.length
    const avgGrowth = filteredItems.reduce((sum, e) => sum + (e.growthRate as number), 0) / filteredItems.length
    return {
      avgCo2: avgCo2.toFixed(1),
      avgCh4: Math.round(avgCh4),
      avgN2o: avgN2o.toFixed(1),
      avgGrowth: avgGrowth.toFixed(1),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCo2Atmospheric({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-gray-600/95 to-slate-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CloudIcon7 className="h-4 w-4 text-slate-200" />
              CO2 Atmospheric Monitor
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
              <div className="text-[10px] text-slate-400/70">CO2</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgCo2}</div>
              <div className="text-[9px] text-slate-400/60">ppm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">CH4</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgCh4}</div>
              <div className="text-[9px] text-slate-400/60">ppb</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">N2O</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgN2o}</div>
              <div className="text-[9px] text-slate-400/60">ppb</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Growth Rate</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgGrowth}</div>
              <div className="text-[9px] text-slate-400/60">ppm/yr</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Observation Sites ({filteredItems.length})
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
                          CO2: <span className="text-slate-100 font-medium">{e.co2ppm} ppm</span>
                        </div>
                        <div>
                          CH4: <span className="text-slate-100 font-medium">{e.ch4ppb} ppb</span>
                        </div>
                        <div>
                          N2O: <span className="text-slate-100 font-medium">{e.n2oppb} ppb</span>
                        </div>
                        <div>
                          Growth: <span className="text-slate-100 font-medium">{e.growthRate} ppm/yr</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-slate-400/70">CO2: </span>
                    <span className="font-medium text-slate-200">{activeItem.co2ppm} ppm</span>
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
