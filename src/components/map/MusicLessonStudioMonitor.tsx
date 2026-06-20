'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ml-schoolofrock-la',
    name: 'School of Rock - Los Angeles CA',
    lat: 34.0522,
    lng: -118.2437,
    status: 'stable',
    value: 83,
    weeklyStudents: 280,
    monthlyRevenue: 0.8,
    studiosAvailable: 5,
    flagshipLines: 'Rock 101, Performance Program, Adult Program',
    trend: 'up' as const,
    description: 'School of Rock Los Angeles CA flagship on Sunset Blvd, 280 weekly students with 5 rehearsal studios; performance-based music education combining private lessons with group shows',
  },
  {
    id: 'ml-musicandarts-nashville',
    name: 'Music & Arts - Nashville TN',
    lat: 36.1627,
    lng: -86.7816,
    status: 'stable',
    value: 79,
    weeklyStudents: 240,
    monthlyRevenue: 0.6,
    studiosAvailable: 4,
    flagshipLines: 'Private Lessons, Band & Orchestra, Instrument Rentals',
    trend: 'stable' as const,
    description: 'Music & Arts Nashville TN store and lesson studio in Music Row, 240 weekly students with 4 lesson studios; instrument sales, rentals, and private instruction for all ages',
  },
  {
    id: 'ml-kindermusik-portland',
    name: 'Kindermusik - Portland OR',
    lat: 45.5152,
    lng: -122.6784,
    status: 'stable',
    value: 75,
    weeklyStudents: 180,
    monthlyRevenue: 0.4,
    studiosAvailable: 3,
    flagshipLines: 'Kindermusik Foundations, Level 2-3, Family Time',
    trend: 'stable' as const,
    description: 'Kindermusik Portland OR early childhood music studio in Pearl District, 180 weekly students with 3 studios; research-based movement and music curriculum for newborns to age 7',
  },
  {
    id: 'ml-yamaha-sanfrancisco',
    name: 'Yamaha Music School - San Francisco CA',
    lat: 37.7749,
    lng: -122.4194,
    status: 'warning',
    value: 58,
    weeklyStudents: 220,
    monthlyRevenue: 0.6,
    studiosAvailable: 6,
    flagshipLines: 'Yamaha Music Education, Piano, Junior Music Course',
    trend: 'down' as const,
    description: 'Yamaha Music School San Francisco CA in Japantown, 220 weekly students with 6 studios; group keyboard instruction facing enrollment declines post-pandemic',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function MusicLessonStudioMonitor() {
  const state = useMapStore((s) => s.musicLessonStudio)
  const setState = useMapStore((s) => s.setMusicLessonStudio)

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
    if (filteredData.length === 0) return { totalStudents: 0, totalRevenue: 0, totalStudios: 0 }
    const totalStudents = filteredData.reduce((s: number, d: any) => s + (d.weeklyStudents as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalStudios = filteredData.reduce((s: number, d: any) => s + (d.studiosAvailable as number), 0)
    return { totalStudents, totalRevenue, totalStudios }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127925;</span>
          <h3 className="text-sm font-semibold text-white">Music Lesson Studio</h3>
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
            <div className="text-slate-400">Weekly Students</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStudents.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Studios Avail</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStudios}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Locations</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.flagshipLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.studiosAvailable} studios</span>
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
              {activeItem.weeklyStudents.toLocaleString()} students/week &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.studiosAvailable} studios available
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
