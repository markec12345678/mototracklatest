'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dw-nycdiamond',
    name: 'NYC Diamond District 47th Street',
    lat: 40.760,
    lng: -73.982,
    status: 'stable',
    value: 91,
    dailyWholesaleOrders: 145,
    caratsInStock: 12500,
    avgCaratPrice: 8400,
    certifiedGrading: 'GIA, AGS',
    trend: 'up' as const,
    description: 'NYC Diamond District 47th Street with 12,500 carats in stock, 145 daily wholesale orders and GIA-certified loose diamonds',
  },
  {
    id: 'dw-antwerp',
    name: 'Antwerp Diamond District BE (US Office)',
    lat: 40.758,
    lng: -73.975,
    status: 'stable',
    value: 86,
    dailyWholesaleOrders: 95,
    caratsInStock: 18500,
    avgCaratPrice: 7200,
    certifiedGrading: 'GIA, IGI, HRD',
    trend: 'stable' as const,
    description: 'Antwerp Diamond District US liaison office with 18,500 carats in stock, rough and polished diamonds from Antwerp bourse',
  },
  {
    id: 'dw-mumbai',
    name: 'Bharat Diamond Bourse Mumbai (US Rep)',
    lat: 40.760,
    lng: -73.985,
    status: 'moderate',
    value: 74,
    dailyWholesaleOrders: 78,
    caratsInStock: 22000,
    avgCaratPrice: 5800,
    certifiedGrading: 'GIA, IGI',
    trend: 'stable' as const,
    description: 'Bharat Diamond Bourse US representative with 22,000 carats, manufactured diamonds from Surat cutting centers',
  },
  {
    id: 'dw-telaviv',
    name: 'Israel Diamond Exchange Tel Aviv (US)',
    lat: 40.758,
    lng: -73.979,
    status: 'warning',
    value: 60,
    dailyWholesaleOrders: 52,
    caratsInStock: 9800,
    avgCaratPrice: 6900,
    certifiedGrading: 'GIA, HRD',
    trend: 'down' as const,
    description: 'Israel Diamond Exchange US office facing softer demand, 9,800 carats in stock with melee and larger polished stones',
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

export function DiamondWholesaleDealerMonitor() {
  const state = useMapStore((s) => s.diamondWholesaleDealer)
  const setState = useMapStore((s) => s.setDiamondWholesaleDealer)

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
    if (filteredData.length === 0) return { totalOrders: 0, totalCarats: 0, avgPrice: 0 }
    const totalOrders = filteredData.reduce((s: number, d: any) => s + (d.dailyWholesaleOrders as number), 0)
    const totalCarats = filteredData.reduce((s: number, d: any) => s + (d.caratsInStock as number), 0)
    const avgPrice = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgCaratPrice as number), 0) / filteredData.length)
    return { totalOrders, totalCarats, avgPrice }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-blue-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128142;</span>
          <h3 className="text-sm font-semibold text-white">Diamond Wholesale Dealer</h3>
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
            <div className="text-slate-400">Daily Orders</div>
            <div className="text-sm font-semibold text-white">{metrics.totalOrders}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Carats In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalCarats / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Carat Price</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgPrice / 1000).toFixed(1)}k</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.certifiedGrading}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.dailyWholesaleOrders}/d</span>
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
              {activeItem.caratsInStock.toLocaleString()} carats &middot; {activeItem.dailyWholesaleOrders} orders/day
              &nbsp;&middot;&nbsp; ${activeItem.avgCaratPrice.toLocaleString()}/ct avg
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
