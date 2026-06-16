'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dc-aws',
    name: 'AWS N Virginia',
    lat: 39.03,
    lng: -77.45,
    status: 'critical',
    value: 85000,
    serversActive: 85000,
    powerMw: 142,
    pueRatio: 1.62,
    tempC: 34,
    trend: 'up' as const,
    description: 'Overheating across multiple availability zones with cooling plants unable to maintain setpoints',
  },
  {
    id: 'dc-google',
    name: 'Google Iowa',
    lat: 41.59,
    lng: -93.62,
    status: 'warning',
    value: 62000,
    serversActive: 62000,
    powerMw: 98,
    pueRatio: 1.18,
    tempC: 27,
    trend: 'up' as const,
    description: 'High compute load driving sustained power draw above normal operating envelopes',
  },
  {
    id: 'dc-azure',
    name: 'Azure Dublin',
    lat: 53.3498,
    lng: -6.2603,
    status: 'moderate',
    value: 41000,
    serversActive: 41000,
    powerMw: 64,
    pueRatio: 1.22,
    tempC: 22,
    trend: 'stable' as const,
    description: 'Normal operations with free-cooling active and balanced load across server halls',
  },
  {
    id: 'dc-alibaba',
    name: 'Alibaba Beijing',
    lat: 39.9042,
    lng: 116.4074,
    status: 'stable',
    value: 53000,
    serversActive: 53000,
    powerMw: 81,
    pueRatio: 1.12,
    tempC: 19,
    trend: 'down' as const,
    description: 'Optimal efficiency with liquid-cooled racks and PUE well below industry average',
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

export function DataCenterCloudMonitor() {
  const state = useMapStore((s) => s.dataCenterCloud)
  const setState = useMapStore((s) => s.setDataCenterCloud)

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
      return { serversActive: 0, powerMw: 0, pueRatio: 0, tempC: 0 }
    const serversActive = filteredData.reduce((s: number, d: any) => s + (d.serversActive as number), 0)
    const powerMw = filteredData.reduce((s: number, d: any) => s + (d.powerMw as number), 0)
    const pueRatio = filteredData.reduce((s: number, d: any) => s + (d.pueRatio as number), 0) / filteredData.length
    const tempC = filteredData.reduce((s: number, d: any) => s + (d.tempC as number), 0) / filteredData.length
    return {
      serversActive: serversActive.toLocaleString(),
      powerMw: powerMw.toLocaleString() + ' MW',
      pueRatio: pueRatio.toFixed(2),
      tempC: tempC.toFixed(1) + ' C',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖥️</span>
          <h3 className="text-sm font-semibold text-white">Data Center Cloud Monitor</h3>
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
            <div className="text-slate-400">Servers Active</div>
            <div className="text-sm font-semibold text-white">{metrics.serversActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Power MW</div>
            <div className="text-sm font-semibold text-white">{metrics.powerMw}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">PUE Ratio</div>
            <div className="text-sm font-semibold text-white">{metrics.pueRatio}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Temp C</div>
            <div className="text-sm font-semibold text-white">{metrics.tempC}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} servers active</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
