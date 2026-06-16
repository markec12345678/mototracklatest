'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cruise-miami',
    name: 'Miami Port',
    lat: 25.7781,
    lng: -80.1668,
    status: 'critical',
    value: 8,
    ships: 8,
    passengers: 24500,
    berthOcc: 95,
    turnaround: 12,
    trend: 'up' as const,
    description: 'Congested Saturday turnaround with all berths occupied and traffic backing up MacArthur Causeway',
  },
  {
    id: 'cruise-barcelona',
    name: 'Barcelona Port',
    lat: 41.3465,
    lng: 2.1403,
    status: 'warning',
    value: 6,
    ships: 6,
    passengers: 18200,
    berthOcc: 82,
    turnaround: 10,
    trend: 'stable' as const,
    description: 'Busy Mediterranean turnaround with managed gangway flow and customs processing on schedule',
  },
  {
    id: 'cruise-cozumel',
    name: 'Cozumel Mexico',
    lat: 20.423,
    lng: -86.9244,
    status: 'moderate',
    value: 4,
    ships: 4,
    passengers: 12800,
    berthOcc: 65,
    turnaround: 8,
    trend: 'up' as const,
    description: 'Active port call day with four ships at Punta Langosta and International piers',
  },
  {
    id: 'cruise-nassau',
    name: 'Nassau Bahamas',
    lat: 25.0833,
    lng: -77.35,
    status: 'stable',
    value: 2,
    ships: 2,
    passengers: 5400,
    berthOcc: 38,
    turnaround: 6,
    trend: 'down' as const,
    description: 'Quiet weekday with two ships alongside and rapid tender operations to Paradise Island',
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

export function CruisePortActivityMonitor() {
  const state = useMapStore((s) => s.cruisePortActivityMonitor)
  const setState = useMapStore((s) => s.setCruisePortActivityMonitor)

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
    if (filteredData.length === 0) return { totalShips: 0, totalPassengers: 0, avgBerth: 0, avgTurnaround: 0 }
    const totalShips = filteredData.reduce((s: number, d: any) => s + (d.ships as number), 0)
    const totalPassengers = filteredData.reduce((s: number, d: any) => s + (d.passengers as number), 0)
    const avgBerth = filteredData.reduce((s: number, d: any) => s + (d.berthOcc as number), 0) / filteredData.length
    const avgTurnaround =
      filteredData.reduce((s: number, d: any) => s + (d.turnaround as number), 0) / filteredData.length
    return {
      totalShips,
      totalPassengers: totalPassengers.toLocaleString(),
      avgBerth: avgBerth.toFixed(0),
      avgTurnaround: avgTurnaround.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-emerald-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚢</span>
          <h3 className="text-sm font-semibold text-white">Cruise Port Activity Monitor</h3>
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
            <div className="text-slate-400">Ships Docked</div>
            <div className="text-sm font-semibold text-white">{metrics.totalShips}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Passengers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPassengers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Berth Occupancy %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgBerth}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Turnaround hr</div>
            <div className="text-sm font-semibold text-white">{metrics.avgTurnaround}</div>
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
                <span className="text-xs text-slate-300">{loc.value} ships</span>
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
              Primary metric: <span className="text-slate-300 font-medium">{activeItem.value} ships docked</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
