'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'port-shanghai',
    name: 'Port of Shanghai',
    lat: 31.23,
    lng: 121.49,
    status: 'stable',
    value: 124000,
    teuDay: 124000,
    vesselsQueued: 14,
    cranesActive: 38,
    berthUtilPct: 87,
    trend: 'up' as const,
    description: 'World busiest container port operating at near capacity with automated yard cranes sustaining high throughput across Yangshan deepwater terminals',
  },
  {
    id: 'port-singapore',
    name: 'PSA Singapore',
    lat: 1.26,
    lng: 103.84,
    status: 'stable',
    value: 108000,
    teuDay: 108000,
    vesselsQueued: 9,
    cranesActive: 42,
    berthUtilPct: 82,
    trend: 'stable' as const,
    description: 'Transshipment hub maintaining efficient vessel turnaround with automated guided vehicles supporting quayside operations',
  },
  {
    id: 'port-la',
    name: 'Port of Los Angeles',
    lat: 33.74,
    lng: -118.27,
    status: 'warning',
    value: 42000,
    teuDay: 42000,
    vesselsQueued: 28,
    cranesActive: 22,
    berthUtilPct: 94,
    trend: 'up' as const,
    description: 'Congestion persists with anchored vessel queue extending outside breakwater as labor dispatch slows yard velocity',
  },
  {
    id: 'port-rotterdam',
    name: 'Port of Rotterdam',
    lat: 51.95,
    lng: 4.14,
    status: 'moderate',
    value: 58000,
    teuDay: 58000,
    vesselsQueued: 11,
    cranesActive: 30,
    berthUtilPct: 78,
    trend: 'down' as const,
    description: 'Europe largest port handling steady volumes with automated terminal Maasvlakte 2 performing reliably under autumn wind constraints',
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

export function SeaportContainerTerminalMonitor() {
  const state = useMapStore((s) => s.seaportContainerTerminal)
  const setState = useMapStore((s) => s.setSeaportContainerTerminal)

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
    if (filteredData.length === 0) return { teuDay: 0, vesselsQueued: 0, cranesActive: 0, berthUtilPct: 0 }
    const teuDay = filteredData.reduce((s: number, d: any) => s + (d.teuDay as number), 0)
    const vesselsQueued = filteredData.reduce((s: number, d: any) => s + (d.vesselsQueued as number), 0)
    const cranesActive = filteredData.reduce((s: number, d: any) => s + (d.cranesActive as number), 0)
    const berthUtilPct = filteredData.reduce((s: number, d: any) => s + (d.berthUtilPct as number), 0) / filteredData.length
    return {
      teuDay: teuDay.toLocaleString(),
      vesselsQueued: vesselsQueued.toLocaleString(),
      cranesActive: cranesActive.toLocaleString(),
      berthUtilPct: berthUtilPct.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9874;</span>
          <h3 className="text-sm font-semibold text-white">Seaport Container Terminal</h3>
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
            <div className="text-slate-400">TEU/day</div>
            <div className="text-sm font-semibold text-white">{metrics.teuDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Vessels Queued</div>
            <div className="text-sm font-semibold text-white">{metrics.vesselsQueued}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cranes Active</div>
            <div className="text-sm font-semibold text-white">{metrics.cranesActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Berth Util %</div>
            <div className="text-sm font-semibold text-white">{metrics.berthUtilPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} TEU/day throughput</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
