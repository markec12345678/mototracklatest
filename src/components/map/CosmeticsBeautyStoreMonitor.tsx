'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cb-sephora',
    name: 'Sephora Times Square',
    lat: 40.757,
    lng: -73.986,
    status: 'stable',
    value: 94,
    customersPerDay: 850,
    productSkus: 12500,
    dailyRevenue: 28500,
    trend: 'up' as const,
    description: 'Sephora flagship in Times Square with 12,500 SKUs across 300+ brands and Beauty Insider loyalty program serving 850 customers daily',
  },
  {
    id: 'cb-ulta',
    name: 'Ulta Beauty Chicago',
    lat: 41.89,
    lng: -87.624,
    status: 'stable',
    value: 88,
    customersPerDay: 720,
    productSkus: 9800,
    dailyRevenue: 22300,
    trend: 'stable' as const,
    description: 'Ulta Beauty River North location combining mass-market and prestige beauty with 9,800 SKUs and full-service salon',
  },
  {
    id: 'cb-mac',
    name: 'MAC Cosmetics SoHo',
    lat: 40.725,
    lng: -74.003,
    status: 'moderate',
    value: 78,
    customersPerDay: 410,
    productSkus: 2400,
    dailyRevenue: 14800,
    trend: 'stable' as const,
    description: 'MAC Cosmetics SoHo boutique with 2,400 SKUs of professional makeup and makeup artist services for 410 customers daily',
  },
  {
    id: 'cb-nars',
    name: 'NARS Boutique Beverly Hills',
    lat: 34.067,
    lng: -118.403,
    status: 'warning',
    value: 65,
    customersPerDay: 285,
    productSkus: 1850,
    dailyRevenue: 11200,
    trend: 'down' as const,
    description: 'NARS Beverly Hills boutique facing reduced luxury foot traffic with 1,850 SKUs and 285 daily customers post-pandemic',
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

export function CosmeticsBeautyStoreMonitor() {
  const state = useMapStore((s) => s.cosmeticsBeautyStore)
  const setState = useMapStore((s) => s.setCosmeticsBeautyStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalSkus: 0, totalRevenue: '$0', avgBasket: '$0' }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.customersPerDay as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.productSkus as number), 0)
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-700 to-purple-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128139;</span>
          <h3 className="text-sm font-semibold text-white">Cosmetics Beauty Store</h3>
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
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total SKUs</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSkus.toLocaleString()}</div>
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
                <span className="text-xs text-slate-300">${(loc.dailyRevenue / 1000).toFixed(1)}K</span>
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
              <span className="text-slate-300 font-medium">{activeItem.customersPerDay} customers/day, {activeItem.productSkus.toLocaleString()} SKUs, ${activeItem.dailyRevenue.toLocaleString()} revenue</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
