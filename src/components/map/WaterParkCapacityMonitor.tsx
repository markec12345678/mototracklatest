'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'water-typhoon',
    name: 'Typhoon Lagoon Orlando',
    lat: 28.362,
    lng: -81.5236,
    status: 'critical',
    value: 8500,
    visitors: 8500,
    slidesOpen: 12,
    poolTemp: 28,
    queue: 45,
    trend: 'up' as const,
    description: 'At peak capacity on a summer weekend with all slides running and queue times nearing one hour',
  },
  {
    id: 'water-aquatica',
    name: 'Aquatica San Diego',
    lat: 32.607,
    lng: -117.082,
    status: 'warning',
    value: 6200,
    visitors: 6200,
    slidesOpen: 14,
    poolTemp: 26,
    queue: 28,
    trend: 'up' as const,
    description: 'Busy holiday crowd with most attractions running and queue times building through the afternoon',
  },
  {
    id: 'water-siam',
    name: 'Siam Park Tenerife',
    lat: 28.066,
    lng: -16.728,
    status: 'moderate',
    value: 4100,
    visitors: 4100,
    slidesOpen: 10,
    poolTemp: 24,
    queue: 15,
    trend: 'stable' as const,
    description: 'Moderate weekday attendance with a comfortable mix of visitors and steady slide throughput',
  },
  {
    id: 'water-yas',
    name: 'Yas Waterworld Abu Dhabi',
    lat: 24.4933,
    lng: 54.6047,
    status: 'stable',
    value: 2100,
    visitors: 2100,
    slidesOpen: 16,
    poolTemp: 32,
    queue: 6,
    trend: 'down' as const,
    description: 'Quiet off-peak weekday with short queues, all slides operational, and warm pool temperatures',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function WaterParkCapacityMonitor() {
  const state = useMapStore((s) => s.waterParkCapacity)
  const setState = useMapStore((s) => s.setWaterParkCapacity)

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
    if (filteredData.length === 0) return { totalVisitors: 0, totalSlides: 0, avgPoolTemp: 0, avgQueue: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.visitors as number), 0)
    const totalSlides = filteredData.reduce((s: number, d: any) => s + (d.slidesOpen as number), 0)
    const avgPoolTemp = filteredData.reduce((s: number, d: any) => s + (d.poolTemp as number), 0) / filteredData.length
    const avgQueue = filteredData.reduce((s: number, d: any) => s + (d.queue as number), 0) / filteredData.length
    return {
      totalVisitors: totalVisitors.toLocaleString(),
      totalSlides: totalSlides.toLocaleString(),
      avgPoolTemp: avgPoolTemp.toFixed(0) + 'C',
      avgQueue: avgQueue.toFixed(0) + ' min',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌊</span>
          <h3 className="text-sm font-semibold text-white">Water Park Capacity Monitor</h3>
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
            <div className="text-slate-400">Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Slides Open</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSlides}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Pool Temp C</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPoolTemp}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Queue min</div>
            <div className="text-sm font-semibold text-white">{metrics.avgQueue}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} visitors</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
