'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gym-equinox',
    name: 'Equinox NYC',
    lat: 40.7484,
    lng: -73.9857,
    status: 'critical',
    value: 540,
    membersPresent: 540,
    classUtil: 95,
    equipmentFree: 4,
    avgSession: 78,
    trend: 'up' as const,
    description: 'Full house at peak post-work hours with crowded weight floors and zero equipment availability',
  },
  {
    id: 'gym-pure',
    name: 'Pure Fitness Singapore',
    lat: 1.2839,
    lng: 103.8443,
    status: 'warning',
    value: 320,
    membersPresent: 320,
    classUtil: 82,
    equipmentFree: 12,
    avgSession: 65,
    trend: 'up' as const,
    description: 'Busy evening rush with packed HIIT classes and limited cardio machine availability',
  },
  {
    id: 'gym-lafitness',
    name: 'LA Fitness LA',
    lat: 34.0901,
    lng: -118.4065,
    status: 'moderate',
    value: 180,
    membersPresent: 180,
    classUtil: 64,
    equipmentFree: 28,
    avgSession: 72,
    trend: 'stable' as const,
    description: 'Moderate mid-morning attendance with steady flow through free weights and treadmill zones',
  },
  {
    id: 'gym-fitnessfirst',
    name: 'Fitness First London',
    lat: 51.5074,
    lng: -0.1278,
    status: 'stable',
    value: 95,
    membersPresent: 95,
    classUtil: 42,
    equipmentFree: 45,
    avgSession: 58,
    trend: 'down' as const,
    description: 'Quieter late-morning slot with empty studios and ample availability across all equipment zones',
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

export function GymFitnessCenterMonitor() {
  const state = useMapStore((s) => s.gymFitnessCenter)
  const setState = useMapStore((s) => s.setGymFitnessCenter)

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
    if (filteredData.length === 0) return { totalMembers: 0, avgClass: 0, totalEquip: 0, avgSession: 0 }
    const totalMembers = filteredData.reduce((s: number, d: any) => s + (d.membersPresent as number), 0)
    const avgClass = filteredData.reduce((s: number, d: any) => s + (d.classUtil as number), 0) / filteredData.length
    const totalEquip = filteredData.reduce((s: number, d: any) => s + (d.equipmentFree as number), 0)
    const avgSession = filteredData.reduce((s: number, d: any) => s + (d.avgSession as number), 0) / filteredData.length
    return {
      totalMembers: totalMembers.toLocaleString(),
      avgClass: avgClass.toFixed(0),
      totalEquip: totalEquip.toLocaleString(),
      avgSession: avgSession.toFixed(0),
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

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏋️</span>
          <h3 className="text-sm font-semibold text-white">Gym &amp; Fitness Center Monitor</h3>
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
            <div className="text-slate-400">Members Present</div>
            <div className="text-sm font-semibold text-white">{metrics.totalMembers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Class Util %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgClass}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Equipment Free</div>
            <div className="text-sm font-semibold text-white">{metrics.totalEquip}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Session min</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSession}</div>
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
                <span className="text-xs text-slate-300">{loc.value}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} members present</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
