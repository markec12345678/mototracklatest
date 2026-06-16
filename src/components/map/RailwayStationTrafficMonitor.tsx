'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'rail-tokyo',
    name: 'Tokyo Shinagawa',
    lat: 35.63,
    lng: 139.74,
    status: 'stable',
    value: 285000,
    passengersHour: 285000,
    delayMin: 1,
    platformsActive: 14,
    trainsHour: 96,
    trend: 'up' as const,
    description: 'Shinkansen and Yamanote line interchange operating at peak efficiency with sub-minute average delay across morning rush',
  },
  {
    id: 'rail-grandcentral',
    name: 'NY Grand Central',
    lat: 40.75,
    lng: -73.98,
    status: 'warning',
    value: 142000,
    passengersHour: 142000,
    delayMin: 12,
    platformsActive: 44,
    trainsHour: 68,
    trend: 'up' as const,
    description: 'Metro-North commuter services experiencing signal delays on the Harlem line causing ripple effects across the terminal',
  },
  {
    id: 'rail-paris',
    name: 'Paris Gare du Nord',
    lat: 48.88,
    lng: 2.35,
    status: 'moderate',
    value: 198000,
    passengersHour: 198000,
    delayMin: 6,
    platformsActive: 32,
    trainsHour: 84,
    trend: 'stable' as const,
    description: 'Eurostar and RER interchange handling steady cross-border traffic with minor platform reassignment disruptions',
  },
  {
    id: 'rail-mumbai',
    name: 'Mumbai CST',
    lat: 18.94,
    lng: 72.84,
    status: 'critical',
    value: 312000,
    passengersHour: 312000,
    delayMin: 28,
    platformsActive: 18,
    trainsHour: 102,
    trend: 'up' as const,
    description: 'Suburban network under severe strain as monsoon waterlogging on the central line forces cancellations and overcrowded platforms',
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

export function RailwayStationTrafficMonitor() {
  const state = useMapStore((s) => s.railwayStationTraffic)
  const setState = useMapStore((s) => s.setRailwayStationTraffic)

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
    if (filteredData.length === 0) return { passengersHour: 0, delayMin: 0, platformsActive: 0, trainsHour: 0 }
    const passengersHour = filteredData.reduce((s: number, d: any) => s + (d.passengersHour as number), 0)
    const delayMin = filteredData.reduce((s: number, d: any) => s + (d.delayMin as number), 0) / filteredData.length
    const platformsActive = filteredData.reduce((s: number, d: any) => s + (d.platformsActive as number), 0)
    const trainsHour = filteredData.reduce((s: number, d: any) => s + (d.trainsHour as number), 0)
    return {
      passengersHour: passengersHour.toLocaleString(),
      delayMin: delayMin.toFixed(1) + ' min',
      platformsActive: platformsActive.toLocaleString(),
      trainsHour: trainsHour.toLocaleString(),
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
          <span className="text-lg">&#128646;</span>
          <h3 className="text-sm font-semibold text-white">Railway Station Traffic</h3>
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
            <div className="text-slate-400">Passengers/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.passengersHour}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Delay</div>
            <div className="text-sm font-semibold text-white">{metrics.delayMin}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Platforms Active</div>
            <div className="text-sm font-semibold text-white">{metrics.platformsActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Trains/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.trainsHour}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} pax/hr throughput</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
