'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'as-aspca',
    name: 'ASPCA New York Adoption',
    lat: 40.776,
    lng: -73.949,
    status: 'stable',
    value: 88,
    animalsHoused: 312,
    adoptionsThisWeek: 38,
    intakeThisWeek: 47,
    euthanasiaRatePct: 4,
    trend: 'up' as const,
    description: 'ASPCA Manhattan shelter with 312 animals in care, no-kill policy maintained and 38 adoptions processed this week',
  },
  {
    id: 'as-hsus',
    name: 'Humane Society Miami',
    lat: 25.789,
    lng: -80.226,
    status: 'stable',
    value: 82,
    animalsHoused: 256,
    adoptionsThisWeek: 31,
    intakeThisWeek: 39,
    euthanasiaRatePct: 6,
    trend: 'stable' as const,
    description: 'Humane Society of Greater Miami with community spay/neuter clinic, 256 animals and active foster network of 90+ families',
  },
  {
    id: 'as-bestfriends',
    name: 'Best Friends Los Angeles NKLA',
    lat: 34.024,
    lng: -118.467,
    status: 'moderate',
    value: 74,
    animalsHoused: 412,
    adoptionsThisWeek: 44,
    intakeThisWeek: 58,
    euthanasiaRatePct: 2,
    trend: 'up' as const,
    description: 'NKLA Pet Adoption Center with mission to make LA no-kill, 412 animals housed with robust rescue partner transfers',
  },
  {
    id: 'as-strayrescue',
    name: 'Stray Rescue St. Louis',
    lat: 38.629,
    lng: -90.244,
    status: 'warning',
    value: 58,
    animalsHoused: 286,
    adoptionsThisWeek: 18,
    intakeThisWeek: 52,
    euthanasiaRatePct: 9,
    trend: 'down' as const,
    description: 'Stray Rescue St. Louis overwhelmed with intake exceeding adoptions, capacity-strained at 286 animals in 220-slot facility',
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

export function AnimalShelterRescueMonitor() {
  const state = useMapStore((s) => s.animalShelterRescue)
  const setState = useMapStore((s) => s.setAnimalShelterRescue)

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
    if (filteredData.length === 0) return { totalHoused: 0, totalAdoptions: 0, totalIntake: 0, avgEuth: '0%' }
    const totalHoused = filteredData.reduce((s: number, d: any) => s + (d.animalsHoused as number), 0)
    const totalAdoptions = filteredData.reduce((s: number, d: any) => s + (d.adoptionsThisWeek as number), 0)
    const totalIntake = filteredData.reduce((s: number, d: any) => s + (d.intakeThisWeek as number), 0)
    const avgEuth = filteredData.reduce((s: number, d: any) => s + (d.euthanasiaRatePct as number), 0) / filteredData.length
    return { totalHoused, totalAdoptions, totalIntake, avgEuth: avgEuth.toFixed(1) + '%' }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-600 to-red-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128062;</span>
          <h3 className="text-sm font-semibold text-white">Animal Shelter & Rescue</h3>
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
            <div className="text-slate-400">In Care</div>
            <div className="text-sm font-semibold text-white">{metrics.totalHoused}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Adoptions / wk</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAdoptions}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Intake / wk</div>
            <div className="text-sm font-semibold text-white">{metrics.totalIntake}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Euth Rate</div>
            <div className="text-sm font-semibold text-white">{metrics.avgEuth}</div>
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
                <span className="text-xs text-slate-300">{loc.animalsHoused} in care</span>
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
              Live release rate: <span className="text-emerald-300 font-medium">{100 - activeItem.euthanasiaRatePct}%</span>
              &nbsp;&middot;&nbsp; {activeItem.adoptionsThisWeek} adoptions vs {activeItem.intakeThisWeek} intake / wk
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
