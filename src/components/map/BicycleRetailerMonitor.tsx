'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bc-trek',
    name: 'Trek Bicycle Waterloo WI HQ',
    lat: 43.192,
    lng: -88.989,
    status: 'stable',
    value: 91,
    dailyCustomers: 240,
    monthlySales: 380,
    serviceRevenuePct: 34,
    brandLines: 'Madone, Domane, Marlin, Fuel EX',
    trend: 'up' as const,
    description: 'Trek Bicycle Waterloo WI HQ flagship, 240 daily customers with Madone, Domane, Marlin and Fuel EX lines; 34% service revenue',
  },
  {
    id: 'bc-specialized',
    name: 'Specialized Morgan Hill CA',
    lat: 37.131,
    lng: -121.653,
    status: 'stable',
    value: 88,
    dailyCustomers: 195,
    monthlySales: 320,
    serviceRevenuePct: 31,
    brandLines: 'Tarmac, Roubaix, Stumpjumper, Levo',
    trend: 'stable' as const,
    description: 'Specialized Morgan Hill CA HQ, 195 daily customers with Tarmac, Roubaix, Stumpjumper and Levo e-MTB lines',
  },
  {
    id: 'bc-giant',
    name: 'Giant Bicycles Newbury Park CA',
    lat: 34.182,
    lng: -118.946,
    status: 'moderate',
    value: 74,
    dailyCustomers: 145,
    monthlySales: 240,
    serviceRevenuePct: 28,
    brandLines: 'TCR, Defy, Trance, Talon',
    trend: 'stable' as const,
    description: 'Giant Bicycles Newbury Park CA, 145 daily customers with TCR, Defy, Trance and Talon lines — value-oriented positioning',
  },
  {
    id: 'bc-performance',
    name: 'Performance Bicycle Chapel Hill NC',
    lat: 35.934,
    lng: -79.041,
    status: 'warning',
    value: 59,
    dailyCustomers: 85,
    monthlySales: 145,
    serviceRevenuePct: 22,
    brandLines: 'Scattante, Forte, house brands',
    trend: 'down' as const,
    description: 'Performance Bicycle Chapel Hill NC, 85 daily customers — restructuring post-bankruptcy; 22% service revenue needs uplift',
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

export function BicycleRetailerMonitor() {
  const state = useMapStore((s) => s.bicycleRetailer)
  const setState = useMapStore((s) => s.setBicycleRetailer)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalSales: 0, avgService: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalSales = filteredData.reduce((s: number, d: any) => s + (d.monthlySales as number), 0)
    const avgService = Math.round(filteredData.reduce((s: number, d: any) => s + (d.serviceRevenuePct as number), 0) / filteredData.length)
    return { totalCustomers, totalSales, avgService }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128692;</span>
          <h3 className="text-sm font-semibold text-white">Bicycle Retailer</h3>
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
            <div className="text-slate-400">Sales / Month</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSales}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Service %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgService}%</div>
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
                <span className="text-xs text-slate-300">{loc.serviceRevenuePct}% svc</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.monthlySales} sales/month
              &nbsp;&middot;&nbsp; {activeItem.serviceRevenuePct}% service revenue &middot; {activeItem.brandLines}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
