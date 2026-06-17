'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mwc-wm',
    name: 'Waste Management Inc. Houston TX HQ',
    lat: 29.760,
    lng: -95.369,
    status: 'stable',
    value: 92,
    tonsPerDay: 720,
    routesDaily: 18,
    householdsServed: 125000,
    diversionRate: 38,
    fleetType: 'CNG + Electric Pilots',
    trend: 'up' as const,
    description: 'Waste Management Inc. Houston headquarters, 720 tons/day across 18 routes serving 125K households with CNG fleet and 38% diversion rate',
  },
  {
    id: 'mwc-republic',
    name: 'Republic Services Phoenix AZ',
    lat: 33.448,
    lng: -112.074,
    status: 'stable',
    value: 88,
    tonsPerDay: 480,
    routesDaily: 14,
    householdsServed: 88000,
    diversionRate: 34,
    fleetType: 'CNG Fleet',
    trend: 'stable' as const,
    description: 'Republic Services Phoenix depot, 480 tons/day across 14 routes serving 88K households with compressed natural gas fleet',
  },
  {
    id: 'mwc-casella',
    name: 'Casella Waste Systems Rutland VT',
    lat: 43.611,
    lng: -72.973,
    status: 'moderate',
    value: 74,
    tonsPerDay: 185,
    routesDaily: 9,
    householdsServed: 41000,
    diversionRate: 52,
    fleetType: 'Diesel Hybrid',
    trend: 'up' as const,
    description: 'Casella Waste Systems Rutland VT depot, 185 tons/day serving 41K households with 52% diversion rate — leading Northeast recovery',
  },
  {
    id: 'mwc-gfl',
    name: 'GFL Environmental Toronto ON',
    lat: 43.651,
    lng: -79.347,
    status: 'warning',
    value: 61,
    tonsPerDay: 310,
    routesDaily: 12,
    householdsServed: 62000,
    diversionRate: 28,
    fleetType: 'Diesel',
    trend: 'down' as const,
    description: 'GFL Environmental Toronto depot, 310 tons/day serving 62K households with older diesel fleet and 28% diversion rate needs modernization',
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

export function MunicipalWasteCollectionMonitor() {
  const state = useMapStore((s) => s.municipalWasteCollection)
  const setState = useMapStore((s) => s.setMunicipalWasteCollection)

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
    if (filteredData.length === 0) return { totalTons: 0, totalRoutes: 0, avgDiversion: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tonsPerDay as number), 0)
    const totalRoutes = filteredData.reduce((s: number, d: any) => s + (d.routesDaily as number), 0)
    const avgDiversion = Math.round(filteredData.reduce((s: number, d: any) => s + (d.diversionRate as number), 0) / filteredData.length)
    return { totalTons, totalRoutes, avgDiversion }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128666;</span>
          <h3 className="text-sm font-semibold text-white">Municipal Waste Collection</h3>
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
            <div className="text-slate-400">Routes Daily</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRoutes}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Diversion</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDiversion}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Depots</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.fleetType}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.tonsPerDay} t/d</span>
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
              {activeItem.tonsPerDay} t/day &middot; {activeItem.routesDaily} routes &middot; {(activeItem.householdsServed / 1000).toFixed(0)}K households
              &nbsp;&middot;&nbsp; {activeItem.diversionRate}% diversion
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
