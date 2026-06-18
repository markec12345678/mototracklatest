'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cd-toyota',
    name: 'Toyota of Manhattan',
    lat: 40.772,
    lng: -73.958,
    status: 'stable',
    value: 92,
    carsInStock: 485,
    monthlySales: 142,
    avgSalePrice: 38500,
    trend: 'up' as const,
    description: 'Toyota Manhattan flagship dealership with 485 vehicles in stock including hybrid RAV4 and Camry models, 142 monthly sales',
  },
  {
    id: 'cd-honda',
    name: 'Honda Los Angeles',
    lat: 34.052,
    lng: -118.243,
    status: 'stable',
    value: 87,
    carsInStock: 380,
    monthlySales: 128,
    avgSalePrice: 32800,
    trend: 'stable' as const,
    description: 'Honda LA downtown dealership with Civic and CR-V inventory, serving 128 monthly sales to LA metro customers',
  },
  {
    id: 'cd-ford',
    name: 'Ford Chicago',
    lat: 41.878,
    lng: -87.63,
    status: 'moderate',
    value: 76,
    carsInStock: 295,
    monthlySales: 95,
    avgSalePrice: 41200,
    trend: 'up' as const,
    description: 'Ford Chicago dealership with F-150 truck inventory and electric Mustang Mach-E, 95 monthly sales in downtown location',
  },
  {
    id: 'cd-tesla',
    name: 'Tesla San Francisco',
    lat: 37.779,
    lng: -122.412,
    status: 'warning',
    value: 65,
    carsInStock: 168,
    monthlySales: 72,
    avgSalePrice: 52400,
    trend: 'down' as const,
    description: 'Tesla San Francisco showroom facing demand softening with 168 inventory and reduced 72 monthly deliveries post-tax-credit changes',
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

export function CarDealershipShowroomMonitor() {
  const state = useMapStore((s) => s.carDealershipShowroom)
  const setState = useMapStore((s) => s.setCarDealershipShowroom)

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
    if (filteredData.length === 0) return { totalStock: 0, totalSales: 0, avgPrice: '$0', totalRevenue: '$0M' }
    const totalStock = filteredData.reduce((s: number, d: any) => s + (d.carsInStock as number), 0)
    const totalSales = filteredData.reduce((s: number, d: any) => s + (d.monthlySales as number), 0)
    const avgPrice = filteredData.reduce((s: number, d: any) => s + (d.avgSalePrice as number), 0) / filteredData.length
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlySales as number) * (d.avgSalePrice as number), 0)
    return {
      totalStock,
      totalSales,
      avgPrice: '$' + (avgPrice / 1000).toFixed(1) + 'K',
      totalRevenue: '$' + (totalRevenue / 1000000).toFixed(1) + 'M',
    }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-700 to-rose-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128663;</span>
          <h3 className="text-sm font-semibold text-white">Car Dealership Showroom</h3>
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
            <div className="text-slate-400">Total Inventory</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStock}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Monthly Sales</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSales}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Price</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPrice}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Monthly Revenue</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue}</div>
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
                <span className="text-xs text-slate-300">{loc.monthlySales}/mo</span>
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
              Primary metric:{' '}
              <span className="text-slate-300 font-medium">{activeItem.carsInStock} in stock, {activeItem.monthlySales} sales/mo, ${activeItem.avgSalePrice.toLocaleString()} avg</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
