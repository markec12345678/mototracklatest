'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mh-hobbytown',
    name: 'HobbyTown Lincoln NE HQ',
    lat: 40.810,
    lng: -96.680,
    status: 'stable',
    value: 87,
    dailyCustomers: 180,
    kitsInStock: 6200,
    brandLines: 'Tamiya, Revell, Trumpeter, Airfix',
    speciality: 'Plastic Model Kits',
    trend: 'up' as const,
    description: 'HobbyTown Lincoln NE HQ flagship, 180 daily customers with 6,200 model kits from Tamiya, Revell, Trumpeter and Airfix',
  },
  {
    id: 'mh-sprue',
    name: 'Sprue Bros Models St Louis MO',
    lat: 38.627,
    lng: -90.199,
    status: 'stable',
    value: 84,
    dailyCustomers: 95,
    kitsInStock: 9800,
    brandLines: 'Eduard, Wingnut Wings, Hobby Boss',
    speciality: 'Specialty Online + Retail',
    trend: 'stable' as const,
    description: 'Sprue Bros Models St Louis MO, 95 daily customers with 9,800 specialty kits — flagship Eduard and Wingnut Wings dealer',
  },
  {
    id: 'mh-greatmodels',
    name: 'GreatModels Web Houston TX',
    lat: 29.760,
    lng: -95.369,
    status: 'moderate',
    value: 71,
    dailyCustomers: 65,
    kitsInStock: 7200,
    brandLines: 'Dragon, Meng, Amusing Hobby',
    speciality: 'Online + Walk-in',
    trend: 'stable' as const,
    description: 'GreatModels Web Houston TX, 65 daily customers with 7,200 kits focused on Dragon and Meng modern military models',
  },
  {
    id: 'mh-hobbycraft',
    name: 'Hobby Depot Mesa AZ',
    lat: 33.415,
    lng: -111.831,
    status: 'warning',
    value: 58,
    dailyCustomers: 42,
    kitsInStock: 3800,
    brandLines: 'Italeri, Academy, Hasegawa',
    speciality: 'Brick & Mortar Only',
    trend: 'down' as const,
    description: 'Hobby Depot Mesa AZ, 42 daily customers — struggling against online competition with 3,800 kit inventory',
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

export function ModelHobbyShopMonitor() {
  const state = useMapStore((s) => s.modelHobbyShop)
  const setState = useMapStore((s) => s.setModelHobbyShop)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalKits: 0, avgKits: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalKits = filteredData.reduce((s: number, d: any) => s + (d.kitsInStock as number), 0)
    const avgKits = Math.round(totalKits / filteredData.length)
    return { totalCustomers, totalKits, avgKits }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-500 to-indigo-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9992;&#65039;</span>
          <h3 className="text-sm font-semibold text-white">Model Hobby Shop</h3>
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
            <div className="text-slate-400">Kits In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalKits / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Kit Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.avgKits.toLocaleString()}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.speciality}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.kitsInStock / 1000).toFixed(1)}K kits</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.kitsInStock.toLocaleString()} kits in stock
              &nbsp;&middot;&nbsp; Brands: {activeItem.brandLines}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
