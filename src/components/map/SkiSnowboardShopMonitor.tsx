'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ss-christy',
    name: 'Christy Sports Lakewood CO',
    lat: 39.704,
    lng: -105.081,
    status: 'stable',
    value: 88,
    dailyCustomers: 210,
    monthlyRevenue: 2.8,
    rentalFleet: 1400,
    brandLines: 'Rossignol, Salomon, K2, Volkl',
    trend: 'up' as const,
    description: 'Christy Sports Lakewood CO flagship, 210 daily customers with 1,400-unit rental fleet across Rossignol, Salomon, K2 and Volkl',
  },
  {
    id: 'ss-evo',
    name: 'Evo Seattle WA',
    lat: 47.651,
    lng: -122.349,
    status: 'stable',
    value: 84,
    dailyCustomers: 175,
    monthlyRevenue: 1.9,
    rentalFleet: 900,
    brandLines: 'Blizzard, Armada, Burton, Giro',
    trend: 'up' as const,
    description: 'Evo Seattle WA flagship, 175 daily customers with 900-unit rental fleet; ski/snowboard/bike multi-sport lifestyle retailer',
  },
  {
    id: 'ss-skibutlers',
    name: 'Ski Butlers Park City UT',
    lat: 40.646,
    lng: -111.498,
    status: 'moderate',
    value: 72,
    dailyCustomers: 60,
    monthlyRevenue: 1.4,
    rentalFleet: 2200,
    brandLines: 'Demo skis, premium boots, delivery',
    trend: 'stable' as const,
    description: 'Ski Butlers Park City UT, 60 daily customers with 2,200-unit rental fleet; ski & snowboard rental delivery service',
  },
  {
    id: 'ss-aspen',
    name: 'Aspen Ski Co Snowmass CO',
    lat: 39.182,
    lng: -106.939,
    status: 'stable',
    value: 90,
    dailyCustomers: 340,
    monthlyRevenue: 3.6,
    rentalFleet: 1800,
    brandLines: 'Aspen, Piste, high-end demo fleet',
    trend: 'up' as const,
    description: 'Aspen Skiing Company Snowmass CO, 340 daily customers with 1,800-unit premium rental fleet at four-mountain resort',
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

export function SkiSnowboardShopMonitor() {
  const state = useMapStore((s) => s.skiSnowboardShop)
  const setState = useMapStore((s) => s.setSkiSnowboardShop)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalRevenue: 0, totalFleet: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalFleet = filteredData.reduce((s: number, d: any) => s + (d.rentalFleet as number), 0)
    return { totalCustomers, totalRevenue, totalFleet }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-500 to-cyan-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9924;</span>
          <h3 className="text-sm font-semibold text-white">Ski &amp; Snowboard Shop</h3>
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
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Rental Fleet</div>
            <div className="text-sm font-semibold text-white">{metrics.totalFleet.toLocaleString()}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.brandLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.rentalFleet.toLocaleString()}</span>
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
              {activeItem.dailyCustomers} customers/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.rentalFleet.toLocaleString()} units in rental fleet
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
