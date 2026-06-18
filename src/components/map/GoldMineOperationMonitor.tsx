'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gold-witwatersrand',
    name: 'Witwatersrand SA',
    lat: -26.2,
    lng: 28.0,
    status: 'critical',
    value: 12400,
    outputOzDay: 12400,
    purityPct: 88.5,
    workersActive: 3200,
    depthM: 3400,
    trend: 'down' as const,
    description: 'Deep-level shafts reporting elevated collapse risk with seismic events triggering emergency evacuations across multiple working levels',
  },
  {
    id: 'gold-nevada',
    name: 'Nevada Gold USA',
    lat: 40.5,
    lng: -117.0,
    status: 'warning',
    value: 8500,
    outputOzDay: 8500,
    purityPct: 92.3,
    workersActive: 1850,
    depthM: 2200,
    trend: 'down' as const,
    description: 'Heap leach operations showing declining recovery rates as oxide ore grades deplete across the active pit complexes',
  },
  {
    id: 'gold-kalgoorlie',
    name: 'Kalgoorlie AU',
    lat: -30.75,
    lng: 121.5,
    status: 'moderate',
    value: 15200,
    outputOzDay: 15200,
    purityPct: 90.1,
    workersActive: 2400,
    depthM: 1600,
    trend: 'stable' as const,
    description: 'Super pit operating at planned output levels with steady mill throughput and consistent recovery across ore sources',
  },
  {
    id: 'gold-yanacocha',
    name: 'Yanacocha Peru',
    lat: -6.9,
    lng: -78.5,
    status: 'stable',
    value: 18700,
    outputOzDay: 18700,
    purityPct: 93.7,
    workersActive: 2100,
    depthM: 240,
    trend: 'up' as const,
    description: 'Open-pit heap leach performing optimally with strong recovery rates and stable weather conditions supporting operations',
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

export function GoldMineOperationMonitor() {
  const state = useMapStore((s) => s.goldMineOperation)
  const setState = useMapStore((s) => s.setGoldMineOperation)

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
    if (filteredData.length === 0) return { outputOzDay: 0, purityPct: 0, workersActive: 0, depthM: 0 }
    const outputOzDay = filteredData.reduce((s: number, d: any) => s + (d.outputOzDay as number), 0)
    const purityPct = filteredData.reduce((s: number, d: any) => s + (d.purityPct as number), 0) / filteredData.length
    const workersActive = filteredData.reduce((s: number, d: any) => s + (d.workersActive as number), 0)
    const depthM = filteredData.reduce((s: number, d: any) => s + (d.depthM as number), 0) / filteredData.length
    return {
      outputOzDay: outputOzDay.toLocaleString(),
      purityPct: purityPct.toFixed(1) + '%',
      workersActive: workersActive.toLocaleString(),
      depthM: depthM.toFixed(0) + ' m',
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
          <span className="text-lg">🥇</span>
          <h3 className="text-sm font-semibold text-white">Gold Mine Operation Monitor</h3>
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
            <div className="text-slate-400">Output oz/day</div>
            <div className="text-sm font-semibold text-white">{metrics.outputOzDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Purity %</div>
            <div className="text-sm font-semibold text-white">{metrics.purityPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Workers Active</div>
            <div className="text-sm font-semibold text-white">{metrics.workersActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Depth m</div>
            <div className="text-sm font-semibold text-white">{metrics.depthM}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} oz/day output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
