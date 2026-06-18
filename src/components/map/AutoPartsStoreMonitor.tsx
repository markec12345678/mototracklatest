'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ap-autozone',
    name: 'AutoZone Memphis HQ',
    lat: 35.149,
    lng: -90.052,
    status: 'stable',
    value: 91,
    customersPerDay: 245,
    partsSkus: 85000,
    dailyRevenue: 14200,
    trend: 'up' as const,
    description: 'AutoZone Memphis headquarters store with 85,000 SKUs, loaner tool program and 245 daily customers across automotive parts',
  },
  {
    id: 'ap-advance',
    name: 'Advance Auto Raleigh',
    lat: 35.779,
    lng: -78.638,
    status: 'stable',
    value: 86,
    customersPerDay: 210,
    partsSkus: 72000,
    dailyRevenue: 11800,
    trend: 'stable' as const,
    description: 'Advance Auto Parts Raleigh store with 72,000 SKUs, online order pickup and 210 daily DIY and commercial customers',
  },
  {
    id: 'ap-oreilly',
    name: 'OReilly Auto Springfield',
    lat: 37.209,
    lng: -93.292,
    status: 'moderate',
    value: 78,
    customersPerDay: 188,
    partsSkus: 68000,
    dailyRevenue: 10200,
    trend: 'up' as const,
    description: 'OReilly Auto Parts Springfield MO headquarters store with 68,000 SKUs serving 188 daily customers including pro mechanics',
  },
  {
    id: 'ap-napa',
    name: 'NAPA Auto Atlanta',
    lat: 33.767,
    lng: -84.521,
    status: 'warning',
    value: 64,
    customersPerDay: 145,
    partsSkus: 55000,
    dailyRevenue: 8600,
    trend: 'down' as const,
    description: 'NAPA Auto Parts Atlanta franchise facing supply chain delays with 55,000 SKUs and 145 daily customers',
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

export function AutoPartsStoreMonitor() {
  const state = useMapStore((s) => s.autoPartsStore)
  const setState = useMapStore((s) => s.setAutoPartsStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalSkus: 0, totalRevenue: '$0K', avgBasket: '$0' }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.customersPerDay as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.partsSkus as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.dailyRevenue as number), 0)
    const avgBasket = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
    return {
      totalCustomers,
      totalSkus,
      totalRevenue: '$' + (totalRevenue / 1000).toFixed(1) + 'K',
      avgBasket: '$' + avgBasket.toFixed(2),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-600 to-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9881;</span>
          <h3 className="text-sm font-semibold text-white">Auto Parts Store</h3>
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
            <div className="text-slate-400">Customers / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total SKUs</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalSkus / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Revenue</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Basket</div>
            <div className="text-sm font-semibold text-white">{metrics.avgBasket}</div>
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
                <span className="text-xs text-slate-300">{(loc.partsSkus / 1000).toFixed(0)}K SKUs</span>
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
              <span className="text-slate-300 font-medium">{activeItem.customersPerDay} customers/day, {(activeItem.partsSkus / 1000).toFixed(0)}K SKUs, ${activeItem.dailyRevenue.toLocaleString()} revenue</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
