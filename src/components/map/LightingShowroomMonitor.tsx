'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ls-lampsplus',
    name: 'Lamps Plus Phoenix AZ HQ',
    lat: 33.448,
    lng: -112.074,
    status: 'stable',
    value: 90,
    dailyCustomers: 240,
    fixturesInStock: 12500,
    avgOrderValue: 385,
    productLines: 'Chandeliers, Pendant, Floor, Table',
    trend: 'up' as const,
    description: 'Lamps Plus Phoenix AZ headquarters, 240 daily customers with 12,500 lighting fixtures and free in-home lighting consultation service',
  },
  {
    id: 'ls-lightingny',
    name: 'Lighting New York Manhattan',
    lat: 40.758,
    lng: -73.975,
    status: 'stable',
    value: 85,
    dailyCustomers: 165,
    fixturesInStock: 8200,
    avgOrderValue: 620,
    productLines: 'Designer, Modern, Crystal, Restoration',
    trend: 'stable' as const,
    description: 'Lighting New York Manhattan flagship, 165 daily customers with designer brands including Visual Comfort, Hudson Valley and Tech Lighting',
  },
  {
    id: 'ls-yale',
    name: 'Yale Lighting Philadelphia PA',
    lat: 40.044,
    lng: -75.221,
    status: 'moderate',
    value: 72,
    dailyCustomers: 92,
    fixturesInStock: 5400,
    avgOrderValue: 480,
    productLines: 'Transitional, Outdoor, Ceiling Fans',
    trend: 'stable' as const,
    description: 'Yale Lighting Philadelphia, 92 daily customers with 5,400 fixtures specializing in transitional and outdoor landscape lighting',
  },
  {
    id: 'ls-crescent',
    name: 'Crescent Lighting Dallas TX',
    lat: 32.948,
    lng: -96.730,
    status: 'warning',
    value: 60,
    dailyCustomers: 68,
    fixturesInStock: 3800,
    avgOrderValue: 540,
    productLines: 'Rustic, Farmhouse, Industrial',
    trend: 'down' as const,
    description: 'Crescent Lighting Dallas facing reduced foot traffic, 68 daily customers with 3,800 fixtures focused on rustic farmhouse and industrial styles',
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

export function LightingShowroomMonitor() {
  const state = useMapStore((s) => s.lightingShowroom)
  const setState = useMapStore((s) => s.setLightingShowroom)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalFixtures: 0, avgOrder: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalFixtures = filteredData.reduce((s: number, d: any) => s + (d.fixturesInStock as number), 0)
    const avgOrder = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgOrderValue as number), 0) / filteredData.length)
    return { totalCustomers, totalFixtures, avgOrder }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500 to-amber-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128161;</span>
          <h3 className="text-sm font-semibold text-white">Lighting Showroom</h3>
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
            <div className="text-slate-400">Fixtures In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalFixtures / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Order</div>
            <div className="text-sm font-semibold text-white">${metrics.avgOrder}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Showrooms</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.productLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${loc.avgOrderValue}</span>
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
              {activeItem.fixturesInStock.toLocaleString()} fixtures &middot; {activeItem.dailyCustomers} customers/day
              &nbsp;&middot;&nbsp; ${activeItem.avgOrderValue} avg order
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
