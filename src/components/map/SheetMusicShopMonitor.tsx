'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sm-jwpepper',
    name: 'J.W. Pepper Philadelphia PA HQ',
    lat: 39.948,
    lng: -75.158,
    status: 'stable',
    value: 88,
    dailyCustomers: 145,
    titlesInStock: 28000,
    monthlyRevenue: 0.92,
    catalogFocus: 'Band, Orchestra, Choral, Piano',
    trend: 'up' as const,
    description: 'J.W. Pepper Philadelphia PA HQ, 145 daily customers with 28K titles — largest US printed sheet music retailer since 1876',
  },
  {
    id: 'sm-sheetmusicplus',
    name: 'Sheet Music Plus Berkeley CA',
    lat: 37.872,
    lng: -122.296,
    status: 'stable',
    value: 84,
    dailyCustomers: 95,
    titlesInStock: 41000,
    monthlyRevenue: 0.78,
    catalogFocus: 'All Genres, Digital Downloads',
    trend: 'stable' as const,
    description: 'Sheet Music Plus Berkeley CA, 95 daily customers with 41K titles including digital downloads — leading online sheet music',
  },
  {
    id: 'sm-steinwaysheet',
    name: 'Steinway Sheet Music New York NY',
    lat: 40.764,
    lng: -73.977,
    status: 'moderate',
    value: 73,
    dailyCustomers: 38,
    titlesInStock: 8200,
    monthlyRevenue: 0.22,
    catalogFocus: 'Classical, Henle, Bärenreiter',
    trend: 'stable' as const,
    description: 'Steinway Sheet Music NYC showroom, 38 daily customers with 8,200 classical titles — Henle and Bärenreiter urtext focus',
  },
  {
    id: 'sm-musicarts',
    name: "Music & Arts Sheet Music Bethesda MD",
    lat: 38.984,
    lng: -77.095,
    status: 'warning',
    value: 58,
    dailyCustomers: 22,
    titlesInStock: 4200,
    monthlyRevenue: 0.12,
    catalogFocus: 'Method Books, School Music',
    trend: 'down' as const,
    description: "Music & Arts Sheet Music Bethesda MD, 22 daily customers with 4,200 titles — method books for school programs declining",
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

export function SheetMusicShopMonitor() {
  const state = useMapStore((s) => s.sheetMusicShop)
  const setState = useMapStore((s) => s.setSheetMusicShop)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalTitles: 0, totalRevenue: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalTitles = filteredData.reduce((s: number, d: any) => s + (d.titlesInStock as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    return { totalCustomers, totalTitles, totalRevenue }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-teal-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127925;</span>
          <h3 className="text-sm font-semibold text-white">Sheet Music Shop</h3>
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
            <div className="text-slate-400">Titles In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalTitles / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(2)}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.catalogFocus}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.titlesInStock / 1000).toFixed(0)}K</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.titlesInStock.toLocaleString()} titles in stock
              &nbsp;&middot;&nbsp; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo &middot; {activeItem.catalogFocus}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
