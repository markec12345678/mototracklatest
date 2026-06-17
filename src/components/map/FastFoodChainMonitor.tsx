'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ff-mcd',
    name: 'McDonalds Times Square',
    lat: 40.758,
    lng: -73.985,
    status: 'stable',
    value: 95,
    ordersPerHour: 420,
    driveThruPct: 68,
    avgTicketSize: 9.4,
    trend: 'up' as const,
    description: 'Flagship 24-hour Times Square McDonalds serving 420+ orders per hour with dual-lane drive-thru and self-order kiosks',
  },
  {
    id: 'ff-bk',
    name: 'Burger King Oxford St',
    lat: 51.515,
    lng: -0.142,
    status: 'moderate',
    value: 78,
    ordersPerHour: 280,
    driveThruPct: 42,
    avgTicketSize: 7.8,
    trend: 'stable' as const,
    description: 'Central London Burger King with high foot traffic from Oxford Street shoppers and tourists',
  },
  {
    id: 'ff-kfc',
    name: 'KFC Shibuya Crossing',
    lat: 35.66,
    lng: 139.7,
    status: 'stable',
    value: 88,
    ordersPerHour: 365,
    driveThruPct: 12,
    avgTicketSize: 11.2,
    trend: 'up' as const,
    description: 'Japan flagship KFC at Shibuya Crossing famous for Christmas chicken tradition with hour-long queues in December',
  },
  {
    id: 'ff-subway',
    name: 'Subway Downtown Toronto',
    lat: 43.653,
    lng: -79.383,
    status: 'warning',
    value: 62,
    ordersPerHour: 145,
    driveThruPct: 0,
    avgTicketSize: 8.6,
    trend: 'down' as const,
    description: 'Downtown Toronto Subway franchise affected by lunchtime competition from local sandwich shops and ghost kitchens',
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

export function FastFoodChainMonitor() {
  const state = useMapStore((s) => s.fastFoodChain)
  const setState = useMapStore((s) => s.setFastFoodChain)

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
    if (filteredData.length === 0) return { totalOrders: 0, avgDriveThru: '0%', avgTicket: '$0', totalRevenue: '$0' }
    const totalOrders = filteredData.reduce((s: number, d: any) => s + (d.ordersPerHour as number), 0)
    const avgDriveThru = filteredData.reduce((s: number, d: any) => s + (d.driveThruPct as number), 0) / filteredData.length
    const avgTicket = filteredData.reduce((s: number, d: any) => s + (d.avgTicketSize as number), 0) / filteredData.length
    const totalRevenue = totalOrders * avgTicket
    return {
      totalOrders,
      avgDriveThru: avgDriveThru.toFixed(0) + '%',
      avgTicket: '$' + avgTicket.toFixed(2),
      totalRevenue: '$' + (totalRevenue / 1000).toFixed(1) + 'K/hr',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-700 to-orange-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127831;</span>
          <h3 className="text-sm font-semibold text-white">Fast Food Chain</h3>
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
            <div className="text-slate-400">Orders / hr</div>
            <div className="text-sm font-semibold text-white">{metrics.totalOrders}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Drive-Thru</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDriveThru}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ticket</div>
            <div className="text-sm font-semibold text-white">{metrics.avgTicket}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue / hr</div>
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
                <span className="text-xs text-slate-300">{loc.ordersPerHour}/hr</span>
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
              <span className="text-slate-300 font-medium">{activeItem.ordersPerHour} orders/hr, {activeItem.driveThruPct}% drive-thru, ${activeItem.avgTicketSize} ticket</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
