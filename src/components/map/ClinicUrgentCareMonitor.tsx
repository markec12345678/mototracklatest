'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'clinic-cvs-nyc',
    name: 'CVS MinuteClinic NYC',
    lat: 40.7484,
    lng: -73.9857,
    status: 'critical',
    value: 38,
    patientsWaiting: 38,
    avgWaitMin: 74,
    doctorsAvailable: 2,
    walkIns: 96,
    trend: 'up' as const,
    description: 'Midtown clinic overcrowded with walk-in surge exceeding practitioner capacity and patients boarding in lobby',
  },
  {
    id: 'clinic-walgreens-la',
    name: 'Walgreens LA',
    lat: 34.0901,
    lng: -118.4065,
    status: 'warning',
    value: 22,
    patientsWaiting: 22,
    avgWaitMin: 47,
    doctorsAvailable: 3,
    walkIns: 61,
    trend: 'up' as const,
    description: 'Busy clinic managing elevated walk-in volume with extended wait times and strained practitioner availability',
  },
  {
    id: 'clinic-boots-london',
    name: 'Boots London',
    lat: 51.5074,
    lng: -0.1278,
    status: 'moderate',
    value: 9,
    patientsWaiting: 9,
    avgWaitMin: 22,
    doctorsAvailable: 4,
    walkIns: 28,
    trend: 'stable' as const,
    description: 'Steady flow at central London branch with balanced intake and practitioner coverage meeting demand',
  },
  {
    id: 'clinic-tokyo',
    name: 'Tokyo Clinic',
    lat: 35.6762,
    lng: 139.6503,
    status: 'stable',
    value: 4,
    patientsWaiting: 4,
    avgWaitMin: 11,
    doctorsAvailable: 5,
    walkIns: 14,
    trend: 'down' as const,
    description: 'Quiet morning shift with minimal wait times and ample practitioner availability across all consultation rooms',
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

export function ClinicUrgentCareMonitor() {
  const state = useMapStore((s) => s.clinicUrgentCare)
  const setState = useMapStore((s) => s.setClinicUrgentCare)

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
    if (filteredData.length === 0) return { patientsWaiting: 0, avgWaitMin: 0, doctorsAvailable: 0, walkIns: 0 }
    const patientsWaiting = filteredData.reduce((s: number, d: any) => s + (d.patientsWaiting as number), 0)
    const avgWaitMin = filteredData.reduce((s: number, d: any) => s + (d.avgWaitMin as number), 0) / filteredData.length
    const doctorsAvailable = filteredData.reduce((s: number, d: any) => s + (d.doctorsAvailable as number), 0)
    const walkIns = filteredData.reduce((s: number, d: any) => s + (d.walkIns as number), 0)
    return {
      patientsWaiting: patientsWaiting.toLocaleString(),
      avgWaitMin: avgWaitMin.toFixed(0) + ' min',
      doctorsAvailable: doctorsAvailable.toLocaleString(),
      walkIns: walkIns.toLocaleString(),
    }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🩺</span>
          <h3 className="text-sm font-semibold text-white">Clinic Urgent Care Monitor</h3>
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
            <div className="text-slate-400">Patients Waiting</div>
            <div className="text-sm font-semibold text-white">{metrics.patientsWaiting}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait min</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWaitMin}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Doctors Available</div>
            <div className="text-sm font-semibold text-white">{metrics.doctorsAvailable}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Walk-ins</div>
            <div className="text-sm font-semibold text-white">{metrics.walkIns}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} patients waiting</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
