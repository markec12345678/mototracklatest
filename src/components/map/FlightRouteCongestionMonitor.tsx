'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'frc-northatlantic',
    name: 'North Atlantic Tracks',
    lat: 55.0,
    lng: -30.0,
    status: 'critical',
    value: 1450,
    flightsPerHour: 1450,
    avgSpeedDrop: 18,
    reroutesIssued: 24,
    congestionIndex: 94,
    trend: 'up' as const,
    description: 'NAT Organized Track System under peak transatlantic morning rush with westbound JFK-LHR-CDG traffic competing for optimal jet stream altitudes',
  },
  {
    id: 'frc-europe',
    name: 'European Core Area',
    lat: 50.11,
    lng: 8.68,
    status: 'warning',
    value: 980,
    flightsPerHour: 980,
    avgSpeedDrop: 12,
    reroutesIssued: 18,
    congestionIndex: 78,
    trend: 'stable' as const,
    description: 'Eurocontrol Maastricht UAC and Karlsruhe UAC sectors experiencing sustained high density across the Brussels-Frankfurt-Munich corridor',
  },
  {
    id: 'frc-china',
    name: 'Eastern China Airspace',
    lat: 31.23,
    lng: 121.47,
    status: 'warning',
    value: 1120,
    flightsPerHour: 1120,
    avgSpeedDrop: 15,
    reroutesIssued: 32,
    congestionIndex: 85,
    trend: 'up' as const,
    description: 'Shanghai-Pudong-Beijing-Guangzhou trunk routes with military airspace restrictions causing civil routing bottlenecks and ground delays',
  },
  {
    id: 'frc-usmidwest',
    name: 'US Midwest Jet Routes',
    lat: 41.88,
    lng: -87.63,
    status: 'moderate',
    value: 620,
    flightsPerHour: 620,
    avgSpeedDrop: 6,
    reroutesIssued: 7,
    congestionIndex: 52,
    trend: 'down' as const,
    description: 'Chicago Center high-altitude jet routes flowing smoothly with seasonal wind alignment reducing headwind penalties on eastbound flights',
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

export function FlightRouteCongestionMonitor() {
  const state = useMapStore((s) => s.flightRouteCongestion)
  const setState = useMapStore((s) => s.setFlightRouteCongestion)

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
    if (filteredData.length === 0) return { flightsPerHour: 0, avgSpeedDrop: 0, reroutesIssued: 0, congestionIndex: 0 }
    const flightsPerHour = filteredData.reduce((s: number, d: any) => s + (d.flightsPerHour as number), 0)
    const avgSpeedDrop = filteredData.reduce((s: number, d: any) => s + (d.avgSpeedDrop as number), 0) / filteredData.length
    const reroutesIssued = filteredData.reduce((s: number, d: any) => s + (d.reroutesIssued as number), 0)
    const congestionIndex = filteredData.reduce((s: number, d: any) => s + (d.congestionIndex as number), 0) / filteredData.length
    return {
      flightsPerHour: flightsPerHour.toLocaleString(),
      avgSpeedDrop: avgSpeedDrop.toFixed(1) + ' kt',
      reroutesIssued: reroutesIssued.toLocaleString(),
      congestionIndex: congestionIndex.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9992;</span>
          <h3 className="text-sm font-semibold text-white">Flight Route Congestion</h3>
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
            <div className="text-slate-400">Flights Per Hour</div>
            <div className="text-sm font-semibold text-white">{metrics.flightsPerHour}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Speed Drop</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSpeedDrop}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Reroutes Issued</div>
            <div className="text-sm font-semibold text-white">{metrics.reroutesIssued}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Congestion Index</div>
            <div className="text-sm font-semibold text-white">{metrics.congestionIndex}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} flights per hour in sector</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
