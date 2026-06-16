'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dairy-wisconsin',
    name: 'Wisconsin Dairy',
    lat: 44.5,
    lng: -89.5,
    status: 'critical',
    value: 24,
    milkLPerCow: 24,
    dailyOutputKL: 18.4,
    cowsMilking: 766000,
    fatPct: 3.4,
    trend: 'down' as const,
    description: 'Heat stress cratering per-cow output; cooperative tankers reporting 22% volume drop versus last month',
  },
  {
    id: 'dairy-california',
    name: 'California Dairy',
    lat: 36.7783,
    lng: -119.4179,
    status: 'warning',
    value: 29,
    milkLPerCow: 29,
    dailyOutputKL: 41.2,
    cowsMilking: 1421000,
    fatPct: 3.6,
    trend: 'down' as const,
    description: 'Output slipping on water rationing and reduced alfalfa supply; fat percentage holding near baseline',
  },
  {
    id: 'dairy-newzealand',
    name: 'New Zealand Dairy',
    lat: -40.9006,
    lng: 174.886,
    status: 'moderate',
    value: 31,
    milkLPerCow: 31,
    dailyOutputKL: 22.7,
    cowsMilking: 732000,
    fatPct: 4.2,
    trend: 'stable' as const,
    description: 'Spring flush winding down with seasonal volume normalizing; pasture growth tracking the long-run mean',
  },
  {
    id: 'dairy-netherlands',
    name: 'Netherlands Dairy',
    lat: 52.1326,
    lng: 5.2913,
    status: 'stable',
    value: 34,
    milkLPerCow: 34,
    dailyOutputKL: 14.9,
    cowsMilking: 438000,
    fatPct: 4.4,
    trend: 'up' as const,
    description: 'High-yield breeds and balanced TMR rations pushing per-cow liters above seasonal benchmark',
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

export function DairyFarmProductionMonitor() {
  const state = useMapStore((s) => s.dairyFarmProduction)
  const setState = useMapStore((s) => s.setDairyFarmProduction)

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
    if (filteredData.length === 0) return { milkLPerCow: 0, dailyOutputKL: 0, cowsMilking: 0, fatPct: 0 }
    const milkLPerCow = filteredData.reduce((s: number, d: any) => s + (d.milkLPerCow as number), 0) / filteredData.length
    const dailyOutputKL = filteredData.reduce((s: number, d: any) => s + (d.dailyOutputKL as number), 0)
    const cowsMilking = filteredData.reduce((s: number, d: any) => s + (d.cowsMilking as number), 0)
    const fatPct = filteredData.reduce((s: number, d: any) => s + (d.fatPct as number), 0) / filteredData.length
    return {
      milkLPerCow: milkLPerCow.toFixed(1) + ' L',
      dailyOutputKL: dailyOutputKL.toFixed(1) + ' kL',
      cowsMilking: cowsMilking.toLocaleString(),
      fatPct: fatPct.toFixed(1) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-400 to-cyan-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">🥛</span>
          <h3 className="text-sm font-semibold text-white">Dairy Farm Production Monitor</h3>
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
            <div className="text-slate-400">Milk L/cow</div>
            <div className="text-sm font-semibold text-white">{metrics.milkLPerCow}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Output kL</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyOutputKL}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cows Milking</div>
            <div className="text-sm font-semibold text-white">{metrics.cowsMilking}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Fat %</div>
            <div className="text-sm font-semibold text-white">{metrics.fatPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} L/cow/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
