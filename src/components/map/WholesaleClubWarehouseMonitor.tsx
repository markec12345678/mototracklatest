'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'wc-costco',
    name: 'Costco Issaquah WA HQ',
    lat: 47.53,
    lng: -122.035,
    status: 'stable',
    value: 95,
    dailyMembers: 2400,
    monthlyRevenue: 12.8,
    bulkSkus: 3800,
    membershipBase: '72.0M',
    trend: 'up' as const,
    description: 'Costco Issaquah WA flagship warehouse (store #1), 2,400 daily members with 3,800 bulk SKUs; world 2nd largest retailer, 72M cardholders',
  },
  {
    id: 'wc-sams',
    name: "Sam's Club Bentonville AR HQ",
    lat: 36.373,
    lng: -94.209,
    status: 'stable',
    value: 84,
    dailyMembers: 1850,
    monthlyRevenue: 7.2,
    bulkSkus: 4500,
    membershipBase: '47.0M',
    trend: 'up' as const,
    description: "Sam's Club Bentonville AR HQ warehouse, 1,850 daily members with 4,500 bulk SKUs; Walmart-owned membership warehouse chain",
  },
  {
    id: 'wc-bjs',
    name: "BJ's Wholesale Westborough MA HQ",
    lat: 42.269,
    lng: -71.616,
    status: 'moderate',
    value: 72,
    dailyMembers: 720,
    monthlyRevenue: 2.9,
    bulkSkus: 5200,
    membershipBase: '6.5M',
    trend: 'stable' as const,
    description: "BJ's Wholesale Westborough MA HQ warehouse, 720 daily members with 5,200 bulk SKUs; East Coast membership warehouse chain",
  },
  {
    id: 'wc-groceryoutlet',
    name: 'Grocery Outlet Berkeley CA HQ',
    lat: 37.872,
    lng: -122.298,
    status: 'warning',
    value: 61,
    dailyMembers: 410,
    monthlyRevenue: 1.4,
    bulkSkus: 2800,
    membershipBase: 'Bargain',
    trend: 'stable' as const,
    description: 'Grocery Outlet Berkeley CA HQ flagship, 410 daily customers with 2,800 closeout SKUs; extreme-value independent operator model',
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

export function WholesaleClubWarehouseMonitor() {
  const state = useMapStore((s) => s.wholesaleClubWarehouse)
  const setState = useMapStore((s) => s.setWholesaleClubWarehouse)

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
    if (filteredData.length === 0) return { totalMembers: 0, totalRevenue: 0, totalSkus: 0 }
    const totalMembers = filteredData.reduce((s: number, d: any) => s + (d.dailyMembers as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.bulkSkus as number), 0)
    return { totalMembers, totalRevenue, totalSkus }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-700 to-orange-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127979;</span>
          <h3 className="text-sm font-semibold text-white">Wholesale Club Warehouse</h3>
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
            <div className="text-slate-400">Daily Members</div>
            <div className="text-sm font-semibold text-white">{metrics.totalMembers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bulk SKUs</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalSkus / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Clubs</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.membershipBase}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.membershipBase}</span>
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
              {activeItem.dailyMembers.toLocaleString()} members/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.bulkSkus.toLocaleString()} bulk SKUs
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
