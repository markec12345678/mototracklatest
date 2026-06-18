'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cin-amc',
    name: 'AMC Times Square',
    lat: 40.756,
    lng: -73.988,
    status: 'critical',
    value: 98,
    seatsFilled: 98,
    showsRunning: 24,
    ticketsSold: 4200,
    avgRating: 4.5,
    trend: 'up' as const,
    description: 'Sold out opening weekend with packed IMAX screens and zero walk-in availability',
  },
  {
    id: 'cin-odeon',
    name: 'Odeon Leicester Sq',
    lat: 51.5103,
    lng: -0.13,
    status: 'warning',
    value: 87,
    seatsFilled: 87,
    showsRunning: 18,
    ticketsSold: 3100,
    avgRating: 4.6,
    trend: 'up' as const,
    description: 'Near full premiere night with limited premium seating for blockbuster releases',
  },
  {
    id: 'cin-toho',
    name: 'Toho Cinemas Shibuya',
    lat: 35.658,
    lng: 139.7016,
    status: 'moderate',
    value: 62,
    seatsFilled: 62,
    showsRunning: 22,
    ticketsSold: 2600,
    avgRating: 4.4,
    trend: 'stable' as const,
    description: 'Moderate matinee attendance with comfortable seat selection across standard screens',
  },
  {
    id: 'cin-ugc',
    name: 'UGC Cine Paris',
    lat: 48.8662,
    lng: 2.347,
    status: 'stable',
    value: 28,
    seatsFilled: 28,
    showsRunning: 14,
    ticketsSold: 980,
    avgRating: 4.2,
    trend: 'down' as const,
    description: 'Low Tuesday afternoon turnout with mostly empty screens and easy walk-in seating',
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

export function CinemaTheaterAttendanceMonitor() {
  const state = useMapStore((s) => s.cinemaTheaterAttendance)
  const setState = useMapStore((s) => s.setCinemaTheaterAttendance)

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
    if (filteredData.length === 0) return { avgSeats: 0, totalShows: 0, totalTickets: 0, avgRating: 0 }
    const avgSeats = filteredData.reduce((s: number, d: any) => s + (d.seatsFilled as number), 0) / filteredData.length
    const totalShows = filteredData.reduce((s: number, d: any) => s + (d.showsRunning as number), 0)
    const totalTickets = filteredData.reduce((s: number, d: any) => s + (d.ticketsSold as number), 0)
    const avgRating = filteredData.reduce((s: number, d: any) => s + (d.avgRating as number), 0) / filteredData.length
    return {
      avgSeats: avgSeats.toFixed(0),
      totalShows: totalShows.toLocaleString(),
      totalTickets: totalTickets.toLocaleString(),
      avgRating: avgRating.toFixed(1),
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

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎬</span>
          <h3 className="text-sm font-semibold text-white">Cinema &amp; Theater Attendance Monitor</h3>
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
            <div className="text-slate-400">Seats Filled %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSeats}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Shows Running</div>
            <div className="text-sm font-semibold text-white">{metrics.totalShows}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Tickets Sold</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTickets}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Rating</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRating}</div>
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
                <span className="text-xs text-slate-300">{loc.value}%</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value}% seats filled</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
