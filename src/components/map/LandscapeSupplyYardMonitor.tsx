'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ls-siteone',
    name: 'SiteOne Landscape Supply Roswell GA',
    lat: 34.023,
    lng: -84.362,
    status: 'stable',
    value: 91,
    dailyOrders: 240,
    skusInStock: 18500,
    contractorsServed: 1450,
    productLines: 'Irrigation, Hardscape, Lighting, Pond',
    trend: 'up' as const,
    description: 'SiteOne Landscape Supply Roswell branch, largest US landscape supply distributor with 18,500 SKUs serving 1,450 active contractors',
  },
  {
    id: 'ls-ewing',
    name: 'Ewing Irrigation Phoenix AZ HQ',
    lat: 33.448,
    lng: -112.074,
    status: 'stable',
    value: 84,
    dailyOrders: 165,
    skusInStock: 9800,
    contractorsServed: 920,
    productLines: 'Irrigation, Drainage, Turf, Landscape Fabric',
    trend: 'stable' as const,
    description: 'Ewing Irrigation & Landscape Supply Phoenix HQ, 9,800 SKUs across 200+ branches nationwide focused on irrigation and turf professionals',
  },
  {
    id: 'ls-horizon',
    name: 'Horizon Distributors San Marcos CA',
    lat: 33.143,
    lng: -117.167,
    status: 'moderate',
    value: 72,
    dailyOrders: 128,
    skusInStock: 8200,
    contractorsServed: 680,
    productLines: 'Irrigation, Landscape Lighting, Pavers',
    trend: 'stable' as const,
    description: 'Horizon Distributors San Marcos branch, 8,200 SKUs for professional landscape contractors with focus on irrigation and hardscape materials',
  },
  {
    id: 'ls-mulchcenter',
    name: 'The Mulch Center Plainfield IN',
    lat: 39.704,
    lng: -86.399,
    status: 'warning',
    value: 58,
    dailyOrders: 76,
    skusInStock: 3400,
    contractorsServed: 410,
    productLines: 'Mulch, Topsoil, Compost, Stone',
    trend: 'down' as const,
    description: 'The Mulch Center Plainfield Indiana, bulk landscape materials supplier facing softer demand with 3,400 SKUs of mulch, soil and stone products',
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

export function LandscapeSupplyYardMonitor() {
  const state = useMapStore((s) => s.landscapeSupplyYard)
  const setState = useMapStore((s) => s.setLandscapeSupplyYard)

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
    if (filteredData.length === 0) return { totalOrders: 0, totalSkus: 0, totalContractors: 0 }
    const totalOrders = filteredData.reduce((s: number, d: any) => s + (d.dailyOrders as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.skusInStock as number), 0)
    const totalContractors = filteredData.reduce((s: number, d: any) => s + (d.contractorsServed as number), 0)
    return { totalOrders, totalSkus, totalContractors }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9935;</span>
          <h3 className="text-sm font-semibold text-white">Landscape Supply Yard</h3>
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
            <div className="text-slate-400">SKUs In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalSkus / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Contractors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalContractors.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Yards</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.productLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.dailyOrders}/day</span>
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
              {activeItem.skusInStock.toLocaleString()} SKUs &middot; {activeItem.dailyOrders} orders/day
              &nbsp;&middot;&nbsp; {activeItem.contractorsServed.toLocaleString()} contractors
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
