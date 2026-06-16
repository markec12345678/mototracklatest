'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ahf-lufthansa',
    name: 'Lufthansa Technik MUC',
    lat: 48.35,
    lng: 11.79,
    status: 'warning',
    value: 38,
    aircraftInHangar: 38,
    bayUtilization: 89,
    turnaroundDays: 12,
    mechanicsOnDuty: 420,
    trend: 'up' as const,
    description: 'Munich heavy maintenance base performing C-checks on A350 and A320neo fleet with expanded night shift and weekend AOG recovery support',
  },
  {
    id: 'ahf-singapore',
    name: 'SIA Engineering SIN',
    lat: 1.36,
    lng: 103.99,
    status: 'stable',
    value: 24,
    aircraftInHangar: 24,
    bayUtilization: 72,
    turnaroundDays: 9,
    mechanicsOnDuty: 280,
    trend: 'stable' as const,
    description: 'Changi Aerospace Park line and base maintenance hub supporting transpacific transit checks and 787 dreamliner cabin retrofits',
  },
  {
    id: 'ahf-dallas',
    name: 'American Airlines DFW',
    lat: 32.9,
    lng: -97.04,
    status: 'moderate',
    value: 32,
    aircraftInHangar: 32,
    bayUtilization: 78,
    turnaroundDays: 14,
    mechanicsOnDuty: 360,
    trend: 'down' as const,
    description: 'Dallas-Fort Worth maintenance hub performing 737 MAX heavy checks and A321neo structural inspections across six wide-body bays',
  },
  {
    id: 'ahf-emirates',
    name: 'Emirates Engineering DXB',
    lat: 25.25,
    lng: 55.36,
    status: 'critical',
    value: 44,
    aircraftInHangar: 44,
    bayUtilization: 96,
    turnaroundDays: 18,
    mechanicsOnDuty: 510,
    trend: 'up' as const,
    description: 'Dubai worlds largest A380 MRO facility under peak load with simultaneous 12-year inspections and cabin upgrades on superjumbo fleet',
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

export function AircraftHangarFacilityMonitor() {
  const state = useMapStore((s) => s.aircraftHangarFacility)
  const setState = useMapStore((s) => s.setAircraftHangarFacility)

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
    if (filteredData.length === 0) return { aircraftInHangar: 0, bayUtilization: 0, turnaroundDays: 0, mechanicsOnDuty: 0 }
    const aircraftInHangar = filteredData.reduce((s: number, d: any) => s + (d.aircraftInHangar as number), 0)
    const bayUtilization = filteredData.reduce((s: number, d: any) => s + (d.bayUtilization as number), 0) / filteredData.length
    const turnaroundDays = filteredData.reduce((s: number, d: any) => s + (d.turnaroundDays as number), 0) / filteredData.length
    const mechanicsOnDuty = filteredData.reduce((s: number, d: any) => s + (d.mechanicsOnDuty as number), 0)
    return {
      aircraftInHangar: aircraftInHangar.toLocaleString(),
      bayUtilization: bayUtilization.toFixed(0) + '%',
      turnaroundDays: turnaroundDays.toFixed(1) + ' d',
      mechanicsOnDuty: mechanicsOnDuty.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-500 to-zinc-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9962;</span>
          <h3 className="text-sm font-semibold text-white">Aircraft Hangar Facility</h3>
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
            <div className="text-slate-400">Aircraft In Hangar</div>
            <div className="text-sm font-semibold text-white">{metrics.aircraftInHangar}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bay Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.bayUtilization}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Turnaround</div>
            <div className="text-sm font-semibold text-white">{metrics.turnaroundDays}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Mechanics On Duty</div>
            <div className="text-sm font-semibold text-white">{metrics.mechanicsOnDuty}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} aircraft in maintenance</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
