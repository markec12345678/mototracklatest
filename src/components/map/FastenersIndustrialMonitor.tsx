'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fi-fastenal',
    name: 'Fastenal Winona MN HQ',
    lat: 44.049,
    lng: -91.664,
    status: 'stable',
    value: 90,
    ordersPerDay: 620,
    skusInStock: 680000,
    businessAccounts: 2450,
    productLines: 'Fasteners, Tools, MRO, Safety',
    trend: 'up' as const,
    description: 'Fastenal Winona HQ with 680,000 SKUs, 620 daily orders, 2,450 business accounts and on-site vending machines and FMI program',
  },
  {
    id: 'fi-msc',
    name: 'MSC Industrial Supply Melville NY',
    lat: 40.783,
    lng: -73.409,
    status: 'stable',
    value: 86,
    ordersPerDay: 480,
    skusInStock: 1200000,
    businessAccounts: 1820,
    productLines: 'Cutting Tools, Abrasives, MRO',
    trend: 'stable' as const,
    description: 'MSC Industrial Melville flagship with 1.2M SKUs, 480 daily orders serving 1,820 manufacturing accounts across the Northeast',
  },
  {
    id: 'fi-grainger',
    name: 'W.W. Grainger Lake Forest IL',
    lat: 42.250,
    lng: -87.870,
    status: 'moderate',
    value: 76,
    ordersPerDay: 920,
    skusInStock: 1450000,
    businessAccounts: 3200,
    productLines: 'MRO, Safety, Hand Tools',
    trend: 'stable' as const,
    description: 'Grainger Lake Forest DC with 1.45M SKUs, 920 daily orders and 3,200 business accounts across multiple vertical markets',
  },
  {
    id: 'fi-mcmaster',
    name: 'McMaster-Carr Elmhurst IL',
    lat: 41.899,
    lng: -87.941,
    status: 'warning',
    value: 60,
    ordersPerDay: 380,
    skusInStock: 575000,
    businessAccounts: 1240,
    productLines: 'Hardware, Plumbing, Electrical',
    trend: 'down' as const,
    description: 'McMaster-Carr Elmhurst DC facing staffing challenges, 575K SKUs serving 1,240 industrial accounts with same-day shipping',
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

export function FastenersIndustrialMonitor() {
  const state = useMapStore((s) => s.fastenersIndustrial)
  const setState = useMapStore((s) => s.setFastenersIndustrial)

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
    if (filteredData.length === 0) return { totalOrders: 0, totalSkus: 0, totalAccounts: 0 }
    const totalOrders = filteredData.reduce((s: number, d: any) => s + (d.ordersPerDay as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.skusInStock as number), 0)
    const totalAccounts = filteredData.reduce((s: number, d: any) => s + (d.businessAccounts as number), 0)
    return { totalOrders, totalSkus, totalAccounts }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-zinc-500 to-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128296;</span>
          <h3 className="text-sm font-semibold text-white">Fasteners Industrial</h3>
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
            <div className="text-sm font-semibold text-white">{(metrics.totalSkus / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Business Accts</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAccounts.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">DCs</div>
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
                  <div className="text-[10px] text-slate-400">{loc.productLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.ordersPerDay}/day</span>
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
              {activeItem.skusInStock.toLocaleString()} SKUs &middot; {activeItem.ordersPerDay} orders/day
              &nbsp;&middot;&nbsp; {activeItem.businessAccounts.toLocaleString()} accounts
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
