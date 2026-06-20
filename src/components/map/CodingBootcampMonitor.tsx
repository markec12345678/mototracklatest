'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cb-ga-nyc',
    name: 'General Assembly - New York NY',
    lat: 40.7411,
    lng: -73.9897,
    status: 'stable',
    value: 88,
    activeCohorts: 420,
    monthlyRevenue: 1.8,
    labSeats: 60,
    courseTracks: 'Full-Stack, UX Design, Data Science',
    trend: 'up' as const,
    description: 'General Assembly New York NY Flatiron District campus, 420 active cohort enrollments with 60 lab seats; flagship bootcamp offering full-stack engineering, UX design, and data science programs',
  },
  {
    id: 'cb-flatiron-denver',
    name: 'Flatiron School - Denver CO',
    lat: 39.7392,
    lng: -104.9903,
    status: 'stable',
    value: 76,
    activeCohorts: 320,
    monthlyRevenue: 1.4,
    labSeats: 48,
    courseTracks: 'Software Engineering, Data Science, Cybersecurity',
    trend: 'up' as const,
    description: 'Flatiron School Denver CO downtown campus, 320 active cohort enrollments with 48 lab seats; immersive 15-week software engineering and data science bootcamp',
  },
  {
    id: 'cb-hackreactor-austin',
    name: 'Hack Reactor - Austin TX',
    lat: 30.2672,
    lng: -97.7431,
    status: 'warning',
    value: 61,
    activeCohorts: 220,
    monthlyRevenue: 0.8,
    labSeats: 36,
    courseTracks: 'Full-Stack JavaScript, AP Advanced',
    trend: 'stable' as const,
    description: 'Hack Reactor Austin TX downtown campus, 220 active cohort enrollments with 36 lab seats; intensive 12-week JavaScript engineering program facing enrollment softening',
  },
  {
    id: 'cb-appacademy-sf',
    name: 'App Academy - San Francisco CA',
    lat: 37.7849,
    lng: -122.4094,
    status: 'stable',
    value: 83,
    activeCohorts: 320,
    monthlyRevenue: 1.2,
    labSeats: 96,
    courseTracks: 'Full-Stack Web Dev, Python, Ruby',
    trend: 'up' as const,
    description: 'App Academy San Francisco CA SoMa campus, 320 active cohort enrollments with 96 lab seats; deferred-tuition pioneer offering full-stack web development and Python curricula',
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

export function CodingBootcampMonitor() {
  const state = useMapStore((s) => s.codingBootcamp)
  const setState = useMapStore((s) => s.setCodingBootcamp)

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
    if (filteredData.length === 0) return { totalCohorts: 0, totalRevenue: 0, totalLabSeats: 0 }
    const totalCohorts = filteredData.reduce((s: number, d: any) => s + (d.activeCohorts as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalLabSeats = filteredData.reduce((s: number, d: any) => s + (d.labSeats as number), 0)
    return { totalCohorts, totalRevenue, totalLabSeats }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-green-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128187;</span>
          <h3 className="text-sm font-semibold text-white">Coding Bootcamp</h3>
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
            <div className="text-slate-400">Active Cohorts</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCohorts.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Lab Seats</div>
            <div className="text-sm font-semibold text-white">{metrics.totalLabSeats}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Campuses</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.courseTracks}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.labSeats} seats</span>
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
              {activeItem.activeCohorts.toLocaleString()} active cohorts &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.labSeats} lab seats
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
