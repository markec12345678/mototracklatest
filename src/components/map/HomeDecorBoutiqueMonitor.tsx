'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'hd-westelm',
    name: 'West Elm DUMBO Brooklyn NY',
    lat: 40.703,
    lng: -73.988,
    status: 'stable',
    value: 88,
    dailyCustomers: 280,
    dailyRevenue: 18500,
    skusInStock: 2400,
    brandLines: 'Mid-Century, Organic Modern, Local',
    trend: 'up' as const,
    description: 'West Elm DUMBO Brooklyn flagship, 280 daily customers with mid-century modern and organic modern collections, FSC-certified and Fair Trade',
  },
  {
    id: 'hd-cb2',
    name: 'CB2 Chicago Oakbrook IL',
    lat: 41.840,
    lng: -87.953,
    status: 'stable',
    value: 84,
    dailyCustomers: 195,
    dailyRevenue: 12800,
    skusInStock: 1850,
    brandLines: 'Modern, Bold, Affordable',
    trend: 'stable' as const,
    description: 'CB2 Oakbrook Illinois (Crate & Barrel sister brand), 195 daily customers with modern affordable furniture and decor for urban lofts',
  },
  {
    id: 'hd-zarahome',
    name: 'Zara Home Aventura FL',
    lat: 25.957,
    lng: -80.143,
    status: 'moderate',
    value: 72,
    dailyCustomers: 145,
    dailyRevenue: 8200,
    skusInStock: 1200,
    brandLines: 'Linen, Textures, Mediterranean',
    trend: 'stable' as const,
    description: 'Zara Home Aventura Florida, 145 daily customers with Mediterranean-inspired linen bedding, textured throws and scented home fragrances',
  },
  {
    id: 'hd-anthropologie',
    name: 'Anthropologie Home Walnut Creek CA',
    lat: 37.901,
    lng: -122.066,
    status: 'warning',
    value: 59,
    dailyCustomers: 98,
    dailyRevenue: 6400,
    skusInStock: 980,
    brandLines: 'Boho, Curated, Artisan',
    trend: 'down' as const,
    description: 'Anthropologie Home Walnut Creek California facing reduced foot traffic, 98 daily customers with boho artisan-curated furniture and decor',
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

export function HomeDecorBoutiqueMonitor() {
  const state = useMapStore((s) => s.homeDecorBoutique)
  const setState = useMapStore((s) => s.setHomeDecorBoutique)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalRevenue: 0, totalSkus: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.dailyRevenue as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.skusInStock as number), 0)
    return { totalCustomers, totalRevenue, totalSkus }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-orange-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128294;</span>
          <h3 className="text-sm font-semibold text-white">Home Decor Boutique</h3>
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
            <div className="text-slate-400">Daily Revenue</div>
            <div className="text-sm font-semibold text-white">${(metrics.totalRevenue / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">SKUs In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSkus.toLocaleString()}</div>
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
                <span className="text-xs text-slate-300">${(loc.dailyRevenue / 1000).toFixed(1)}k</span>
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
              {activeItem.dailyCustomers} customers/day &middot; ${activeItem.dailyRevenue.toLocaleString()} revenue
              &nbsp;&middot;&nbsp; {activeItem.skusInStock.toLocaleString()} SKUs
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
