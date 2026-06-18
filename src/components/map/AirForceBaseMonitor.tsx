'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'af-ramstein',
    name: 'Ramstein Air Base',
    lat: 49.04,
    lng: 7.6,
    status: 'stable',
    value: 62,
    aircraftDeployed: 62,
    sortiesDay: 28,
    runwayStatus: 'open',
    readinessLevel: 'C1',
    trend: 'up' as const,
    description: 'USAF Europe primary airlift hub and NATO operations center supporting C-130, C-17 and MQ-9 missions across EUCOM theater',
  },
  {
    id: 'af-nellis',
    name: 'Nellis AFB Nevada',
    lat: 36.24,
    lng: -115.03,
    status: 'stable',
    value: 145,
    aircraftDeployed: 145,
    sortiesDay: 84,
    runwayStatus: 'open',
    readinessLevel: 'C1',
    trend: 'stable' as const,
    description: 'USAF Warfare Center hosting Red Flag exercises, F-22, F-35 and aggressor squadrons operating across NTTR training range complex',
  },
  {
    id: 'af-akrotiri',
    name: 'RAF Akrotiri Cyprus',
    lat: 34.59,
    lng: 32.99,
    status: 'moderate',
    value: 24,
    aircraftDeployed: 24,
    sortiesDay: 14,
    runwayStatus: 'open',
    readinessLevel: 'C2',
    trend: 'up' as const,
    description: 'UK Sovereign Base supporting Typhoon FGR4 quick-reaction alert and Reaper ISR missions over Eastern Mediterranean',
  },
  {
    id: 'af-andersen',
    name: 'Andersen AFB Guam',
    lat: 13.58,
    lng: 144.92,
    status: 'warning',
    value: 18,
    aircraftDeployed: 18,
    sortiesDay: 9,
    runwayStatus: 'limited',
    readinessLevel: 'C3',
    trend: 'down' as const,
    description: 'Pacific bomber rotational hub hosting B-52 and B-2 deployments, runway surface repair causing sortie reduction',
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

export function AirForceBaseMonitor() {
  const state = useMapStore((s) => s.airForceBase)
  const setState = useMapStore((s) => s.setAirForceBase)

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
    if (filteredData.length === 0) return { aircraftDeployed: 0, sortiesDay: 0 }
    const aircraftDeployed = filteredData.reduce((s: number, d: any) => s + (d.aircraftDeployed as number), 0)
    const sortiesDay = filteredData.reduce((s: number, d: any) => s + (d.sortiesDay as number), 0)
    return {
      aircraftDeployed: aircraftDeployed.toLocaleString(),
      sortiesDay: sortiesDay.toLocaleString() + ' /d',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700 to-sky-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9992;</span>
          <h3 className="text-sm font-semibold text-white">Air Force Base</h3>
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
            <div className="text-slate-400">Aircraft Deployed</div>
            <div className="text-sm font-semibold text-white">{metrics.aircraftDeployed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Sorties</div>
            <div className="text-sm font-semibold text-white">{metrics.sortiesDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Runway Status</div>
            <div className="text-sm font-semibold text-white">3 open / 1 limited</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Readiness</div>
            <div className="text-sm font-semibold text-white">C1</div>
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
                <span className="text-xs text-slate-300">{loc.value} ac</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} aircraft deployed, {activeItem.sortiesDay} sorties / day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
