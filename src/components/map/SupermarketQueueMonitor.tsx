'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sm-walmart',
    name: 'Walmart Bentonville',
    lat: 36.3729,
    lng: -94.2088,
    status: 'critical',
    value: 28,
    queueLength: 28,
    waitTime: 22,
    checkoutOpen: 14,
    stockLevel: 88,
    trend: 'up' as const,
    description: 'Very long pre-holiday queues with all checkouts open and 22-minute average wait times',
  },
  {
    id: 'sm-tesco',
    name: 'Tesco London',
    lat: 51.5074,
    lng: -0.1278,
    status: 'warning',
    value: 16,
    queueLength: 16,
    waitTime: 12,
    checkoutOpen: 8,
    stockLevel: 92,
    trend: 'up' as const,
    description: 'Long evening rush queues at Express stores with self-checkout backups building up',
  },
  {
    id: 'sm-carrefour',
    name: 'Carrefour Paris',
    lat: 48.8566,
    lng: 2.3522,
    status: 'moderate',
    value: 8,
    queueLength: 8,
    waitTime: 6,
    checkoutOpen: 12,
    stockLevel: 95,
    trend: 'stable' as const,
    description: 'Normal midday flow with adequate checkout staffing and minimal queue buildup',
  },
  {
    id: 'sm-aldi',
    name: 'Aldi Essen',
    lat: 51.4556,
    lng: 7.0116,
    status: 'stable',
    value: 3,
    queueLength: 3,
    waitTime: 2,
    checkoutOpen: 4,
    stockLevel: 97,
    trend: 'down' as const,
    description: 'Short early-morning queues with quick turnover and well-stocked aisles',
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

export function SupermarketQueueMonitor() {
  const state = useMapStore((s) => s.supermarketQueue)
  const setState = useMapStore((s) => s.setSupermarketQueue)

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
    if (filteredData.length === 0) return { totalQueue: 0, avgWait: 0, totalCheckouts: 0, avgStock: 0 }
    const totalQueue = filteredData.reduce((s: number, d: any) => s + (d.queueLength as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.waitTime as number), 0) / filteredData.length
    const totalCheckouts = filteredData.reduce((s: number, d: any) => s + (d.checkoutOpen as number), 0)
    const avgStock = filteredData.reduce((s: number, d: any) => s + (d.stockLevel as number), 0) / filteredData.length
    return {
      totalQueue: totalQueue.toLocaleString(),
      avgWait: avgWait.toFixed(0),
      totalCheckouts: totalCheckouts.toLocaleString(),
      avgStock: avgStock.toFixed(0),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛒</span>
          <h3 className="text-sm font-semibold text-white">Supermarket Queue Monitor</h3>
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
            <div className="text-slate-400">Queue Length</div>
            <div className="text-sm font-semibold text-white">{metrics.totalQueue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Wait Time min</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Checkout Open</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCheckouts}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stock Level %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgStock}%</div>
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
                <span className="text-xs text-slate-300">{loc.value}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} in queue</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
