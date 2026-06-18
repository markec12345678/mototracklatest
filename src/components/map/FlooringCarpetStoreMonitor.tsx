'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fc-empire',
    name: 'Empire Today Chicago IL HQ',
    lat: 41.878,
    lng: -87.636,
    status: 'stable',
    value: 84,
    dailyCustomers: 680,
    monthlyRevenue: 4.2,
    flooringSkus: 2800,
    flagshipLines: 'Empire Carpet, Hardwood, Laminate, Vinyl',
    trend: 'up' as const,
    description: 'Empire Today Chicago IL HQ flagship, 680 daily customers with 2,800 flooring SKUs; shop-at-home flooring retailer since 1959, "588-2300 Empire" jingle',
  },
  {
    id: 'fc-ll',
    name: 'LL Flooring Toano VA HQ',
    lat: 37.371,
    lng: -76.768,
    status: 'warning',
    value: 56,
    dailyCustomers: 320,
    monthlyRevenue: 1.6,
    flooringSkus: 3500,
    flagshipLines: 'Bamboo, Hardwood, Vinyl Plank, Tile',
    trend: 'down' as const,
    description: 'LL Flooring Toano VA HQ flagship (formerly Lumber Liquidators), 320 daily customers with 3,500 flooring SKUs; restructuring after store count reduction',
  },
  {
    id: 'fc-carpetone',
    name: 'Carpet One St. Louis MO HQ',
    lat: 38.627,
    lng: -90.198,
    status: 'moderate',
    value: 68,
    dailyCustomers: 240,
    monthlyRevenue: 1.2,
    flooringSkus: 2200,
    flagshipLines: 'Beautiful Breakdown, Lees, Tigressá',
    trend: 'stable' as const,
    description: 'Carpet One Floor & Home St. Louis MO flagship (cooperative), 240 daily customers with 2,200 flooring SKUs; largest flooring co-op with 1,000+ stores',
  },
  {
    id: 'fc-mohawk',
    name: 'Mohawk Industries Dalton GA HQ',
    lat: 34.77,
    lng: -84.971,
    status: 'stable',
    value: 88,
    dailyCustomers: 420,
    monthlyRevenue: 9.6,
    flooringSkus: 18000,
    flagshipLines: 'Mohawk, Karastan, Quick-Step, Pergo',
    trend: 'up' as const,
    description: 'Mohawk Industries Dalton GA HQ flagship, 420 daily customers with 18,000 flooring SKUs; world largest flooring manufacturer, "Carpet Capital of the World"',
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

export function FlooringCarpetStoreMonitor() {
  const state = useMapStore((s) => s.flooringCarpetStore)
  const setState = useMapStore((s) => s.setFlooringCarpetStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalRevenue: 0, totalStock: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalStock = filteredData.reduce((s: number, d: any) => s + (d.flooringSkus as number), 0)
    return { totalCustomers, totalRevenue, totalStock }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-700 to-yellow-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128998;</span>
          <h3 className="text-sm font-semibold text-white">Flooring &amp; Carpet Store</h3>
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
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Flooring SKUs</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalStock / 1000).toFixed(1)}K</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.flagshipLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.flooringSkus / 1000).toFixed(1)}K</span>
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
              {activeItem.dailyCustomers.toLocaleString()} customers/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.flooringSkus.toLocaleString()} SKUs in stock
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
