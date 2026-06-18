'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'hosp-jh',
    name: 'Johns Hopkins Baltimore',
    lat: 39.2992,
    lng: -76.5916,
    status: 'critical',
    value: 12,
    bedsAvailable: 12,
    icuCapacityPct: 96,
    erWaitMin: 58,
    staffOnDuty: 940,
    trend: 'up' as const,
    description: 'Tertiary referral center running overcapacity with ICU beds saturated and emergency department boarding admitted patients',
  },
  {
    id: 'hosp-mayo',
    name: 'Mayo Clinic MN',
    lat: 44.023,
    lng: -92.4656,
    status: 'warning',
    value: 48,
    bedsAvailable: 48,
    icuCapacityPct: 78,
    erWaitMin: 31,
    staffOnDuty: 1320,
    trend: 'up' as const,
    description: 'High patient throughput with elevated ICU occupancy and extended emergency department wait times during seasonal surge',
  },
  {
    id: 'hosp-charite',
    name: 'Charite Berlin',
    lat: 52.5194,
    lng: 13.4269,
    status: 'moderate',
    value: 110,
    bedsAvailable: 110,
    icuCapacityPct: 62,
    erWaitMin: 19,
    staffOnDuty: 1180,
    trend: 'stable' as const,
    description: 'Steady operations across campuses with balanced admissions, moderate ICU load, and routine emergency intake',
  },
  {
    id: 'hosp-tokyo',
    name: 'Tokyo Univ Hospital',
    lat: 35.7128,
    lng: 139.7619,
    status: 'stable',
    value: 165,
    bedsAvailable: 165,
    icuCapacityPct: 41,
    erWaitMin: 12,
    staffOnDuty: 860,
    trend: 'down' as const,
    description: 'Light caseload with abundant bed availability, low ICU utilization, and prompt emergency triage across departments',
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

export function HospitalCapacityTrack127Monitor() {
  const state = useMapStore((s) => s.hospitalCapacityTrack127)
  const setState = useMapStore((s) => s.setHospitalCapacityTrack127)

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
    if (filteredData.length === 0) return { bedsAvailable: 0, icuCapacityPct: 0, erWaitMin: 0, staffOnDuty: 0 }
    const bedsAvailable = filteredData.reduce((s: number, d: any) => s + (d.bedsAvailable as number), 0)
    const icuCapacityPct = filteredData.reduce((s: number, d: any) => s + (d.icuCapacityPct as number), 0) / filteredData.length
    const erWaitMin = filteredData.reduce((s: number, d: any) => s + (d.erWaitMin as number), 0) / filteredData.length
    const staffOnDuty = filteredData.reduce((s: number, d: any) => s + (d.staffOnDuty as number), 0)
    return {
      bedsAvailable: bedsAvailable.toLocaleString(),
      icuCapacityPct: icuCapacityPct.toFixed(0) + '%',
      erWaitMin: erWaitMin.toFixed(0) + ' min',
      staffOnDuty: staffOnDuty.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-red-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏥</span>
          <h3 className="text-sm font-semibold text-white">Hospital Capacity Track 127 Monitor</h3>
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
            <div className="text-slate-400">Beds Available</div>
            <div className="text-sm font-semibold text-white">{metrics.bedsAvailable}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">ICU Capacity %</div>
            <div className="text-sm font-semibold text-white">{metrics.icuCapacityPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">ER Wait min</div>
            <div className="text-sm font-semibold text-white">{metrics.erWaitMin}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Staff On Duty</div>
            <div className="text-sm font-semibold text-white">{metrics.staffOnDuty}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} beds available</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
