'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cr-starbucks-york',
    name: 'Starbucks York Roasting Facility',
    lat: 41.51,
    lng: -73.05,
    status: 'stable',
    value: 68000000,
    roasterKilosDay: 32000,
    batchWeightKg: 220,
    roastProfiles: 14,
    trend: 'up' as const,
    description: 'York Pennsylvania flagship roastery producing 32 tonnes daily across 14 roast profiles, 68M kg annual supply for East Coast stores',
  },
  {
    id: 'cr-lavazza-italy',
    name: 'Lavazza Settimo Torinese Roastery',
    lat: 45.13,
    lng: 7.77,
    status: 'stable',
    value: 47000000,
    roasterKilosDay: 28000,
    batchWeightKg: 180,
    roastProfiles: 18,
    trend: 'stable' as const,
    description: 'Italian family roaster since 1895, 47M kg annual output serving European market with convection drum roasters and 18 signature blends',
  },
  {
    id: 'cr-illy-trieste',
    name: 'illy Caffe Trieste Roastery',
    lat: 45.65,
    lng: 13.78,
    status: 'moderate',
    value: 31000000,
    roasterKilosDay: 19000,
    batchWeightKg: 120,
    roastProfiles: 8,
    trend: 'up' as const,
    description: 'Single-blend premium Arabica roaster, 9-stage quality control with pressurization packaging preserving 31M kg annual freshness',
  },
  {
    id: 'cr-nescafe-switzerland',
    name: 'Nescafe Orbe Roasting Plant',
    lat: 46.71,
    lng: 6.53,
    status: 'warning',
    value: 92000000,
    roasterKilosDay: 42000,
    batchWeightKg: 350,
    roastProfiles: 22,
    trend: 'down' as const,
    description: 'Nestle global instant coffee hub, 92M kg annual capacity facing Robusta sourcing pressures from Vietnam drought affecting extraction yield',
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

export function CoffeeRoasteryBatchMonitor() {
  const state = useMapStore((s) => s.coffeeRoasteryBatch)
  const setState = useMapStore((s) => s.setCoffeeRoasteryBatch)

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
    if (filteredData.length === 0) return { totalOutput: '0', avgDaily: 0, totalProfiles: 0 }
    const totalOutput = filteredData.reduce((s: number, d: any) => s + (d.value as number), 0)
    const avgDaily = filteredData.reduce((s: number, d: any) => s + (d.roasterKilosDay as number), 0) / filteredData.length
    const totalProfiles = filteredData.reduce((s: number, d: any) => s + (d.roastProfiles as number), 0)
    return {
      totalOutput: (totalOutput / 1000000).toFixed(0) + 'M kg',
      avgDaily,
      totalProfiles,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-800 to-stone-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9749;</span>
          <h3 className="text-sm font-semibold text-white">Coffee Roastery Batch</h3>
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
            <div className="text-slate-400">Annual Output</div>
            <div className="text-sm font-semibold text-white">{metrics.totalOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Daily</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDaily.toLocaleString()} kg</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Roast Profiles</div>
            <div className="text-sm font-semibold text-white">{metrics.totalProfiles}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest Roaster</div>
            <div className="text-sm font-semibold text-white">1895</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(0)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} kg annual, {activeItem.roasterKilosDay.toLocaleString()} kg/day, {activeItem.batchWeightKg} kg/batch, {activeItem.roastProfiles} profiles</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
