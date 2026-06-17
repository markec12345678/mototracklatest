'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'vc-banfield',
    name: 'Banfield Pet Hospital Portland',
    lat: 45.523,
    lng: -122.676,
    status: 'stable',
    value: 88,
    appointmentsPerDay: 42,
    vetsOnDuty: 4,
    avgWaitMin: 18,
    species: 'Dog / Cat / Exotic',
    trend: 'up' as const,
    description: 'Banfield flagship Portland clinic offering Optimum Wellness Plans, 4 DVMs on rotation and full in-house lab & digital radiography',
  },
  {
    id: 'vc-vca',
    name: 'VCA Animal Hospital LA',
    lat: 34.090,
    lng: -118.361,
    status: 'stable',
    value: 84,
    appointmentsPerDay: 38,
    vetsOnDuty: 3,
    avgWaitMin: 22,
    species: 'Dog / Cat',
    trend: 'stable' as const,
    description: 'VCA West LA clinic with preventive care focus, 3 exam rooms and integrated online booking for routine vaccinations & dental cleaning',
  },
  {
    id: 'vc-bluepearl',
    name: 'BluePearl Seattle Specialty',
    lat: 47.612,
    lng: -122.332,
    status: 'moderate',
    value: 76,
    appointmentsPerDay: 28,
    vetsOnDuty: 6,
    avgWaitMin: 35,
    species: 'Dog / Cat / Avian',
    trend: 'up' as const,
    description: 'BluePearl Seattle specialty & emergency referral center with board-certified surgeons, internal medicine and 24/7 criticalist coverage',
  },
  {
    id: 'vc-thriv',
    name: 'Thrive Pet Healthcare Austin',
    lat: 30.267,
    lng: -97.743,
    status: 'warning',
    value: 62,
    appointmentsPerDay: 24,
    vetsOnDuty: 2,
    avgWaitMin: 42,
    species: 'Dog / Cat',
    trend: 'down' as const,
    description: 'Thrive Pet Healthcare Austin location facing staff shortages, 2 DVMs covering expanded hours with 42-min average wait times',
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

export function VeterinaryClinicMonitor() {
  const state = useMapStore((s) => s.veterinaryClinic)
  const setState = useMapStore((s) => s.setVeterinaryClinic)

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
    if (filteredData.length === 0) return { totalAppts: 0, totalVets: 0, avgWait: '0m', peakAppts: 0 }
    const totalAppts = filteredData.reduce((s: number, d: any) => s + (d.appointmentsPerDay as number), 0)
    const totalVets = filteredData.reduce((s: number, d: any) => s + (d.vetsOnDuty as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.avgWaitMin as number), 0) / filteredData.length
    const peakAppts = Math.max(...filteredData.map((d: any) => d.appointmentsPerDay as number))
    return { totalAppts, totalVets, avgWait: avgWait.toFixed(0) + 'm', peakAppts }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-teal-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128049;</span>
          <h3 className="text-sm font-semibold text-white">Veterinary Clinic</h3>
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
            <div className="text-slate-400">Appointments/day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAppts}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">DVMs on duty</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVets}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Busiest Clinic</div>
            <div className="text-sm font-semibold text-white">{metrics.peakAppts}/d</div>
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
                <span className="text-xs text-slate-300">{loc.appointmentsPerDay}/d</span>
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
              Species: <span className="text-slate-300 font-medium">{activeItem.species}</span>
              &nbsp;&middot;&nbsp; {activeItem.appointmentsPerDay} appts/d, {activeItem.vetsOnDuty} DVMs, {activeItem.avgWaitMin}m wait
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
