'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fb-1800flowers',
    name: '1-800-Flowers Carle Place NY HQ',
    lat: 40.755,
    lng: -73.617,
    status: 'stable',
    value: 92,
    dailyOrders: 18500,
    avgOrderValue: 68,
    deliveryRoutes: 320,
    signatureLines: 'Birthday Bouquets, Sympathy, Same-Day',
    trend: 'up' as const,
    description: '1-800-Flowers.com flagship distribution hub on Long Island processing 18.5k orders/day with 320 same-day delivery routes across the metro area',
  },
  {
    id: 'fb-ftd',
    name: 'FTD Florists Transworld Delivery Downers Grove IL',
    lat: 41.796,
    lng: -88.011,
    status: 'stable',
    value: 88,
    dailyOrders: 12400,
    avgOrderValue: 75,
    deliveryRoutes: 245,
    signatureLines: 'ProFlowers, Personalization Universe',
    trend: 'stable' as const,
    description: 'FTD Worldwide headquarters outside Chicago, wire network of 12.4k daily orders across 15k affiliated florists in North America',
  },
  {
    id: 'fb-proflowers',
    name: 'ProFlowers San Diego Fulfillment Center',
    lat: 32.832,
    lng: -117.146,
    status: 'moderate',
    value: 71,
    dailyOrders: 8200,
    avgOrderValue: 59,
    deliveryRoutes: 180,
    signatureLines: 'Farm-Fresh Direct, Skip-the-Middleman',
    trend: 'stable' as const,
    description: 'ProFlowers (FTD subsidiary) San Diego fulfillment hub shipping farm-direct bouquets overnight from growers in Ecuador and Colombia',
  },
  {
    id: 'fb-teleflora',
    name: 'Teleflora Oklahoma City HQ',
    lat: 35.468,
    lng: -97.521,
    status: 'warning',
    value: 58,
    dailyOrders: 6800,
    avgOrderValue: 82,
    deliveryRoutes: 165,
    signatureLines: 'Hand-Designed Locally, Make Someone Smile',
    trend: 'down' as const,
    description: 'Teleflora headquarters facing declining order volume post-pandemic, 6.8k daily orders routed to 10k+ local hand-design florists',
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

export function FloristBoutiqueShopMonitor() {
  const state = useMapStore((s) => s.floristBoutiqueShop)
  const setState = useMapStore((s) => s.setFloristBoutiqueShop)

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
    if (filteredData.length === 0) return { totalOrders: 0, avgOrderValue: 0, totalRoutes: 0 }
    const totalOrders = filteredData.reduce((s: number, d: any) => s + (d.dailyOrders as number), 0)
    const avgOrderValue = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgOrderValue as number), 0) / filteredData.length)
    const totalRoutes = filteredData.reduce((s: number, d: any) => s + (d.deliveryRoutes as number), 0)
    return { totalOrders, avgOrderValue, totalRoutes }
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
          <span className="text-lg">&#127801;</span>
          <h3 className="text-sm font-semibold text-white">Florist Boutique Shop</h3>
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
            <div className="text-sm font-semibold text-white">{(metrics.totalOrders / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Order</div>
            <div className="text-sm font-semibold text-white">${metrics.avgOrderValue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Delivery Routes</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRoutes}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.signatureLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.dailyOrders / 1000).toFixed(1)}k</span>
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
              {(activeItem.dailyOrders / 1000).toFixed(1)}k orders/day &middot; ${activeItem.avgOrderValue} avg ticket
              &nbsp;&middot;&nbsp; {activeItem.deliveryRoutes} delivery routes
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
