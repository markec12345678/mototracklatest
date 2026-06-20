'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pt-ati-bolingbrook',
    name: 'ATI Physical Therapy Bolingbrook IL',
    lat: 41.698,
    lng: -88.072,
    status: 'stable',
    value: 86,
    dailyPatients: 92,
    monthlyRevenue: 1.1,
    treatmentRooms: 12,
    flagshipLines: 'ATI, Aquatic Therapy, Work Hardening, Hand Therapy',
    trend: 'up' as const,
    description: 'ATI Physical Therapy Bolingbrook IL clinic, 92 daily patients across 12 treatment rooms; flagship Midwest outpatient orthopedic rehab site',
  },
  {
    id: 'pt-select-mechanicsburg',
    name: 'Select Medical Mechanicsburg PA',
    lat: 40.213,
    lng: -76.969,
    status: 'stable',
    value: 83,
    dailyPatients: 110,
    monthlyRevenue: 1.4,
    treatmentRooms: 16,
    flagshipLines: 'Select Medical, Kessler, SSM Health, Concentra',
    trend: 'stable' as const,
    description: 'Select Medical Mechanicsburg PA headquarters clinic, 110 daily patients across 16 treatment rooms; corporate HQ and specialty rehab flagship',
  },
  {
    id: 'pt-upstream-knoxville',
    name: 'Upstream Rehabilitation Knoxville TN',
    lat: 35.960,
    lng: -83.921,
    status: 'moderate',
    value: 71,
    dailyPatients: 78,
    monthlyRevenue: 0.9,
    treatmentRooms: 10,
    flagshipLines: 'Upstream, Drayer, BenchMark, Results Physio',
    trend: 'down' as const,
    description: 'Upstream Rehabilitation Knoxville TN regional clinic, 78 daily patients across 10 treatment rooms; flagship for the largest PT-owned group in the US',
  },
  {
    id: 'pt-confluent-nashville',
    name: 'Confluent Health Nashville TN',
    lat: 36.162,
    lng: -86.781,
    status: 'warning',
    value: 64,
    dailyPatients: 65,
    monthlyRevenue: 0.7,
    treatmentRooms: 9,
    flagshipLines: 'Confluent Health, EIM, Evidence In Motion, IBJI',
    trend: 'down' as const,
    description: 'Confluent Health Nashville TN teaching clinic, 65 daily patients across 9 treatment rooms; flagship residency and orthopedic manual therapy site',
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

export function PhysicalTherapyClinicMonitor() {
  const state = useMapStore((s) => s.physicalTherapyClinic)
  const setState = useMapStore((s) => s.setPhysicalTherapyClinic)

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
    const totalRooms = filteredData.reduce((s: number, d: any) => s + (d.treatmentRooms as number), 0)
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-700 to-teal-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128153;</span>
          <h3 className="text-sm font-semibold text-white">Physical Therapy Clinic</h3>
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
                <span className="text-xs text-slate-300">{loc.treatmentRooms.toLocaleString()}</span>
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
              &nbsp;&middot;&nbsp; {activeItem.treatmentRooms.toLocaleString()} treatment rooms
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
