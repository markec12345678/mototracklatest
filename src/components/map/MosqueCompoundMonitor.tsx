'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mc-haram',
    name: 'Masjid al-Haram Mecca',
    lat: 21.39,
    lng: 39.86,
    status: 'stable',
    value: 4000000,
    capacity: 4000000,
    dailyVisitors: 50000,
    yearBuilt: 638,
    unescoListed: false,
    trend: 'up' as const,
    description: 'Grand Mosque surrounding the Kaaba in Mecca, largest mosque in the world accommodating 4 million worshippers during Hajj',
  },
  {
    id: 'mc-nabawi',
    name: 'Al-Masjid an-Nabawi Medina',
    lat: 24.47,
    lng: 39.61,
    status: 'stable',
    value: 1000000,
    capacity: 1000000,
    dailyVisitors: 70000,
    yearBuilt: 622,
    unescoListed: false,
    trend: 'stable' as const,
    description: 'Prophet Mosque in Medina built by Muhammad, second holiest site in Islam with iconic Green Dome over Prophet tomb',
  },
  {
    id: 'mc-al-aqsa',
    name: 'Al-Aqsa Mosque Jerusalem',
    lat: 31.78,
    lng: 35.24,
    status: 'warning',
    value: 400000,
    capacity: 400000,
    dailyVisitors: 8000,
    yearBuilt: 705,
    unescoListed: true,
    trend: 'down' as const,
    description: 'Third holiest site in Islam on Temple Mount in Old City of Jerusalem, access restricted amid ongoing Israeli-Palestinian tensions',
  },
  {
    id: 'mc-sheikh',
    name: 'Sheikh Zayed Grand Mosque',
    lat: 24.41,
    lng: 54.61,
    status: 'stable',
    value: 40000,
    capacity: 40000,
    dailyVisitors: 15000,
    yearBuilt: 2007,
    unescoListed: false,
    trend: 'up' as const,
    description: 'Abu Dhabi white marble mosque with 82 domes and 1,096 columns, world largest hand-knotted carpet and 24k gold chandeliers',
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

export function MosqueCompoundMonitor() {
  const state = useMapStore((s) => s.mosqueCompound)
  const setState = useMapStore((s) => s.setMosqueCompound)

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
      capacity: (capacity / 1000000).toFixed(1) + 'M',
      dailyVisitors: (dailyVisitors / 1000).toFixed(0) + 'k',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127996;</span>
          <h3 className="text-sm font-semibold text-white">Mosque Compound</h3>
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
            <div className="text-sm font-semibold text-white">622 CE</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} capacity, {activeItem.dailyVisitors.toLocaleString()} visitors/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
