'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ch-ussc',
    name: 'US Supreme Court',
    lat: 38.8906,
    lng: -77.0047,
    status: 'critical',
    value: 2,
    casesToday: 2,
    judgesActive: 9,
    avgDurationHr: 6.5,
    backlog: 7000,
    trend: 'up' as const,
    description: 'Merits docket argued under tight schedule with massive cert-petition backlog awaiting review',
  },
  {
    id: 'ch-oldbailey',
    name: 'Old Bailey London',
    lat: 51.5151,
    lng: -0.103,
    status: 'warning',
    value: 18,
    casesToday: 18,
    judgesActive: 24,
    avgDurationHr: 4.2,
    backlog: 1200,
    trend: 'up' as const,
    description: 'Central Criminal Court running heavy trial lists with sustained juror and chamber throughput',
  },
  {
    id: 'ch-icjhague',
    name: 'Hague ICJ',
    lat: 52.079,
    lng: 4.314,
    status: 'moderate',
    value: 3,
    casesToday: 3,
    judgesActive: 15,
    avgDurationHr: 7.8,
    backlog: 60,
    trend: 'stable' as const,
    description: 'International Court of Justice hearing contentions states with predictable oral-argument cadence',
  },
  {
    id: 'ch-tokyodistrict',
    name: 'Tokyo District Court',
    lat: 35.6895,
    lng: 139.6917,
    status: 'stable',
    value: 8,
    casesToday: 8,
    judgesActive: 12,
    avgDurationHr: 2.5,
    backlog: 200,
    trend: 'down' as const,
    description: 'Light docket with quick dispositions and minimal pending caseload across civil chambers',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function CourtHouseScheduleMonitor() {
  const state = useMapStore((s) => s.courtHouseSchedule)
  const setState = useMapStore((s) => s.setCourtHouseSchedule)

  useEffect(() => {
    if (state.data.length === 0) {
      setState({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length, setState])

  const filteredData = useMemo(() => {
    if (state.statusFilter === 'all') return state.data
    return state.data.filter((item: any) => item.status === state.statusFilter)
  }, [state.data, state.statusFilter])

  const metrics = useMemo(() => {
    if (filteredData.length === 0)
      return { casesToday: 0, judgesActive: 0, avgDurationHr: 0, backlog: 0 }
    const casesToday = filteredData.reduce((s: number, d: any) => s + (d.casesToday as number), 0)
    const judgesActive = filteredData.reduce((s: number, d: any) => s + (d.judgesActive as number), 0)
    const avgDurationHr =
      filteredData.reduce((s: number, d: any) => s + (d.avgDurationHr as number), 0) / filteredData.length
    const backlog = filteredData.reduce((s: number, d: any) => s + (d.backlog as number), 0)
    return {
      casesToday: casesToday.toLocaleString(),
      judgesActive: judgesActive.toLocaleString(),
      avgDurationHr: avgDurationHr.toFixed(1) + ' hr',
      backlog: backlog.toLocaleString(),
    }
  }, [filteredData])

  const geojson = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: filteredData.map((loc: any) => ({
        type: 'Feature' as const,
        properties: { name: loc.name, status: loc.status, value: loc.value },
        geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] },
      })),
    }),
    [filteredData]
  )

  void geojson

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-yellow-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <h3 className="text-sm font-semibold text-white">Court House Schedule Monitor</h3>
        </div>
        <button onClick={() => setState({ open: false })} className="text-white/80 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        <Select value={state.statusFilter} onValueChange={(v) => setState({ statusFilter: v })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 text-xs h-8">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cases Today</div>
            <div className="text-sm font-semibold text-white">{metrics.casesToday}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Judges Active</div>
            <div className="text-sm font-semibold text-white">{metrics.judgesActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Duration hr</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDurationHr}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Backlog</div>
            <div className="text-sm font-semibold text-white">{metrics.backlog}</div>
          </div>
        </div>

        <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
          {filteredData.map((loc: any) => (
            <div
              key={loc.id}
              onClick={() => setState({ activeItemId: loc.id })}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                state.activeItemId === loc.id ? 'bg-slate-700' : 'bg-slate-800/40 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${STATUS_COLORS[loc.status]}`} />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">{loc.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}</span>
                <TrendIcon trend={loc.trend} />
              </div>
            </div>
          ))}
        </div>

        {activeItem && (
          <div className="bg-slate-800/60 rounded p-2.5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-semibold text-white">{activeItem.name}</div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${STATUS_COLORS[activeItem.status]} text-white`}
              >
                {activeItem.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{activeItem.description}</div>
            <div className="mt-1.5 text-[10px] text-slate-500">
              Primary metric:{' '}
              <span className="text-slate-300 font-medium">
                {activeItem.value.toLocaleString()} cases today
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
