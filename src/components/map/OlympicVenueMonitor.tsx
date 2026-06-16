'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'olymp-la28',
    name: 'LA 2028',
    lat: 34.0407,
    lng: -118.267,
    status: 'warning',
    value: 8500,
    athletes: 8500,
    medalsAwarded: 0,
    venuesActive: 14,
    spectators: 0,
    trend: 'up' as const,
    description: 'Preparation phase delayed by venue construction setbacks with several sites still pending inspection',
  },
  {
    id: 'olymp-paris24',
    name: 'Paris 2024',
    lat: 48.8566,
    lng: 2.3522,
    status: 'stable',
    value: 10500,
    athletes: 10500,
    medalsAwarded: 1080,
    venuesActive: 0,
    spectators: 9500000,
    trend: 'stable' as const,
    description: 'Games completed successfully with full medal tally confirmed and venues now decommissioned',
  },
  {
    id: 'olymp-tokyo20',
    name: 'Tokyo 2020',
    lat: 35.6762,
    lng: 139.6503,
    status: 'moderate',
    value: 11420,
    athletes: 11420,
    medalsAwarded: 1099,
    venuesActive: 5,
    spectators: 0,
    trend: 'stable' as const,
    description: 'Wrap-up ongoing with a handful of venues still operational for legacy conversion activities',
  },
  {
    id: 'olymp-beijing22',
    name: 'Beijing 2022',
    lat: 39.9042,
    lng: 116.4074,
    status: 'critical',
    value: 2871,
    athletes: 2871,
    medalsAwarded: 327,
    venuesActive: 12,
    spectators: 0,
    trend: 'down' as const,
    description: 'Diplomatic boycott incident disrupting spectator access with closed-loop venues remaining active',
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

export function OlympicVenueMonitor() {
  const state = useMapStore((s) => s.olympicVenueMonitor)
  const setState = useMapStore((s) => s.setOlympicVenueMonitor)

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
    if (filteredData.length === 0) return { totalAthletes: 0, totalMedals: 0, totalVenues: 0, totalSpectators: 0 }
    const totalAthletes = filteredData.reduce((s: number, d: any) => s + (d.athletes as number), 0)
    const totalMedals = filteredData.reduce((s: number, d: any) => s + (d.medalsAwarded as number), 0)
    const totalVenues = filteredData.reduce((s: number, d: any) => s + (d.venuesActive as number), 0)
    const totalSpectators = filteredData.reduce((s: number, d: any) => s + (d.spectators as number), 0)
    return {
      totalAthletes: totalAthletes.toLocaleString(),
      totalMedals: totalMedals.toLocaleString(),
      totalVenues: totalVenues.toLocaleString(),
      totalSpectators: totalSpectators.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500 to-amber-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🥇</span>
          <h3 className="text-sm font-semibold text-white">Olympic Venue Monitor</h3>
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
            <div className="text-slate-400">Athletes</div>
            <div className="text-sm font-semibold text-white">{metrics.totalAthletes}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Medals Awarded</div>
            <div className="text-sm font-semibold text-white">{metrics.totalMedals}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Venues Active</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVenues}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Spectators</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSpectators}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} athletes</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
