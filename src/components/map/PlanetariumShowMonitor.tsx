'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pl-adler',
    name: 'Adler Planetarium',
    lat: 41.867,
    lng: -87.866,
    status: 'stable',
    value: 550000,
    domeDiameterM: 21,
    showScheduleDaily: 12,
    seatingCapacity: 285,
    trend: 'up' as const,
    description: 'Americas first planetarium founded 1930 on Chicago Lake Michigan shoreline, Grainger Sky Theater 8K projection, Doane Observatory telescope',
  },
  {
    id: 'pl-hayden',
    name: 'Hayden Planetarium',
    lat: 40.781,
    lng: -73.974,
    status: 'stable',
    value: 700000,
    domeDiameterM: 20,
    showScheduleDaily: 10,
    seatingCapacity: 429,
    trend: 'stable' as const,
    description: 'Rose Center for Earth and Space at AMNH NYC since 2000, 87-foot Hayden Sphere with Zeiss Mark IX projector, Big Bang cosmology narrated by Neil deGrasse Tyson',
  },
  {
    id: 'pl-griffith',
    name: 'Griffith Observatory Planetarium',
    lat: 34.118,
    lng: -118.300,
    status: 'moderate',
    value: 1300000,
    domeDiameterM: 23,
    showScheduleDaily: 14,
    seatingCapacity: 290,
    trend: 'up' as const,
    description: 'Los Angeles 1935 art deco observatory on Mount Hollywood, Samuel Oschin Planetarium 75-foot dome with Zeiss star projector, free public telescopes',
  },
  {
    id: 'pl-brussels',
    name: 'Brussels Planetarium',
    lat: 50.838,
    lng: 4.396,
    status: 'warning',
    value: 180000,
    domeDiameterM: 24,
    showScheduleDaily: 8,
    seatingCapacity: 350,
    trend: 'down' as const,
    description: 'Royal Observatory of Belgium planetarium since 1976, Europes largest 24m dome; aging projector and budget cuts threatening show diversity',
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

export function PlanetariumShowMonitor() {
  const state = useMapStore((s) => s.planetariumShow)
  const setState = useMapStore((s) => s.setPlanetariumShow)

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
    if (filteredData.length === 0) return { totalShows: 0, totalSeats: 0, avgDome: '0' }
    const totalShows = filteredData.reduce((s: number, d: any) => s + (d.showScheduleDaily as number), 0)
    const totalSeats = filteredData.reduce((s: number, d: any) => s + (d.seatingCapacity as number), 0)
    const avgDome = filteredData.reduce((s: number, d: any) => s + (d.domeDiameterM as number), 0) / filteredData.length
    return {
      totalShows,
      totalSeats,
      avgDome: avgDome.toFixed(0) + 'm',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-700 to-violet-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127776;</span>
          <h3 className="text-sm font-semibold text-white">Planetarium Show</h3>
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
            <div className="text-slate-400">Shows/Day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalShows}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Seats</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSeats}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Dome</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDome}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1930</div>
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
                <span className="text-xs text-slate-300">{loc.domeDiameterM}m</span>
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
              <span className="text-slate-300 font-medium">{activeItem.domeDiameterM}m dome, {activeItem.showScheduleDaily} shows/day, {activeItem.seatingCapacity} seats, {activeItem.value.toLocaleString()} annual visitors</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
