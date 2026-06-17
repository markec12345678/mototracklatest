'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ps-steinway',
    name: 'Steinway & Sons New York NY',
    lat: 40.764,
    lng: -73.977,
    status: 'stable',
    value: 93,
    dailyVisitors: 85,
    pianosInStock: 180,
    avgSalePrice: 89000,
    brandLines: 'Model D, Model B, Model O, Essex',
    trend: 'up' as const,
    description: 'Steinway & Sons Manhattan NYC flagship showroom, 85 daily visitors with 180 pianos and $89K avg sale price for Model D concert grands',
  },
  {
    id: 'ps-yamaha',
    name: 'Yamaha Piano Artist Services NYC',
    lat: 40.760,
    lng: -73.980,
    status: 'stable',
    value: 87,
    dailyVisitors: 62,
    pianosInStock: 145,
    avgSalePrice: 24500,
    brandLines: 'CFX, C7X, U1, b1',
    trend: 'stable' as const,
    description: 'Yamaha Piano Artist Services NYC, 62 daily visitors with 145 pianos — CFX concert grand and U1 upright vertical flagship',
  },
  {
    id: 'ps-boston',
    name: 'M. Steinert & Sons Boston MA',
    lat: 42.349,
    lng: -71.080,
    status: 'moderate',
    value: 75,
    dailyVisitors: 34,
    pianosInStock: 92,
    avgSalePrice: 38500,
    brandLines: 'Boston, Essex, Steinway Used',
    trend: 'stable' as const,
    description: 'M. Steinert & Sons Boston MA (est. 1860), 34 daily visitors with 92 pianos — oldest Steinway dealer in the United States',
  },
  {
    id: 'ps-meridian',
    name: 'Meridian Music Indianapolis IN',
    lat: 39.768,
    lng: -86.158,
    status: 'warning',
    value: 59,
    dailyVisitors: 22,
    pianosInStock: 68,
    avgSalePrice: 18500,
    brandLines: 'Kawai, Yamaha Used, Roland',
    trend: 'down' as const,
    description: 'Meridian Music Indianapolis IN, 22 daily visitors with 68 pianos — facing digital piano displacement in Midwest market',
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

export function PianoShowroomMonitor() {
  const state = useMapStore((s) => s.pianoShowroom)
  const setState = useMapStore((s) => s.setPianoShowroom)

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
    if (filteredData.length === 0) return { totalVisitors: 0, totalStock: 0, avgPrice: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const totalStock = filteredData.reduce((s: number, d: any) => s + (d.pianosInStock as number), 0)
    const avgPrice = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgSalePrice as number), 0) / filteredData.length)
    return { totalVisitors, totalStock, avgPrice }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-600 to-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127932;</span>
          <h3 className="text-sm font-semibold text-white">Piano Showroom</h3>
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
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Pianos In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStock}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Sale Price</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgPrice / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Showrooms</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.brandLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.avgSalePrice / 1000).toFixed(0)}K</span>
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
              {activeItem.dailyVisitors} visitors/day &middot; {activeItem.pianosInStock} pianos in stock
              &nbsp;&middot;&nbsp; ${activeItem.avgSalePrice.toLocaleString()} avg sale price
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
