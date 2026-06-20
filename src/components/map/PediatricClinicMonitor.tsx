'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pc-childrens-colorado',
    name: 'Childrens Hospital Colorado Aurora CO',
    lat: 39.674,
    lng: -104.841,
    status: 'stable',
    value: 88,
    dailyPatients: 1240,
    monthlyRevenue: 18.4,
    patientRooms: 420,
    flagshipLines: 'NICU, PICU, Cardiac, Oncology',
    trend: 'up' as const,
    description: 'Childrens Hospital Colorado Aurora CO main campus, 1,240 daily patients with 420 inpatient rooms; top-ranked pediatric academic medical center serving the Rocky Mountain region',
  },
  {
    id: 'pc-nemours-jacksonville',
    name: 'Nemours Childrens Health Jacksonville FL',
    lat: 30.345,
    lng: -81.667,
    status: 'moderate',
    value: 74,
    dailyPatients: 760,
    monthlyRevenue: 11.2,
    patientRooms: 230,
    flagshipLines: 'Orthopedics, Gastroenterology, Pulmonology, Endocrinology',
    trend: 'stable' as const,
    description: 'Nemours Childrens Health Jacksonville FL flagship, 760 daily patients with 230 inpatient rooms; integrated pediatric health system founded by Alfred I. duPont in 1940',
  },
  {
    id: 'pc-texas-childrens-houston',
    name: 'Texas Childrens Hospital Houston TX',
    lat: 29.709,
    lng: -95.402,
    status: 'stable',
    value: 91,
    dailyPatients: 2150,
    monthlyRevenue: 32.7,
    patientRooms: 970,
    flagshipLines: 'Heart Center, Neurology, Transplant, Fetal',
    trend: 'up' as const,
    description: 'Texas Childrens Hospital Houston TX medical center campus, 2,150 daily patients with 970 inpatient rooms; largest childrens hospital in the United States by capacity',
  },
  {
    id: 'pc-boston-childrens',
    name: 'Boston Childrens Hospital Boston MA',
    lat: 42.337,
    lng: -71.107,
    status: 'warning',
    value: 69,
    dailyPatients: 1980,
    monthlyRevenue: 41.5,
    patientRooms: 404,
    flagshipLines: 'Cardiology, Surgery, Genetics, Stem Cell',
    trend: 'down' as const,
    description: 'Boston Childrens Hospital Boston MA Longwood medical campus, 1,980 daily patients with 404 inpatient rooms; Harvard Medical School affiliate ranked among the top pediatric research hospitals globally',
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

export function PediatricClinicMonitor() {
  const state = useMapStore((s) => s.pediatricClinic)
  const setState = useMapStore((s) => s.setPediatricClinic)

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
    if (filteredData.length === 0) return { totalPatients: 0, totalRevenue: 0, totalRooms: 0 }
    const totalPatients = filteredData.reduce((s: number, d: any) => s + (d.dailyPatients as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalRooms = filteredData.reduce((s: number, d: any) => s + (d.patientRooms as number), 0)
    return { totalPatients, totalRevenue, totalRooms }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-700 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128118;</span>
          <h3 className="text-sm font-semibold text-white">Pediatric Clinic</h3>
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
            <div className="text-slate-400">Rooms</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRooms.toLocaleString()}</div>
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
                <span className="text-xs text-slate-300">{loc.patientRooms} rm</span>
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
              &nbsp;&middot;&nbsp; {activeItem.patientRooms.toLocaleString()} inpatient rooms
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
