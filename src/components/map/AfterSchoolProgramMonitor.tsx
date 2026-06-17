'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'as-ymca',
    name: 'YMCA After School Portland',
    lat: 45.523,
    lng: -122.676,
    status: 'stable',
    value: 88,
    kidsEnrolled: 124,
    dailyAttendance: 96,
    staffRatio: '1:12',
    programs: 'Homework / STEM / Sports',
    pickupSchools: 5,
    trend: 'up' as const,
    description: 'YMCA Portland after-school program with 124 enrolled, daily homework help, STEM clubs and transportation from 5 local elementary schools',
  },
  {
    id: 'as-boys',
    name: 'Boys & Girls Club Seattle',
    lat: 47.612,
    lng: -122.332,
    status: 'stable',
    value: 84,
    kidsEnrolled: 158,
    dailyAttendance: 112,
    staffRatio: '1:15',
    programs: 'Mentoring / Arts / Athletics',
    pickupSchools: 7,
    trend: 'stable' as const,
    description: 'Boys & Girls Club Seattle with 158 members, daily mentoring and arts programming serving 7 school catchments',
  },
  {
    id: 'as-right',
    name: 'Right at School Denver',
    lat: 39.762,
    lng: -104.880,
    status: 'moderate',
    value: 74,
    kidsEnrolled: 88,
    dailyAttendance: 64,
    staffRatio: '1:14',
    programs: 'Fitness / Homework / Enrichment',
    pickupSchools: 4,
    trend: 'up' as const,
    description: 'Right at School Denver on-site after-school program with fitness, homework and enrichment for 88 enrolled across 4 partner schools',
  },
  {
    id: 'as-stretch',
    name: 'Stretch-N-Grow Atlanta',
    lat: 33.767,
    lng: -84.420,
    status: 'warning',
    value: 60,
    kidsEnrolled: 48,
    dailyAttendance: 32,
    staffRatio: '1:16',
    programs: 'Fitness / Nutrition',
    pickupSchools: 3,
    trend: 'down' as const,
    description: 'Stretch-N-Grow Atlanta facing declining attendance with 48 enrolled, 32 daily average and 3 active school partnerships',
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

export function AfterSchoolProgramMonitor() {
  const state = useMapStore((s) => s.afterSchoolProgram)
  const setState = useMapStore((s) => s.setAfterSchoolProgram)

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
    if (filteredData.length === 0) return { totalEnrolled: 0, totalAttending: 0, attendanceRate: '0%', totalSchools: 0 }
    const totalEnrolled = filteredData.reduce((s: number, d: any) => s + (d.kidsEnrolled as number), 0)
    const totalAttending = filteredData.reduce((s: number, d: any) => s + (d.dailyAttendance as number), 0)
    const totalSchools = filteredData.reduce((s: number, d: any) => s + (d.pickupSchools as number), 0)
    const attendanceRate = totalEnrolled > 0 ? ((totalAttending / totalEnrolled) * 100).toFixed(0) : '0'
    return { totalEnrolled, totalAttending, attendanceRate: attendanceRate + '%', totalSchools }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-600 to-amber-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127979;</span>
          <h3 className="text-sm font-semibold text-white">After-School Program</h3>
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
            <div className="text-slate-400">Enrolled</div>
            <div className="text-sm font-semibold text-white">{metrics.totalEnrolled}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Attend</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAttending}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Attendance</div>
            <div className="text-sm font-semibold text-white">{metrics.attendanceRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Schools Served</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSchools}</div>
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
                <span className="text-xs text-slate-300">{loc.dailyAttendance}/{loc.kidsEnrolled}</span>
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
              Programs: <span className="text-slate-300 font-medium">{activeItem.programs}</span>
              &nbsp;&middot;&nbsp; {activeItem.pickupSchools} schools, ratio {activeItem.staffRatio}, {activeItem.dailyAttendance}/{activeItem.kidsEnrolled} daily
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
