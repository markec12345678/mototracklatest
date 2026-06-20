'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tpc-princeton',
    name: 'Princeton Review - New York NY',
    lat: 40.7128,
    lng: -74.006,
    status: 'active',
    value: 86,
    enrolledStudents: 520,
    monthlyRevenue: 1.0,
    prepRooms: 6,
    flagshipLines: 'SAT, ACT, GMAT, GRE Prep',
    trend: 'up' as const,
    description: 'Princeton Review New York NY flagship test prep center in Midtown Manhattan, 520 enrolled students with 6 prep rooms; flagship SAT/ACT classroom and tutoring hub serving NYC metro',
  },
  {
    id: 'tpc-kaplan',
    name: 'Kaplan Test Prep - Boston MA',
    lat: 42.3601,
    lng: -71.0589,
    status: 'active',
    value: 81,
    enrolledStudents: 430,
    monthlyRevenue: 0.9,
    prepRooms: 5,
    flagshipLines: 'MCAT, LSAT, SAT, DAT Prep',
    trend: 'stable' as const,
    description: 'Kaplan Test Prep Boston MA center near Back Bay, 430 enrolled students with 5 prep rooms; flagship pre-med and pre-law MCAT/LSAT classroom programs serving Greater Boston',
  },
  {
    id: 'tpc-manhattan',
    name: 'Manhattan Prep - Washington DC',
    lat: 38.9072,
    lng: -77.0369,
    status: 'warning',
    value: 58,
    enrolledStudents: 360,
    monthlyRevenue: 0.7,
    prepRooms: 4,
    flagshipLines: 'GMAT, GRE, LSAT Prep',
    trend: 'down' as const,
    description: 'Manhattan Prep Washington DC center in Dupont Circle, 360 enrolled students with 4 prep rooms; facing declining GMAT enrollment as online self-study shifts demand away from in-person classes',
  },
  {
    id: 'tpc-magoosh',
    name: 'Magoosh Test Prep - San Diego CA',
    lat: 32.7157,
    lng: -117.1611,
    status: 'active',
    value: 78,
    enrolledStudents: 310,
    monthlyRevenue: 0.6,
    prepRooms: 7,
    flagshipLines: 'SAT, ACT, TOEFL, GRE Prep',
    trend: 'up' as const,
    description: 'Magoosh Test Prep San Diego CA hybrid learning center in La Jolla, 310 enrolled students with 7 prep rooms; blending online video curriculum with in-person coaching sessions',
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

export function TestPrepCenterMonitor() {
  const state = useMapStore((s) => s.testPrepCenter)
  const setState = useMapStore((s) => s.setTestPrepCenter)

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
    if (filteredData.length === 0) return { totalStudents: 0, totalRevenue: 0, totalRooms: 0 }
    const totalStudents = filteredData.reduce((s: number, d: any) => s + (d.enrolledStudents as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalRooms = filteredData.reduce((s: number, d: any) => s + (d.prepRooms as number), 0)
    return { totalStudents, totalRevenue, totalRooms }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-red-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128221;</span>
          <h3 className="text-sm font-semibold text-white">Test Prep Center</h3>
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
            <div className="text-slate-400">Enrolled Students</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStudents.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Prep Rooms</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRooms}</div>
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
                <span className="text-xs text-slate-300">{loc.prepRooms} rooms</span>
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
              {activeItem.enrolledStudents.toLocaleString()} enrolled students &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.prepRooms} prep rooms
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
