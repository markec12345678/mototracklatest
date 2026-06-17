'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gh-costafarms',
    name: 'Costa Farms Miami FL',
    lat: 25.789,
    lng: -80.226,
    status: 'stable',
    value: 94,
    greenhouseArea: 1850,
    weeklyOutput: 920000,
    primaryCrops: 'Pothos, Snake Plant, Monstera, Aglaonema',
    trend: 'up' as const,
    description: 'Costa Farms Miami headquarters with 1,850 acres of greenhouse and field production, largest US houseplant grower shipping 920k plants weekly',
  },
  {
    id: 'gh-monrovia',
    name: 'Monrovia Nursery Dayton OR',
    lat: 45.221,
    lng: -123.077,
    status: 'stable',
    value: 88,
    greenhouseArea: 980,
    weeklyOutput: 285000,
    primaryCrops: 'Roses, Hydrangea, Conifers, Japanese Maples',
    trend: 'stable' as const,
    description: 'Monrovia Dayton Oregon growing facility, 980 acres producing premium landscape shrubs and trees distributed to garden retailers nationwide',
  },
  {
    id: 'gh-altman',
    name: 'Altman Plants Vista CA',
    lat: 33.202,
    lng: -117.241,
    status: 'moderate',
    value: 74,
    greenhouseArea: 620,
    weeklyOutput: 180000,
    primaryCrops: 'Succulents, Cacti, Air Plants, Bromeliads',
    trend: 'up' as const,
    description: 'Altman Plants Vista California specialty grower, 620 acres focused on succulents and cacti supplying Home Depot, Lowe\'s and indie retailers',
  },
  {
    id: 'gh-greencircle',
    name: 'Green Circle Growers Oberlin OH',
    lat: 41.290,
    lng: -82.218,
    status: 'warning',
    value: 62,
    greenhouseArea: 720,
    weeklyOutput: 145000,
    primaryCrops: 'Orchids, Anthurium, Tropicals, Bromeliads',
    trend: 'down' as const,
    description: 'Green Circle Growers Oberlin Ohio, 720-acre facility and largest US orchid producer facing declining tropical plant demand post-pandemic',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function GreenhouseGrowerMonitor() {
  const state = useMapStore((s) => s.greenhouseGrower)
  const setState = useMapStore((s) => s.setGreenhouseGrower)

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
    if (filteredData.length === 0) return { totalArea: 0, totalOutput: 0 }
    const totalArea = filteredData.reduce((s: number, d: any) => s + (d.greenhouseArea as number), 0)
    const totalOutput = filteredData.reduce((s: number, d: any) => s + (d.weeklyOutput as number), 0)
    return { totalArea, totalOutput }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-500 to-green-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127806;</span>
          <h3 className="text-sm font-semibold text-white">Greenhouse Grower</h3>
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
            <div className="text-slate-400">Greenhouse Area</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalArea / 1000).toFixed(2)}k acres</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Weekly Output</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalOutput / 1000000).toFixed(2)}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Yield/Acre</div>
            <div className="text-sm font-semibold text-white">
              {metrics.totalArea > 0 ? Math.round(metrics.totalOutput / metrics.totalArea) : 0}
            </div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Growers</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.primaryCrops}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.greenhouseArea} ac</span>
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
              {activeItem.greenhouseArea} acres &middot; {(activeItem.weeklyOutput / 1000).toFixed(0)}k plants/week
              &nbsp;&middot;&nbsp; {activeItem.primaryCrops}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
