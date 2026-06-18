'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fs-floordecor',
    name: 'Floor & Decor Atlanta GA HQ',
    lat: 33.949,
    lng: -84.221,
    status: 'stable',
    value: 92,
    dailyCustomers: 480,
    skusInStock: 8500,
    dailyRevenue: 32000,
    materialTypes: 'Tile, Hardwood, Laminate, Vinyl, Stone',
    trend: 'up' as const,
    description: 'Floor & Decor Atlanta GA headquarters, 480 daily customers with 8,500 SKUs of tile, hardwood, laminate and natural stone at warehouse prices',
  },
  {
    id: 'fs-llflooring',
    name: 'LL Flooring Richmond VA HQ',
    lat: 37.541,
    lng: -77.435,
    status: 'stable',
    value: 84,
    dailyCustomers: 215,
    skusInStock: 4200,
    dailyRevenue: 18500,
    materialTypes: 'Hardwood, Bamboo, Cork, Vinyl Plank',
    trend: 'stable' as const,
    description: 'LL Flooring (Lumber Liquidators) Richmond VA headquarters, 215 daily customers with 4,200 SKUs of hardwood and resilient flooring',
  },
  {
    id: 'fs-empire',
    name: 'Empire Today Chicago IL',
    lat: 41.878,
    lng: -87.630,
    status: 'moderate',
    value: 73,
    dailyCustomers: 185,
    skusInStock: 2800,
    dailyRevenue: 24800,
    materialTypes: 'Carpet, Hardwood, Laminate, Sheet Vinyl',
    trend: 'stable' as const,
    description: 'Empire Today Chicago IL shop-at-home service, 185 daily appointments with next-day professional installation on carpet and hardwood',
  },
  {
    id: 'fs-tilebar',
    name: 'Tile Bar Miami FL Showroom',
    lat: 25.789,
    lng: -80.226,
    status: 'warning',
    value: 61,
    dailyCustomers: 92,
    skusInStock: 3400,
    dailyRevenue: 9800,
    materialTypes: 'Porcelain, Marble, Mosaic, Encaustic',
    trend: 'down' as const,
    description: 'Tile Bar Miami showroom facing softer demand, 92 daily customers with 3,400 SKUs of designer porcelain, marble and encaustic cement tile',
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

export function FlooringStoreMonitor() {
  const state = useMapStore((s) => s.flooringStore)
  const setState = useMapStore((s) => s.setFlooringStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalSkus: 0, totalRevenue: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.skusInStock as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.dailyRevenue as number), 0)
    return { totalCustomers, totalSkus, totalRevenue }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9638;</span>
          <h3 className="text-sm font-semibold text-white">Flooring Store</h3>
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
            <div className="text-slate-400">Daily Customers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">SKUs In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalSkus / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Revenue</div>
            <div className="text-sm font-semibold text-white">${(metrics.totalRevenue / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stores</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.materialTypes}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.skusInStock / 1000).toFixed(1)}k</span>
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
              {activeItem.skusInStock.toLocaleString()} SKUs &middot; {activeItem.dailyCustomers} customers/day
              &nbsp;&middot;&nbsp; ${activeItem.dailyRevenue.toLocaleString()} revenue
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
