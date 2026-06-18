'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'vac-javits-nyc',
    name: 'Javits NYC',
    lat: 40.7549,
    lng: -73.994,
    status: 'critical',
    value: 240,
    dosesToday: 240,
    capacityPct: 22,
    waitTimeMin: 95,
    stockDoses: 380,
    trend: 'down' as const,
    description: 'Low stock condition with limited doses on hand, long queues, and capacity utilization below sustainable thresholds',
  },
  {
    id: 'vac-excel-london',
    name: 'Excel London',
    lat: 51.5081,
    lng: 0.0396,
    status: 'warning',
    value: 1820,
    dosesToday: 1820,
    capacityPct: 64,
    waitTimeMin: 48,
    stockDoses: 2400,
    trend: 'up' as const,
    description: 'Busy mass vaccination site with elevated throughput and moderate waits as booster demand surges across cohorts',
  },
  {
    id: 'vac-bigsight-tokyo',
    name: 'Tokyo Big Sight',
    lat: 35.6295,
    lng: 139.7925,
    status: 'moderate',
    value: 1240,
    dosesToday: 1240,
    capacityPct: 78,
    waitTimeMin: 22,
    stockDoses: 5600,
    trend: 'stable' as const,
    description: 'Normal operations with steady dose throughput, balanced capacity utilization, and well-stocked vaccine reserves',
  },
  {
    id: 'vac-dodger-la',
    name: 'Dodger Stadium LA',
    lat: 34.0739,
    lng: -118.24,
    status: 'stable',
    value: 980,
    dosesToday: 980,
    capacityPct: 41,
    waitTimeMin: 9,
    stockDoses: 8200,
    trend: 'down' as const,
    description: 'Optimal site performance with low wait times, ample stock, and capacity headroom for surge demand scenarios',
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

export function VaccinationDriveMonitor() {
  const state = useMapStore((s) => s.vaccinationDrive)
  const setState = useMapStore((s) => s.setVaccinationDrive)

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
    if (filteredData.length === 0) return { dosesToday: 0, capacityPct: 0, waitTimeMin: 0, stockDoses: 0 }
    const dosesToday = filteredData.reduce((s: number, d: any) => s + (d.dosesToday as number), 0)
    const capacityPct = filteredData.reduce((s: number, d: any) => s + (d.capacityPct as number), 0) / filteredData.length
    const waitTimeMin = filteredData.reduce((s: number, d: any) => s + (d.waitTimeMin as number), 0) / filteredData.length
    const stockDoses = filteredData.reduce((s: number, d: any) => s + (d.stockDoses as number), 0)
    return {
      dosesToday: dosesToday.toLocaleString(),
      capacityPct: capacityPct.toFixed(0) + '%',
      waitTimeMin: waitTimeMin.toFixed(0) + ' min',
      stockDoses: stockDoses.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500 to-amber-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">💉</span>
          <h3 className="text-sm font-semibold text-white">Vaccination Drive Monitor</h3>
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
            <div className="text-slate-400">Doses Today</div>
            <div className="text-sm font-semibold text-white">{metrics.dosesToday}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Capacity %</div>
            <div className="text-sm font-semibold text-white">{metrics.capacityPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Wait Time min</div>
            <div className="text-sm font-semibold text-white">{metrics.waitTimeMin}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stock Doses</div>
            <div className="text-sm font-semibold text-white">{metrics.stockDoses}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} doses today</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
