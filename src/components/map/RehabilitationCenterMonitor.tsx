'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'reh-mayo-rochester',
    name: 'Mayo Rochester',
    lat: 44.023,
    lng: -92.4656,
    status: 'critical',
    value: 285,
    patientsInProgram: 285,
    recoveryRatePct: 58,
    staffRatio: 7.2,
    avgStayDays: 42,
    trend: 'up' as const,
    description: 'Overcrowded inpatient rehabilitation unit with elevated caseloads straining therapist ratios and lengthening stays',
  },
  {
    id: 'reh-shirley-ryan-chicago',
    name: 'Shirley Ryan Chicago',
    lat: 41.894,
    lng: -87.62,
    status: 'warning',
    value: 198,
    patientsInProgram: 198,
    recoveryRatePct: 71,
    staffRatio: 5.4,
    avgStayDays: 31,
    trend: 'stable' as const,
    description: 'High program census with strong recovery outcomes but tightening therapist-to-patient ratios amid seasonal intake',
  },
  {
    id: 'reh-royal-london',
    name: 'Royal London',
    lat: 51.52,
    lng: -0.06,
    status: 'moderate',
    value: 142,
    patientsInProgram: 142,
    recoveryRatePct: 76,
    staffRatio: 4.1,
    avgStayDays: 24,
    trend: 'stable' as const,
    description: 'Normal operations across neuro and ortho rehab tracks with balanced staffing and steady discharge planning',
  },
  {
    id: 'reh-kessler-nj',
    name: 'Kessler NJ',
    lat: 40.79,
    lng: -74.18,
    status: 'stable',
    value: 96,
    patientsInProgram: 96,
    recoveryRatePct: 84,
    staffRatio: 3.2,
    avgStayDays: 18,
    trend: 'down' as const,
    description: 'Optimal rehabilitation environment with low caseload, strong recovery rates, and shorter average length of stay',
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

export function RehabilitationCenterMonitor() {
  const state = useMapStore((s) => s.rehabilitationCenter)
  const setState = useMapStore((s) => s.setRehabilitationCenter)

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
    if (filteredData.length === 0) return { patientsInProgram: 0, recoveryRatePct: 0, staffRatio: 0, avgStayDays: 0 }
    const patientsInProgram = filteredData.reduce((s: number, d: any) => s + (d.patientsInProgram as number), 0)
    const recoveryRatePct = filteredData.reduce((s: number, d: any) => s + (d.recoveryRatePct as number), 0) / filteredData.length
    const staffRatio = filteredData.reduce((s: number, d: any) => s + (d.staffRatio as number), 0) / filteredData.length
    const avgStayDays = filteredData.reduce((s: number, d: any) => s + (d.avgStayDays as number), 0) / filteredData.length
    return {
      patientsInProgram: patientsInProgram.toLocaleString(),
      recoveryRatePct: recoveryRatePct.toFixed(0) + '%',
      staffRatio: staffRatio.toFixed(1) + ':1',
      avgStayDays: avgStayDays.toFixed(0) + ' days',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🦽</span>
          <h3 className="text-sm font-semibold text-white">Rehabilitation Center Monitor</h3>
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
            <div className="text-slate-400">Patients In Program</div>
            <div className="text-sm font-semibold text-white">{metrics.patientsInProgram}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Recovery Rate %</div>
            <div className="text-sm font-semibold text-white">{metrics.recoveryRatePct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Staff Ratio</div>
            <div className="text-sm font-semibold text-white">{metrics.staffRatio}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Stay days</div>
            <div className="text-sm font-semibold text-white">{metrics.avgStayDays}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} patients in program</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
