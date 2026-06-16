'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mh-mclean-boston',
    name: 'McLean Boston',
    lat: 42.3834,
    lng: -71.15,
    status: 'critical',
    value: 420,
    patientsActive: 420,
    therapists: 18,
    avgWaitDays: 38,
    crisisCalls: 96,
    trend: 'up' as const,
    description: 'Overwhelmed intake system with month-long waitlists and surging crisis line volume exceeding clinician capacity',
  },
  {
    id: 'mh-maudsley-london',
    name: 'Maudsley London',
    lat: 51.489,
    lng: -0.091,
    status: 'warning',
    value: 280,
    patientsActive: 280,
    therapists: 24,
    avgWaitDays: 21,
    crisisCalls: 52,
    trend: 'up' as const,
    description: 'High demand across adolescent and adult services with extended wait times and growing acute referral backlog',
  },
  {
    id: 'mh-bellevue-nyc',
    name: 'Bellevue NYC',
    lat: 40.7411,
    lng: -73.976,
    status: 'moderate',
    value: 195,
    patientsActive: 195,
    therapists: 32,
    avgWaitDays: 12,
    crisisCalls: 28,
    trend: 'stable' as const,
    description: 'Stable caseload across outpatient programs with balanced therapist assignments and routine crisis triage protocols',
  },
  {
    id: 'mh-tokyo-medical',
    name: 'Tokyo Medical',
    lat: 35.6762,
    lng: 139.6503,
    status: 'stable',
    value: 110,
    patientsActive: 110,
    therapists: 28,
    avgWaitDays: 6,
    crisisCalls: 11,
    trend: 'down' as const,
    description: 'Quiet period with ample therapist availability, short intake waits, and low crisis call volume across services',
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

export function MentalHealthCenterMonitor() {
  const state = useMapStore((s) => s.mentalHealthCenter)
  const setState = useMapStore((s) => s.setMentalHealthCenter)

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
    if (filteredData.length === 0) return { patientsActive: 0, therapists: 0, avgWaitDays: 0, crisisCalls: 0 }
    const patientsActive = filteredData.reduce((s: number, d: any) => s + (d.patientsActive as number), 0)
    const therapists = filteredData.reduce((s: number, d: any) => s + (d.therapists as number), 0)
    const avgWaitDays = filteredData.reduce((s: number, d: any) => s + (d.avgWaitDays as number), 0) / filteredData.length
    const crisisCalls = filteredData.reduce((s: number, d: any) => s + (d.crisisCalls as number), 0)
    return {
      patientsActive: patientsActive.toLocaleString(),
      therapists: therapists.toLocaleString(),
      avgWaitDays: avgWaitDays.toFixed(0) + ' days',
      crisisCalls: crisisCalls.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-emerald-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <h3 className="text-sm font-semibold text-white">Mental Health Center Monitor</h3>
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
            <div className="text-slate-400">Patients Active</div>
            <div className="text-sm font-semibold text-white">{metrics.patientsActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Therapists</div>
            <div className="text-sm font-semibold text-white">{metrics.therapists}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait days</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWaitDays}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Crisis Calls</div>
            <div className="text-sm font-semibold text-white">{metrics.crisisCalls}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} patients active</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
