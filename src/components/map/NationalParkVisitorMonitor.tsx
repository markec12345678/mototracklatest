'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'park-yellowstone',
    name: 'Yellowstone',
    lat: 44.428,
    lng: -110.5885,
    status: 'critical',
    value: 28000,
    visitors: 28000,
    trailClosures: 3,
    wildlifeSightings: 47,
    campSites: 12,
    trend: 'up' as const,
    description: 'At daily capacity with Old Faithful congestion and full campgrounds turning away visitors',
  },
  {
    id: 'park-grandcanyon',
    name: 'Grand Canyon',
    lat: 36.0544,
    lng: -112.1401,
    status: 'warning',
    value: 21000,
    visitors: 21000,
    trailClosures: 1,
    wildlifeSightings: 32,
    campSites: 8,
    trend: 'stable' as const,
    description: 'Busy South Rim with managed shuttle access and one trail closed for rockfall repair',
  },
  {
    id: 'park-yosemite',
    name: 'Yosemite',
    lat: 37.8651,
    lng: -119.5383,
    status: 'moderate',
    value: 15000,
    visitors: 15000,
    trailClosures: 2,
    wildlifeSightings: 28,
    campSites: 15,
    trend: 'up' as const,
    description: 'Active season with reservation system active and two trails closed for bear management',
  },
  {
    id: 'park-banff',
    name: 'Banff',
    lat: 51.4968,
    lng: -115.9281,
    status: 'stable',
    value: 8500,
    visitors: 8500,
    trailClosures: 0,
    wildlifeSightings: 51,
    campSites: 22,
    trend: 'down' as const,
    description: 'Quiet shoulder season with abundant wildlife sightings and available campground slots',
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

export function NationalParkVisitorMonitor() {
  const state = useMapStore((s) => s.nationalParkVisitorMonitor)
  const setState = useMapStore((s) => s.setNationalParkVisitorMonitor)

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
    if (filteredData.length === 0) return { totalVisitors: 0, totalClosures: 0, totalWildlife: 0, totalCamps: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.visitors as number), 0)
    const totalClosures = filteredData.reduce((s: number, d: any) => s + (d.trailClosures as number), 0)
    const totalWildlife = filteredData.reduce((s: number, d: any) => s + (d.wildlifeSightings as number), 0)
    const totalCamps = filteredData.reduce((s: number, d: any) => s + (d.campSites as number), 0)
    return {
      totalVisitors: totalVisitors.toLocaleString(),
      totalClosures,
      totalWildlife,
      totalCamps,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌲</span>
          <h3 className="text-sm font-semibold text-white">National Park Visitor Monitor</h3>
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
            <div className="text-slate-400">Visitors today</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Trail Closures</div>
            <div className="text-sm font-semibold text-white">{metrics.totalClosures}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Wildlife Sightings</div>
            <div className="text-sm font-semibold text-white">{metrics.totalWildlife}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Camp Sites</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCamps}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} visitors today</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
