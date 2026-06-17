'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cb-peters',
    name: 'St Peter Basilica Vatican',
    lat: 41.9,
    lng: 12.45,
    status: 'stable',
    value: 60000,
    capacity: 60000,
    dailyVisitors: 80000,
    yearBuilt: 1626,
    unescoListed: true,
    trend: 'up' as const,
    description: 'Renaissance papal basilica at Vatican City, largest church in the world by interior area, Michelangelo dome and Bernini colonnade',
  },
  {
    id: 'cb-notredame',
    name: 'Notre Dame Cathedral Paris',
    lat: 48.85,
    lng: 2.35,
    status: 'warning',
    value: 9000,
    capacity: 9000,
    dailyVisitors: 0,
    yearBuilt: 1345,
    unescoListed: true,
    trend: 'down' as const,
    description: 'French Gothic masterpiece on Ile de la Cite, undergoing reconstruction after 2019 fire with reopening planned for December 2024',
  },
  {
    id: 'cb-cologne',
    name: 'Cologne Cathedral',
    lat: 50.94,
    lng: 6.96,
    status: 'stable',
    value: 5000,
    capacity: 5000,
    dailyVisitors: 20000,
    yearBuilt: 1880,
    unescoListed: true,
    trend: 'stable' as const,
    description: 'High Gothic twin-spired cathedral on Rhine riverbank, German most visited landmark hosting 6 million annual visitors',
  },
  {
    id: 'cb-stpauls',
    name: 'St Paul Cathedral London',
    lat: 51.51,
    lng: -0.1,
    status: 'moderate',
    value: 3500,
    capacity: 3500,
    dailyVisitors: 4500,
    yearBuilt: 1710,
    unescoListed: false,
    trend: 'stable' as const,
    description: 'Sir Christopher Wren Baroque masterpiece after Great Fire of London, Anglican seat with iconic dome and whispering gallery',
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

export function CathedralBasilicaMonitor() {
  const state = useMapStore((s) => s.cathedralBasilica)
  const setState = useMapStore((s) => s.setCathedralBasilica)

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
    if (filteredData.length === 0) return { capacity: 0, dailyVisitors: 0, unescoListed: 0 }
    const capacity = filteredData.reduce((s: number, d: any) => s + (d.capacity as number), 0)
    const dailyVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const unescoListed = filteredData.filter((d: any) => d.unescoListed).length
    return {
      capacity: capacity.toLocaleString(),
      dailyVisitors: dailyVisitors.toLocaleString(),
      unescoListed: unescoListed + '/' + filteredData.length,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-yellow-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9962;</span>
          <h3 className="text-sm font-semibold text-white">Cathedral &amp; Basilica</h3>
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
            <div className="text-slate-400">Total Capacity</div>
            <div className="text-sm font-semibold text-white">{metrics.capacity}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">UNESCO Listed</div>
            <div className="text-sm font-semibold text-white">{metrics.unescoListed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1345</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000).toFixed(0)}k cap</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} capacity, built {activeItem.yearBuilt}, {activeItem.dailyVisitors.toLocaleString()} visitors/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
