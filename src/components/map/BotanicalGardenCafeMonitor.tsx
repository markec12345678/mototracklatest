'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bgc-nybg',
    name: 'New York Botanical Garden Bronx NY',
    lat: 40.8623,
    lng: -73.879,
    status: 'stable',
    value: 90,
    dailyCustomers: 4200,
    monthlyRevenue: 2.8,
    skusInStock: 680,
    flagshipLines: 'Pine Tree Cafe, Hudson Garden, NYBG Store, Children\'s Cafe',
    trend: 'up' as const,
    description: 'New York Botanical Garden Bronx NY 250-acre National Historic Landmark, 4,200 daily visitors with 680 SKUs; 1M living plants with Pine Tree Cafe and seasonal Holiday Train Show',
  },
  {
    id: 'bgc-missouri',
    name: 'Missouri Botanical Garden St. Louis MO',
    lat: 38.6117,
    lng: -90.2593,
    status: 'stable',
    value: 88,
    dailyCustomers: 3800,
    monthlyRevenue: 2.4,
    skusInStock: 620,
    flagshipLines: 'Sassafras Cafe, Garden View, Lantern Cafe, MBG Store',
    trend: 'up' as const,
    description: 'Missouri Botanical Garden St. Louis MO 79-acre 1859 garden, 3,800 daily visitors with 620 SKUs; oldest US botanical garden with Climatron geodesic dome and Sassafras vegan cafe',
  },
  {
    id: 'bgc-chicago',
    name: 'Chicago Botanic Garden Glencoe IL',
    lat: 42.1486,
    lng: -87.7136,
    status: 'stable',
    value: 86,
    dailyCustomers: 3400,
    monthlyRevenue: 2.1,
    skusInStock: 580,
    flagshipLines: 'Garden View Cafe, Garden Shop, Buehler, Regenstein',
    trend: 'stable' as const,
    description: 'Chicago Botanic Garden Glencoe IL 385-acre living museum, 3,400 daily visitors with 580 SKUs; 2.6M plants with Garden View Cafe and island garden settings',
  },
  {
    id: 'bgc-huntington',
    name: 'Huntington Botanical San Marino CA',
    lat: 34.127,
    lng: -118.1124,
    status: 'moderate',
    value: 78,
    dailyCustomers: 2800,
    monthlyRevenue: 1.9,
    skusInStock: 510,
    flagshipLines: 'Huntington Cafe, Rose Garden, Chinese Tea, Store 1919',
    trend: 'stable' as const,
    description: 'Huntington Library Botanical San Marino CA 207-acre gardens, 2,800 daily visitors with 510 SKUs; 16 themed gardens including Chinese and Japanese with Chinese Tea House Cafe',
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

export function BotanicalGardenCafeMonitor() {
  const state = useMapStore((s) => s.botanicalGardenCafe)
  const setState = useMapStore((s) => s.setBotanicalGardenCafe)

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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-700 to-emerald-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127807;</span>
          <h3 className="text-sm font-semibold text-white">Botanical Garden Cafe</h3>
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
