'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'stad-wembley',
    name: 'Wembley London',
    lat: 51.556,
    lng: -0.2796,
    status: 'critical',
    value: 89000,
    attendance: 89000,
    capacityPct: 100,
    concessionK: 1250,
    exitsOpen: 12,
    trend: 'up' as const,
    description: 'At full capacity for the cup final with concession stands overwhelmed and all emergency exits manned',
  },
  {
    id: 'stad-campnou',
    name: 'Camp Nou Barcelona',
    lat: 41.3809,
    lng: 2.1228,
    status: 'warning',
    value: 95000,
    attendance: 95000,
    capacityPct: 96,
    concessionK: 1420,
    exitsOpen: 14,
    trend: 'up' as const,
    description: 'Near full for the El Clasico clash with high concession demand and additional exit lanes being prepared',
  },
  {
    id: 'stad-maracana',
    name: 'Maracana Rio',
    lat: -22.9121,
    lng: -43.2302,
    status: 'moderate',
    value: 55000,
    attendance: 55000,
    capacityPct: 70,
    concessionK: 680,
    exitsOpen: 10,
    trend: 'stable' as const,
    description: 'Moderate turnout for the league match with steady concession flow and standard exit operations',
  },
  {
    id: 'stad-att',
    name: 'AT&T Stadium Texas',
    lat: 32.7473,
    lng: -97.0945,
    status: 'stable',
    value: 25000,
    attendance: 25000,
    capacityPct: 32,
    concessionK: 320,
    exitsOpen: 8,
    trend: 'down' as const,
    description: 'Low attendance during preseason event with light concession traffic and minimal exit management',
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

export function StadiumCrowdMonitor() {
  const state = useMapStore((s) => s.stadiumCrowdMonitor)
  const setState = useMapStore((s) => s.setStadiumCrowdMonitor)

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
    if (filteredData.length === 0) return { totalAttendance: 0, avgCapacity: 0, totalConcession: 0, totalExits: 0 }
    const totalAttendance = filteredData.reduce((s: number, d: any) => s + (d.attendance as number), 0)
    const avgCapacity = filteredData.reduce((s: number, d: any) => s + (d.capacityPct as number), 0) / filteredData.length
    const totalConcession = filteredData.reduce((s: number, d: any) => s + (d.concessionK as number), 0)
    const totalExits = filteredData.reduce((s: number, d: any) => s + (d.exitsOpen as number), 0)
    return {
      totalAttendance: totalAttendance.toLocaleString(),
      avgCapacity: avgCapacity.toFixed(0) + '%',
      totalConcession: totalConcession.toLocaleString(),
      totalExits: totalExits.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏟️</span>
          <h3 className="text-sm font-semibold text-white">Stadium Crowd Monitor</h3>
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
            <div className="text-slate-400">Attendance</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAttendance}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Capacity %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgCapacity}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Concession $K</div>
            <div className="text-sm font-semibold text-white">{metrics.totalConcession}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Exits Open</div>
            <div className="text-sm font-semibold text-white">{metrics.totalExits}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} attendance</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
