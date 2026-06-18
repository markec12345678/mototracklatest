'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bs-urban',
    name: 'UrbanSitter SF Bay Area',
    lat: 37.774,
    lng: -122.419,
    status: 'stable',
    value: 88,
    activeSitters: 412,
    bookingsThisWeek: 286,
    avgHourlyRate: 28,
    repeatClientPct: 64,
    trend: 'up' as const,
    description: 'UrbanSitter SF Bay Area with 412 active sitters, 286 weekly bookings and 64% repeat-client rate at $28/hr average',
  },
  {
    id: 'bs-sitter',
    name: 'Sittercity Marketplace NYC',
    lat: 40.744,
    lng: -73.985,
    status: 'stable',
    value: 82,
    activeSitters: 386,
    bookingsThisWeek: 248,
    avgHourlyRate: 25,
    repeatClientPct: 58,
    trend: 'stable' as const,
    description: 'Sittercity NYC marketplace with 386 active sitters, 248 weekly bookings and date-night specialization options',
  },
  {
    id: 'bs-bambino',
    name: 'Bambino Sitters LA',
    lat: 34.024,
    lng: -118.467,
    status: 'moderate',
    value: 74,
    activeSitters: 218,
    bookingsThisWeek: 142,
    avgHourlyRate: 22,
    repeatClientPct: 52,
    trend: 'up' as const,
    description: 'Bambino LA faith-community vetted sitters, 218 active with 142 weekly bookings and neighborhood trust circles',
  },
  {
    id: 'bs-helpr',
    name: 'Helpr Babysitting Atlanta',
    lat: 33.767,
    lng: -84.420,
    status: 'warning',
    value: 58,
    activeSitters: 96,
    bookingsThisWeek: 48,
    avgHourlyRate: 18,
    repeatClientPct: 42,
    trend: 'down' as const,
    description: 'Helpr Atlanta facing sitter recruitment challenges, 96 active sitters with 48 weekly bookings and reduced corporate backup care demand',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-amber-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function BabysittingServiceMonitor() {
  const state = useMapStore((s) => s.babysittingService)
  const setState = useMapStore((s) => s.setBabysittingService)

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
    if (filteredData.length === 0) return { totalSitters: 0, totalBookings: 0, avgRate: '$0', avgRepeat: '0%' }
    const totalSitters = filteredData.reduce((s: number, d: any) => s + (d.activeSitters as number), 0)
    const totalBookings = filteredData.reduce((s: number, d: any) => s + (d.bookingsThisWeek as number), 0)
    const avgRate = filteredData.reduce((s: number, d: any) => s + (d.avgHourlyRate as number), 0) / filteredData.length
    const avgRepeat = filteredData.reduce((s: number, d: any) => s + (d.repeatClientPct as number), 0) / filteredData.length
    return { totalSitters, totalBookings, avgRate: '$' + avgRate.toFixed(0), avgRepeat: avgRepeat.toFixed(0) + '%' }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-600 to-pink-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128150;</span>
          <h3 className="text-sm font-semibold text-white">Babysitting Service</h3>
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
            <div className="text-slate-400">Active Sitters</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSitters}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bookings / wk</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBookings}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Rate</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRate}/hr</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Repeat Clients</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRepeat}</div>
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
                <span className="text-xs text-slate-300">{loc.bookingsThisWeek}/wk</span>
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
              Avg rate: <span className="text-slate-300 font-medium">${activeItem.avgHourlyRate}/hr</span>
              &nbsp;&middot;&nbsp; {activeItem.activeSitters} sitters, {activeItem.bookingsThisWeek} bookings/wk, {activeItem.repeatClientPct}% repeat
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
