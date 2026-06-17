'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'em-deq',
    name: 'DEQ Emissions Portland',
    lat: 45.515,
    lng: -122.679,
    status: 'stable',
    value: 86,
    inspectionsPerDay: 95,
    avgWaitMin: 18,
    passRatePct: 92,
    trend: 'up' as const,
    description: 'Oregon DEQ Portland emissions inspection station testing 95 vehicles daily with 92% pass rate on OBD-II and tailpipe tests',
  },
  {
    id: 'em-illinois',
    name: 'Illinois Air Team Chicago',
    lat: 41.878,
    lng: -87.63,
    status: 'moderate',
    value: 76,
    inspectionsPerDay: 78,
    avgWaitMin: 28,
    passRatePct: 88,
    trend: 'stable' as const,
    description: 'Illinois Air Team Chicago emissions testing facility with 78 daily inspections and 88% pass rate on vehicles 1996+',
  },
  {
    id: 'em-texas',
    name: 'Texas DPS Inspection Houston',
    lat: 29.735,
    lng: -95.464,
    status: 'stable',
    value: 82,
    inspectionsPerDay: 88,
    avgWaitMin: 22,
    passRatePct: 90,
    trend: 'up' as const,
    description: 'Texas DPS Houston vehicle inspection station performing 88 daily safety and emissions tests with 90% pass rate',
  },
  {
    id: 'em-arizona',
    name: 'Arizona ADEQ Phoenix',
    lat: 33.448,
    lng: -112.074,
    status: 'warning',
    value: 65,
    inspectionsPerDay: 62,
    avgWaitMin: 35,
    passRatePct: 84,
    trend: 'down' as const,
    description: 'Arizona ADEQ Phoenix emissions station facing reduced throughput with 62 daily inspections and longer 35-min waits',
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

export function EmissionsInspectionMonitor() {
  const state = useMapStore((s) => s.emissionsInspection)
  const setState = useMapStore((s) => s.setEmissionsInspection)

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
    if (filteredData.length === 0) return { totalInspections: 0, avgWait: '0m', avgPassRate: '0%', failingDaily: 0 }
    const totalInspections = filteredData.reduce((s: number, d: any) => s + (d.inspectionsPerDay as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.avgWaitMin as number), 0) / filteredData.length
    const avgPassRate = filteredData.reduce((s: number, d: any) => s + (d.passRatePct as number), 0) / filteredData.length
    const failingDaily = Math.round(totalInspections * (1 - avgPassRate / 100))
    return {
      totalInspections,
      avgWait: avgWait.toFixed(0) + 'm',
      avgPassRate: avgPassRate.toFixed(0) + '%',
      failingDaily,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-green-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127744;</span>
          <h3 className="text-sm font-semibold text-white">Emissions Inspection</h3>
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
            <div className="text-slate-400">Inspections / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalInspections}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Pass Rate</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPassRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Failing / day</div>
            <div className="text-sm font-semibold text-white">{metrics.failingDaily}</div>
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
                <span className="text-xs text-emerald-300">{loc.passRatePct}%</span>
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
              <span className="text-slate-300 font-medium">{activeItem.inspectionsPerDay} inspections/day, {activeItem.avgWaitMin}m wait, {activeItem.passRatePct}% pass rate</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
