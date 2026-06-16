'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mkt-boqueria',
    name: 'La Boqueria Barcelona',
    lat: 41.3818,
    lng: 2.1716,
    status: 'critical',
    value: 8500,
    vendorsActive: 240,
    visitors: 8500,
    avgSale: 18,
    stallOccupancy: 99,
    trend: 'up' as const,
    description: 'Overflow Saturday market with cramped aisles and jam-packed tapas bars drawing record crowds',
  },
  {
    id: 'mkt-camden',
    name: 'Camden Market London',
    lat: 51.539,
    lng: -0.1464,
    status: 'warning',
    value: 6200,
    vendorsActive: 410,
    visitors: 6200,
    avgSale: 22,
    stallOccupancy: 92,
    trend: 'up' as const,
    description: 'Busy weekend afternoon with vintage and street food stalls drawing steady tourist traffic',
  },
  {
    id: 'mkt-chatuchak',
    name: 'Chatuchak Bangkok',
    lat: 13.8,
    lng: 100.55,
    status: 'moderate',
    value: 4500,
    vendorsActive: 5300,
    visitors: 4500,
    avgSale: 9,
    stallOccupancy: 85,
    trend: 'stable' as const,
    description: 'Active Friday morning with steady local shoppers browsing handicrafts and food sections',
  },
  {
    id: 'mkt-khanelkhalili',
    name: 'Khan el-Khalili Cairo',
    lat: 30.0478,
    lng: 31.2628,
    status: 'stable',
    value: 1800,
    vendorsActive: 380,
    visitors: 1800,
    avgSale: 14,
    stallOccupancy: 72,
    trend: 'down' as const,
    description: 'Quieter weekday morning with relaxed browsing at spice and souvenir stalls',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function StreetMarketActivityMonitor() {
  const state = useMapStore((s) => s.streetMarketActivity)
  const setState = useMapStore((s) => s.setStreetMarketActivity)

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
    if (filteredData.length === 0) return { totalVendors: 0, totalVisitors: 0, avgSale: 0, avgOccupancy: 0 }
    const totalVendors = filteredData.reduce((s: number, d: any) => s + (d.vendorsActive as number), 0)
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.visitors as number), 0)
    const avgSale = filteredData.reduce((s: number, d: any) => s + (d.avgSale as number), 0) / filteredData.length
    const avgOccupancy = filteredData.reduce((s: number, d: any) => s + (d.stallOccupancy as number), 0) / filteredData.length
    return {
      totalVendors: totalVendors.toLocaleString(),
      totalVisitors: totalVisitors.toLocaleString(),
      avgSale: avgSale.toFixed(0),
      avgOccupancy: avgOccupancy.toFixed(0),
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

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌶️</span>
          <h3 className="text-sm font-semibold text-white">Street Market Activity Monitor</h3>
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
            <div className="text-slate-400">Vendors Active</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVendors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Visitors/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Sale $</div>
            <div className="text-sm font-semibold text-white">${metrics.avgSale}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stall Occupancy %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgOccupancy}%</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} visitors/hr</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
