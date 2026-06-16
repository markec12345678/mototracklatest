'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'grain-kc',
    name: 'Kansas City',
    lat: 39.0997,
    lng: -94.5786,
    status: 'critical',
    value: 12,
    capacityTons: 820000,
    storedTons: 98000,
    fillPct: 12,
    turnoverDays: 58,
    trend: 'down' as const,
    description: 'Silo complex nearly empty ahead of harvest; logistics constrained as railcars are rerouted to gulf terminals',
  },
  {
    id: 'grain-rotterdam',
    name: 'Rotterdam Port',
    lat: 51.9244,
    lng: 4.4777,
    status: 'warning',
    value: 34,
    capacityTons: 1450000,
    storedTons: 493000,
    fillPct: 34,
    turnoverDays: 21,
    trend: 'down' as const,
    description: 'Drawdown accelerating on strong EU feed demand; reserve cover below the seasonal comfort band',
  },
  {
    id: 'grain-novorossiysk',
    name: 'Novorossiysk Russia',
    lat: 44.7235,
    lng: 37.7689,
    status: 'moderate',
    value: 68,
    capacityTons: 960000,
    storedTons: 652800,
    fillPct: 68,
    turnoverDays: 14,
    trend: 'stable' as const,
    description: 'Black Sea export terminal operating at steady turnover with wheat flowing to Mediterranean buyers',
  },
  {
    id: 'grain-santos',
    name: 'Santos Brazil',
    lat: -23.9619,
    lng: -46.33,
    status: 'stable',
    value: 91,
    capacityTons: 1180000,
    storedTons: 1073800,
    fillPct: 91,
    turnoverDays: 9,
    trend: 'up' as const,
    description: 'Soybean stocks brimming as second-crop flows arrive; vessels queued with rapid berth turnover',
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

export function GrainSiloStorageMonitor() {
  const state = useMapStore((s) => s.grainSiloStorage)
  const setState = useMapStore((s) => s.setGrainSiloStorage)

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
    if (filteredData.length === 0) return { capacityTons: 0, storedTons: 0, fillPct: 0, turnoverDays: 0 }
    const capacityTons = filteredData.reduce((s: number, d: any) => s + (d.capacityTons as number), 0)
    const storedTons = filteredData.reduce((s: number, d: any) => s + (d.storedTons as number), 0)
    const fillPct = filteredData.reduce((s: number, d: any) => s + (d.fillPct as number), 0) / filteredData.length
    const turnoverDays = filteredData.reduce((s: number, d: any) => s + (d.turnoverDays as number), 0) / filteredData.length
    return {
      capacityTons: capacityTons.toLocaleString(),
      storedTons: storedTons.toLocaleString(),
      fillPct: fillPct.toFixed(0) + '%',
      turnoverDays: turnoverDays.toFixed(0) + ' days',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-orange-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏭</span>
          <h3 className="text-sm font-semibold text-white">Grain Silo Storage Monitor</h3>
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
            <div className="text-slate-400">Capacity Tons</div>
            <div className="text-sm font-semibold text-white">{metrics.capacityTons}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stored Tons</div>
            <div className="text-sm font-semibold text-white">{metrics.storedTons}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Fill %</div>
            <div className="text-sm font-semibold text-white">{metrics.fillPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Turnover days</div>
            <div className="text-sm font-semibold text-white">{metrics.turnoverDays}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()}% silo fill</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
