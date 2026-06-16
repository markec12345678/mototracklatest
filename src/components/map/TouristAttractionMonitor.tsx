'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tour-eiffel',
    name: 'Paris Eiffel Tower',
    lat: 48.8584,
    lng: 2.2945,
    status: 'critical',
    value: 75000,
    visitors: 75000,
    waitTime: 180,
    rating: 4.7,
    revenue: 2.1,
    trend: 'up' as const,
    description: 'Overcrowded peak summer season with 4-hour elevator waits and packed observation decks',
  },
  {
    id: 'tour-colosseum',
    name: 'Rome Colosseum',
    lat: 41.8902,
    lng: 12.4922,
    status: 'warning',
    value: 42000,
    visitors: 42000,
    waitTime: 90,
    rating: 4.8,
    revenue: 1.3,
    trend: 'up' as const,
    description: 'Busy heritage site with timed-entry tickets and heavy tour group traffic',
  },
  {
    id: 'tour-timessquare',
    name: 'NYC Times Square',
    lat: 40.758,
    lng: -73.9855,
    status: 'moderate',
    value: 330000,
    visitors: 330000,
    waitTime: 25,
    rating: 4.5,
    revenue: 5.8,
    trend: 'stable' as const,
    description: 'Normal foot traffic flowing through the pedestrian plaza with moderate crowds',
  },
  {
    id: 'tour-shibuya',
    name: 'Tokyo Shibuya',
    lat: 35.6595,
    lng: 139.7004,
    status: 'stable',
    value: 85000,
    visitors: 85000,
    waitTime: 10,
    rating: 4.6,
    revenue: 1.1,
    trend: 'down' as const,
    description: 'Quieter weekday morning with smooth scramble crossing flow and minimal wait times',
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

export function TouristAttractionMonitor() {
  const state = useMapStore((s) => s.touristAttractionMonitor)
  const setState = useMapStore((s) => s.setTouristAttractionMonitor)

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
    if (filteredData.length === 0) return { totalVisitors: 0, avgWait: 0, avgRating: 0, totalRevenue: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.visitors as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.waitTime as number), 0) / filteredData.length
    const avgRating = filteredData.reduce((s: number, d: any) => s + (d.rating as number), 0) / filteredData.length
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.revenue as number), 0)
    return {
      totalVisitors: totalVisitors.toLocaleString(),
      avgWait: avgWait.toFixed(0),
      avgRating: avgRating.toFixed(1),
      totalRevenue: totalRevenue.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-pink-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗼</span>
          <h3 className="text-sm font-semibold text-white">Tourist Attraction Monitor</h3>
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
            <div className="text-slate-400">Visitors/day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Wait Time min</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Rating</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRating}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M</div>
            <div className="text-sm font-semibold text-white">${metrics.totalRevenue}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} visitors/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
