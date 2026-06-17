'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dj-levis',
    name: "Levi's Plaza San Francisco CA",
    lat: 37.801,
    lng: -122.403,
    status: 'stable',
    value: 90,
    dailyCustomers: 380,
    monthlyRevenue: 2.8,
    jeansInStock: 6400,
    brandLines: '501, 505, 511, Wedgie, Ribcage',
    trend: 'up' as const,
    description: "Levi's Plaza San Francisco CA HQ flagship, 380 daily customers with 6,400 pairs of jeans; iconic denim inventor since 1853",
  },
  {
    id: 'dj-lucky',
    name: 'Lucky Brand Los Angeles CA',
    lat: 34.043,
    lng: -118.254,
    status: 'moderate',
    value: 72,
    dailyCustomers: 165,
    monthlyRevenue: 1.1,
    jeansInStock: 3800,
    brandLines: 'MIDNIGHT, 711, 410, Sweet & Low',
    trend: 'stable' as const,
    description: 'Lucky Brand Los Angeles CA flagship, 165 daily customers with 3,800 pairs of jeans; vintage-inspired denim since 1990',
  },
  {
    id: 'dj-agi',
    name: 'AG Jeans South El Monte CA',
    lat: 34.052,
    lng: -118.049,
    status: 'stable',
    value: 78,
    dailyCustomers: 110,
    monthlyRevenue: 1.4,
    jeansInStock: 2400,
    brandLines: 'Farrah, Ex-Boyfriend, Stilt, Graduate',
    trend: 'up' as const,
    description: 'AG Jeans South El Monte CA HQ, 110 daily customers with 2,400 pairs of jeans; premium denim made in Los Angeles',
  },
  {
    id: 'dj-wrangler',
    name: 'Wrangler Greensboro NC',
    lat: 36.072,
    lng: -79.792,
    status: 'stable',
    value: 82,
    dailyCustomers: 240,
    monthlyRevenue: 1.9,
    jeansInStock: 7200,
    brandLines: ' Cowboy Cut, Authentics, Aura, Retro',
    trend: 'stable' as const,
    description: 'Wrangler Greensboro NC HQ store, 240 daily customers with 7,200 pairs of jeans; western workwear heritage since 1947',
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

export function DenimJeansStoreMonitor() {
  const state = useMapStore((s) => s.denimJeansStore)
  const setState = useMapStore((s) => s.setDenimJeansStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalRevenue: 0, totalJeans: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalJeans = filteredData.reduce((s: number, d: any) => s + (d.jeansInStock as number), 0)
    return { totalCustomers, totalRevenue, totalJeans }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-700 to-indigo-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128086;</span>
          <h3 className="text-sm font-semibold text-white">Denim &amp; Jeans Store</h3>
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
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Jeans</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalJeans / 1000).toFixed(1)}K</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.brandLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.jeansInStock / 1000).toFixed(1)}K</span>
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
              {activeItem.dailyCustomers} customers/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.jeansInStock.toLocaleString()} pairs of jeans in stock
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
