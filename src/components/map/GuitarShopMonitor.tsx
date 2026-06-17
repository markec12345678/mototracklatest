'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gs-chelsea',
    name: 'Chelsea Guitars New York NY',
    lat: 40.742,
    lng: -74.004,
    status: 'stable',
    value: 88,
    dailyCustomers: 65,
    guitarsInStock: 320,
    avgTicket: 1850,
    brandLines: 'Boutique, Custom Shop, Vintage',
    trend: 'up' as const,
    description: 'Chelsea Guitars NYC boutique, 65 daily customers with 320 guitars — known for vintage Fender and custom shop Gibsons',
  },
  {
    id: 'gs-wildwood',
    name: 'Wildwood Guitars Louisville CO',
    lat: 39.978,
    lng: -105.131,
    status: 'stable',
    value: 90,
    dailyCustomers: 48,
    guitarsInStock: 850,
    avgTicket: 2400,
    brandLines: 'Suhr, Tom Anderson, Music Man',
    trend: 'stable' as const,
    description: 'Wildwood Guitars Louisville CO, 48 daily customers with 850 premium electrics — largest Suhr and Tom Anderson dealer',
  },
  {
    id: 'gs-truetone',
    name: 'Truetone Music Santa Monica CA',
    lat: 34.015,
    lng: -118.485,
    status: 'moderate',
    value: 74,
    dailyCustomers: 38,
    guitarsInStock: 410,
    avgTicket: 1950,
    brandLines: 'PRS Private Stock, Collings, LSL',
    trend: 'stable' as const,
    description: 'Truetone Music Santa Monica CA, 38 daily customers with 410 guitars — boutique dealer for PRS Private Stock and Collings',
  },
  {
    id: 'gs-eighth',
    name: 'Eighth Street Music Philadelphia PA',
    lat: 39.948,
    lng: -75.158,
    status: 'warning',
    value: 58,
    dailyCustomers: 28,
    guitarsInStock: 220,
    avgTicket: 920,
    brandLines: 'Epiphone, Squier, Yamaha entry',
    trend: 'down' as const,
    description: 'Eighth Street Music Philadelphia PA, 28 daily customers with 220 guitars — entry-level positioning facing online competition',
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

export function GuitarShopMonitor() {
  const state = useMapStore((s) => s.guitarShop)
  const setState = useMapStore((s) => s.setGuitarShop)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalStock: 0, avgTicket: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalStock = filteredData.reduce((s: number, d: any) => s + (d.guitarsInStock as number), 0)
    const avgTicket = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgTicket as number), 0) / filteredData.length)
    return { totalCustomers, totalStock, avgTicket }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-700 to-red-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127928;</span>
          <h3 className="text-sm font-semibold text-white">Guitar Shop</h3>
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
            <div className="text-slate-400">Guitars In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStock}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ticket</div>
            <div className="text-sm font-semibold text-white">${metrics.avgTicket}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Shops</div>
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
                <span className="text-xs text-slate-300">{loc.guitarsInStock}</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.guitarsInStock} guitars in stock
              &nbsp;&middot;&nbsp; ${activeItem.avgTicket.toLocaleString()} avg ticket
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
