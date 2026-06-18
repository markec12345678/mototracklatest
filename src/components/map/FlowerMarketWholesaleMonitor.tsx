'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fm-lawholesale',
    name: 'Los Angeles Flower Market Wall Street',
    lat: 34.041,
    lng: -118.253,
    status: 'stable',
    value: 92,
    dailyBuyers: 820,
    weeklyStems: 18500000,
    avgStemPrice: 0.42,
    specialtyFlowers: 'Roses, Carnations, Chrysanthemums, Lilies',
    trend: 'up' as const,
    description: 'LA Flower Market (Original LA Flower Market + Southern California Flower Market), 820 daily wholesale buyers purchasing 18.5M stems/week',
  },
  {
    id: 'fm-aalsmeer',
    name: 'Royal FloraHolland Aalsmeer NL',
    lat: 52.263,
    lng: 4.733,
    status: 'stable',
    value: 96,
    dailyBuyers: 3200,
    weeklyStems: 285000000,
    avgStemPrice: 0.38,
    specialtyFlowers: 'Tulips, Roses, Orchids, Lilies',
    trend: 'stable' as const,
    description: 'Royal FloraHolland Aalsmeer - world\'s largest flower auction, 3,200 daily buyers trading 285M stems weekly across 44,000 m2 auction facility',
  },
  {
    id: 'fm-nymarket',
    name: 'NYC Flower Market 28th Street District',
    lat: 40.747,
    lng: -73.993,
    status: 'moderate',
    value: 76,
    dailyBuyers: 480,
    weeklyStems: 6200000,
    avgStemPrice: 0.65,
    specialtyFlowers: 'Peonies, Ranunculus, Anemones, Garden Roses',
    trend: 'stable' as const,
    description: 'NYC Flower Market on West 28th Street, 480 daily buyers sourcing 6.2M premium stems/week for Manhattan\'s event florists and high-end retailers',
  },
  {
    id: 'fm-miamidistrict',
    name: 'Miami Flower Distribution District',
    lat: 25.789,
    lng: -80.317,
    status: 'warning',
    value: 64,
    dailyBuyers: 590,
    weeklyStems: 12400000,
    avgStemPrice: 0.31,
    specialtyFlowers: 'Tropicals, Heliconia, Gingers, South American Roses',
    trend: 'down' as const,
    description: 'Miami flower distribution district near MIA airport, US gateway for South American imports facing tighter margins at $0.31 avg stem price',
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

export function FlowerMarketWholesaleMonitor() {
  const state = useMapStore((s) => s.flowerMarketWholesale)
  const setState = useMapStore((s) => s.setFlowerMarketWholesale)

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
    if (filteredData.length === 0) return { totalBuyers: 0, totalStems: 0, avgPrice: 0 }
    const totalBuyers = filteredData.reduce((s: number, d: any) => s + (d.dailyBuyers as number), 0)
    const totalStems = filteredData.reduce((s: number, d: any) => s + (d.weeklyStems as number), 0)
    const avgPrice = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgStemPrice as number), 0) * 100) / 100
    return { totalBuyers, totalStems, avgPrice }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500 to-violet-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127800;</span>
          <h3 className="text-sm font-semibold text-white">Flower Market Wholesale</h3>
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
            <div className="text-slate-400">Daily Buyers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBuyers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Weekly Stems</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalStems / 1000000).toFixed(1)}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Stem Price</div>
            <div className="text-sm font-semibold text-white">${metrics.avgPrice.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Markets</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.specialtyFlowers}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${loc.avgStemPrice.toFixed(2)}</span>
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
              {activeItem.dailyBuyers.toLocaleString()} buyers &middot; {(activeItem.weeklyStems / 1000000).toFixed(1)}M stems/week
              &nbsp;&middot;&nbsp; ${activeItem.avgStemPrice.toFixed(2)}/stem
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
