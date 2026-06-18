'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'arena-msg',
    name: 'Madison Square Garden NYC',
    lat: 40.7505,
    lng: -73.9934,
    status: 'critical',
    value: 129500,
    events: 7,
    avgAttendance: 18500,
    ticketsSold: 129500,
    revenueM: 9.8,
    trend: 'up' as const,
    description: 'Sold out week with seven consecutive events including concerts and a Knicks playoff series',
  },
  {
    id: 'arena-o2',
    name: 'O2 Arena London',
    lat: 51.503,
    lng: 0.0032,
    status: 'warning',
    value: 80000,
    events: 5,
    avgAttendance: 16000,
    ticketsSold: 80000,
    revenueM: 5.2,
    trend: 'up' as const,
    description: 'High demand week with multiple chart-topping artists and limited tickets still available',
  },
  {
    id: 'arena-staples',
    name: 'Staples Center LA',
    lat: 34.043,
    lng: -118.267,
    status: 'moderate',
    value: 56000,
    events: 4,
    avgAttendance: 14000,
    ticketsSold: 56000,
    revenueM: 3.8,
    trend: 'stable' as const,
    description: 'Normal schedule with a Clippers game, two concerts, and a family show at typical attendance',
  },
  {
    id: 'arena-scotiabank',
    name: 'Scotiabank Toronto',
    lat: 43.6436,
    lng: -79.3791,
    status: 'stable',
    value: 19000,
    events: 2,
    avgAttendance: 9500,
    ticketsSold: 19000,
    revenueM: 1.2,
    trend: 'down' as const,
    description: 'Slow week with only two minor events and plenty of seating available across the venue',
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

export function ArenaEventMonitor() {
  const state = useMapStore((s) => s.arenaEventMonitor)
  const setState = useMapStore((s) => s.setArenaEventMonitor)

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
    if (filteredData.length === 0) return { totalEvents: 0, avgAttendance: 0, totalTickets: 0, totalRevenue: 0 }
    const totalEvents = filteredData.reduce((s: number, d: any) => s + (d.events as number), 0)
    const avgAttendance = filteredData.reduce((s: number, d: any) => s + (d.avgAttendance as number), 0) / filteredData.length
    const totalTickets = filteredData.reduce((s: number, d: any) => s + (d.ticketsSold as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.revenueM as number), 0)
    return {
      totalEvents: totalEvents.toLocaleString(),
      avgAttendance: avgAttendance.toFixed(0),
      totalTickets: totalTickets.toLocaleString(),
      totalRevenue: totalRevenue.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎪</span>
          <h3 className="text-sm font-semibold text-white">Arena Event Monitor</h3>
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
            <div className="text-slate-400">Events This Week</div>
            <div className="text-sm font-semibold text-white">{metrics.totalEvents}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Attendance</div>
            <div className="text-sm font-semibold text-white">{metrics.avgAttendance}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Tickets Sold</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTickets}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} tickets</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
