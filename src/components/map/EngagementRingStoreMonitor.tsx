'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'er-jared',
    name: 'Jared The Galleria Of Jewelry King Of Prussia PA',
    lat: 40.087,
    lng: -75.399,
    status: 'stable',
    value: 88,
    ringsInStock: 540,
    avgCaratWeight: 1.2,
    avgRingPrice: 7200,
    designerLines: 'Verragio, Tacori, CrownRing',
    trend: 'up' as const,
    description: 'Jared flagship with 540 engagement rings in stock, Verragio and Tacori designer settings plus custom design bar',
  },
  {
    id: 'er-kay',
    name: 'Kay Jewelers Garden State Plaza NJ',
    lat: 40.888,
    lng: -74.075,
    status: 'stable',
    value: 84,
    ringsInStock: 380,
    avgCaratWeight: 0.9,
    avgRingPrice: 4800,
    designerLines: 'Neil Lane, Tolkowsky, Leo Artisan',
    trend: 'stable' as const,
    description: 'Kay Jewelers Garden State Plaza with 380 engagement rings, Neil Lane designer collection and Leo Artisan cut diamonds',
  },
  {
    id: 'er-zales',
    name: 'Zales Galleria Dallas TX',
    lat: 32.948,
    lng: -96.837,
    status: 'moderate',
    value: 72,
    ringsInStock: 320,
    avgCaratWeight: 1.0,
    avgRingPrice: 5500,
    designerLines: 'Vera Wang, Celebration Diamond, Unstoppable',
    trend: 'stable' as const,
    description: 'Zales Galleria Dallas with 320 engagement rings, Vera Wang Love collection and exclusive Celebration cut diamonds',
  },
  {
    id: 'er-shane',
    name: 'Shane Co. Tysons Corner VA',
    lat: 38.919,
    lng: -77.224,
    status: 'warning',
    value: 60,
    ringsInStock: 285,
    avgCaratWeight: 1.4,
    avgRingPrice: 8900,
    designerLines: 'Rutland, Sylvie, Danhov',
    trend: 'down' as const,
    description: 'Shane Co. Tysons Corner facing softer demand, 285 rings in stock with direct-diamond sourcing and lifetime trade-in program',
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

export function EngagementRingStoreMonitor() {
  const state = useMapStore((s) => s.engagementRingStore)
  const setState = useMapStore((s) => s.setEngagementRingStore)

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
    if (filteredData.length === 0) return { totalRings: 0, avgCarat: 0, avgPrice: 0 }
    const totalRings = filteredData.reduce((s: number, d: any) => s + (d.ringsInStock as number), 0)
    const avgCarat = (filteredData.reduce((s: number, d: any) => s + (d.avgCaratWeight as number), 0) / filteredData.length).toFixed(2)
    const avgPrice = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgRingPrice as number), 0) / filteredData.length)
    return { totalRings, avgCarat, avgPrice }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-pink-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128141;</span>
          <h3 className="text-sm font-semibold text-white">Engagement Ring Store</h3>
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
            <div className="text-slate-400">Rings In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRings}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Carat</div>
            <div className="text-sm font-semibold text-white">{metrics.avgCarat}ct</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ring Price</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgPrice / 1000).toFixed(1)}k</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.designerLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.ringsInStock}r</span>
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
              {activeItem.ringsInStock} rings &middot; {activeItem.avgCaratWeight}ct avg
              &nbsp;&middot;&nbsp; ${activeItem.avgRingPrice.toLocaleString()} avg price
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
