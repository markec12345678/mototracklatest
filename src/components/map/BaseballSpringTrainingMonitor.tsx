'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bst-camelback',
    name: 'Camelback Ranch, Glendale, AZ',
    lat: 33.528,
    lng: -112.268,
    status: 'stable',
    value: 86,
    dailyCustomers: 9400,
    monthlyRevenue: 5.8,
    skusInStock: 1850,
    flagshipLines: 'Dodger Dogs, Garlic Fries, Craft Beer, Helados',
    trend: 'up' as const,
    description: 'Camelback Ranch-Glendale spring training home of the Dodgers and White Sox, 9,400 daily fans with 1,850 SKUs; Cactus League flagship ballpark',
  },
  {
    id: 'bst-sloan',
    name: 'Sloan Park, Mesa, AZ',
    lat: 33.426,
    lng: -111.825,
    status: 'moderate',
    value: 74,
    dailyCustomers: 10100,
    monthlyRevenue: 5.2,
    skusInStock: 1620,
    flagshipLines: 'Chicago Beef, Vienna Beef, Old Style, Churros',
    trend: 'stable' as const,
    description: 'Sloan Park spring training home of the Chicago Cubs in Mesa, 10,100 daily fans with 1,620 SKUs; highest-capacity Cactus League venue',
  },
  {
    id: 'bst-cooltoday',
    name: 'CoolToday Park, North Port, FL',
    lat: 27.063,
    lng: -82.245,
    status: 'warning',
    value: 62,
    dailyCustomers: 6800,
    monthlyRevenue: 2.9,
    skusInStock: 940,
    flagshipLines: 'Gulf Grouper, Cuban Sandwich, Key Lime Pie, IPA',
    trend: 'down' as const,
    description: 'CoolToday Park spring training home of the Atlanta Braves in North Port, 6,800 daily fans with 940 SKUs; Grapefruit League regional menu',
  },
  {
    id: 'bst-td-ballpark',
    name: 'TD Ballpark, Dunedin, FL',
    lat: 28.003,
    lng: -82.781,
    status: 'critical',
    value: 48,
    dailyCustomers: 4200,
    monthlyRevenue: 1.7,
    skusInStock: 610,
    flagshipLines: 'Peameal Bacon, Poutine, Labatt Blue, Butter Tarts',
    trend: 'down' as const,
    description: 'TD Ballpark spring training home of the Toronto Blue Jays in Dunedin, 4,200 daily fans with 610 SKUs; small-capacity Grapefruit League venue',
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

export function BaseballSpringTrainingMonitor() {
  const state = useMapStore((s) => s.baseballSpringTraining)
  const setState = useMapStore((s) => s.setBaseballSpringTraining)

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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-700 to-green-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9918;</span>
          <h3 className="text-sm font-semibold text-white">Baseball Spring Training</h3>
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
