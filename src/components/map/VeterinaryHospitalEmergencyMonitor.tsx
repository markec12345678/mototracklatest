'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'vh-bluepearl',
    name: 'BluePearl Pet Hospital Tampa ER',
    lat: 27.965,
    lng: -82.537,
    status: 'stable',
    value: 92,
    erCasesPerDay: 38,
    icuCages: 12,
    criticalistsOnDuty: 3,
    avgResponseMin: 4,
    specialties: 'Surgery / Internal Med / Neuro',
    trend: 'up' as const,
    description: 'BluePearl Tampa 24/7 emergency & specialty hospital with 12 ICU cages, 3 criticalists on duty and 4-min triage response',
  },
  {
    id: 'vh-medvet',
    name: 'MedVet Dallas Emergency',
    lat: 32.813,
    lng: -96.771,
    status: 'stable',
    value: 86,
    erCasesPerDay: 32,
    icuCages: 10,
    criticalistsOnDuty: 2,
    avgResponseMin: 6,
    specialties: 'Surgery / Cardiology / Oncology',
    trend: 'stable' as const,
    description: 'MedVet Dallas 24/7 ER with 10 ICU cages, 2 criticalists and integrated oncology/cardiologist on-call rotation',
  },
  {
    id: 'vh-veccs',
    name: 'VECCS Certified Boston ER',
    lat: 42.360,
    lng: -71.060,
    status: 'moderate',
    value: 74,
    erCasesPerDay: 28,
    icuCages: 8,
    criticalistsOnDuty: 2,
    avgResponseMin: 8,
    specialties: 'Emergency / Critical Care',
    trend: 'up' as const,
    description: 'VECCS Level I certified Boston ER with 8 ICU cages and rapid trauma team activation, 28 cases daily with 8-min average triage',
  },
  {
    id: 'vh-aerc',
    name: 'AERC Minneapolis Twin Cities',
    lat: 44.975,
    lng: -93.267,
    status: 'warning',
    value: 62,
    erCasesPerDay: 22,
    icuCages: 6,
    criticalistsOnDuty: 1,
    avgResponseMin: 14,
    specialties: 'Emergency Only',
    trend: 'down' as const,
    description: 'AERC Twin Cities facing overnight staffing strain, single criticalist on duty with 14-min triage times and ICU near capacity',
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

export function VeterinaryHospitalEmergencyMonitor() {
  const state = useMapStore((s) => s.veterinaryHospitalEmergency)
  const setState = useMapStore((s) => s.setVeterinaryHospitalEmergency)

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
    if (filteredData.length === 0) return { totalEr: 0, totalIcu: 0, totalCrit: 0, avgResponse: '0m' }
    const totalEr = filteredData.reduce((s: number, d: any) => s + (d.erCasesPerDay as number), 0)
    const totalIcu = filteredData.reduce((s: number, d: any) => s + (d.icuCages as number), 0)
    const totalCrit = filteredData.reduce((s: number, d: any) => s + (d.criticalistsOnDuty as number), 0)
    const avgResponse = filteredData.reduce((s: number, d: any) => s + (d.avgResponseMin as number), 0) / filteredData.length
    return { totalEr, totalIcu, totalCrit, avgResponse: avgResponse.toFixed(1) + 'm' }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-600 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#10024;</span>
          <h3 className="text-sm font-semibold text-white">Vet Hospital ER (24/7)</h3>
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
            <div className="text-slate-400">ER cases/day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalEr}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">ICU cages</div>
            <div className="text-sm font-semibold text-white">{metrics.totalIcu}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Criticalists</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCrit}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Triage</div>
            <div className="text-sm font-semibold text-white">{metrics.avgResponse}</div>
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
                <span className="text-xs text-slate-300">{loc.erCasesPerDay}/d</span>
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
              Specialties: <span className="text-slate-300 font-medium">{activeItem.specialties}</span>
              &nbsp;&middot;&nbsp; {activeItem.erCasesPerDay} ER/d, {activeItem.icuCages} ICU, {activeItem.avgResponseMin}m triage
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
