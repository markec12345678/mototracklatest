'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ps-partycity',
    name: 'Party City Rockaway NJ HQ',
    lat: 40.901,
    lng: -74.508,
    status: 'warning',
    value: 62,
    dailyCustomers: 380,
    monthlyRevenue: 1.6,
    partySkus: 8200,
    seasonalLines: 'Halloween, Birthday, Balloons',
    trend: 'down' as const,
    description: 'Party City Rockaway NJ HQ flagship, 380 daily customers with 8,200 party SKUs; largest US party goods retailer, restructuring after Ch. 11',
  },
  {
    id: 'ps-dollartree',
    name: 'Dollar Tree Chesapeake VA HQ',
    lat: 36.768,
    lng: -76.287,
    status: 'stable',
    value: 78,
    dailyCustomers: 1600,
    monthlyRevenue: 3.8,
    partySkus: 3400,
    seasonalLines: 'Party Zone, Celebration, Holidays',
    trend: 'up' as const,
    description: 'Dollar Tree Chesapeake VA HQ flagship party section, 1,600 daily customers with 3,400 party SKUs; value party goods leader',
  },
  {
    id: 'ps-fivebelow',
    name: 'Five Below Philadelphia PA HQ',
    lat: 40.078,
    lng: -75.158,
    status: 'stable',
    value: 81,
    dailyCustomers: 920,
    monthlyRevenue: 2.4,
    partySkus: 2800,
    seasonalLines: 'Tech, Trend, Party, Candy',
    trend: 'up' as const,
    description: 'Five Below Philadelphia PA HQ flagship, 920 daily customers with 2,800 trend/party SKUs; teen-focused $5-and-under retailer',
  },
  {
    id: 'ps-otc',
    name: 'Oriental Trading Omaha NE HQ',
    lat: 41.234,
    lng: -96.128,
    status: 'moderate',
    value: 69,
    dailyCustomers: 240,
    monthlyRevenue: 1.1,
    partySkus: 12000,
    seasonalLines: 'Novelty, Crafts, Party Favors',
    trend: 'stable' as const,
    description: 'Oriental Trading Omaha NE HQ flagship, 240 daily customers with 12,000 novelty party SKUs; direct-to-consumer party/craft catalog leader',
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

export function PartySupplyStoreMonitor() {
  const state = useMapStore((s) => s.partySupplyStore)
  const setState = useMapStore((s) => s.setPartySupplyStore)

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
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.partySkus as number), 0)
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-700 to-pink-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127881;</span>
          <h3 className="text-sm font-semibold text-white">Party Supply Store</h3>
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
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Party SKUs</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalSkus / 1000).toFixed(1)}K</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.seasonalLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.partySkus / 1000).toFixed(1)}K</span>
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
              {activeItem.dailyCustomers.toLocaleString()} customers/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.partySkus.toLocaleString()} party SKUs
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
