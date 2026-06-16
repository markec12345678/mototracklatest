'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'museum-louvre',
    name: 'Louvre Paris',
    lat: 48.8606,
    lng: 2.3376,
    status: 'critical',
    value: 1800,
    visitors: 1800,
    queue: 95,
    exhibitsOpen: 380,
    capacity: 98,
    trend: 'up' as const,
    description: 'Mona Lisa gallery at full capacity with timed-entry slots sold out through the day',
  },
  {
    id: 'museum-british',
    name: 'British Museum London',
    lat: 51.5194,
    lng: -0.127,
    status: 'warning',
    value: 1200,
    visitors: 1200,
    queue: 60,
    exhibitsOpen: 290,
    capacity: 85,
    trend: 'stable' as const,
    description: 'Rosetta Stone hall crowded with school groups and timed ticketing controlling entry',
  },
  {
    id: 'museum-met',
    name: 'Met NYC',
    lat: 40.7794,
    lng: -73.9632,
    status: 'moderate',
    value: 850,
    visitors: 850,
    queue: 30,
    exhibitsOpen: 410,
    capacity: 72,
    trend: 'up' as const,
    description: 'Special exhibition driving moderate footfall with smooth gallery circulation',
  },
  {
    id: 'museum-vatican',
    name: 'Vatican Rome',
    lat: 41.9065,
    lng: 12.4536,
    status: 'stable',
    value: 520,
    visitors: 520,
    queue: 15,
    exhibitsOpen: 220,
    capacity: 58,
    trend: 'down' as const,
    description: 'Sistine Chapel access smooth on a weekday morning with available guided slots',
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

export function MuseumFootfallMonitor() {
  const state = useMapStore((s) => s.museumFootfallMonitor)
  const setState = useMapStore((s) => s.setMuseumFootfallMonitor)

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
    if (filteredData.length === 0) return { totalVisitors: 0, avgQueue: 0, totalExhibits: 0, avgCapacity: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.visitors as number), 0)
    const avgQueue = filteredData.reduce((s: number, d: any) => s + (d.queue as number), 0) / filteredData.length
    const totalExhibits = filteredData.reduce((s: number, d: any) => s + (d.exhibitsOpen as number), 0)
    const avgCapacity = filteredData.reduce((s: number, d: any) => s + (d.capacity as number), 0) / filteredData.length
    return {
      totalVisitors: totalVisitors.toLocaleString(),
      avgQueue: avgQueue.toFixed(0),
      totalExhibits,
      avgCapacity: avgCapacity.toFixed(0),
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

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏛️</span>
          <h3 className="text-sm font-semibold text-white">Museum Footfall Monitor</h3>
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
            <div className="text-slate-400">Visitors/hour</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Queue min</div>
            <div className="text-sm font-semibold text-white">{metrics.avgQueue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Exhibits Open</div>
            <div className="text-sm font-semibold text-white">{metrics.totalExhibits}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Capacity %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgCapacity}%</div>
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
                <span className="text-xs text-slate-300">{loc.value}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} visitors/hour</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
