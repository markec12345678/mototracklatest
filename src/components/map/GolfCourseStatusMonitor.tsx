'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'golf-augusta',
    name: 'Augusta Georgia',
    lat: 33.5025,
    lng: -82.0225,
    status: 'critical',
    value: 0,
    holesOpen: 0,
    playersOnCourse: 0,
    teeTimes: 0,
    courseRating: 78.1,
    trend: 'down' as const,
    description: 'Course closed for Masters tournament preparation with all public play suspended indefinitely',
  },
  {
    id: 'golf-standrews',
    name: 'St Andrews UK',
    lat: 56.3406,
    lng: -2.8044,
    status: 'warning',
    value: 45,
    holesOpen: 12,
    playersOnCourse: 45,
    teeTimes: 18,
    courseRating: 76.5,
    trend: 'stable' as const,
    description: 'Six holes temporarily closed due to standing water from morning showers with delayed tee times',
  },
  {
    id: 'golf-pebble',
    name: 'Pebble Beach CA',
    lat: 36.568,
    lng: -121.9477,
    status: 'moderate',
    value: 120,
    holesOpen: 18,
    playersOnCourse: 120,
    teeTimes: 95,
    courseRating: 75.5,
    trend: 'up' as const,
    description: 'Open and accepting regular play with steady traffic and standard pace across all eighteen holes',
  },
  {
    id: 'golf-pinehurst',
    name: 'Pinehurst NC',
    lat: 35.2068,
    lng: -79.4605,
    status: 'stable',
    value: 88,
    holesOpen: 18,
    playersOnCourse: 88,
    teeTimes: 78,
    courseRating: 77.8,
    trend: 'stable' as const,
    description: 'Optimal conditions with mild weather, full course access, and ideal pace of play for members',
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

export function GolfCourseStatusMonitor() {
  const state = useMapStore((s) => s.golfCourseStatus)
  const setState = useMapStore((s) => s.setGolfCourseStatus)

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
    if (filteredData.length === 0) return { totalHoles: 0, totalPlayers: 0, totalTeeTimes: 0, avgRating: 0 }
    const totalHoles = filteredData.reduce((s: number, d: any) => s + (d.holesOpen as number), 0)
    const totalPlayers = filteredData.reduce((s: number, d: any) => s + (d.playersOnCourse as number), 0)
    const totalTeeTimes = filteredData.reduce((s: number, d: any) => s + (d.teeTimes as number), 0)
    const avgRating = filteredData.reduce((s: number, d: any) => s + (d.courseRating as number), 0) / filteredData.length
    return {
      totalHoles: totalHoles.toLocaleString(),
      totalPlayers: totalPlayers.toLocaleString(),
      totalTeeTimes: totalTeeTimes.toLocaleString(),
      avgRating: avgRating.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛳</span>
          <h3 className="text-sm font-semibold text-white">Golf Course Status Monitor</h3>
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
            <div className="text-slate-400">Holes Open</div>
            <div className="text-sm font-semibold text-white">{metrics.totalHoles}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Players on Course</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPlayers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Tee Times</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTeeTimes}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Course Rating</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRating}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} players on course</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
