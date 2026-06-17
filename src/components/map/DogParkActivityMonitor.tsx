'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dp-tompkins',
    name: 'Tompkins Square Dog Park NYC',
    lat: 40.726,
    lng: -73.982,
    status: 'stable',
    value: 92,
    dogsOnSite: 64,
    parkSizeAcre: 2.5,
    avgVisitMin: 48,
    amenities: 'Water / Off-leash / Shade',
    trend: 'up' as const,
    description: 'Tompkins Square first NYC dog run with separate large/small dog areas, 64 dogs at peak hour and active community events',
  },
  {
    id: 'dp-griffith',
    name: 'Griffith Park Dog Park LA',
    lat: 34.137,
    lng: -118.296,
    status: 'stable',
    value: 86,
    dogsOnSite: 88,
    parkSizeAcre: 4.2,
    avgVisitMin: 55,
    amenities: 'Trails / Water / Off-leash',
    trend: 'stable' as const,
    description: 'Griffith Park off-leash area with 4.2 acres, shaded benches and 88 dogs enjoying morning social hour across multiple play zones',
  },
  {
    id: 'dp-montrose',
    name: 'Montrose Dog Beach Chicago',
    lat: 41.964,
    lng: -87.642,
    status: 'moderate',
    value: 76,
    dogsOnSite: 112,
    parkSizeAcre: 6.0,
    avgVisitMin: 70,
    amenities: 'Beach / Lake / Off-leash',
    trend: 'up' as const,
    description: 'Montrose Dog Beach Chicago with 6-acre lakefront off-leash zone, 112 dogs splashing in Lake Michigan during summer peak',
  },
  {
    id: 'dp-pointisabel',
    name: 'Point Isabel Richmond',
    lat: 37.896,
    lng: -122.320,
    status: 'warning',
    value: 60,
    dogsOnSite: 28,
    parkSizeAcre: 23,
    avgVisitMin: 38,
    amenities: 'Trails / Off-leash / Bay views',
    trend: 'down' as const,
    description: 'Point Isabel regional shoreline facing winter attendance dip with rain-softened trails and reduced off-leash activity',
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

export function DogParkActivityMonitor() {
  const state = useMapStore((s) => s.dogParkActivity)
  const setState = useMapStore((s) => s.setDogParkActivity)

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
    if (filteredData.length === 0) return { totalDogs: 0, totalAcres: 0, avgVisit: '0m', peakDogs: 0 }
    const totalDogs = filteredData.reduce((s: number, d: any) => s + (d.dogsOnSite as number), 0)
    const totalAcres = filteredData.reduce((s: number, d: any) => s + (d.parkSizeAcre as number), 0)
    const avgVisit = filteredData.reduce((s: number, d: any) => s + (d.avgVisitMin as number), 0) / filteredData.length
    const peakDogs = Math.max(...filteredData.map((d: any) => d.dogsOnSite as number))
    return { totalDogs, totalAcres: totalAcres.toFixed(1), avgVisit: avgVisit.toFixed(0) + 'm', peakDogs }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-600 to-green-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127807;</span>
          <h3 className="text-sm font-semibold text-white">Dog Park Activity</h3>
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
            <div className="text-slate-400">Dogs on site</div>
            <div className="text-sm font-semibold text-white">{metrics.totalDogs}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Acres</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAcres}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Visit</div>
            <div className="text-sm font-semibold text-white">{metrics.avgVisit}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Busiest Park</div>
            <div className="text-sm font-semibold text-white">{metrics.peakDogs} dogs</div>
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
                <span className="text-xs text-slate-300">{loc.dogsOnSite} dogs</span>
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
              Amenities: <span className="text-slate-300 font-medium">{activeItem.amenities}</span>
              &nbsp;&middot;&nbsp; {activeItem.parkSizeAcre} acres, {activeItem.dogsOnSite} dogs, {activeItem.avgVisitMin}m avg visit
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
