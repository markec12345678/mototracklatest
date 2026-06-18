'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'wb-rolex',
    name: 'Rolex Boutique Beverly Hills',
    lat: 34.067,
    lng: -118.401,
    status: 'stable',
    value: 92,
    watchesInStock: 180,
    avgSalePrice: 18500,
    monthlySales: 32,
    brandLines: 'Submariner, Datejust, Daytona, GMT',
    trend: 'up' as const,
    description: 'Rolex Authorized Dealer Beverly Hills with 180 watches in stock including sport models, 32 monthly sales and waitlist for stainless Daytona',
  },
  {
    id: 'wb-omega',
    name: 'Omega Boutique Fifth Avenue NYC',
    lat: 40.758,
    lng: -73.975,
    status: 'stable',
    value: 86,
    watchesInStock: 145,
    avgSalePrice: 7800,
    monthlySales: 28,
    brandLines: 'Speedmaster, Seamaster, Constellation',
    trend: 'stable' as const,
    description: 'Omega flagship NYC boutique with 145 watches including Moonwatch Speedmaster Professional and Seamaster Diver 300M',
  },
  {
    id: 'wb-patek',
    name: 'Patek Philippe Tiffany & Co. NYC',
    lat: 40.763,
    lng: -73.974,
    status: 'moderate',
    value: 76,
    watchesInStock: 42,
    avgSalePrice: 85000,
    monthlySales: 8,
    brandLines: 'Nautilus, Aquanaut, Calatrava, Grand Comp',
    trend: 'stable' as const,
    description: 'Patek Philippe at Tiffany & Co. flagship with 42 watches, exclusive Nautilus 5811 and Tiffany Blue 5711 allocation program',
  },
  {
    id: 'wb-tagheuer',
    name: 'TAG Heuer Boutique Las Vegas',
    lat: 36.114,
    lng: -115.173,
    status: 'warning',
    value: 58,
    watchesInStock: 95,
    avgSalePrice: 3200,
    monthlySales: 14,
    brandLines: 'Carrera, Monaco, Aquaracer, Formula 1',
    trend: 'down' as const,
    description: 'TAG Heuer Las Vegas Forum Shops facing soft demand, 95 watches in stock with Monaco and Carrera collections at promotional pricing',
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

export function WatchBoutiqueRetailMonitor() {
  const state = useMapStore((s) => s.watchBoutiqueRetail)
  const setState = useMapStore((s) => s.setWatchBoutiqueRetail)

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
    if (filteredData.length === 0) return { totalStock: 0, avgPrice: 0, totalSales: 0 }
    const totalStock = filteredData.reduce((s: number, d: any) => s + (d.watchesInStock as number), 0)
    const avgPrice = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgSalePrice as number), 0) / filteredData.length)
    const totalSales = filteredData.reduce((s: number, d: any) => s + (d.monthlySales as number), 0)
    return { totalStock, avgPrice, totalSales }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-600 to-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9201;&#65039;</span>
          <h3 className="text-sm font-semibold text-white">Watch Boutique Retail</h3>
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
            <div className="text-slate-400">Watches In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStock}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Sale Price</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgPrice / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Monthly Sales</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSales}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Boutiques</div>
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
                <span className="text-xs text-slate-300">{loc.watchesInStock}w</span>
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
              {activeItem.watchesInStock} watches &middot; {activeItem.monthlySales} sales/month
              &nbsp;&middot;&nbsp; ${activeItem.avgSalePrice.toLocaleString()} avg price
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
