'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fiber-equinix',
    name: 'Equinix Ashburn',
    lat: 39.0438,
    lng: -77.4874,
    status: 'critical',
    value: 4.2,
    bandwidthTbps: 4.2,
    latencyMs: 68,
    uptimePct: 97.8,
    routesActive: 12,
    trend: 'up' as const,
    description: 'Severed backbone link causing major rerouting and congestion across east coast transit paths',
  },
  {
    id: 'fiber-telehouse',
    name: 'Telehouse London',
    lat: 51.5074,
    lng: -0.1278,
    status: 'warning',
    value: 6.8,
    bandwidthTbps: 6.8,
    latencyMs: 38,
    uptimePct: 99.4,
    routesActive: 18,
    trend: 'up' as const,
    description: 'Degraded throughput on transatlantic spur with packet loss above SLA thresholds',
  },
  {
    id: 'fiber-decix',
    name: 'DE-CIX Frankfurt',
    lat: 50.1109,
    lng: 8.6821,
    status: 'moderate',
    value: 9.1,
    bandwidthTbps: 9.1,
    latencyMs: 21,
    uptimePct: 99.92,
    routesActive: 24,
    trend: 'stable' as const,
    description: 'Normal traffic distribution across peering fabric with balanced route utilization',
  },
  {
    id: 'fiber-jpix',
    name: 'JPIX Tokyo',
    lat: 35.6895,
    lng: 139.6917,
    status: 'stable',
    value: 11.4,
    bandwidthTbps: 11.4,
    latencyMs: 14,
    uptimePct: 99.99,
    routesActive: 32,
    trend: 'down' as const,
    description: 'Optimal backbone performance with full redundancy across all primary and dark fiber routes',
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

export function FiberOpticBackboneMonitor() {
  const state = useMapStore((s) => s.fiberOpticBackbone)
  const setState = useMapStore((s) => s.setFiberOpticBackbone)

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
      return { bandwidthTbps: 0, latencyMs: 0, uptimePct: 0, routesActive: 0 }
    const bandwidthTbps = filteredData.reduce((s: number, d: any) => s + (d.bandwidthTbps as number), 0)
    const latencyMs = filteredData.reduce((s: number, d: any) => s + (d.latencyMs as number), 0) / filteredData.length
    const uptimePct = filteredData.reduce((s: number, d: any) => s + (d.uptimePct as number), 0) / filteredData.length
    const routesActive = filteredData.reduce((s: number, d: any) => s + (d.routesActive as number), 0)
    return {
      bandwidthTbps: bandwidthTbps.toFixed(1) + ' Tbps',
      latencyMs: latencyMs.toFixed(1) + ' ms',
      uptimePct: uptimePct.toFixed(2) + ' %',
      routesActive: routesActive.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌐</span>
          <h3 className="text-sm font-semibold text-white">Fiber Optic Backbone Monitor</h3>
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
            <div className="text-slate-400">Bandwidth Tbps</div>
            <div className="text-sm font-semibold text-white">{metrics.bandwidthTbps}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Latency ms</div>
            <div className="text-sm font-semibold text-white">{metrics.latencyMs}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Uptime %</div>
            <div className="text-sm font-semibold text-white">{metrics.uptimePct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Routes Active</div>
            <div className="text-sm font-semibold text-white">{metrics.routesActive}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} Tbps bandwidth</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
