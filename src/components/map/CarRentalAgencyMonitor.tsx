'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cr-enterprise',
    name: 'Enterprise NYC JFK',
    lat: 40.641,
    lng: -73.778,
    status: 'stable',
    value: 92,
    carsAvailable: 285,
    dailyRentals: 78,
    fleetUtilizationPct: 84,
    trend: 'up' as const,
    description: 'Enterprise Rent-A-Car JFK airport location with 285-vehicle fleet, 78 daily rentals and 84% utilization including luxury and EV classes',
  },
  {
    id: 'cr-hertz',
    name: 'Hertz LAX Airport',
    lat: 33.942,
    lng: -118.408,
    status: 'moderate',
    value: 78,
    carsAvailable: 410,
    dailyRentals: 95,
    fleetUtilizationPct: 71,
    trend: 'stable' as const,
    description: 'Hertz LAX airport location with 410-vehicle fleet and 95 daily rentals, recovering from bankruptcy reorganization',
  },
  {
    id: 'cr-avis',
    name: 'Avis Chicago OHare',
    lat: 41.974,
    lng: -87.907,
    status: 'stable',
    value: 86,
    carsAvailable: 320,
    dailyRentals: 82,
    fleetUtilizationPct: 79,
    trend: 'up' as const,
    description: 'Avis Chicago OHare airport location with 320 vehicles and 82 daily rentals including commercial and loyalty program tiers',
  },
  {
    id: 'cr-budget',
    name: 'Budget Miami Airport',
    lat: 25.795,
    lng: -80.287,
    status: 'warning',
    value: 64,
    carsAvailable: 245,
    dailyRentals: 58,
    fleetUtilizationPct: 62,
    trend: 'down' as const,
    description: 'Budget Miami Airport facing reduced demand with 245-vehicle fleet, 58 daily rentals and 62% utilization in off-season',
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

export function CarRentalAgencyMonitor() {
  const state = useMapStore((s) => s.carRentalAgency)
  const setState = useMapStore((s) => s.setCarRentalAgency)

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
    if (filteredData.length === 0) return { totalFleet: 0, totalRentals: 0, avgUtilization: '0%', idleCars: 0 }
    const totalFleet = filteredData.reduce((s: number, d: any) => s + (d.carsAvailable as number), 0)
    const totalRentals = filteredData.reduce((s: number, d: any) => s + (d.dailyRentals as number), 0)
    const avgUtilization = filteredData.reduce((s: number, d: any) => s + (d.fleetUtilizationPct as number), 0) / filteredData.length
    const idleCars = Math.round(totalFleet * (1 - avgUtilization / 100))
    return {
      totalFleet,
      totalRentals,
      avgUtilization: avgUtilization.toFixed(0) + '%',
      idleCars,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-700 to-indigo-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128273;</span>
          <h3 className="text-sm font-semibold text-white">Car Rental Agency</h3>
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
            <div className="text-slate-400">Total Fleet</div>
            <div className="text-sm font-semibold text-white">{metrics.totalFleet}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Rentals</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRentals}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.avgUtilization}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Idle Cars</div>
            <div className="text-sm font-semibold text-white">{metrics.idleCars}</div>
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
                <span className="text-xs text-slate-300">{loc.fleetUtilizationPct}%</span>
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
              <span className="text-slate-300 font-medium">{activeItem.carsAvailable} fleet, {activeItem.dailyRentals} rentals/day, {activeItem.fleetUtilizationPct}% utilization</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
