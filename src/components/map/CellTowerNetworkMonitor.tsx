'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cell-nyc',
    name: 'NYC Cell Grid',
    lat: 40.7128,
    lng: -74.0014,
    status: 'critical',
    value: 1240,
    activeTowers: 1240,
    signalStrengthDb: -98,
    usersConnected: 482000,
    avgLatencyMs: 78,
    trend: 'up' as const,
    description: 'Severe outage across multiple cell sites with thousands of users affected and degraded voice/data handoffs',
  },
  {
    id: 'cell-tokyo',
    name: 'Tokyo Tower',
    lat: 35.6586,
    lng: 139.7454,
    status: 'warning',
    value: 980,
    activeTowers: 980,
    signalStrengthDb: -86,
    usersConnected: 311000,
    avgLatencyMs: 42,
    trend: 'up' as const,
    description: 'Degraded signal reported during evening peak with intermittent call drops across central wards',
  },
  {
    id: 'cell-london',
    name: 'London Battersea',
    lat: 51.4816,
    lng: -0.155,
    status: 'moderate',
    value: 760,
    activeTowers: 760,
    signalStrengthDb: -78,
    usersConnected: 198000,
    avgLatencyMs: 31,
    trend: 'stable' as const,
    description: 'Network operating within expected parameters with steady handoffs and balanced sector loads',
  },
  {
    id: 'cell-seoul',
    name: 'Seoul Gangnam',
    lat: 37.4979,
    lng: 127.0276,
    status: 'stable',
    value: 1420,
    activeTowers: 1420,
    signalStrengthDb: -68,
    usersConnected: 527000,
    avgLatencyMs: 18,
    trend: 'down' as const,
    description: 'Optimal 5G coverage across all sectors with ultra-low latency and minimal interference',
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

export function CellTowerNetworkMonitor() {
  const state = useMapStore((s) => s.cellTowerNetwork)
  const setState = useMapStore((s) => s.setCellTowerNetwork)

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
    if (filteredData.length === 0)
      return { activeTowers: 0, signalStrengthDb: 0, usersConnected: 0, avgLatencyMs: 0 }
    const activeTowers = filteredData.reduce((s: number, d: any) => s + (d.activeTowers as number), 0)
    const signalStrengthDb = filteredData.reduce((s: number, d: any) => s + (d.signalStrengthDb as number), 0) / filteredData.length
    const usersConnected = filteredData.reduce((s: number, d: any) => s + (d.usersConnected as number), 0)
    const avgLatencyMs = filteredData.reduce((s: number, d: any) => s + (d.avgLatencyMs as number), 0) / filteredData.length
    return {
      activeTowers: activeTowers.toLocaleString(),
      signalStrengthDb: signalStrengthDb.toFixed(1) + ' dB',
      usersConnected: usersConnected.toLocaleString(),
      avgLatencyMs: avgLatencyMs.toFixed(1) + ' ms',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">📡</span>
          <h3 className="text-sm font-semibold text-white">Cell Tower Network Monitor</h3>
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
            <div className="text-slate-400">Active Towers</div>
            <div className="text-sm font-semibold text-white">{metrics.activeTowers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Signal Strength dB</div>
            <div className="text-sm font-semibold text-white">{metrics.signalStrengthDb}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Users Connected</div>
            <div className="text-sm font-semibold text-white">{metrics.usersConnected}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Latency ms</div>
            <div className="text-sm font-semibold text-white">{metrics.avgLatencyMs}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} active towers</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
