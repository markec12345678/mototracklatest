'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ed-nyc911',
    name: 'NYC 911',
    lat: 40.7128,
    lng: -74.0014,
    status: 'critical',
    value: 2400,
    callsPerHr: 2400,
    avgResponseS: 95,
    dispatchQueue: 180,
    operatorsActive: 320,
    trend: 'up' as const,
    description: 'Call volume surging past capacity with extended queue depths and back-to-back dispatch assignments',
  },
  {
    id: 'ed-london999',
    name: 'London 999',
    lat: 51.5074,
    lng: -0.1278,
    status: 'warning',
    value: 980,
    callsPerHr: 980,
    avgResponseS: 70,
    dispatchQueue: 65,
    operatorsActive: 180,
    trend: 'up' as const,
    description: 'Busy triage flow with rising demand across the metropolis and moderate operator strain',
  },
  {
    id: 'ed-tokyo110',
    name: 'Tokyo 110',
    lat: 35.6895,
    lng: 139.6917,
    status: 'moderate',
    value: 420,
    callsPerHr: 420,
    avgResponseS: 55,
    dispatchQueue: 18,
    operatorsActive: 90,
    trend: 'stable' as const,
    description: 'Steady call intake with healthy queue depth and rapid dispatcher handoffs across precincts',
  },
  {
    id: 'ed-sydney000',
    name: 'Sydney 000',
    lat: -33.8688,
    lng: 151.2093,
    status: 'stable',
    value: 150,
    callsPerHr: 150,
    avgResponseS: 48,
    dispatchQueue: 6,
    operatorsActive: 45,
    trend: 'down' as const,
    description: 'Quiet shift with light call volume and ample operator availability statewide',
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

export function EmergencyDispatch911Monitor() {
  const state = useMapStore((s) => s.emergencyDispatch911)
  const setState = useMapStore((s) => s.setEmergencyDispatch911)

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
      return { callsPerHr: 0, avgResponseS: 0, dispatchQueue: 0, operatorsActive: 0 }
    const callsPerHr = filteredData.reduce((s: number, d: any) => s + (d.callsPerHr as number), 0)
    const avgResponseS =
      filteredData.reduce((s: number, d: any) => s + (d.avgResponseS as number), 0) / filteredData.length
    const dispatchQueue = filteredData.reduce((s: number, d: any) => s + (d.dispatchQueue as number), 0)
    const operatorsActive = filteredData.reduce((s: number, d: any) => s + (d.operatorsActive as number), 0)
    return {
      callsPerHr: callsPerHr.toLocaleString(),
      avgResponseS: avgResponseS.toFixed(0) + ' s',
      dispatchQueue: dispatchQueue.toLocaleString(),
      operatorsActive: operatorsActive.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-red-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">☎️</span>
          <h3 className="text-sm font-semibold text-white">Emergency Dispatch 911 Monitor</h3>
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
            <div className="text-slate-400">Calls/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.callsPerHr}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Response s</div>
            <div className="text-sm font-semibold text-white">{metrics.avgResponseS}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Dispatch Queue</div>
            <div className="text-sm font-semibold text-white">{metrics.dispatchQueue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Operators Active</div>
            <div className="text-sm font-semibold text-white">{metrics.operatorsActive}</div>
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
              <span className="text-slate-300 font-medium">
                {activeItem.value.toLocaleString()} calls/hr
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
