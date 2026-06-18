'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'te-lapd',
    name: 'LAPD Traffic',
    lat: 34.0522,
    lng: -118.2437,
    status: 'critical',
    value: 2400,
    citationsToday: 2400,
    unitsPatrol: 180,
    speedCameras: 420,
    avgSpeedKmh: 72,
    trend: 'up' as const,
    description: 'Major incidents across freeway corridors with heavy citation tempo and elevated response activity',
  },
  {
    id: 'te-metpolice',
    name: 'Met Police London',
    lat: 51.5074,
    lng: -0.1278,
    status: 'warning',
    value: 980,
    citationsToday: 980,
    unitsPatrol: 140,
    speedCameras: 850,
    avgSpeedKmh: 48,
    trend: 'up' as const,
    description: 'Active enforcement across congestion zone with dense camera coverage and steady citation flow',
  },
  {
    id: 'te-tokyo',
    name: 'Tokyo Traffic',
    lat: 35.6895,
    lng: 139.6917,
    status: 'moderate',
    value: 420,
    citationsToday: 420,
    unitsPatrol: 95,
    speedCameras: 210,
    avgSpeedKmh: 42,
    trend: 'stable' as const,
    description: 'Routine urban enforcement with moderate citation volume and standard patrol coverage',
  },
  {
    id: 'te-autobahn',
    name: 'Autobahn Patrol',
    lat: 50.1109,
    lng: 8.6821,
    status: 'stable',
    value: 180,
    citationsToday: 180,
    unitsPatrol: 60,
    speedCameras: 120,
    avgSpeedKmh: 128,
    trend: 'down' as const,
    description: 'Quiet enforcement shift with light citation volume and high free-flow speeds across corridors',
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

export function TrafficEnforcementUnitMonitor() {
  const state = useMapStore((s) => s.trafficEnforcementUnit)
  const setState = useMapStore((s) => s.setTrafficEnforcementUnit)

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
      return { citationsToday: 0, unitsPatrol: 0, speedCameras: 0, avgSpeedKmh: 0 }
    const citationsToday = filteredData.reduce((s: number, d: any) => s + (d.citationsToday as number), 0)
    const unitsPatrol = filteredData.reduce((s: number, d: any) => s + (d.unitsPatrol as number), 0)
    const speedCameras = filteredData.reduce((s: number, d: any) => s + (d.speedCameras as number), 0)
    const avgSpeedKmh =
      filteredData.reduce((s: number, d: any) => s + (d.avgSpeedKmh as number), 0) / filteredData.length
    return {
      citationsToday: citationsToday.toLocaleString(),
      unitsPatrol: unitsPatrol.toLocaleString(),
      speedCameras: speedCameras.toLocaleString(),
      avgSpeedKmh: avgSpeedKmh.toFixed(0) + ' km/h',
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
          <span className="text-lg">🚔</span>
          <h3 className="text-sm font-semibold text-white">Traffic Enforcement Unit Monitor</h3>
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
            <div className="text-slate-400">Citations Today</div>
            <div className="text-sm font-semibold text-white">{metrics.citationsToday}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Units Patrol</div>
            <div className="text-sm font-semibold text-white">{metrics.unitsPatrol}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Speed Cameras</div>
            <div className="text-sm font-semibold text-white">{metrics.speedCameras}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Speed km/h</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSpeedKmh}</div>
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
                {activeItem.value.toLocaleString()} citations today
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
