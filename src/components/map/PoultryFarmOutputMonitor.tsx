'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'poul-arkansas',
    name: 'Arkansas Tyson',
    lat: 36.0822,
    lng: -94.1719,
    status: 'critical',
    value: 2.1,
    eggsPerDay: 2100000,
    birdsReady: 1840000,
    feedEfficiency: 2.1,
    mortalityPct: 7.4,
    trend: 'down' as const,
    description: 'Avian influenza cluster confirmed across three complexes; depopulation underway and exports halted',
  },
  {
    id: 'poul-georgia',
    name: 'Georgia Poultry',
    lat: 32.1656,
    lng: -82.9001,
    status: 'warning',
    value: 2.4,
    eggsPerDay: 2400000,
    birdsReady: 1620000,
    feedEfficiency: 2.0,
    mortalityPct: 4.1,
    trend: 'down' as const,
    description: 'Heat dome reducing egg production and broiler weights; processing line throughput slipping',
  },
  {
    id: 'poul-brazil',
    name: 'Brazil Poultry',
    lat: -23.5505,
    lng: -46.6333,
    status: 'moderate',
    value: 3.2,
    eggsPerDay: 3200000,
    birdsReady: 2310000,
    feedEfficiency: 1.8,
    mortalityPct: 2.6,
    trend: 'stable' as const,
    description: 'Stable broiler cycles with normal feed conversion and steady export loadings to Asia and the Gulf',
  },
  {
    id: 'poul-thailand',
    name: 'Thailand CP',
    lat: 13.7563,
    lng: 100.5018,
    status: 'stable',
    value: 3.6,
    eggsPerDay: 3600000,
    birdsReady: 2740000,
    feedEfficiency: 1.6,
    mortalityPct: 1.9,
    trend: 'up' as const,
    description: 'Integrated operations hitting optimal feed conversion and strong cooked-export demand from Japan and EU',
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

export function PoultryFarmOutputMonitor() {
  const state = useMapStore((s) => s.poultryFarmOutput)
  const setState = useMapStore((s) => s.setPoultryFarmOutput)

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
    if (filteredData.length === 0) return { eggsPerDay: 0, birdsReady: 0, feedEfficiency: 0, mortalityPct: 0 }
    const eggsPerDay = filteredData.reduce((s: number, d: any) => s + (d.eggsPerDay as number), 0)
    const birdsReady = filteredData.reduce((s: number, d: any) => s + (d.birdsReady as number), 0)
    const feedEfficiency = filteredData.reduce((s: number, d: any) => s + (d.feedEfficiency as number), 0) / filteredData.length
    const mortalityPct = filteredData.reduce((s: number, d: any) => s + (d.mortalityPct as number), 0) / filteredData.length
    return {
      eggsPerDay: (eggsPerDay / 1000000).toFixed(1) + 'M',
      birdsReady: birdsReady.toLocaleString(),
      feedEfficiency: feedEfficiency.toFixed(2),
      mortalityPct: mortalityPct.toFixed(1) + '%',
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
          <span className="text-lg">🐔</span>
          <h3 className="text-sm font-semibold text-white">Poultry Farm Output Monitor</h3>
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
            <div className="text-slate-400">Eggs/day</div>
            <div className="text-sm font-semibold text-white">{metrics.eggsPerDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Birds Ready</div>
            <div className="text-sm font-semibold text-white">{metrics.birdsReady}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Feed Efficiency</div>
            <div className="text-sm font-semibold text-white">{metrics.feedEfficiency}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Mortality %</div>
            <div className="text-sm font-semibold text-white">{metrics.mortalityPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} feed efficiency ratio</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
