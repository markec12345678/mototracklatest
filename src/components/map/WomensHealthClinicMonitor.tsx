'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'whc-planned-parenthood-nyc',
    name: 'Planned Parenthood NYC Manhattan NY',
    lat: 40.748,
    lng: -73.985,
    status: 'stable',
    value: 86,
    dailyPatients: 240,
    monthlyRevenue: 3.2,
    examRooms: 18,
    flagshipLines: 'Planned Parenthood, reproductive health, wellness exams, STI testing',
    trend: 'up' as const,
    description: 'Planned Parenthood Manhattan flagship clinic, 240 daily patients across 18 exam rooms; comprehensive reproductive and preventive healthcare services',
  },
  {
    id: 'whc-obgyn-atlanta',
    name: 'Obstetrics & Gynecology of Atlanta GA',
    lat: 33.849,
    lng: -84.367,
    status: 'stable',
    value: 81,
    dailyPatients: 185,
    monthlyRevenue: 2.6,
    examRooms: 14,
    flagshipLines: 'Obstetrics, Gynecology, prenatal care, menopause management',
    trend: 'stable' as const,
    description: 'Obstetrics and Gynecology of Atlanta GA flagship practice, 185 daily patients across 14 exam rooms; full-spectrum OB-GYN and maternal-fetal care',
  },
  {
    id: 'whc-mayo-womens',
    name: "Mayo Clinic Women's Health Rochester MN",
    lat: 44.022,
    lng: -92.465,
    status: 'moderate',
    value: 72,
    dailyPatients: 310,
    monthlyRevenue: 4.8,
    examRooms: 22,
    flagshipLines: 'Mayo Clinic, gynecologic surgery, breast health, fertility',
    trend: 'up' as const,
    description: 'Mayo Clinic Womens Health Rochester MN flagship center, 310 daily patients across 22 exam rooms; integrated multispecialty diagnostics and surgical care',
  },
  {
    id: 'whc-cleveland-womens',
    name: "Cleveland Clinic Women's Cleveland OH",
    lat: 41.503,
    lng: -81.62,
    status: 'stable',
    value: 78,
    dailyPatients: 275,
    monthlyRevenue: 3.9,
    examRooms: 20,
    flagshipLines: 'Cleveland Clinic, maternal care, gynecologic oncology, urogynecology',
    trend: 'stable' as const,
    description: 'Cleveland Clinic Womens Health Cleveland OH flagship center, 275 daily patients across 20 exam rooms; advanced maternal and gynecologic specialty programs',
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

export function WomensHealthClinicMonitor() {
  const state = useMapStore((s) => s.womensHealthClinic)
  const setState = useMapStore((s) => s.setWomensHealthClinic)

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
    if (filteredData.length === 0) return { totalPatients: 0, totalRevenue: 0, totalExamRooms: 0 }
    const totalPatients = filteredData.reduce((s: number, d: any) => s + (d.dailyPatients as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalExamRooms = filteredData.reduce((s: number, d: any) => s + (d.examRooms as number), 0)
    return { totalPatients, totalRevenue, totalExamRooms }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-700 to-fuchsia-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129728;</span>
          <h3 className="text-sm font-semibold text-white">Women's Health Clinic</h3>
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
            <div className="text-slate-400">Daily Patients</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPatients.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Exam Rooms</div>
            <div className="text-sm font-semibold text-white">{metrics.totalExamRooms.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Clinics</div>
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
                <span className="text-xs text-slate-300">{loc.examRooms} rm</span>
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
              {activeItem.dailyPatients.toLocaleString()} patients/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.examRooms.toLocaleString()} exam rooms
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
