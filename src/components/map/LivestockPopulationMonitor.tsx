'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'liv-texas',
    name: 'Texas Cattle',
    lat: 31.9686,
    lng: -99.9018,
    status: 'critical',
    value: 12800000,
    cattleCount: 12800000,
    sheepCount: 720000,
    healthPct: 64,
    avgWeightKg: 482,
    trend: 'down' as const,
    description: 'Anthrax outbreak confirmed in three ranches; herd health declining and quarantines expanding across the panhandle',
  },
  {
    id: 'liv-pampas',
    name: 'Argentina Pampas',
    lat: -34.6037,
    lng: -58.3816,
    status: 'warning',
    value: 5400000,
    cattleCount: 5400000,
    sheepCount: 4100000,
    healthPct: 78,
    avgWeightKg: 438,
    trend: 'down' as const,
    description: 'Foot-and-mouth surveillance zone active; weights down 6% as forage quality drops in late dry season',
  },
  {
    id: 'liv-outback',
    name: 'Australia Outback',
    lat: -25.2744,
    lng: 133.7751,
    status: 'moderate',
    value: 24500000,
    cattleCount: 24500000,
    sheepCount: 64000000,
    healthPct: 88,
    avgWeightKg: 412,
    trend: 'stable' as const,
    description: 'Steady herd condition across northern stations; mustering on schedule with normal cull rates',
  },
  {
    id: 'liv-mongolia',
    name: 'Mongolia Steppe',
    lat: 47.8864,
    lng: 106.9057,
    status: 'stable',
    value: 66000000,
    cattleCount: 4700000,
    sheepCount: 66000000,
    healthPct: 94,
    avgWeightKg: 56,
    trend: 'up' as const,
    description: 'Healthy livestock populations following favorable summer pasture; nomadic herds reported in prime condition',
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

export function LivestockPopulationMonitor() {
  const state = useMapStore((s) => s.livestockPopulation)
  const setState = useMapStore((s) => s.setLivestockPopulation)

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
    if (filteredData.length === 0) return { cattleCount: 0, sheepCount: 0, healthPct: 0, avgWeightKg: 0 }
    const cattleCount = filteredData.reduce((s: number, d: any) => s + (d.cattleCount as number), 0)
    const sheepCount = filteredData.reduce((s: number, d: any) => s + (d.sheepCount as number), 0)
    const healthPct = filteredData.reduce((s: number, d: any) => s + (d.healthPct as number), 0) / filteredData.length
    const avgWeightKg = filteredData.reduce((s: number, d: any) => s + (d.avgWeightKg as number), 0) / filteredData.length
    return {
      cattleCount: cattleCount.toLocaleString(),
      sheepCount: sheepCount.toLocaleString(),
      healthPct: healthPct.toFixed(0) + '%',
      avgWeightKg: avgWeightKg.toFixed(0) + ' kg',
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
          <span className="text-lg">🐄</span>
          <h3 className="text-sm font-semibold text-white">Livestock Population Monitor</h3>
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
            <div className="text-slate-400">Cattle Count</div>
            <div className="text-sm font-semibold text-white">{metrics.cattleCount}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Sheep Count</div>
            <div className="text-sm font-semibold text-white">{metrics.sheepCount}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Health %</div>
            <div className="text-sm font-semibold text-white">{metrics.healthPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Weight kg</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWeightKg}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} head tracked</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
