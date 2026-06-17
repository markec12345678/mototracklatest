'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ar-bestbuy',
    name: 'Best Buy Appliances Richfield MN HQ',
    lat: 44.883,
    lng: -93.281,
    status: 'stable',
    value: 91,
    dailyCustomers: 420,
    unitsInStock: 6800,
    avgTicketSize: 1450,
    brandLines: 'Samsung, LG, Whirlpool, GE, Bosch',
    trend: 'up' as const,
    description: 'Best Buy Appliances Richfield MN headquarters, 420 daily customers with 6,800 units and Geek Squad installation across Samsung, LG, Whirlpool brands',
  },
  {
    id: 'ar-conns',
    name: "Conn's HomePlus Beaumont TX",
    lat: 30.086,
    lng: -94.102,
    status: 'stable',
    value: 83,
    dailyCustomers: 185,
    unitsInStock: 3200,
    avgTicketSize: 980,
    brandLines: 'Frigidaire, Maytag, KitchenAid, Hisense',
    trend: 'stable' as const,
    description: "Conn's HomePlus Beaumont TX, 185 daily customers with 3,200 appliances and flexible credit financing for Frigidaire, Maytag and KitchenAid",
  },
  {
    id: 'ar-pacific',
    name: 'Pacific Sales Brea CA',
    lat: 33.917,
    lng: -117.901,
    status: 'moderate',
    value: 72,
    dailyCustomers: 142,
    unitsInStock: 4800,
    avgTicketSize: 2200,
    brandLines: 'Thermador, Sub-Zero, Wolf, Miele, Viking',
    trend: 'stable' as const,
    description: 'Pacific Sales Brea CA premium appliance showroom, 142 daily customers with high-end Thermador, Sub-Zero, Wolf, Miele and Viking brands',
  },
  {
    id: 'ar-abt',
    name: 'ABT Electronics Glenview IL',
    lat: 42.073,
    lng: -87.840,
    status: 'warning',
    value: 62,
    dailyCustomers: 128,
    unitsInStock: 4100,
    avgTicketSize: 1850,
    brandLines: 'Bosch, KitchenAid, GE Monogram, Fisher Paykel',
    trend: 'down' as const,
    description: 'ABT Electronics Glenview IL family-owned showroom facing softer demand, 128 daily customers with Bosch, KitchenAid and GE Monogram appliances',
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

export function ApplianceRetailStoreMonitor() {
  const state = useMapStore((s) => s.applianceRetailStore)
  const setState = useMapStore((s) => s.setApplianceRetailStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalUnits: 0, avgTicket: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalUnits = filteredData.reduce((s: number, d: any) => s + (d.unitsInStock as number), 0)
    const avgTicket = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgTicketSize as number), 0) / filteredData.length)
    return { totalCustomers, totalUnits, avgTicket }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-500 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128267;</span>
          <h3 className="text-sm font-semibold text-white">Appliance Retail Store</h3>
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
            <div className="text-slate-400">Units In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalUnits / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ticket</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgTicket / 1000).toFixed(1)}k</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.brandLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.avgTicketSize / 1000).toFixed(1)}k</span>
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
              {activeItem.unitsInStock.toLocaleString()} units &middot; {activeItem.dailyCustomers} customers/day
              &nbsp;&middot;&nbsp; ${activeItem.avgTicketSize.toLocaleString()} avg ticket
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
