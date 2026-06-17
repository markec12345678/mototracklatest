'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bt-mahabodhi',
    name: 'Mahabodhi Temple Bodhgaya',
    lat: 24.7,
    lng: 85.0,
    status: 'stable',
    value: 2000,
    capacity: 2000,
    dailyVisitors: 8000,
    yearBuilt: 260,
    unescoListed: true,
    trend: 'up' as const,
    description: 'UNESCO site marking Buddha enlightenment under bodhi tree, 50m pyramidal spire and diamond throne at Bodhgaya pilgrimage center',
  },
  {
    id: 'bt-shwedagon',
    name: 'Shwedagon Pagoda Yangon',
    lat: 16.8,
    lng: 96.15,
    status: 'stable',
    value: 15000,
    capacity: 15000,
    dailyVisitors: 12000,
    yearBuilt: -588,
    unescoListed: false,
    trend: 'stable' as const,
    description: 'Myanmar most sacred 99m gilded stupa encrusted with 4,531 diamonds on Singuttara Hill, holding eight hairs of the Buddha',
  },
  {
    id: 'bt-borobudur',
    name: 'Borobudur Temple Java',
    lat: -7.61,
    lng: 110.2,
    status: 'moderate',
    value: 5000,
    capacity: 5000,
    dailyVisitors: 9000,
    yearBuilt: 825,
    unescoListed: true,
    trend: 'up' as const,
    description: 'World largest Buddhist temple, 9th-century Mahayana stepped pyramid with 2,672 relief panels and 504 Buddha statues in Java',
  },
  {
    id: 'bt-temple-of-heaven',
    name: 'Temple of Heaven Beijing',
    lat: 39.88,
    lng: 116.41,
    status: 'stable',
    value: 10000,
    capacity: 10000,
    dailyVisitors: 35000,
    yearBuilt: 1420,
    unescoListed: true,
    trend: 'up' as const,
    description: 'Ming dynasty imperial altar complex where emperors prayed for good harvests, iconic circular Hall of Prayer for Good Harvests',
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

export function BuddhistTempleMonitor() {
  const state = useMapStore((s) => s.buddhistTemple)
  const setState = useMapStore((s) => s.setBuddhistTemple)

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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127993;</span>
          <h3 className="text-sm font-semibold text-white">Buddhist Temple</h3>
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
            <div className="text-sm font-semibold text-white">588 BCE</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000).toFixed(0)}k</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} capacity, {activeItem.dailyVisitors.toLocaleString()} visitors/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
