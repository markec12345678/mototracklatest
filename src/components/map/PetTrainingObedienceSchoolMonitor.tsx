'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pt-petsmart',
    name: 'PetSmart Training Seattle',
    lat: 47.607,
    lng: -122.335,
    status: 'stable',
    value: 86,
    classesPerWeek: 28,
    dogsInTraining: 142,
    certifiedTrainers: 4,
    programTypes: 'Puppy / Beginner / Advanced CGC',
    trend: 'up' as const,
    description: 'PetSmart Seattle training program with 4 AKC-certified trainers, 28 weekly classes and 142 dogs enrolled across puppy to CGC levels',
  },
  {
    id: 'pt-petco',
    name: 'Petco Positive Reinforcement Denver',
    lat: 39.744,
    lng: -104.991,
    status: 'stable',
    value: 82,
    classesPerWeek: 22,
    dogsInTraining: 118,
    certifiedTrainers: 3,
    programTypes: 'Puppy / Adult / Private 1:1',
    trend: 'stable' as const,
    description: 'Petco Denver positive-reinforcement training with 3 certified trainers, private 1:1 sessions and group classes for all life stages',
  },
  {
    id: 'pt-starmark',
    name: 'Starmark Academy Austin TX',
    lat: 30.428,
    lng: -97.612,
    status: 'moderate',
    value: 76,
    classesPerWeek: 18,
    dogsInTraining: 86,
    certifiedTrainers: 5,
    programTypes: 'Board & Train / Protection / Therapy',
    trend: 'up' as const,
    description: 'Starmark Academy Austin with 5 master trainers, 2-week board-and-train programs, protection sport and therapy dog certification',
  },
  {
    id: 'pt-barkbusters',
    name: 'Bark Busters In-Home Boston',
    lat: 42.360,
    lng: -71.060,
    status: 'warning',
    value: 62,
    classesPerWeek: 12,
    dogsInTraining: 38,
    certifiedTrainers: 2,
    programTypes: 'In-Home Behavior / Aggression',
    trend: 'down' as const,
    description: 'Bark Busters Boston in-home behavioral specialist facing demand drop, 38 dogs in modified training plans due to reduced travel',
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

export function PetTrainingObedienceSchoolMonitor() {
  const state = useMapStore((s) => s.petTrainingObedienceSchool)
  const setState = useMapStore((s) => s.setPetTrainingObedienceSchool)

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
    if (filteredData.length === 0) return { totalClasses: 0, totalDogs: 0, totalTrainers: 0, peakDogs: 0 }
    const totalClasses = filteredData.reduce((s: number, d: any) => s + (d.classesPerWeek as number), 0)
    const totalDogs = filteredData.reduce((s: number, d: any) => s + (d.dogsInTraining as number), 0)
    const totalTrainers = filteredData.reduce((s: number, d: any) => s + (d.certifiedTrainers as number), 0)
    const peakDogs = Math.max(...filteredData.map((d: any) => d.dogsInTraining as number))
    return { totalClasses, totalDogs, totalTrainers, peakDogs }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-600 to-violet-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127937;</span>
          <h3 className="text-sm font-semibold text-white">Pet Training School</h3>
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
            <div className="text-slate-400">Classes / wk</div>
            <div className="text-sm font-semibold text-white">{metrics.totalClasses}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Dogs Enrolled</div>
            <div className="text-sm font-semibold text-white">{metrics.totalDogs}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cert. Trainers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTrainers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Busiest School</div>
            <div className="text-sm font-semibold text-white">{metrics.peakDogs} dogs</div>
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
                <span className="text-xs text-slate-300">{loc.dogsInTraining} dogs</span>
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
              Programs: <span className="text-slate-300 font-medium">{activeItem.programTypes}</span>
              &nbsp;&middot;&nbsp; {activeItem.classesPerWeek} classes/wk, {activeItem.certifiedTrainers} trainers, {activeItem.dogsInTraining} dogs
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
