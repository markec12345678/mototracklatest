'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ro-london',
    name: 'Heathrow EGLL 27L',
    lat: 51.47,
    lng: -0.45,
    status: 'critical',
    value: 48,
    movementsPerHour: 48,
    runwayOccupancy: 92,
    landingSeparation: 2.5,
    groundHolds: 14,
    trend: 'up' as const,
    description: 'Heathrow single-runway alternating operations under westerly flow with peak arrival bank at 89% capacity and holding stacks over BNN and OCK',
  },
  {
    id: 'ro-dubai',
    name: 'Dubai OMDB 12L/30R',
    lat: 25.25,
    lng: 55.36,
    status: 'warning',
    value: 42,
    movementsPerHour: 42,
    runwayOccupancy: 84,
    landingSeparation: 3.0,
    groundHolds: 9,
    trend: 'up' as const,
    description: 'Dual parallel runway operations with A380 superjumbo wake turbulence separation requiring increased spacing on trailing heavy departures',
  },
  {
    id: 'ro-tokyo',
    name: 'Haneda RJTT 34R',
    lat: 35.55,
    lng: 139.78,
    status: 'moderate',
    value: 36,
    movementsPerHour: 36,
    runwayOccupancy: 71,
    landingSeparation: 3.5,
    groundHolds: 5,
    trend: 'stable' as const,
    description: 'Tokyo Haneda north-flow runway operations maintaining efficient throughput with mixed narrowbody and business jet traffic',
  },
  {
    id: 'ro-singapore',
    name: 'Changi WSSS 02L',
    lat: 1.36,
    lng: 103.99,
    status: 'stable',
    value: 32,
    movementsPerHour: 32,
    runwayOccupancy: 62,
    landingSeparation: 4.0,
    groundHolds: 3,
    trend: 'down' as const,
    description: 'Singapore Changi dual-runway independent parallel approaches operating below capacity with smooth overnight cargo wave and minimal delays',
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

export function RunwayOccupancyMonitor() {
  const state = useMapStore((s) => s.runwayOccupancy)
  const setState = useMapStore((s) => s.setRunwayOccupancy)

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
    if (filteredData.length === 0) return { movementsPerHour: 0, runwayOccupancy: 0, landingSeparation: 0, groundHolds: 0 }
    const movementsPerHour = filteredData.reduce((s: number, d: any) => s + (d.movementsPerHour as number), 0)
    const runwayOccupancy = filteredData.reduce((s: number, d: any) => s + (d.runwayOccupancy as number), 0) / filteredData.length
    const landingSeparation = filteredData.reduce((s: number, d: any) => s + (d.landingSeparation as number), 0) / filteredData.length
    const groundHolds = filteredData.reduce((s: number, d: any) => s + (d.groundHolds as number), 0)
    return {
      movementsPerHour: movementsPerHour.toLocaleString(),
      runwayOccupancy: runwayOccupancy.toFixed(0) + '%',
      landingSeparation: landingSeparation.toFixed(1) + ' nm',
      groundHolds: groundHolds.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9992;</span>
          <h3 className="text-sm font-semibold text-white">Runway Occupancy</h3>
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
            <div className="text-slate-400">Movements Per Hour</div>
            <div className="text-sm font-semibold text-white">{metrics.movementsPerHour}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Occupancy</div>
            <div className="text-sm font-semibold text-white">{metrics.runwayOccupancy}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Separation</div>
            <div className="text-sm font-semibold text-white">{metrics.landingSeparation}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Ground Holds</div>
            <div className="text-sm font-semibold text-white">{metrics.groundHolds}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} movements per hour</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
