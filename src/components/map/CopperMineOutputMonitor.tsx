'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cop-escondida',
    name: 'Escondida Chile',
    lat: -24.2667,
    lng: -69.0833,
    status: 'critical',
    value: 142000,
    outputTDay: 142000,
    gradePct: 0.85,
    haulTrucks: 95,
    refiningPct: 88.2,
    trend: 'down' as const,
    description: 'Primary sulfide ore zones yielding sub-economic copper grades forcing throughput cuts and stockpile drawdown',
  },
  {
    id: 'cop-bingham',
    name: 'Bingham Canyon USA',
    lat: 40.5233,
    lng: -112.1511,
    status: 'warning',
    value: 118000,
    outputTDay: 118000,
    gradePct: 0.92,
    haulTrucks: 78,
    refiningPct: 91.5,
    trend: 'down' as const,
    description: 'Pit wall monitoring shows declining ore grades as the mine approaches final depth limits of the engineered slope',
  },
  {
    id: 'cop-chuquicamata',
    name: 'Chuquicamata Chile',
    lat: -22.2833,
    lng: -68.9,
    status: 'moderate',
    value: 165000,
    outputTDay: 165000,
    gradePct: 1.18,
    haulTrucks: 110,
    refiningPct: 93.7,
    trend: 'stable' as const,
    description: 'Combined open pit and underground operations maintaining planned throughput with steady concentrator feed',
  },
  {
    id: 'cop-morenci',
    name: 'Morenci USA',
    lat: 33.05,
    lng: -109.3333,
    status: 'stable',
    value: 188000,
    outputTDay: 188000,
    gradePct: 1.34,
    haulTrucks: 124,
    refiningPct: 95.1,
    trend: 'up' as const,
    description: 'SX-EW circuit operating at nameplate capacity with strong leach recovery and optimal heap stacking rates',
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

export function CopperMineOutputMonitor() {
  const state = useMapStore((s) => s.copperMineOutput)
  const setState = useMapStore((s) => s.setCopperMineOutput)

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
    if (filteredData.length === 0) return { outputTDay: 0, gradePct: 0, haulTrucks: 0, refiningPct: 0 }
    const outputTDay = filteredData.reduce((s: number, d: any) => s + (d.outputTDay as number), 0)
    const gradePct = filteredData.reduce((s: number, d: any) => s + (d.gradePct as number), 0) / filteredData.length
    const haulTrucks = filteredData.reduce((s: number, d: any) => s + (d.haulTrucks as number), 0)
    const refiningPct = filteredData.reduce((s: number, d: any) => s + (d.refiningPct as number), 0) / filteredData.length
    return {
      outputTDay: outputTDay.toLocaleString(),
      gradePct: gradePct.toFixed(2) + '%',
      haulTrucks: haulTrucks.toLocaleString(),
      refiningPct: refiningPct.toFixed(1) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🟠</span>
          <h3 className="text-sm font-semibold text-white">Copper Mine Output Monitor</h3>
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
            <div className="text-slate-400">Output T/day</div>
            <div className="text-sm font-semibold text-white">{metrics.outputTDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Grade %</div>
            <div className="text-sm font-semibold text-white">{metrics.gradePct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Haul Trucks</div>
            <div className="text-sm font-semibold text-white">{metrics.haulTrucks}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Refining %</div>
            <div className="text-sm font-semibold text-white">{metrics.refiningPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} T/day output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
