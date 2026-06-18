'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'jp-tropicana-florida',
    name: 'Tropicana Bradenton Juice Plant',
    lat: 27.50,
    lng: -82.57,
    status: 'stable',
    value: 320000000,
    fruitTonnesDay: 9000,
    pasteurTemp: 95,
    flavorVarieties: 11,
    trend: 'stable' as const,
    description: 'Florida citrus processing 9000 tonnes oranges daily, 320M liter annual single-strength orange juice with NFC not-from-concentrate process',
  },
  {
    id: 'jp-minute-maid-texas',
    name: 'Minute Maid Houston Juice Facility',
    lat: 29.76,
    lng: -95.37,
    status: 'stable',
    value: 185000000,
    fruitTonnesDay: 5200,
    pasteurTemp: 92,
    flavorVarieties: 8,
    trend: 'up' as const,
    description: 'Coca-Cola company juice producer, 185M liter annual with aseptic cold-fill technology preserving 8 flavor varieties for shelf stability',
  },
  {
    id: 'jp-ocean-spray-wisconsin',
    name: 'Ocean Spray Wisconsin Rapids',
    lat: 44.40,
    lng: -89.83,
    status: 'moderate',
    value: 145000000,
    fruitTonnesDay: 4100,
    pasteurTemp: 88,
    flavorVarieties: 14,
    trend: 'stable' as const,
    description: 'Cranberry cooperative processing 4100 tonnes daily during harvest, 145M liter annual cranberry juice and cocktail blend production',
  },
  {
    id: 'jp-welch-pennsylvania',
    name: 'Welchs North East Concord Plant',
    lat: 42.16,
    lng: -79.83,
    status: 'warning',
    value: 92000000,
    fruitTonnesDay: 2800,
    pasteurTemp: 90,
    flavorVarieties: 9,
    trend: 'down' as const,
    description: 'Concord grape juice processor, 92M liter annual facing Concord grape crop stress from unusual frost patterns reducing 2024 yield estimates',
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

export function JuiceProcessingLineMonitor() {
  const state = useMapStore((s) => s.juiceProcessingLine)
  const setState = useMapStore((s) => s.setJuiceProcessingLine)

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
    if (filteredData.length === 0) return { totalOutput: '0', avgDaily: 0, avgTemp: 0 }
    const totalOutput = filteredData.reduce((s: number, d: any) => s + (d.value as number), 0)
    const avgDaily = filteredData.reduce((s: number, d: any) => s + (d.fruitTonnesDay as number), 0) / filteredData.length
    const avgTemp = filteredData.reduce((s: number, d: any) => s + (d.pasteurTemp as number), 0) / filteredData.length
    return {
      totalOutput: (totalOutput / 1000000).toFixed(0) + 'M L',
      avgDaily,
      avgTemp,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129475;</span>
          <h3 className="text-sm font-semibold text-white">Juice Processing Line</h3>
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
            <div className="text-slate-400">Avg Fruit/Day</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDaily.toLocaleString()} t</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Pasteur</div>
            <div className="text-sm font-semibold text-white">{metrics.avgTemp}&deg;C</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Fruit</div>
            <div className="text-sm font-semibold text-white">Orange</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} L annual, {activeItem.fruitTonnesDay.toLocaleString()} t/day fruit, {activeItem.pasteurTemp}&deg;C pasteurization, {activeItem.flavorVarieties} SKUs</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
