'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bat-hornsdale',
    name: 'Hornsdale AU',
    lat: -33.1,
    lng: 138.0,
    status: 'stable',
    value: 150,
    capacityMWh: 150,
    chargePct: 92,
    outputMW: 70,
    cycles: 642,
    trend: 'up' as const,
    description: 'South Australian lithium battery farm fully charged and dispatching frequency regulation services smoothly',
  },
  {
    id: 'bat-mosslanding',
    name: 'Moss Landing CA',
    lat: 36.79,
    lng: -121.77,
    status: 'warning',
    value: 400,
    capacityMWh: 400,
    chargePct: 38,
    outputMW: 130,
    cycles: 410,
    trend: 'down' as const,
    description: 'Monterey Bay facility reporting low state of charge after heavy discharge cycle with cell balancing underway',
  },
  {
    id: 'bat-teslatx',
    name: 'Tesla Megapack TX',
    lat: 30.25,
    lng: -97.75,
    status: 'moderate',
    value: 360,
    capacityMWh: 360,
    chargePct: 64,
    outputMW: 95,
    cycles: 285,
    trend: 'stable' as const,
    description: 'Austin battery complex in standard charging phase with moderate output commitments to the ERCOT grid',
  },
  {
    id: 'bat-victoria',
    name: 'Victoria AU',
    lat: -37.8,
    lng: 144.95,
    status: 'critical',
    value: 300,
    capacityMWh: 300,
    chargePct: 7,
    outputMW: 0,
    cycles: 798,
    trend: 'down' as const,
    description: 'Victorian big battery depleted after extended dispatch with no output and emergency recharge required',
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

export function BatteryStorageFacilityMonitor() {
  const state = useMapStore((s) => s.batteryStorageFacility)
  const setState = useMapStore((s) => s.setBatteryStorageFacility)

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
    if (filteredData.length === 0) return { capacityMWh: 0, chargePct: 0, outputMW: 0, cycles: 0 }
    const capacityMWh = filteredData.reduce((s: number, d: any) => s + (d.capacityMWh as number), 0)
    const chargePct = filteredData.reduce((s: number, d: any) => s + (d.chargePct as number), 0) / filteredData.length
    const outputMW = filteredData.reduce((s: number, d: any) => s + (d.outputMW as number), 0)
    const cycles = filteredData.reduce((s: number, d: any) => s + (d.cycles as number), 0)
    return {
      capacityMWh: capacityMWh.toLocaleString() + ' MWh',
      chargePct: chargePct.toFixed(0) + ' %',
      outputMW: outputMW.toLocaleString() + ' MW',
      cycles: cycles.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔋</span>
          <h3 className="text-sm font-semibold text-white">Battery Storage Facility Monitor</h3>
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
            <div className="text-slate-400">Capacity MWh</div>
            <div className="text-sm font-semibold text-white">{metrics.capacityMWh}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Charge %</div>
            <div className="text-sm font-semibold text-white">{metrics.chargePct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Output MW</div>
            <div className="text-sm font-semibold text-white">{metrics.outputMW}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cycles</div>
            <div className="text-sm font-semibold text-white">{metrics.cycles}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} MWh capacity</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
