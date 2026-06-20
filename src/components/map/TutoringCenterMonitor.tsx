'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tc-kumon-boston',
    name: 'Kumon Math & Reading - Boston MA',
    lat: 42.3601,
    lng: -71.0589,
    status: 'stable',
    value: 84,
    activeStudents: 520,
    monthlyRevenue: 1.1,
    tutorsAvailable: 24,
    flagshipLines: 'Kumon Math, Kumon Reading, Junior Kumon',
    trend: 'up' as const,
    description: 'Kumon Math & Reading Center Boston MA flagship in Back Bay, 520 active students with 24 certified tutors; individualized worksheet-based math and reading enrichment program',
  },
  {
    id: 'tc-mathnasium-chicago',
    name: 'Mathnasium Learning Center - Chicago IL',
    lat: 41.8781,
    lng: -87.6298,
    status: 'stable',
    value: 81,
    activeStudents: 560,
    monthlyRevenue: 1.2,
    tutorsAvailable: 28,
    flagshipLines: 'Mathnasium Method, SAT/ACT Prep, Numerical Fluency',
    trend: 'up' as const,
    description: 'Mathnasium Learning Center Chicago IL in Lincoln Park, 560 active students with 28 tutors; customized math-only learning plans for grades 2-12',
  },
  {
    id: 'tc-sylvan-austin',
    name: 'Sylvan Learning - Austin TX',
    lat: 30.2672,
    lng: -97.7431,
    status: 'warning',
    value: 62,
    activeStudents: 380,
    monthlyRevenue: 0.7,
    tutorsAvailable: 18,
    flagshipLines: 'SylvanSync, Reading, Math, Study Skills',
    trend: 'down' as const,
    description: 'Sylvan Learning Austin TX center in Round Rock, 380 active students with 18 tutors; personalized tutoring facing tutor recruitment challenges',
  },
  {
    id: 'tc-huntington-seattle',
    name: 'Huntington Learning Center - Seattle WA',
    lat: 47.6062,
    lng: -122.3321,
    status: 'stable',
    value: 78,
    activeStudents: 380,
    monthlyRevenue: 0.8,
    tutorsAvailable: 22,
    flagshipLines: 'SAT/ACT Prep, Academic Tutoring, Exam Prep',
    trend: 'stable' as const,
    description: 'Huntington Learning Center Seattle WA in Bellevue, 380 active students with 22 tutors; certified tutoring for K-12 academics and college test prep',
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

export function TutoringCenterMonitor() {
  const state = useMapStore((s) => s.tutoringCenter)
  const setState = useMapStore((s) => s.setTutoringCenter)

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
    if (filteredData.length === 0) return { totalStudents: 0, totalRevenue: 0, totalTutors: 0 }
    const totalStudents = filteredData.reduce((s: number, d: any) => s + (d.activeStudents as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalTutors = filteredData.reduce((s: number, d: any) => s + (d.tutorsAvailable as number), 0)
    return { totalStudents, totalRevenue, totalTutors }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-yellow-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128218;</span>
          <h3 className="text-sm font-semibold text-white">Tutoring Center</h3>
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
            <div className="text-slate-400">Active Students</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStudents.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Tutors Avail</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTutors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Centers</div>
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
                <span className="text-xs text-slate-300">{loc.tutorsAvailable} tutors</span>
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
              {activeItem.activeStudents.toLocaleString()} active students &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.tutorsAvailable} tutors available
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
