'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ls-berlitz',
    name: 'Berlitz Language Center - Miami FL',
    lat: 25.7617,
    lng: -80.1918,
    status: 'active',
    value: 88,
    activeLearners: 720,
    monthlyRevenue: 1.2,
    classroomsAvailable: 8,
    flagshipLines: 'English, Spanish, French, Mandarin',
    trend: 'up' as const,
    description: 'Berlitz Language Center Miami FL flagship in Brickell, 720 active learners with 8 classrooms; immersive conversational instruction serving multicultural South Florida professionals and expats',
  },
  {
    id: 'ls-inlingua',
    name: 'Inlingua Language School - Houston TX',
    lat: 29.7604,
    lng: -95.3698,
    status: 'active',
    value: 82,
    activeLearners: 640,
    monthlyRevenue: 1.1,
    classroomsAvailable: 7,
    flagshipLines: 'English, German, Italian, Portuguese',
    trend: 'stable' as const,
    description: 'Inlingua Language School Houston TX center in Galleria district, 640 active learners with 7 classrooms; corporate language training hub serving energy-sector expats and international assignees',
  },
  {
    id: 'ls-alliance',
    name: 'Alliance Française USA - Chicago IL',
    lat: 41.8781,
    lng: -87.6298,
    status: 'warning',
    value: 61,
    activeLearners: 540,
    monthlyRevenue: 0.8,
    classroomsAvailable: 5,
    flagshipLines: 'French, Cultural Programs, DELF',
    trend: 'down' as const,
    description: 'Alliance Française USA Chicago IL branch in Lincoln Park, 540 active learners with 5 classrooms; facing enrollment softness as post-pandemic cultural programming competes with online alternatives',
  },
  {
    id: 'ls-goethe',
    name: 'Goethe-Institut USA - San Francisco CA',
    lat: 37.7749,
    lng: -122.4194,
    status: 'active',
    value: 84,
    activeLearners: 580,
    monthlyRevenue: 1.0,
    classroomsAvailable: 12,
    flagshipLines: 'German, Cultural Programs, TestDaF',
    trend: 'up' as const,
    description: 'Goethe-Institut USA San Francisco CA flagship in SoMa, 580 active learners with 12 classrooms; flagship German-language and cultural-exchange programs serving Bay Area tech professionals',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
  active: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function LanguageSchoolMonitor() {
  const state = useMapStore((s) => s.languageSchool)
  const setState = useMapStore((s) => s.setLanguageSchool)

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
    if (filteredData.length === 0) return { totalLearners: 0, totalRevenue: 0, totalClassrooms: 0 }
    const totalLearners = filteredData.reduce((s: number, d: any) => s + (d.activeLearners as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalClassrooms = filteredData.reduce((s: number, d: any) => s + (d.classroomsAvailable as number), 0)
    return { totalLearners, totalRevenue, totalClassrooms }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-cyan-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127760;</span>
          <h3 className="text-sm font-semibold text-white">Language School</h3>
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
            <div className="text-slate-400">Active Learners</div>
            <div className="text-sm font-semibold text-white">{metrics.totalLearners.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Classrooms</div>
            <div className="text-sm font-semibold text-white">{metrics.totalClassrooms}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Schools</div>
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
                <span className="text-xs text-slate-300">{loc.classroomsAvailable} rooms</span>
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
              {activeItem.activeLearners.toLocaleString()} active learners &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.classroomsAvailable} classrooms available
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
