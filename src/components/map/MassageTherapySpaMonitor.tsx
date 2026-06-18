'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ms-massageenvy',
    name: 'Massage Envy Scottsdale',
    lat: 33.494,
    lng: -111.926,
    status: 'stable',
    value: 88,
    sessionsPerDay: 62,
    therapistsOnDuty: 7,
    avgSessionMin: 60,
    trend: 'up' as const,
    description: 'Massage Envy Scottsdale flagship with 7 licensed massage therapists serving 62 members daily with 60-min Swedish and deep tissue sessions',
  },
  {
    id: 'ms-elements',
    name: 'Elements Massage Denver',
    lat: 39.739,
    lng: -104.99,
    status: 'moderate',
    value: 76,
    sessionsPerDay: 48,
    therapistsOnDuty: 5,
    avgSessionMin: 55,
    trend: 'stable' as const,
    description: 'Elements Massage Denver Cherry Creek location with 5 therapists providing customized massage therapy and 55-min sessions',
  },
  {
    id: 'ms-handstone',
    name: 'Hand & Stone Franchise NJ',
    lat: 40.058,
    lng: -74.145,
    status: 'stable',
    value: 84,
    sessionsPerDay: 55,
    therapistsOnDuty: 6,
    avgSessionMin: 50,
    trend: 'up' as const,
    description: 'Hand & Stone Toms River NJ location offering massage and facial services with 6 therapists and 50-min standard sessions',
  },
  {
    id: 'ms-zeel',
    name: 'Zeel On-Demand NYC',
    lat: 40.713,
    lng: -74.006,
    status: 'warning',
    value: 68,
    sessionsPerDay: 38,
    therapistsOnDuty: 12,
    avgSessionMin: 75,
    trend: 'down' as const,
    description: 'Zeel on-demand NYC dispatch center with 12 mobile therapists and longer 75-min in-home sessions but reduced booking volume',
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

export function MassageTherapySpaMonitor() {
  const state = useMapStore((s) => s.massageTherapySpa)
  const setState = useMapStore((s) => s.setMassageTherapySpa)

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
    if (filteredData.length === 0) return { totalSessions: 0, totalTherapists: 0, avgSession: '0m', totalHours: 0 }
    const totalSessions = filteredData.reduce((s: number, d: any) => s + (d.sessionsPerDay as number), 0)
    const totalTherapists = filteredData.reduce((s: number, d: any) => s + (d.therapistsOnDuty as number), 0)
    const avgSession = filteredData.reduce((s: number, d: any) => s + (d.avgSessionMin as number), 0) / filteredData.length
    const totalHours = filteredData.reduce((s: number, d: any) => s + (d.sessionsPerDay as number) * (d.avgSessionMin as number), 0) / 60
    return {
      totalSessions,
      totalTherapists,
      avgSession: avgSession.toFixed(0) + 'm',
      totalHours: Math.round(totalHours),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-600 to-cyan-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128170;</span>
          <h3 className="text-sm font-semibold text-white">Massage Therapy Spa</h3>
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
            <div className="text-slate-400">Sessions / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSessions}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Therapists</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTherapists}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Session</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSession}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Hours</div>
            <div className="text-sm font-semibold text-white">{metrics.totalHours}h</div>
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
                <span className="text-xs text-slate-300">{loc.sessionsPerDay}/day</span>
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
              <span className="text-slate-300 font-medium">{activeItem.sessionsPerDay} sessions/day, {activeItem.therapistsOnDuty} therapists, {activeItem.avgSessionMin}m avg</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
