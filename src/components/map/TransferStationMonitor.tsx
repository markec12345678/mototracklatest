'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ts-sunset',
    name: 'Sims Sunset Park Transfer Brooklyn NY',
    lat: 40.648,
    lng: -74.019,
    status: 'stable',
    value: 90,
    tonsPerDay: 1800,
    trucksInDaily: 320,
    railCarsMonthly: 540,
    processingRate: 85,
    trend: 'up' as const,
    description: 'Sims Sunset Park Brooklyn NY waterfront transfer station, 1,800 t/day with 320 truck inputs and 540 rail cars/mo for export at 85% processing rate',
  },
  {
    id: 'ts-north',
    name: 'North Transfer Station Seattle WA',
    lat: 47.651,
    lng: -122.348,
    status: 'stable',
    value: 85,
    tonsPerDay: 900,
    trucksInDaily: 165,
    railCarsMonthly: 280,
    processingRate: 78,
    trend: 'stable' as const,
    description: 'North Transfer Station Seattle WA modern facility, 900 t/day with 165 truck inputs serving Seattle routes; rail-export to Columbia Ridge landfill',
  },
  {
    id: 'ts-sunsetpark',
    name: 'Sunset Park MRF Brooklyn NY',
    lat: 40.642,
    lng: -74.018,
    status: 'moderate',
    value: 72,
    tonsPerDay: 1100,
    trucksInDaily: 210,
    railCarsMonthly: 320,
    processingRate: 68,
    trend: 'stable' as const,
    description: 'Sunset Park MRF Brooklyn NY, 1,100 t/day handling NYC curbside recyclables with 68% processing rate; contamination at 18% needs reduction',
  },
  {
    id: 'ts-forttotten',
    name: 'DC Fort Totten Transfer Station Washington DC',
    lat: 38.952,
    lng: -77.002,
    status: 'warning',
    value: 58,
    tonsPerDay: 650,
    trucksInDaily: 95,
    railCarsMonthly: 145,
    processingRate: 62,
    trend: 'down' as const,
    description: 'DC Fort Totten Transfer Station Washington DC, 650 t/day with 62% processing rate — aging infrastructure causing throughput bottlenecks',
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

export function TransferStationMonitor() {
  const state = useMapStore((s) => s.transferStation)
  const setState = useMapStore((s) => s.setTransferStation)

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
    if (filteredData.length === 0) return { totalTons: 0, totalTrucks: 0, avgRate: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tonsPerDay as number), 0)
    const totalTrucks = filteredData.reduce((s: number, d: any) => s + (d.trucksInDaily as number), 0)
    const avgRate = Math.round(filteredData.reduce((s: number, d: any) => s + (d.processingRate as number), 0) / filteredData.length)
    return { totalTons, totalTrucks, avgRate }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128230;</span>
          <h3 className="text-sm font-semibold text-white">Transfer Station</h3>
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
            <div className="text-slate-400">Tons / Day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTons.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Trucks In</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTrucks}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Processing</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRate}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stations</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.trucksInDaily} trucks &middot; {loc.railCarsMonthly} rail/mo</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.processingRate}%</span>
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
              {activeItem.tonsPerDay.toLocaleString()} t/day &middot; {activeItem.trucksInDaily} trucks/day &middot; {activeItem.railCarsMonthly} rail cars/mo
              &nbsp;&middot;&nbsp; {activeItem.processingRate}% processing rate
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
