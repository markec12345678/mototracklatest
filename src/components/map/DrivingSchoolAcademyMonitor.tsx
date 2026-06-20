'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ds-driversed-dallas',
    name: 'DriversEd.com - Dallas TX',
    lat: 32.7767,
    lng: -96.797,
    status: 'stable',
    value: 86,
    activeStudents: 280,
    monthlyRevenue: 0.7,
    trainingCars: 8,
    flagshipLines: 'DriversEd.com, Online + Behind-the-Wheel',
    trend: 'up' as const,
    description: 'DriversEd.com Dallas TX branch serving 280 active students with 8 training cars; online coursework paired with behind-the-wheel instruction across the DFW metroplex',
  },
  {
    id: 'ds-aceable-houston',
    name: 'Aceable Academy - Houston TX',
    lat: 29.7604,
    lng: -95.3698,
    status: 'stable',
    value: 79,
    activeStudents: 260,
    monthlyRevenue: 0.6,
    trainingCars: 6,
    flagshipLines: 'Aceable, Mobile App, Parent-Taught',
    trend: 'up' as const,
    description: 'Aceable Academy Houston TX branch serving 260 active students with 6 training cars; mobile-first app-based curriculum popular with teen drivers in Greater Houston',
  },
  {
    id: 'ds-911-bellevue',
    name: '911 Driving School - Bellevue WA',
    lat: 47.6101,
    lng: -122.2015,
    status: 'warning',
    value: 58,
    activeStudents: 200,
    monthlyRevenue: 0.4,
    trainingCars: 5,
    flagshipLines: '911 Driving School, Police Officer Instructors',
    trend: 'stable' as const,
    description: '911 Driving School Bellevue WA branch serving 200 active students with 5 training cars; police officer-led instruction facing instructor scheduling constraints',
  },
  {
    id: 'ds-safeway-minneapolis',
    name: 'Safeway Driving School - Minneapolis MN',
    lat: 44.9778,
    lng: -93.265,
    status: 'stable',
    value: 82,
    activeStudents: 240,
    monthlyRevenue: 0.4,
    trainingCars: 9,
    flagshipLines: 'Safeway, Classroom + In-Car Packages',
    trend: 'up' as const,
    description: 'Safeway Driving School Minneapolis MN branch serving 240 active students with 9 training cars; largest Minnesota driving school with classroom and in-car packages',
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

export function DrivingSchoolAcademyMonitor() {
  const state = useMapStore((s) => s.drivingSchoolAcademy)
  const setState = useMapStore((s) => s.setDrivingSchoolAcademy)

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
    if (filteredData.length === 0) return { totalStudents: 0, totalRevenue: 0, totalCars: 0 }
    const totalStudents = filteredData.reduce((s: number, d: any) => s + (d.activeStudents as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalCars = filteredData.reduce((s: number, d: any) => s + (d.trainingCars as number), 0)
    return { totalStudents, totalRevenue, totalCars }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128663;</span>
          <h3 className="text-sm font-semibold text-white">Driving School Academy</h3>
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
            <div className="text-slate-400">Training Cars</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCars}</div>
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
                <span className="text-xs text-slate-300">{loc.trainingCars} cars</span>
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
              &nbsp;&middot;&nbsp; {activeItem.trainingCars} training cars
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
