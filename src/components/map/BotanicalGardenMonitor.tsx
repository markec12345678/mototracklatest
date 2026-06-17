'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bg-kew',
    name: 'Royal Botanic Gardens Kew',
    lat: 51.479,
    lng: -0.296,
    status: 'stable',
    value: 2100000,
    plantSpecies: 27000,
    gardenHectares: 132,
    glasshouses: 8,
    trend: 'up' as const,
    description: 'UNESCO World Heritage 1759 Kew Gardens London, 132-hectare living plant collection with Palm House, Temperate House and Millennium Seed Bank partnership',
  },
  {
    id: 'bg-missouri',
    name: 'Missouri Botanical Garden',
    lat: 38.612,
    lng: -90.260,
    status: 'stable',
    value: 1000000,
    plantSpecies: 16800,
    gardenHectares: 32,
    glasshouses: 5,
    trend: 'stable' as const,
    description: 'St. Louis 1859 Henry Shaw garden, 79-acre Climatron geodesic dome tropical rainforest, Japanese garden and global plant research TROPICOS database',
  },
  {
    id: 'bg-singapore',
    name: 'Singapore Botanic Gardens',
    lat: 1.314,
    lng: 103.812,
    status: 'stable',
    value: 4500000,
    plantSpecies: 10000,
    gardenHectares: 82,
    glasshouses: 3,
    trend: 'up' as const,
    description: 'UNESCO 1859 tropical botanic garden, 82-hectare National Orchid Garden with 1,000+ species and 2,000 hybrids, only tropical botanic garden on UNESCO list',
  },
  {
    id: 'bg-montreal',
    name: 'Montreal Botanical Garden',
    lat: 45.559,
    lng: -73.563,
    status: 'moderate',
    value: 950000,
    plantSpecies: 22000,
    gardenHectares: 75,
    glasshouses: 10,
    trend: 'down' as const,
    description: 'Jardin botanique de Montreal 1931, 75-hectare space with 30 thematic gardens and 10 greenhouses; budget constraints reducing specialized collections',
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

export function BotanicalGardenMonitor() {
  const state = useMapStore((s) => s.botanicalGarden)
  const setState = useMapStore((s) => s.setBotanicalGarden)

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
    if (filteredData.length === 0) return { totalSpecies: 0, totalHectares: 0, totalGlasshouses: 0 }
    const totalSpecies = filteredData.reduce((s: number, d: any) => s + (d.plantSpecies as number), 0)
    const totalHectares = filteredData.reduce((s: number, d: any) => s + (d.gardenHectares as number), 0)
    const totalGlasshouses = filteredData.reduce((s: number, d: any) => s + (d.glasshouses as number), 0)
    return {
      totalSpecies,
      totalHectares,
      totalGlasshouses,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-teal-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127800;</span>
          <h3 className="text-sm font-semibold text-white">Botanical Garden</h3>
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
            <div className="text-slate-400">Plant Species</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSpecies.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Hectares</div>
            <div className="text-sm font-semibold text-white">{metrics.totalHectares}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Glasshouses</div>
            <div className="text-sm font-semibold text-white">{metrics.totalGlasshouses}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1759</div>
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
                <span className="text-xs text-slate-300">{loc.plantSpecies.toLocaleString()}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.plantSpecies.toLocaleString()} species, {activeItem.gardenHectares} hectares, {activeItem.glasshouses} glasshouses, {activeItem.value.toLocaleString()} annual visitors</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
