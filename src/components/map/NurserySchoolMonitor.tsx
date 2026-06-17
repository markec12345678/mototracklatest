'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ns-little',
    name: 'Little Sunshine Nursery NYC',
    lat: 40.744,
    lng: -73.985,
    status: 'stable',
    value: 88,
    toddlersEnrolled: 48,
    capacity: 56,
    teachersOnDuty: 8,
    staffRatio: '1:6',
    ageRange: '18 months - 3 yrs',
    trend: 'up' as const,
    description: 'Little Sunshine Manhattan nursery with 48 toddlers enrolled, 1:6 ratio and structured sensory play curriculum',
  },
  {
    id: 'ns-sunny',
    name: 'Sunny Days Nursery LA',
    lat: 34.090,
    lng: -118.361,
    status: 'stable',
    value: 84,
    toddlersEnrolled: 42,
    capacity: 50,
    teachersOnDuty: 7,
    staffRatio: '1:6',
    ageRange: '18 months - 3 yrs',
    trend: 'stable' as const,
    description: 'Sunny Days LA nursery with outdoor garden play area, 42 enrolled and weekly music & movement sessions',
  },
  {
    id: 'ns-apple',
    name: 'Apple Tree Nursery Chicago',
    lat: 41.878,
    lng: -87.636,
    status: 'moderate',
    value: 74,
    toddlersEnrolled: 36,
    capacity: 48,
    teachersOnDuty: 6,
    staffRatio: '1:6',
    ageRange: '18 months - 3 yrs',
    trend: 'up' as const,
    description: 'Apple Tree Chicago nursery with 36 of 48 spots filled, Reggio Emilia-inspired curriculum and bilingual story time',
  },
  {
    id: 'ns-bumble',
    name: 'Bumble Bee Nursery Miami',
    lat: 25.789,
    lng: -80.226,
    status: 'warning',
    value: 58,
    toddlersEnrolled: 24,
    capacity: 44,
    teachersOnDuty: 4,
    staffRatio: '1:6',
    ageRange: '18 months - 3 yrs',
    trend: 'down' as const,
    description: 'Bumble Bee Miami nursery facing enrollment decline post-hurricane, 24 of 44 spots with reduced operating days',
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

export function NurserySchoolMonitor() {
  const state = useMapStore((s) => s.nurserySchool)
  const setState = useMapStore((s) => s.setNurserySchool)

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
    const totalEnrolled = filteredData.reduce((s: number, d: any) => s + (d.toddlersEnrolled as number), 0)
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-600 to-emerald-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127823;</span>
          <h3 className="text-sm font-semibold text-white">Nursery School</h3>
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
            <div className="text-slate-400">Toddlers</div>
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
                <span className="text-xs text-slate-300">{loc.toddlersEnrolled}/{loc.capacity}</span>
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
              Age range: <span className="text-slate-300 font-medium">{activeItem.ageRange}</span>
              &nbsp;&middot;&nbsp; Ratio {activeItem.staffRatio}, {activeItem.teachersOnDuty} teachers, {activeItem.toddlersEnrolled}/{activeItem.capacity} kids
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
