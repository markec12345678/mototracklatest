'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'uni-mit',
    name: 'MIT',
    lat: 42.3601,
    lng: -71.0942,
    status: 'critical',
    value: 11520,
    students: 11520,
    faculty: 1380,
    research: 1850,
    intlPct: 41,
    trend: 'up' as const,
    description: 'Overcapacity during fall semester with record enrollment and lab utilization at 98%',
  },
  {
    id: 'uni-oxford',
    name: 'Oxford',
    lat: 51.7548,
    lng: -1.2544,
    status: 'warning',
    value: 26450,
    students: 26450,
    faculty: 7420,
    research: 790,
    intlPct: 46,
    trend: 'up' as const,
    description: 'High enrollment pressure across colleges with competitive admissions driving capacity strain',
  },
  {
    id: 'uni-tokyo',
    name: 'Tokyo University',
    lat: 35.7128,
    lng: 139.7619,
    status: 'moderate',
    value: 28170,
    students: 28170,
    faculty: 4210,
    research: 620,
    intlPct: 16,
    trend: 'stable' as const,
    description: 'Normal operations across Hongo and Komaba campuses with steady research output',
  },
  {
    id: 'uni-eth',
    name: 'ETH Zurich',
    lat: 47.3763,
    lng: 8.5477,
    status: 'stable',
    value: 22340,
    students: 22340,
    faculty: 570,
    research: 1740,
    intlPct: 39,
    trend: 'up' as const,
    description: 'Optimal capacity with strong engineering programs and expanding international partnerships',
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

export function UniversityCampusMonitor() {
  const state = useMapStore((s) => s.universityCampusMonitor)
  const setState = useMapStore((s) => s.setUniversityCampusMonitor)

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
    if (filteredData.length === 0) return { totalStudents: 0, totalFaculty: 0, totalResearch: 0, avgIntl: 0 }
    const totalStudents = filteredData.reduce((s: number, d: any) => s + (d.students as number), 0)
    const totalFaculty = filteredData.reduce((s: number, d: any) => s + (d.faculty as number), 0)
    const totalResearch = filteredData.reduce((s: number, d: any) => s + (d.research as number), 0)
    const avgIntl = filteredData.reduce((s: number, d: any) => s + (d.intlPct as number), 0) / filteredData.length
    return {
      totalStudents: totalStudents.toLocaleString(),
      totalFaculty: totalFaculty.toLocaleString(),
      totalResearch: totalResearch.toLocaleString(),
      avgIntl: avgIntl.toFixed(1),
    }
  }, [filteredData])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <h3 className="text-sm font-semibold text-white">University Campus Monitor</h3>
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
            <div className="text-slate-400">Students Enrolled</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStudents}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Faculty Count</div>
            <div className="text-sm font-semibold text-white">{metrics.totalFaculty}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Research $M</div>
            <div className="text-sm font-semibold text-white">${metrics.totalResearch}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Int Students %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgIntl}%</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} students</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
