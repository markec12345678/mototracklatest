'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'zoo-san-diego',
    name: 'San Diego Zoo',
    lat: 32.736,
    lng: -117.149,
    status: 'stable',
    value: 4000000,
    animalSpecies: 650,
    totalAnimals: 12000,
    dailyVisitors: 14000,
    trend: 'up' as const,
    description: '100-acre Balboa Park zoo since 1916, pioneer of open-air cageless exhibits, hosts giant pandas, koalas and 650+ endangered species breeding programs',
  },
  {
    id: 'zoo-bronx',
    name: 'Bronx Zoo',
    lat: 40.850,
    lng: -73.876,
    status: 'stable',
    value: 2350000,
    animalSpecies: 530,
    totalAnimals: 6500,
    dailyVisitors: 9500,
    trend: 'stable' as const,
    description: '265-acre Wildlife Conservation Society flagship since 1899, Congo Gorilla Forest and Tiger Mountain exhibits, 530 species global conservation',
  },
  {
    id: 'zoo-singapore',
    name: 'Singapore Zoo',
    lat: 1.404,
    lng: 103.790,
    status: 'stable',
    value: 1900000,
    animalSpecies: 315,
    totalAnimals: 2800,
    dailyVisitors: 8200,
    trend: 'up' as const,
    description: '28-hectare Mandai open-concept zoo since 1973, free-ranging orangutans and white tigers, Night Safari and River Safari sister parks',
  },
  {
    id: 'zoo-berlin',
    name: 'Berlin Zoological Garden',
    lat: 52.510,
    lng: 13.336,
    status: 'moderate',
    value: 3100000,
    animalSpecies: 1380,
    totalAnimals: 18500,
    dailyVisitors: 8800,
    trend: 'down' as const,
    description: 'Most species-rich zoo worldwide (1,380) founded 1844, 35-hectare Tierpark; celeb polar bear Knut legacy, post-pandemic attendance recovering slowly',
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

export function ZooWildlifeParkMonitor() {
  const state = useMapStore((s) => s.zooWildlifePark)
  const setState = useMapStore((s) => s.setZooWildlifePark)

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
    if (filteredData.length === 0) return { totalVisitors: '0', totalAnimals: 0, totalSpecies: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const totalAnimals = filteredData.reduce((s: number, d: any) => s + (d.totalAnimals as number), 0)
    const totalSpecies = filteredData.reduce((s: number, d: any) => s + (d.animalSpecies as number), 0)
    return {
      totalVisitors: (totalVisitors / 1000).toFixed(1) + 'k/day',
      totalAnimals,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-600 to-emerald-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129418;</span>
          <h3 className="text-sm font-semibold text-white">Zoo &amp; Wildlife Park</h3>
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
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Animals</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAnimals.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Species</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSpecies}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1844</div>
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
                <span className="text-xs text-slate-300">{loc.animalSpecies}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.animalSpecies} species, {activeItem.totalAnimals.toLocaleString()} animals, {activeItem.dailyVisitors.toLocaleString()} daily visitors, {activeItem.value.toLocaleString()} annual attendance</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
