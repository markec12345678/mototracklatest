'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'lm-atlanta',
    name: 'Atlanta UPS Hub',
    lat: 33.65,
    lng: -84.43,
    status: 'stable',
    value: 185000,
    parcelsDay: 185000,
    vehiclesDispatched: 320,
    onTimePct: 96,
    avgRouteMin: 142,
    trend: 'up' as const,
    description: 'Southeast regional hub completing delivery dispatch with route optimization algorithms sustaining high on-time performance',
  },
  {
    id: 'lm-berlin',
    name: 'Berlin DHL Hub',
    lat: 52.52,
    lng: 13.40,
    status: 'warning',
    value: 142000,
    parcelsDay: 142000,
    vehiclesDispatched: 248,
    onTimePct: 88,
    avgRouteMin: 168,
    trend: 'down' as const,
    description: 'Urban delivery fleet challenged by city center access restrictions and construction detours extending route completion times',
  },
  {
    id: 'lm-saopaulo',
    name: 'Sao Paulo Metro',
    lat: -23.55,
    lng: -46.63,
    status: 'moderate',
    value: 98000,
    parcelsDay: 98000,
    vehiclesDispatched: 186,
    onTimePct: 82,
    avgRouteMin: 195,
    trend: 'stable' as const,
    description: 'Mega-city last mile operations coping with dense traffic using motorcycle courier fleet for time-critical deliveries',
  },
  {
    id: 'lm-tokyo',
    name: 'Tokyo Sagawa Hub',
    lat: 35.68,
    lng: 139.76,
    status: 'stable',
    value: 210000,
    parcelsDay: 210000,
    vehiclesDispatched: 412,
    onTimePct: 98,
    avgRouteMin: 128,
    trend: 'up' as const,
    description: 'Hyper-efficient urban delivery network leveraging train-based trunk movement with electric walker vehicles for final delivery',
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
  if (trend === 'down') return <span className="text-red-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function LastMileDeliveryHubMonitor() {
  const state = useMapStore((s) => s.lastMileDeliveryHub)
  const setState = useMapStore((s) => s.setLastMileDeliveryHub)

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
    if (filteredData.length === 0) return { parcelsDay: 0, vehiclesDispatched: 0, onTimePct: 0, avgRouteMin: 0 }
    const parcelsDay = filteredData.reduce((s: number, d: any) => s + (d.parcelsDay as number), 0)
    const vehiclesDispatched = filteredData.reduce((s: number, d: any) => s + (d.vehiclesDispatched as number), 0)
    const onTimePct = filteredData.reduce((s: number, d: any) => s + (d.onTimePct as number), 0) / filteredData.length
    const avgRouteMin = filteredData.reduce((s: number, d: any) => s + (d.avgRouteMin as number), 0) / filteredData.length
    return {
      parcelsDay: parcelsDay.toLocaleString(),
      vehiclesDispatched: vehiclesDispatched.toLocaleString(),
      onTimePct: onTimePct.toFixed(0) + '%',
      avgRouteMin: avgRouteMin.toFixed(0) + ' min',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128666;</span>
          <h3 className="text-sm font-semibold text-white">Last Mile Delivery Hub</h3>
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
            <div className="text-slate-400">Parcels/day</div>
            <div className="text-sm font-semibold text-white">{metrics.parcelsDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Vehicles Out</div>
            <div className="text-sm font-semibold text-white">{metrics.vehiclesDispatched}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">On-Time %</div>
            <div className="text-sm font-semibold text-white">{metrics.onTimePct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Route</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRouteMin}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} parcels/day delivered</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
