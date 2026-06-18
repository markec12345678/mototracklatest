'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'aq-petsmart',
    name: 'PetSmart Phoenix AZ HQ',
    lat: 33.615,
    lng: -112.230,
    status: 'stable',
    value: 90,
    dailyCustomers: 1450,
    monthlyRevenue: 6.8,
    petSkus: 12000,
    liveAnimalSkus: 'Fish, Birds, Reptiles',
    flagshipLines: 'Authority, Top Paw, Grreat Choice',
    trend: 'up' as const,
    description: 'PetSmart Phoenix AZ HQ flagship, 1,450 daily customers with 12K pet SKUs; largest US pet specialty retailer with 1,600+ stores, services incl. PetsHotel',
  },
  {
    id: 'aq-petco',
    name: 'Petco San Diego CA HQ',
    lat: 32.899,
    lng: -117.193,
    status: 'stable',
    value: 85,
    dailyCustomers: 1280,
    monthlyRevenue: 5.9,
    petSkus: 11000,
    liveAnimalSkus: 'Fish, Reptiles, Small Pets',
    flagshipLines: 'WholeHearted, Reddy, Well & Good',
    trend: 'up' as const,
    description: 'Petco San Diego CA HQ flagship, 1,280 daily customers with 11K pet SKUs; 2nd largest US pet retailer with 1,500+ stores, vet hospital partnership',
  },
  {
    id: 'aq-chewy',
    name: 'Chewy Plantation FL HQ',
    lat: 26.124,
    lng: -80.256,
    status: 'stable',
    value: 92,
    dailyCustomers: 980,
    monthlyRevenue: 9.4,
    petSkus: 25000,
    liveAnimalSkus: 'Online Only',
    flagshipLines: 'Chewy Brands, Frisco, American Journey',
    trend: 'up' as const,
    description: 'Chewy Plantation FL HQ fulfillment flagship, 980 daily orders with 25K pet SKUs; largest pure-play e-commerce pet retailer, autoship subscription leader',
  },
  {
    id: 'aq-petvalu',
    name: 'Pet Valu Baltimore MD',
    lat: 39.290,
    lng: -76.612,
    status: 'critical',
    value: 41,
    dailyCustomers: 180,
    monthlyRevenue: 0.6,
    petSkus: 6800,
    liveAnimalSkus: 'Birds, Small Pets',
    flagshipLines: 'Performatrin, Ultimate, Pet Valu',
    trend: 'down' as const,
    description: 'Pet Valu Baltimore MD flagship (US ops), 180 daily customers with 6,800 pet SKUs; Canadian chain, US stores wound down in 2020-21 restructuring',
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

export function AquariumPetSupplyMonitor() {
  const state = useMapStore((s) => s.aquariumPetSupply)
  const setState = useMapStore((s) => s.setAquariumPetSupply)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalRevenue: 0, totalStock: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalStock = filteredData.reduce((s: number, d: any) => s + (d.petSkus as number), 0)
    return { totalCustomers, totalRevenue, totalStock }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-700 to-sky-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128032;</span>
          <h3 className="text-sm font-semibold text-white">Aquarium &amp; Pet Supply</h3>
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
            <div className="text-slate-400">Pet SKUs</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalStock / 1000).toFixed(1)}K</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.flagshipLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.petSkus / 1000).toFixed(1)}K</span>
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
              &nbsp;&middot;&nbsp; {activeItem.petSkus.toLocaleString()} pet SKUs
            </div>
            <div className="mt-1 text-[10px] text-slate-500">Live animals: {activeItem.liveAnimalSkus}</div>
          </div>
        )}
      </div>
    </Card>
  )
}
