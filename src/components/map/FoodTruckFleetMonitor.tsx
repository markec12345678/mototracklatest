'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ft-taco',
    name: 'Taco Truck Los Angeles',
    lat: 34.046,
    lng: -118.25,
    status: 'stable',
    value: 88,
    ordersPerStop: 145,
    dailyStops: 6,
    avgWaitMin: 12,
    trend: 'up' as const,
    description: 'LA street taco truck hitting 6 stops daily from Boyle Heights to Venice serving al pastor and carne asada tacos',
  },
  {
    id: 'ft-kogi',
    name: 'Kogi BBQ Truck Seoul',
    lat: 37.557,
    lng: 126.978,
    status: 'stable',
    value: 91,
    ordersPerStop: 168,
    dailyStops: 7,
    avgWaitMin: 15,
    trend: 'up' as const,
    description: 'Korean-Mexican fusion truck famous for kimchi quesadillas and short rib sliders covering 7 stops daily across Seoul',
  },
  {
    id: 'ft-halal',
    name: 'Halal Guys Cart NYC',
    lat: 40.762,
    lng: -73.973,
    status: 'moderate',
    value: 78,
    ordersPerStop: 210,
    dailyStops: 2,
    avgWaitMin: 18,
    trend: 'stable' as const,
    description: 'Iconic NYC halal cart at 53rd and 6th serving chicken-and-rice platters with signature white and hot sauces',
  },
  {
    id: 'ft-burger',
    name: 'Burger Truck Portland',
    lat: 45.523,
    lng: -122.676,
    status: 'warning',
    value: 62,
    ordersPerStop: 95,
    dailyStops: 5,
    avgWaitMin: 22,
    trend: 'down' as const,
    description: 'Portland craft burger truck impacted by winter weather with reduced downtown lunch stops and longer wait times',
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

export function FoodTruckFleetMonitor() {
  const state = useMapStore((s) => s.foodTruckFleet)
  const setState = useMapStore((s) => s.setFoodTruckFleet)

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
    if (filteredData.length === 0) return { totalOrders: 0, totalStops: 0, avgWait: '0m', avgOrdersPerStop: 0 }
    const totalOrders = filteredData.reduce((s: number, d: any) => s + (d.ordersPerStop as number) * (d.dailyStops as number), 0)
    const totalStops = filteredData.reduce((s: number, d: any) => s + (d.dailyStops as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.avgWaitMin as number), 0) / filteredData.length
    const avgOrdersPerStop = filteredData.reduce((s: number, d: any) => s + (d.ordersPerStop as number), 0) / filteredData.length
    return {
      totalOrders,
      totalStops,
      avgWait: avgWait.toFixed(0) + 'm',
      avgOrdersPerStop: Math.round(avgOrdersPerStop),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-600 to-green-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128666;</span>
          <h3 className="text-sm font-semibold text-white">Food Truck Fleet</h3>
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
            <div className="text-slate-400">Total Orders</div>
            <div className="text-sm font-semibold text-white">{metrics.totalOrders}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Stops</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStops}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Orders / stop</div>
            <div className="text-sm font-semibold text-white">{metrics.avgOrdersPerStop}</div>
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
                <span className="text-xs text-slate-300">{loc.dailyStops} stops</span>
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
              <span className="text-slate-300 font-medium">{activeItem.ordersPerStop} orders/stop, {activeItem.dailyStops} stops/day, {activeItem.avgWaitMin}m wait</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
