'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mine-mongolia',
    name: 'Inner Mongolia China',
    lat: 40.81,
    lng: 111.67,
    status: 'critical',
    value: 0,
    hashrate: 0,
    power: 0,
    btc: 0,
    efficiency: 95,
    trend: 'down' as const,
    description: 'Offline facility following regulatory suspension with all mining rigs powered down since the quarterly crackdown',
  },
  {
    id: 'mine-texas',
    name: 'Texas Rockdale',
    lat: 30.7936,
    lng: -96.9311,
    status: 'warning',
    value: 18200,
    hashrate: 18200,
    power: 180,
    btc: 14,
    efficiency: 42,
    trend: 'down' as const,
    description: 'Low output during peak grid pricing with voluntary curtailment reducing hashrate by nearly half of nameplate capacity',
  },
  {
    id: 'mine-iceland',
    name: 'Iceland Reykjavik',
    lat: 64.1466,
    lng: -21.9426,
    status: 'moderate',
    value: 24600,
    hashrate: 24600,
    power: 120,
    btc: 19,
    efficiency: 28,
    trend: 'stable' as const,
    description: 'Operational facility running on geothermal and hydro power with steady output and stable ambient cooling profile',
  },
  {
    id: 'mine-tbilisi',
    name: 'Georgia Tbilisi',
    lat: 41.7151,
    lng: 44.8271,
    status: 'stable',
    value: 31200,
    hashrate: 31200,
    power: 145,
    btc: 24,
    efficiency: 22,
    trend: 'up' as const,
    description: 'Optimal performance with cheap hydropower contracts and recently expanded capacity running at peak efficiency',
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

export function CryptocurrencyMiningMonitor() {
  const state = useMapStore((s) => s.cryptocurrencyMining)
  const setState = useMapStore((s) => s.setCryptocurrencyMining)

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
    if (filteredData.length === 0) return { totalHashrate: 0, totalPower: 0, totalBtc: 0, avgEfficiency: 0 }
    const totalHashrate = filteredData.reduce((s: number, d: any) => s + (d.hashrate as number), 0)
    const totalPower = filteredData.reduce((s: number, d: any) => s + (d.power as number), 0)
    const totalBtc = filteredData.reduce((s: number, d: any) => s + (d.btc as number), 0)
    const avgEfficiency = filteredData.reduce((s: number, d: any) => s + (d.efficiency as number), 0) / filteredData.length
    return {
      totalHashrate: totalHashrate.toLocaleString(),
      totalPower: totalPower.toFixed(0),
      totalBtc: totalBtc.toFixed(0),
      avgEfficiency: avgEfficiency.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-yellow-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛏️</span>
          <h3 className="text-sm font-semibold text-white">Cryptocurrency Mining Monitor</h3>
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
            <div className="text-slate-400">Hashrate TH/s</div>
            <div className="text-sm font-semibold text-white">{metrics.totalHashrate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Power MW</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPower}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">BTC Mined</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBtc}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Efficiency J/TH</div>
            <div className="text-sm font-semibold text-white">{metrics.avgEfficiency}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} TH/s</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
