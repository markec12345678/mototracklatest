'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bf-budweiser',
    name: 'Anheuser-Busch St. Louis Brewery',
    lat: 38.59,
    lng: -90.21,
    status: 'stable',
    value: 12500000,
    fermentationTanks: 240,
    abvPercent: 5.0,
    batchCycleHours: 168,
    trend: 'up' as const,
    description: 'Flagship Budweiser brewery with 240 fermentation tanks producing 12.5M barrels annually using beechwood aging process',
  },
  {
    id: 'bf-guinness',
    name: 'St. James Gate Guinness Storehouse',
    lat: 53.34,
    lng: -6.29,
    status: 'stable',
    value: 4800000,
    fermentationTanks: 96,
    abvPercent: 4.2,
    batchCycleHours: 144,
    trend: 'stable' as const,
    description: 'Historic Dublin brewery since 1759, nitrogenated stout with roasted barley, 4.8M hl annual output across 150 countries',
  },
  {
    id: 'bf-weihenstephan',
    name: 'Weihenstephan Abbey Brewery',
    lat: 48.40,
    lng: 11.67,
    status: 'moderate',
    value: 850000,
    fermentationTanks: 38,
    abvPercent: 5.4,
    batchCycleHours: 192,
    trend: 'up' as const,
    description: 'World oldest brewery founded 1040 AD, Bavarian lager with 4-week cold lagering producing traditional helles and weissbier',
  },
  {
    id: 'bf-budweiser-budvar',
    name: 'Budweiser Budvar Cooperative',
    lat: 48.95,
    lng: 14.47,
    status: 'warning',
    value: 920000,
    fermentationTanks: 52,
    abvPercent: 5.0,
    batchCycleHours: 168,
    trend: 'down' as const,
    description: 'Czech state-owned premium lager brewery using Saaz hops and 90-day maturation, capacity constrained by demand outpacing expansion',
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

export function BreweryFermentationMonitor() {
  const state = useMapStore((s) => s.breweryFermentation)
  const setState = useMapStore((s) => s.setBreweryFermentation)

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
    if (filteredData.length === 0) return { totalOutput: '0', avgAbv: '0.0', totalTanks: 0 }
    const totalOutput = filteredData.reduce((s: number, d: any) => s + (d.value as number), 0)
    const avgAbv = filteredData.reduce((s: number, d: any) => s + (d.abvPercent as number), 0) / filteredData.length
    const totalTanks = filteredData.reduce((s: number, d: any) => s + (d.fermentationTanks as number), 0)
    return {
      totalOutput: (totalOutput / 1000000).toFixed(1) + 'M hl',
      avgAbv: avgAbv.toFixed(1) + '%',
      totalTanks,
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
          <span className="text-lg">&#127866;</span>
          <h3 className="text-sm font-semibold text-white">Brewery Fermentation</h3>
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
            <div className="text-slate-400">Avg ABV</div>
            <div className="text-sm font-semibold text-white">{metrics.avgAbv}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Ferment Tanks</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTanks}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1040 AD</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(1)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} hl annual, {activeItem.fermentationTanks} tanks, {activeItem.abvPercent}% ABV, {activeItem.batchCycleHours}h cycle</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
