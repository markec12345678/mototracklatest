'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cc-mccormick',
    name: 'McCormick Place Chicago',
    lat: 41.851,
    lng: -87.616,
    status: 'stable',
    value: 82,
    bookingPct: 82,
    totalHalls: 4,
    exhibitionSqm: 246000,
    trend: 'up' as const,
    description: 'Largest convention center in North America with 4 interconnected halls, 2.6M sq ft exhibition space and Lakeside Center ballroom',
  },
  {
    id: 'cc-messe',
    name: 'Messe Frankfurt',
    lat: 50.105,
    lng: 8.648,
    status: 'stable',
    value: 89,
    bookingPct: 89,
    totalHalls: 11,
    exhibitionSqm: 366000,
    trend: 'stable' as const,
    description: 'World largest trade fair venue by exhibition area with 11 halls hosting Frankfurt Motor Show and Ambiente trade fairs',
  },
  {
    id: 'cc-sands',
    name: 'Sands Expo Singapore',
    lat: 1.283,
    lng: 103.859,
    status: 'moderate',
    value: 75,
    bookingPct: 75,
    totalHalls: 5,
    exhibitionSqm: 120000,
    trend: 'up' as const,
    description: 'Marina Bay Sands integrated resort convention center with 5 halls and 250,000 sq ft column-free ballroom',
  },
  {
    id: 'cc-canton',
    name: 'Canton Fair Complex',
    lat: 23.097,
    lng: 113.324,
    status: 'warning',
    value: 68,
    bookingPct: 68,
    totalHalls: 8,
    exhibitionSqm: 1100000,
    trend: 'down' as const,
    description: 'Guangzhou Pazhou complex hosting Canton Fair biannually with 8 halls and 1.1M sq m, reduced post-COVID international attendance',
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

export function ConventionCenterBookingMonitor() {
  const state = useMapStore((s) => s.conventionCenterBooking)
  const setState = useMapStore((s) => s.setConventionCenterBooking)

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
    if (filteredData.length === 0) return { avgBooking: '0', totalHalls: 0, totalSqm: 0 }
    const avgBooking = filteredData.reduce((s: number, d: any) => s + (d.bookingPct as number), 0) / filteredData.length
    const totalHalls = filteredData.reduce((s: number, d: any) => s + (d.totalHalls as number), 0)
    const totalSqm = filteredData.reduce((s: number, d: any) => s + (d.exhibitionSqm as number), 0)
    return {
      avgBooking: avgBooking.toFixed(0) + '%',
      totalHalls,
      totalSqm: (totalSqm / 1000).toFixed(0) + 'k sqm',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-700 to-indigo-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127881;</span>
          <h3 className="text-sm font-semibold text-white">Convention Center Booking</h3>
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
            <div className="text-slate-400">Avg Booking</div>
            <div className="text-sm font-semibold text-white">{metrics.avgBooking}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Halls</div>
            <div className="text-sm font-semibold text-white">{metrics.totalHalls}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Exhibition</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSqm}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Events/Year</div>
            <div className="text-sm font-semibold text-white">284</div>
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
                <span className="text-xs text-slate-300">{loc.bookingPct}%</span>
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
              <span className="text-slate-300 font-medium">{activeItem.bookingPct}% booked, {activeItem.totalHalls} halls, {activeItem.exhibitionSqm.toLocaleString()} sqm exhibition</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
