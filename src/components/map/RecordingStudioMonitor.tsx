'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'rs-electric',
    name: 'Electric Lady Studios NYC',
    lat: 40.727,
    lng: -74.002,
    status: 'stable',
    value: 92,
    hourlyRate: 2500,
    studiosActive: 2,
    bookingMonths: 8,
    console: 'API Legacy AXS, Neve 8068',
    trend: 'up' as const,
    description: 'Electric Lady Studios Greenwich Village NYC (Jimi Hendrix founded), 2 active studios at $2,500/hr with 8 months booking lead',
  },
  {
    id: 'rs-capitol',
    name: 'Capitol Studios Hollywood CA',
    lat: 34.095,
    lng: -118.326,
    status: 'stable',
    value: 89,
    hourlyRate: 2200,
    studiosActive: 2,
    bookingMonths: 6,
    console: 'Neve 88RS, SSL Duality',
    trend: 'stable' as const,
    description: 'Capitol Studios Hollywood CA in Capitol Tower, 2 active studios with Neve 88RS and echo chambers at $2,200/hr',
  },
  {
    id: 'rs-abbey',
    name: 'Abbey Road Studios London UK',
    lat: 51.532,
    lng: -0.178,
    status: 'moderate',
    value: 78,
    hourlyRate: 1800,
    studiosActive: 3,
    bookingMonths: 5,
    console: 'EMI REDD, TG12345, SSL',
    trend: 'stable' as const,
    description: 'Abbey Road Studios London UK Studio Two, 3 active studios with historic EMI consoles — heritage tourism offsets recording revenue',
  },
  {
    id: 'rs-blackbird',
    name: 'Blackbird Studio Nashville TN',
    alt: 'Nashville',
    lat: 36.110,
    lng: -86.789,
    status: 'warning',
    value: 62,
    hourlyRate: 1500,
    studiosActive: 2,
    bookingMonths: 3,
    console: 'API 1608, Neve Genesys',
    trend: 'down' as const,
    description: 'Blackbird Studio Nashville TN, 2 active studios at $1,500/hr — facing competition from home studio trend post-pandemic',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function RecordingStudioMonitor() {
  const state = useMapStore((s) => s.recordingStudio)
  const setState = useMapStore((s) => s.setRecordingStudio)

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
    if (filteredData.length === 0) return { avgRate: 0, totalStudios: 0, avgBooking: 0 }
    const avgRate = Math.round(filteredData.reduce((s: number, d: any) => s + (d.hourlyRate as number), 0) / filteredData.length)
    const totalStudios = filteredData.reduce((s: number, d: any) => s + (d.studiosActive as number), 0)
    const avgBooking = Math.round(filteredData.reduce((s: number, d: any) => s + (d.bookingMonths as number), 0) / filteredData.length)
    return { avgRate, totalStudios, avgBooking }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700 to-purple-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127908;</span>
          <h3 className="text-sm font-semibold text-white">Recording Studio</h3>
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
            <div className="text-slate-400">Avg Hourly Rate</div>
            <div className="text-sm font-semibold text-white">${metrics.avgRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Studios Active</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStudios}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Booking</div>
            <div className="text-sm font-semibold text-white">{metrics.avgBooking} mo</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Facilities</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.console}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.hourlyRate / 100).toFixed(0)}00/hr</span>
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
              ${activeItem.hourlyRate.toLocaleString()}/hr &middot; {activeItem.studiosActive} studios active &middot; {activeItem.bookingMonths} mo booking
              &nbsp;&middot;&nbsp; {activeItem.console}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
