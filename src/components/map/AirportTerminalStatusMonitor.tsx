'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'apt-atl',
    name: 'Hartsfield-Jackson ATL',
    lat: 33.64,
    lng: -84.43,
    status: 'critical',
    value: 92400,
    passengersHour: 92400,
    delayMin: 47,
    gatesActive: 195,
    flightsHour: 126,
    trend: 'up' as const,
    description: 'Major hub experiencing cascading delays due to afternoon thunderstorms grounding departures across the southeast corridor',
  },
  {
    id: 'apt-lhr',
    name: 'London Heathrow LHR',
    lat: 51.47,
    lng: -0.45,
    status: 'warning',
    value: 78200,
    passengersHour: 78200,
    delayMin: 23,
    gatesActive: 168,
    flightsHour: 88,
    trend: 'stable' as const,
    description: 'Slot constraints causing moderate departure delays with stack holding patterns over the terminal control area',
  },
  {
    id: 'apt-hnd',
    name: 'Tokyo Haneda HND',
    lat: 35.55,
    lng: 139.78,
    status: 'stable',
    value: 85600,
    passengersHour: 85600,
    delayMin: 8,
    gatesActive: 142,
    flightsHour: 94,
    trend: 'down' as const,
    description: 'Operations running near capacity with on-time performance above industry average across domestic and international terminals',
  },
  {
    id: 'apt-dxb',
    name: 'Dubai DXB',
    lat: 25.25,
    lng: 55.36,
    status: 'moderate',
    value: 71800,
    passengersHour: 71800,
    delayMin: 15,
    gatesActive: 156,
    flightsHour: 78,
    trend: 'up' as const,
    description: 'Peak evening bank in progress with concourse A handling A380 operations at full gate occupancy and stable turnaround times',
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

export function AirportTerminalStatusMonitor() {
  const state = useMapStore((s) => s.airportTerminalStatus)
  const setState = useMapStore((s) => s.setAirportTerminalStatus)

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
    if (filteredData.length === 0) return { passengersHour: 0, delayMin: 0, gatesActive: 0, flightsHour: 0 }
    const passengersHour = filteredData.reduce((s: number, d: any) => s + (d.passengersHour as number), 0)
    const delayMin = filteredData.reduce((s: number, d: any) => s + (d.delayMin as number), 0) / filteredData.length
    const gatesActive = filteredData.reduce((s: number, d: any) => s + (d.gatesActive as number), 0)
    const flightsHour = filteredData.reduce((s: number, d: any) => s + (d.flightsHour as number), 0)
    return {
      passengersHour: passengersHour.toLocaleString(),
      delayMin: delayMin.toFixed(0) + ' min',
      gatesActive: gatesActive.toLocaleString(),
      flightsHour: flightsHour.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-500 to-indigo-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9992;</span>
          <h3 className="text-sm font-semibold text-white">Airport Terminal Status</h3>
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
            <div className="text-slate-400">Gates Active</div>
            <div className="text-sm font-semibold text-white">{metrics.gatesActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Flights/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.flightsHour}</div>
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
