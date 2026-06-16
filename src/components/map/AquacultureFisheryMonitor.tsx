'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'aqua-norway',
    name: 'Norway Salmon',
    lat: 60.472,
    lng: 5.0,
    status: 'critical',
    value: 1.8,
    fishStockM: 1.8,
    harvestTons: 12400,
    feedRatio: 1.32,
    survivalPct: 81,
    trend: 'down' as const,
    description: 'Sea lice treatment failures and gill disease driving mortality above action threshold across multiple fjords',
  },
  {
    id: 'aqua-vietnam',
    name: 'Vietnam Mekong',
    lat: 10.0,
    lng: 106.0,
    status: 'warning',
    value: 2.4,
    fishStockM: 2.4,
    harvestTons: 9800,
    feedRatio: 1.55,
    survivalPct: 88,
    trend: 'down' as const,
    description: 'Pangasius ponds showing early mortality syndrome; export volumes softening as buyers shift to alternatives',
  },
  {
    id: 'aqua-chile',
    name: 'Chile Salmon',
    lat: -33.4489,
    lng: -70.6693,
    status: 'moderate',
    value: 3.1,
    fishStockM: 3.1,
    harvestTons: 15600,
    feedRatio: 1.28,
    survivalPct: 92,
    trend: 'stable' as const,
    description: 'Harvest pacing on plan with antibiotic use declining; sanitary breaks coordinated across concession zones',
  },
  {
    id: 'aqua-japan',
    name: 'Japan Tuna',
    lat: 35.6762,
    lng: 139.6503,
    status: 'stable',
    value: 4.2,
    fishStockM: 4.2,
    harvestTons: 6700,
    feedRatio: 1.18,
    survivalPct: 96,
    trend: 'up' as const,
    description: 'Bluefin tuna ranches reporting abundant stock with strong growth rates and premium sashimi-grade yields',
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

export function AquacultureFisheryMonitor() {
  const state = useMapStore((s) => s.aquacultureFishery)
  const setState = useMapStore((s) => s.setAquacultureFishery)

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
    if (filteredData.length === 0) return { fishStockM: 0, harvestTons: 0, feedRatio: 0, survivalPct: 0 }
    const fishStockM = filteredData.reduce((s: number, d: any) => s + (d.fishStockM as number), 0)
    const harvestTons = filteredData.reduce((s: number, d: any) => s + (d.harvestTons as number), 0)
    const feedRatio = filteredData.reduce((s: number, d: any) => s + (d.feedRatio as number), 0) / filteredData.length
    const survivalPct = filteredData.reduce((s: number, d: any) => s + (d.survivalPct as number), 0) / filteredData.length
    return {
      fishStockM: fishStockM.toFixed(1) + 'M',
      harvestTons: harvestTons.toLocaleString(),
      feedRatio: feedRatio.toFixed(2),
      survivalPct: survivalPct.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-emerald-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐟</span>
          <h3 className="text-sm font-semibold text-white">Aquaculture Fishery Monitor</h3>
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
            <div className="text-slate-400">Fish Stock M</div>
            <div className="text-sm font-semibold text-white">{metrics.fishStockM}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Harvest Tons</div>
            <div className="text-sm font-semibold text-white">{metrics.harvestTons}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Feed Ratio</div>
            <div className="text-sm font-semibold text-white">{metrics.feedRatio}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Survival %</div>
            <div className="text-sm font-semibold text-white">{metrics.survivalPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()}M fish in stock</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
