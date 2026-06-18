'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'wifi-nyc',
    name: 'NYC Free WiFi',
    lat: 40.7128,
    lng: -74.0014,
    status: 'critical',
    value: 412,
    hotspotsActive: 412,
    usersConnected: 28400,
    avgSpeedMbps: 6.4,
    coveragePct: 38,
    trend: 'down' as const,
    description: 'Many hotspots down across boroughs causing widespread connectivity gaps and slow roaming',
  },
  {
    id: 'wifi-singapore',
    name: 'Singapore Wireless',
    lat: 1.2834,
    lng: 103.8513,
    status: 'warning',
    value: 1280,
    hotspotsActive: 1280,
    usersConnected: 64200,
    avgSpeedMbps: 18.2,
    coveragePct: 78,
    trend: 'down' as const,
    description: 'Slow throughput reported during peak hours with congested backhaul on key access points',
  },
  {
    id: 'wifi-taipei',
    name: 'Taipei WiFi',
    lat: 25.033,
    lng: 121.5654,
    status: 'moderate',
    value: 940,
    hotspotsActive: 940,
    usersConnected: 31800,
    avgSpeedMbps: 32.6,
    coveragePct: 86,
    trend: 'stable' as const,
    description: 'Normal mesh performance with balanced load across the citywide hotspot grid',
  },
  {
    id: 'wifi-barcelona',
    name: 'Barcelona WiFi',
    lat: 41.3851,
    lng: 2.1734,
    status: 'stable',
    value: 1080,
    hotspotsActive: 1080,
    usersConnected: 42500,
    avgSpeedMbps: 48.9,
    coveragePct: 94,
    trend: 'up' as const,
    description: 'Optimal WiFi 6 coverage across all districts with seamless roaming and full backhaul capacity',
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

export function WifiHotspotNetworkMonitor() {
  const state = useMapStore((s) => s.wifiHotspotNetwork)
  const setState = useMapStore((s) => s.setWifiHotspotNetwork)

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
      return { hotspotsActive: 0, usersConnected: 0, avgSpeedMbps: 0, coveragePct: 0 }
    const hotspotsActive = filteredData.reduce((s: number, d: any) => s + (d.hotspotsActive as number), 0)
    const usersConnected = filteredData.reduce((s: number, d: any) => s + (d.usersConnected as number), 0)
    const avgSpeedMbps = filteredData.reduce((s: number, d: any) => s + (d.avgSpeedMbps as number), 0) / filteredData.length
    const coveragePct = filteredData.reduce((s: number, d: any) => s + (d.coveragePct as number), 0) / filteredData.length
    return {
      hotspotsActive: hotspotsActive.toLocaleString(),
      usersConnected: usersConnected.toLocaleString(),
      avgSpeedMbps: avgSpeedMbps.toFixed(1) + ' Mbps',
      coveragePct: coveragePct.toFixed(1) + ' %',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">📶</span>
          <h3 className="text-sm font-semibold text-white">WiFi Hotspot Network Monitor</h3>
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
            <div className="text-slate-400">Hotspots Active</div>
            <div className="text-sm font-semibold text-white">{metrics.hotspotsActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Users Connected</div>
            <div className="text-sm font-semibold text-white">{metrics.usersConnected}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Speed Mbps</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSpeedMbps}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Coverage %</div>
            <div className="text-sm font-semibold text-white">{metrics.coveragePct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} hotspots active</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
