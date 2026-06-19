'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tsd-grandcentral',
    name: 'Grand Central Oyster Bar, NYC',
    lat: 40.752,
    lng: -73.977,
    status: 'stable',
    value: 88,
    dailyCustomers: 2400,
    monthlyRevenue: 3.2,
    skusInStock: 540,
    flagshipLines: 'Oysters, Clam Chowder, Lobster Roll, Pan-Roasted Halibut',
    trend: 'up' as const,
    description: 'Grand Central Oyster Bar in Grand Central Terminal NYC, 2,400 daily customers with 540 SKUs; century-old landmark restaurant serving fresh shellfish from the Lower Dining Concourse',
  },
  {
    id: 'tsd-unionstation-chi',
    name: "The Depot / Lilly's, Union Station Chicago",
    lat: 41.878,
    lng: -87.639,
    status: 'moderate',
    value: 71,
    dailyCustomers: 1700,
    monthlyRevenue: 2.1,
    skusInStock: 410,
    flagshipLines: "Lilly's Breakfast, Depot Burgers, Chicago Dogs, Italian Beef",
    trend: 'stable' as const,
    description: "The Depot and Lilly's at Chicago Union Station, 1,700 daily customers with 410 SKUs; commuter-focused casual dining serving Amtrak and Metra passengers",
  },
  {
    id: 'tsd-unionstation-la',
    name: 'Traxx Restaurant, Union Station LA',
    lat: 34.056,
    lng: -118.237,
    status: 'warning',
    value: 62,
    dailyCustomers: 950,
    monthlyRevenue: 1.4,
    skusInStock: 320,
    flagshipLines: 'Traxx Bistro, Pacific Rim Salads, Artisan Sandwiches, Craft Cocktails',
    trend: 'down' as const,
    description: 'Traxx Restaurant in Los Angeles Union Station, 950 daily customers with 320 SKUs; historic Art Deco dining room adjacent to the waiting hall with declining post-pandemic traffic',
  },
  {
    id: 'tsd-30thstreet',
    name: 'The Market at 30th Street, Philadelphia',
    lat: 39.957,
    lng: -75.182,
    status: 'stable',
    value: 84,
    dailyCustomers: 3100,
    monthlyRevenue: 2.8,
    skusInStock: 680,
    flagshipLines: 'Philly Cheesesteaks, Pretzel Factory, La Colombe Coffee, Reading Terminal Eats',
    trend: 'up' as const,
    description: 'The Market at 30th Street Station Philadelphia, 3,100 daily customers with 680 SKUs; food hall concept featuring regional chefs and Amtrak commuter grab-and-go options',
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

export function TrainStationDiningMonitor() {
  const state = useMapStore((s) => s.trainStationDining)
  const setState = useMapStore((s) => s.setTrainStationDining)

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
    const totalStock = filteredData.reduce((s: number, d: any) => s + (d.skusInStock as number), 0)
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-700 to-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128642;</span>
          <h3 className="text-sm font-semibold text-white">Train Station Dining</h3>
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
            <div className="text-slate-400">SKUs</div>
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
                <span className="text-xs text-slate-300">{(loc.skusInStock / 1000).toFixed(1)}K</span>
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
              &nbsp;&middot;&nbsp; {activeItem.skusInStock.toLocaleString()} SKUs in stock
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
