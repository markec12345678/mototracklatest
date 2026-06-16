'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'vtm-singapore',
    name: 'Singapore Strait VTS',
    lat: 1.27,
    lng: 103.84,
    status: 'warning',
    value: 1850,
    vesselsTracked: 1850,
    crossingEvents: 42,
    closestPointCPA: 0.8,
    trafficDensity: 96,
    trend: 'up' as const,
    description: 'One of the worlds busiest straits with dense traffic separation scheme experiencing elevated close-quarter situations during southwest monsoon',
  },
  {
    id: 'vtm-english',
    name: 'English Channel VTS',
    lat: 50.68,
    lng: 1.52,
    status: 'moderate',
    value: 620,
    vesselsTracked: 620,
    crossingEvents: 18,
    closestPointCPA: 1.4,
    trafficDensity: 78,
    trend: 'stable' as const,
    description: 'Dover-Calais traffic corridor maintaining safe separation with efficient VTS coordination across the Channel Navigation Information Service',
  },
  {
    id: 'vtm-bosporus',
    name: 'Bosporus Strait VTS',
    lat: 41.12,
    lng: 29.06,
    status: 'critical',
    value: 280,
    vesselsTracked: 280,
    crossingEvents: 56,
    closestPointCPA: 0.3,
    trafficDensity: 89,
    trend: 'up' as const,
    description: 'Narrow Turkish strait under severe strain with northbound tankers queueing and current restrictions reducing transit scheduling capacity',
  },
  {
    id: 'vtm-malacca',
    name: 'Malacca Strait VTS',
    lat: 2.5,
    lng: 101.4,
    status: 'stable',
    value: 1240,
    vesselsTracked: 1240,
    crossingEvents: 24,
    closestPointCPA: 1.8,
    trafficDensity: 82,
    trend: 'stable' as const,
    description: 'Critical Asian shipping lane with co-operative VTS between Indonesia Malaysia and Singapore maintaining safe through traffic flow',
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

export function VesselTrafficManagementMonitor() {
  const state = useMapStore((s) => s.vesselTrafficManagement)
  const setState = useMapStore((s) => s.setVesselTrafficManagement)

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
    if (filteredData.length === 0) return { vesselsTracked: 0, crossingEvents: 0, closestPointCPA: 0, trafficDensity: 0 }
    const vesselsTracked = filteredData.reduce((s: number, d: any) => s + (d.vesselsTracked as number), 0)
    const crossingEvents = filteredData.reduce((s: number, d: any) => s + (d.crossingEvents as number), 0)
    const closestPointCPA = filteredData.reduce((s: number, d: any) => s + (d.closestPointCPA as number), 0) / filteredData.length
    const trafficDensity = filteredData.reduce((s: number, d: any) => s + (d.trafficDensity as number), 0) / filteredData.length
    return {
      vesselsTracked: vesselsTracked.toLocaleString(),
      crossingEvents: crossingEvents.toLocaleString(),
      closestPointCPA: closestPointCPA.toFixed(1) + ' nm',
      trafficDensity: trafficDensity.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9875;</span>
          <h3 className="text-sm font-semibold text-white">Vessel Traffic Management</h3>
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
            <div className="text-slate-400">Vessels Tracked</div>
            <div className="text-sm font-semibold text-white">{metrics.vesselsTracked}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Crossing Events</div>
            <div className="text-sm font-semibold text-white">{metrics.crossingEvents}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg CPA</div>
            <div className="text-sm font-semibold text-white">{metrics.closestPointCPA}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Traffic Density</div>
            <div className="text-sm font-semibold text-white">{metrics.trafficDensity}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} vessels actively tracked</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
