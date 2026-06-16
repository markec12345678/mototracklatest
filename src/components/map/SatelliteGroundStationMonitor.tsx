'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sat-goldstone',
    name: 'Goldstone CA',
    lat: 35.4259,
    lng: -116.89,
    status: 'critical',
    value: 0,
    satellitesTracked: 0,
    uplinksActive: 0,
    downlinksGbps: 0,
    signalQualityPct: 0,
    trend: 'down' as const,
    description: 'No signal reception due to antenna array fault severing all deep space network communications',
  },
  {
    id: 'sat-kourou',
    name: 'Kourou French Guiana',
    lat: 5.236,
    lng: -52.775,
    status: 'warning',
    value: 18,
    satellitesTracked: 18,
    uplinksActive: 9,
    downlinksGbps: 4.2,
    signalQualityPct: 71,
    trend: 'down' as const,
    description: 'Interference from atmospheric disturbance degrading uplink quality on multiple channels',
  },
  {
    id: 'sat-kiruna',
    name: 'Kiruna Sweden',
    lat: 67.8573,
    lng: 20.2253,
    status: 'moderate',
    value: 26,
    satellitesTracked: 26,
    uplinksActive: 14,
    downlinksGbps: 7.8,
    signalQualityPct: 88,
    trend: 'stable' as const,
    description: 'Normal Earth observation passes with reliable X-band downlinks and stable orbital tracking',
  },
  {
    id: 'sat-hartebeesthoek',
    name: 'Hartebeesthoek SA',
    lat: -25.887,
    lng: 27.6854,
    status: 'stable',
    value: 32,
    satellitesTracked: 32,
    uplinksActive: 18,
    downlinksGbps: 11.4,
    signalQualityPct: 96,
    trend: 'up' as const,
    description: 'Optimal reception across S and Ku bands with full antenna availability and clear skies',
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

export function SatelliteGroundStationMonitor() {
  const state = useMapStore((s) => s.satelliteGroundStation)
  const setState = useMapStore((s) => s.setSatelliteGroundStation)

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
      return { satellitesTracked: 0, uplinksActive: 0, downlinksGbps: 0, signalQualityPct: 0 }
    const satellitesTracked = filteredData.reduce((s: number, d: any) => s + (d.satellitesTracked as number), 0)
    const uplinksActive = filteredData.reduce((s: number, d: any) => s + (d.uplinksActive as number), 0)
    const downlinksGbps = filteredData.reduce((s: number, d: any) => s + (d.downlinksGbps as number), 0)
    const signalQualityPct = filteredData.reduce((s: number, d: any) => s + (d.signalQualityPct as number), 0) / filteredData.length
    return {
      satellitesTracked: satellitesTracked.toLocaleString(),
      uplinksActive: uplinksActive.toLocaleString(),
      downlinksGbps: downlinksGbps.toFixed(1) + ' Gbps',
      signalQualityPct: signalQualityPct.toFixed(1) + ' %',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-500 to-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛰️</span>
          <h3 className="text-sm font-semibold text-white">Satellite Ground Station Monitor</h3>
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
            <div className="text-slate-400">Satellites Tracked</div>
            <div className="text-sm font-semibold text-white">{metrics.satellitesTracked}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Uplinks Active</div>
            <div className="text-sm font-semibold text-white">{metrics.uplinksActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Downlinks Gbps</div>
            <div className="text-sm font-semibold text-white">{metrics.downlinksGbps}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Signal Quality %</div>
            <div className="text-sm font-semibold text-white">{metrics.signalQualityPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} satellites tracked</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
