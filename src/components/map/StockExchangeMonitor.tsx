'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'exch-nyse',
    name: 'NYSE New York',
    lat: 40.7069,
    lng: -74.0094,
    status: 'critical',
    value: 42830,
    index: 42830,
    volume: 2840,
    change: -3.4,
    listed: 2400,
    trend: 'down' as const,
    description: 'Market crash with broad sell-off across sectors and circuit breakers triggered twice during morning session',
  },
  {
    id: 'exch-lse',
    name: 'LSE London',
    lat: 51.5149,
    lng: -0.1192,
    status: 'warning',
    value: 7820,
    index: 7820,
    volume: 1620,
    change: -1.2,
    listed: 1900,
    trend: 'down' as const,
    description: 'Declining session led by mining and energy sectors with defensive stocks holding relatively firm',
  },
  {
    id: 'exch-tse',
    name: 'Tokyo TSE',
    lat: 35.6812,
    lng: 139.772,
    status: 'moderate',
    value: 38450,
    index: 38450,
    volume: 1980,
    change: 0.3,
    listed: 3800,
    trend: 'stable' as const,
    description: 'Stable trading with balanced advances and declines and tech sector showing modest momentum',
  },
  {
    id: 'exch-hkex',
    name: 'HKEX Hong Kong',
    lat: 22.28,
    lng: 114.1588,
    status: 'stable',
    value: 19850,
    index: 19850,
    volume: 1340,
    change: 1.8,
    listed: 2600,
    trend: 'up' as const,
    description: 'Rising session supported by mainland inflows and strong performance in financials and consumer names',
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

export function StockExchangeMonitor() {
  const state = useMapStore((s) => s.stockExchangeMonitor)
  const setState = useMapStore((s) => s.setStockExchangeMonitor)

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
    if (filteredData.length === 0) return { avgIndex: 0, totalVolume: 0, avgChange: 0, totalListed: 0 }
    const avgIndex = filteredData.reduce((s: number, d: any) => s + (d.index as number), 0) / filteredData.length
    const totalVolume = filteredData.reduce((s: number, d: any) => s + (d.volume as number), 0)
    const avgChange = filteredData.reduce((s: number, d: any) => s + (d.change as number), 0) / filteredData.length
    const totalListed = filteredData.reduce((s: number, d: any) => s + (d.listed as number), 0)
    return {
      avgIndex: avgIndex.toFixed(0),
      totalVolume: totalVolume.toLocaleString(),
      avgChange: avgChange.toFixed(2),
      totalListed: totalListed.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-red-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <h3 className="text-sm font-semibold text-white">Stock Exchange Monitor</h3>
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
            <div className="text-slate-400">Index Points</div>
            <div className="text-sm font-semibold text-white">{metrics.avgIndex}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Volume M</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVolume}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Change %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgChange}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Listed Cos</div>
            <div className="text-sm font-semibold text-white">{metrics.totalListed}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} index pts</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
