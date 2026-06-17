'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dc-dogtopia',
    name: 'Dogtopia Daycare Bellevue WA',
    lat: 47.610,
    lng: -122.201,
    status: 'stable',
    value: 90,
    dogsPerDay: 84,
    capacity: 110,
    playroomHours: 7,
    staffRatio: '1:10',
    trend: 'up' as const,
    description: 'Dogtopia Bellevue with climate-controlled playrooms, live webcam access and structured nap time with 1:10 staff ratio',
  },
  {
    id: 'dc-campbowwow',
    name: 'Camp Bow Wow Atlanta',
    lat: 33.767,
    lng: -84.420,
    status: 'stable',
    value: 84,
    dogsPerDay: 68,
    capacity: 90,
    playroomHours: 8,
    staffRatio: '1:12',
    trend: 'stable' as const,
    description: 'Camp Bow Wow Atlanta with all-day play, certified Camp Counselors and 8-hour open-play format for socialized dogs',
  },
  {
    id: 'dc-doggy',
    name: 'Doggy Daycare San Francisco',
    lat: 37.761,
    lng: -122.435,
    status: 'moderate',
    value: 74,
    dogsPerDay: 52,
    capacity: 75,
    playroomHours: 6,
    staffRatio: '1:8',
    trend: 'up' as const,
    description: 'SF Doggy Daycare boutique location with small dog focus, indoor agility course and 6-hour structured play schedule',
  },
  {
    id: 'dc-wag',
    name: 'Wag Drop-In Austin Daycare',
    lat: 30.261,
    lng: -97.727,
    status: 'warning',
    value: 58,
    dogsPerDay: 28,
    capacity: 60,
    playroomHours: 4,
    staffRatio: '1:14',
    trend: 'down' as const,
    description: 'Wag Drop-In Austin facing post-COVID competition from in-home services, 28 dogs/day with reduced 4-hour play sessions',
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

export function PetDaycareCenterMonitor() {
  const state = useMapStore((s) => s.petDaycareCenter)
  const setState = useMapStore((s) => s.setPetDaycareCenter)

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
    if (filteredData.length === 0) return { totalDogs: 0, totalCap: 0, utilization: '0%', avgHours: '0h' }
    const totalDogs = filteredData.reduce((s: number, d: any) => s + (d.dogsPerDay as number), 0)
    const totalCap = filteredData.reduce((s: number, d: any) => s + (d.capacity as number), 0)
    const avgHours = filteredData.reduce((s: number, d: any) => s + (d.playroomHours as number), 0) / filteredData.length
    const utilization = totalCap > 0 ? ((totalDogs / totalCap) * 100).toFixed(0) : '0'
    return { totalDogs, totalCap, utilization: utilization + '%', avgHours: avgHours.toFixed(1) + 'h' }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-600 to-cyan-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127868;</span>
          <h3 className="text-sm font-semibold text-white">Pet Daycare Center</h3>
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
            <div className="text-slate-400">Dogs / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalDogs}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Capacity</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCap}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.utilization}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Play Hrs</div>
            <div className="text-sm font-semibold text-white">{metrics.avgHours}</div>
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
                <span className="text-xs text-slate-300">{loc.dogsPerDay}/{loc.capacity}</span>
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
              Staff ratio: <span className="text-slate-300 font-medium">{activeItem.staffRatio}</span>
              &nbsp;&middot;&nbsp; {activeItem.playroomHours}h play, {activeItem.dogsPerDay}/{activeItem.capacity} dogs
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
