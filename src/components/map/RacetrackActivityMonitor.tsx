'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'race-monaco',
    name: 'Monaco F1',
    lat: 43.7347,
    lng: 7.4206,
    status: 'critical',
    value: 20,
    lapRecord: 71.4,
    carsRacing: 20,
    spectators: 215000,
    pitStops: 28,
    trend: 'up' as const,
    description: 'Red flag deployed after a multi-car crash at the Swimming Pool chicane halting the Grand Prix',
  },
  {
    id: 'race-indy500',
    name: 'Indianapolis 500',
    lat: 39.7953,
    lng: -86.2354,
    status: 'warning',
    value: 33,
    lapRecord: 37.6,
    carsRacing: 33,
    spectators: 300000,
    pitStops: 42,
    trend: 'stable' as const,
    description: 'Yellow flag caution for debris on the backstretch with the field bunched behind the pace car',
  },
  {
    id: 'race-daytona',
    name: 'Daytona Florida',
    lat: 29.191,
    lng: -81.07,
    status: 'moderate',
    value: 40,
    lapRecord: 44.7,
    carsRacing: 40,
    spectators: 100000,
    pitStops: 18,
    trend: 'up' as const,
    description: 'Green flag racing under clear skies with a tightly packed field drafting through the tri-oval',
  },
  {
    id: 'race-suzuka',
    name: 'Suzuka Japan',
    lat: 34.8431,
    lng: 136.5395,
    status: 'stable',
    value: 22,
    lapRecord: 88.0,
    carsRacing: 22,
    spectators: 35000,
    pitStops: 0,
    trend: 'down' as const,
    description: 'Free practice session running smoothly with no timed stops and crews evaluating tire strategy',
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

export function RacetrackActivityMonitor() {
  const state = useMapStore((s) => s.racetrackActivity)
  const setState = useMapStore((s) => s.setRacetrackActivity)

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
    if (filteredData.length === 0) return { bestLap: 0, totalCars: 0, totalSpectators: 0, totalPitStops: 0 }
    const bestLap = Math.min(...filteredData.map((d: any) => d.lapRecord as number))
    const totalCars = filteredData.reduce((s: number, d: any) => s + (d.carsRacing as number), 0)
    const totalSpectators = filteredData.reduce((s: number, d: any) => s + (d.spectators as number), 0)
    const totalPitStops = filteredData.reduce((s: number, d: any) => s + (d.pitStops as number), 0)
    return {
      bestLap: bestLap.toFixed(1) + 's',
      totalCars: totalCars.toLocaleString(),
      totalSpectators: totalSpectators.toLocaleString(),
      totalPitStops: totalPitStops.toLocaleString(),
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
          <span className="text-lg">🏁</span>
          <h3 className="text-sm font-semibold text-white">Racetrack Activity Monitor</h3>
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
            <div className="text-slate-400">Lap Record</div>
            <div className="text-sm font-semibold text-white">{metrics.bestLap}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cars Racing</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCars}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Spectators</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSpectators}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Pit Stops</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPitStops}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} cars racing</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
