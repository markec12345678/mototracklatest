'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useMapStore, type MonitorData } from '@/lib/map-store'
import { CircleDot as CircleDotIcon4, X, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MonitorData[] = [
  {
    id: 'pm-delhi',
    name: 'Delhi Winter',
    lat: 28.614,
    lng: 77.209,
    pm25: 285,
    pm10: 412,
    aqi: 425,
    visibilityKm: 0.8,
    status: 'critical',
    description: 'Severe winter smog episode in Delhi from stubble burning, vehicular, and industrial emissions trapped by inversion',
  },
  {
    id: 'pm-beijing',
    name: 'Beijing Spring',
    lat: 39.904,
    lng: 116.407,
    pm25: 168,
    pm10: 312,
    aqi: 238,
    visibilityKm: 2.4,
    status: 'warning',
    description: 'Spring dust storms combined with industrial emissions affecting Beijing and the North China Plain',
  },
  {
    id: 'pm-cairo',
    name: 'Cairo Basin',
    lat: 30.044,
    lng: 31.236,
    pm25: 142,
    pm10: 245,
    aqi: 198,
    visibilityKm: 3.1,
    status: 'warning',
    description: 'Cairo urban basin with persistent particulate pollution from traffic, industry, and open burning',
  },
  {
    id: 'pm-lahore',
    name: 'Lahore Winter',
    lat: 31.55,
    lng: 74.35,
    pm25: 312,
    pm10: 468,
    aqi: 468,
    visibilityKm: 0.5,
    status: 'critical',
    description: 'Hazardous winter particulate levels in Lahore from brick kilns, transport, and crop residue burning',
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

export function ParticulateMatterMonitor() {
  const state = useMapStore((s) => s.particulateMatterTrack119)
  const setState = useMapStore((s) => s.setParticulateMatterTrack119)

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
      return { avgPm25: 0, avgPm10: 0, avgAqi: 0, avgVis: 0 }
    }
    const avgPm25 = filteredItems.reduce((sum, e) => sum + (e.pm25 as number), 0) / filteredItems.length
    const avgPm10 = filteredItems.reduce((sum, e) => sum + (e.pm10 as number), 0) / filteredItems.length
    const avgAqi = filteredItems.reduce((sum, e) => sum + (e.aqi as number), 0) / filteredItems.length
    const avgVis = filteredItems.reduce((sum, e) => sum + (e.visibilityKm as number), 0) / filteredItems.length
    return {
      avgPm25: avgPm25.toFixed(0),
      avgPm10: avgPm10.toFixed(0),
      avgAqi: avgAqi.toFixed(0),
      avgVis: avgVis.toFixed(1),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setParticulateMatterTrack119({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-600/95 to-amber-700/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CircleDotIcon4 className="h-4 w-4 text-stone-200" />
              Particulate Matter Monitor
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
              <div className="text-[10px] text-slate-400/70">PM2.5</div>
              <div className="text-sm font-semibold text-stone-200">{summary.avgPm25}</div>
              <div className="text-[9px] text-slate-400/60">ug/m3 avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">PM10</div>
              <div className="text-sm font-semibold text-amber-200">{summary.avgPm10}</div>
              <div className="text-[9px] text-slate-400/60">ug/m3 avg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">AQI</div>
              <div className="text-sm font-semibold text-orange-200">{summary.avgAqi}</div>
              <div className="text-[9px] text-slate-400/60">avg index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Visibility</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgVis}</div>
              <div className="text-[9px] text-slate-400/60">km avg</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              PM Stations ({filteredItems.length})
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
                          PM2.5: <span className="text-slate-100 font-medium">{e.pm25 as number} ug/m3</span>
                        </div>
                        <div>
                          PM10: <span className="text-slate-100 font-medium">{e.pm10 as number} ug/m3</span>
                        </div>
                        <div>
                          AQI: <span className="text-slate-100 font-medium">{e.aqi as number}</span>
                        </div>
                        <div>
                          Vis: <span className="text-slate-100 font-medium">{e.visibilityKm as number} km</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No stations match the current filter.
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
                    <span className="text-slate-400/70">PM2.5: </span>
                    <span className="font-medium text-stone-200">{activeItem.pm25 as number} ug/m3</span>
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
