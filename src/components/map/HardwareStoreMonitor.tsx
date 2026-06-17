'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'hw-homedepot',
    name: 'The Home Depot Atlanta #6451',
    lat: 33.749,
    lng: -84.388,
    status: 'stable',
    value: 92,
    dailyCustomers: 2840,
    skusInStock: 38500,
    dailyRevenue: 184000,
    departments: 24,
    trend: 'up' as const,
    description: 'Home Depot Atlanta flagship superstore with 2,840 daily customers, 38,500 SKUs across 24 departments, pro desk and tool rental center',
  },
  {
    id: 'hw-lowes',
    name: "Lowe's Mooresville NC HQ Store",
    lat: 35.581,
    lng: -80.814,
    status: 'stable',
    value: 88,
    dailyCustomers: 2120,
    skusInStock: 36000,
    dailyRevenue: 152000,
    departments: 22,
    trend: 'stable' as const,
    description: "Lowe's corporate flagship with 2,120 daily customers, 36,000 SKUs, full garden center, and installation services for cabinets and flooring",
  },
  {
    id: 'hw-ace',
    name: 'Ace Hardware Oak Brook IL',
    lat: 41.840,
    lng: -87.948,
    status: 'moderate',
    value: 74,
    dailyCustomers: 680,
    skusInStock: 14500,
    dailyRevenue: 38500,
    departments: 16,
    trend: 'stable' as const,
    description: 'Ace Hardware retailer-owned cooperative flagship with 680 daily customers, helpful hardware folk and award-winning customer service',
  },
  {
    id: 'hw-menards',
    name: 'Menards Eau Claire WI',
    lat: 44.811,
    lng: -91.498,
    status: 'warning',
    value: 58,
    dailyCustomers: 1450,
    skusInStock: 41000,
    dailyRevenue: 96000,
    departments: 28,
    trend: 'down' as const,
    description: 'Menards Eau Claire home store facing lumber price pressure, 1,450 daily customers and 41,000 SKUs including groceries and pet supplies',
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

export function HardwareStoreMonitor() {
  const state = useMapStore((s) => s.hardwareStore)
  const setState = useMapStore((s) => s.setHardwareStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalSkus: 0, totalRevenue: 0, avgDepts: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.skusInStock as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.dailyRevenue as number), 0)
    const avgDepts = Math.round(filteredData.reduce((s: number, d: any) => s + (d.departments as number), 0) / filteredData.length)
    return { totalCustomers, totalSkus, totalRevenue, avgDepts }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128295;</span>
          <h3 className="text-sm font-semibold text-white">Hardware Store</h3>
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
            <div className="text-slate-400">SKUs In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSkus.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Revenue</div>
            <div className="text-sm font-semibold text-white">${(metrics.totalRevenue / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Departments</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDepts}</div>
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
                  <div className="text-[10px] text-slate-400">
                    {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.dailyCustomers}/day</span>
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
              {activeItem.skusInStock.toLocaleString()} SKUs across {activeItem.departments} departments
              &nbsp;&middot;&nbsp; Revenue ${(activeItem.dailyRevenue / 1000).toFixed(0)}k/day
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
