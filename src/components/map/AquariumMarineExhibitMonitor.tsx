'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'aq-monterey',
    name: 'Monterey Bay Aquarium',
    lat: 36.618,
    lng: -121.901,
    status: 'stable',
    value: 2200000,
    tankVolumeLiters: 5300000,
    marineSpecies: 530,
    dailyVisitors: 6800,
    trend: 'up' as const,
    description: 'Cannery Row aquarium since 1984, 1.4-million-gallon Open Sea tank with 28-foot Kelp Forest, sea otter surrogacy and white shark release program',
  },
  {
    id: 'aq-georgia',
    name: 'Georgia Aquarium',
    lat: 33.764,
    lng: -84.395,
    status: 'stable',
    value: 2700000,
    tankVolumeLiters: 38000000,
    marineSpecies: 500,
    dailyVisitors: 9200,
    trend: 'stable' as const,
    description: 'World largest aquarium by volume (10M gallons), Atlanta since 2005, Ocean Voyager whale shark exhibit, beluga whale and dolphin conservation',
  },
  {
    id: 'aq-osaka',
    name: 'Osaka Aquarium Kaiyukan',
    lat: 34.654,
    lng: 135.429,
    status: 'moderate',
    value: 2600000,
    tankVolumeLiters: 10900000,
    marineSpecies: 470,
    dailyVisitors: 7400,
    trend: 'down' as const,
    description: 'Ring of Fire Pacific Rim aquarium since 1990, 9m deep Pacific Ocean tank with whale sharks, post-COVID international tourism impacting numbers',
  },
  {
    id: 'aq-dubai',
    name: 'Dubai Aquarium &amp; Underwater Zoo',
    lat: 25.198,
    lng: 55.279,
    status: 'warning',
    value: 1800000,
    tankVolumeLiters: 10000000,
    marineSpecies: 330,
    dailyVisitors: 5800,
    trend: 'stable' as const,
    description: 'Dubai Mall 10M-liter acrylic panel tank since 2008, 140 species including sand tiger sharks, 270-degree walk-through tunnel attraction',
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

export function AquariumMarineExhibitMonitor() {
  const state = useMapStore((s) => s.aquariumMarineExhibit)
  const setState = useMapStore((s) => s.setAquariumMarineExhibit)

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
    if (filteredData.length === 0) return { totalVolume: '0', totalVisitors: 0, totalSpecies: 0 }
    const totalVolume = filteredData.reduce((s: number, d: any) => s + (d.tankVolumeLiters as number), 0)
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const totalSpecies = filteredData.reduce((s: number, d: any) => s + (d.marineSpecies as number), 0)
    return {
      totalVolume: (totalVolume / 1000000).toFixed(1) + 'M L',
      totalVisitors,
      totalSpecies,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-600 to-blue-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128032;</span>
          <h3 className="text-sm font-semibold text-white">Aquarium Marine Exhibit</h3>
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
            <div className="text-slate-400">Tank Volume</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVolume}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Marine Species</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSpecies}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1984</div>
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
                <span className="text-xs text-slate-300">{(loc.tankVolumeLiters / 1000000).toFixed(1)}M L</span>
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
              <span className="text-slate-300 font-medium">{(activeItem.tankVolumeLiters / 1000000).toFixed(1)}M L volume, {activeItem.marineSpecies} species, {activeItem.dailyVisitors.toLocaleString()} daily visitors, {activeItem.value.toLocaleString()} annual attendance</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
