'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gs-natural',
    name: 'Natural Sapphire Company Madison Avenue NYC',
    lat: 40.766,
    lng: -73.967,
    status: 'stable',
    value: 88,
    stonesInStock: 420,
    avgCaratPrice: 6500,
    monthlySales: 18,
    gemTypes: 'Ceylon Sapphire, Padparadscha, Ruby',
    trend: 'up' as const,
    description: 'Natural Sapphire Company Madison Avenue with 420 stones in stock, untreated Ceylon sapphires and rare Padparadscha specimens',
  },
  {
    id: 'gs-emerald',
    name: 'Emerald International Boston',
    lat: 42.350,
    lng: -71.076,
    status: 'stable',
    value: 82,
    stonesInStock: 285,
    avgCaratPrice: 4800,
    monthlySales: 12,
    gemTypes: 'Colombian Emerald, Muzo, Trapiche',
    trend: 'stable' as const,
    description: 'Emerald International Boston with 285 stones in stock, Colombian Muzo emeralds and rare Trapiche specimens from Coscuez mine',
  },
  {
    id: 'gs-ruby',
    name: 'Ruby & Tanzanite Exchange Houston',
    lat: 29.769,
    lng: -95.369,
    status: 'moderate',
    value: 70,
    stonesInStock: 195,
    avgCaratPrice: 7200,
    monthlySales: 9,
    gemTypes: 'Burmese Ruby, Tanzanite, Spinel',
    trend: 'stable' as const,
    description: 'Ruby & Tanzanite Exchange Houston with 195 stones, Burmese Mogok rubies and Merelani tanzanite direct from Tanzania',
  },
  {
    id: 'gs-opal',
    name: 'Opal & Tourmaline Gallery San Diego',
    lat: 32.716,
    lng: -117.161,
    status: 'warning',
    value: 58,
    stonesInStock: 145,
    avgCaratPrice: 2800,
    monthlySales: 7,
    gemTypes: 'Australian Opal, Paraiba Tourmaline',
    trend: 'down' as const,
    description: 'Opal & Tourmaline Gallery San Diego facing softer demand, 145 stones including Lightning Ridge opals and Paraiba tourmaline',
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

export function GemstoneJewelryDealerMonitor() {
  const state = useMapStore((s) => s.gemstoneJewelryDealer)
  const setState = useMapStore((s) => s.setGemstoneJewelryDealer)

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
    if (filteredData.length === 0) return { totalStones: 0, avgPrice: 0, totalSales: 0 }
    const totalStones = filteredData.reduce((s: number, d: any) => s + (d.stonesInStock as number), 0)
    const avgPrice = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgCaratPrice as number), 0) / filteredData.length)
    const totalSales = filteredData.reduce((s: number, d: any) => s + (d.monthlySales as number), 0)
    return { totalStones, avgPrice, totalSales }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#10024;</span>
          <h3 className="text-sm font-semibold text-white">Gemstone Jewelry Dealer</h3>
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
            <div className="text-slate-400">Stones In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStones}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Carat Price</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgPrice / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Monthly Sales</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSales}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Dealers</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.gemTypes}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.stonesInStock}s</span>
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
              {activeItem.stonesInStock} stones &middot; {activeItem.monthlySales} sales/month
              &nbsp;&middot;&nbsp; ${activeItem.avgCaratPrice.toLocaleString()}/ct avg
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
