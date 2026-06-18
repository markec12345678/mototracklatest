'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'vr-tuscany-villa',
    name: 'Villa Toscana San Gimignano',
    lat: 43.468,
    lng: 11.043,
    status: 'stable',
    value: 92,
    bookingPct: 92,
    totalProperties: 24,
    avgNightly: 340,
    trend: 'up' as const,
    description: 'Pool villa portfolio in Tuscany hills near San Gimignano with 24 stone farmhouses renovated for luxury short-term rentals',
  },
  {
    id: 'vr-aspen-cabin',
    name: 'Aspen Chalet Collection',
    lat: 39.191,
    lng: -106.817,
    status: 'moderate',
    value: 79,
    bookingPct: 79,
    totalProperties: 48,
    avgNightly: 890,
    trend: 'stable' as const,
    description: 'Ski-in ski-out luxury cabin portfolio in Aspen Snowmass with 48 properties, hot tubs and ski concierge services',
  },
  {
    id: 'vr-santorini',
    name: 'Santorini Cave Houses',
    lat: 36.462,
    lng: 25.376,
    status: 'stable',
    value: 96,
    bookingPct: 96,
    totalProperties: 35,
    avgNightly: 520,
    trend: 'up' as const,
    description: 'Oia caldera cliff cave house portfolio with 35 luxury properties, plunge pools and sunset views over Aegean Sea',
  },
  {
    id: 'vr-tokyo-loft',
    name: 'Tokyo Design Loft',
    lat: 35.658,
    lng: 139.701,
    status: 'warning',
    value: 65,
    bookingPct: 65,
    totalProperties: 62,
    avgNightly: 185,
    trend: 'down' as const,
    description: 'Shibuya design apartment portfolio with 62 units facing new Japan minpaku regulations reducing booking velocity',
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

export function VacationRentalPropertyMonitor() {
  const state = useMapStore((s) => s.vacationRentalProperty)
  const setState = useMapStore((s) => s.setVacationRentalProperty)

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
    if (filteredData.length === 0) return { avgBooking: '0', totalProps: 0, avgRate: 0 }
    const avgBooking = filteredData.reduce((s: number, d: any) => s + (d.bookingPct as number), 0) / filteredData.length
    const totalProps = filteredData.reduce((s: number, d: any) => s + (d.totalProperties as number), 0)
    const avgRate = filteredData.reduce((s: number, d: any) => s + (d.avgNightly as number), 0) / filteredData.length
    return {
      avgBooking: avgBooking.toFixed(0) + '%',
      totalProps,
      avgRate: '$' + avgRate.toFixed(0),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-600 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127969;</span>
          <h3 className="text-sm font-semibold text-white">Vacation Rental Property</h3>
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
            <div className="text-slate-400">Total Properties</div>
            <div className="text-sm font-semibold text-white">{metrics.totalProps}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Nightly</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Stay</div>
            <div className="text-sm font-semibold text-white">4.2 nights</div>
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
                <span className="text-xs text-slate-300">{loc.totalProperties}p</span>
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
              <span className="text-slate-300 font-medium">{activeItem.bookingPct}% booked, {activeItem.totalProperties} properties, ${activeItem.avgNightly}/night avg</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
