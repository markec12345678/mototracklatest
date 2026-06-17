'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'el-tutor',
    name: 'Tutor Time Early Learning Austin',
    lat: 30.267,
    lng: -97.743,
    status: 'stable',
    value: 88,
    childrenEnrolled: 132,
    capacity: 150,
    teachersOnDuty: 14,
    curriculum: 'STEAM / Literacy',
    enrichmentClasses: 6,
    trend: 'up' as const,
    description: 'Tutor Time Austin STEAM-focused early learning with 132 enrolled, 14 teachers and 6 weekly enrichment classes including Spanish & coding',
  },
  {
    id: 'el-la',
    name: 'LA Early Learning Center',
    lat: 34.024,
    lng: -118.467,
    status: 'stable',
    value: 84,
    childrenEnrolled: 108,
    capacity: 125,
    teachersOnDuty: 12,
    curriculum: 'Play / Social-Emotional',
    enrichmentClasses: 5,
    trend: 'stable' as const,
    description: 'LA Early Learning with play-based curriculum, 108 enrolled and 5 enrichment programs including music and gymnastics',
  },
  {
    id: 'el-denver',
    name: 'Denver Early Learning Academy',
    lat: 39.762,
    lng: -104.880,
    status: 'moderate',
    value: 76,
    childrenEnrolled: 92,
    capacity: 120,
    teachersOnDuty: 10,
    curriculum: 'Reggio Emilia',
    enrichmentClasses: 4,
    trend: 'up' as const,
    description: 'Denver Early Learning Academy Reggio Emilia-inspired with documentation panels, 92 enrolled and 4 enrichment programs',
  },
  {
    id: 'el-seattle',
    name: 'Seattle Early Learning Co-op',
    lat: 47.612,
    lng: -122.332,
    status: 'warning',
    value: 58,
    childrenEnrolled: 62,
    capacity: 100,
    teachersOnDuty: 7,
    curriculum: 'Co-op / Parent Participation',
    enrichmentClasses: 3,
    trend: 'down' as const,
    description: 'Seattle Early Learning Co-op struggling with parent participation requirements, 62 of 100 spots and 7 teaching staff',
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

export function EarlyLearningCenterMonitor() {
  const state = useMapStore((s) => s.earlyLearningCenter)
  const setState = useMapStore((s) => s.setEarlyLearningCenter)

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
    if (filteredData.length === 0) return { totalEnrolled: 0, totalCap: 0, utilization: '0%', totalTeachers: 0 }
    const totalEnrolled = filteredData.reduce((s: number, d: any) => s + (d.childrenEnrolled as number), 0)
    const totalCap = filteredData.reduce((s: number, d: any) => s + (d.capacity as number), 0)
    const totalTeachers = filteredData.reduce((s: number, d: any) => s + (d.teachersOnDuty as number), 0)
    const utilization = totalCap > 0 ? ((totalEnrolled / totalCap) * 100).toFixed(0) : '0'
    return { totalEnrolled, totalCap, utilization: utilization + '%', totalTeachers }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-600 to-purple-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129518;</span>
          <h3 className="text-sm font-semibold text-white">Early Learning Center</h3>
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
            <div className="text-slate-400">Capacity</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCap}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.utilization}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Teachers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTeachers}</div>
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
                <span className="text-xs text-slate-300">{loc.childrenEnrolled}/{loc.capacity}</span>
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
              Curriculum: <span className="text-slate-300 font-medium">{activeItem.curriculum}</span>
              &nbsp;&middot;&nbsp; {activeItem.enrichmentClasses} enrichment classes, {activeItem.teachersOnDuty} teachers, {activeItem.childrenEnrolled}/{activeItem.capacity} kids
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
