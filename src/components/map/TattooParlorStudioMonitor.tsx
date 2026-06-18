'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tp-bangbang',
    name: 'Bang Bang NYC SoHo',
    lat: 40.723,
    lng: -74.002,
    status: 'stable',
    value: 95,
    sessionsPerDay: 18,
    artistsOnDuty: 5,
    avgSessionHr: 4.5,
    trend: 'up' as const,
    description: 'Bang Bang celebrity tattoo parlor in SoHo with 5 world-renowned artists and 4.5-hour average custom session for high-end clientele',
  },
  {
    id: 'tp-tribe',
    name: 'Tribe Tattoo Los Angeles',
    lat: 34.085,
    lng: -118.341,
    status: 'stable',
    value: 86,
    sessionsPerDay: 14,
    artistsOnDuty: 4,
    avgSessionHr: 3.8,
    trend: 'stable' as const,
    description: 'LA Tribe Tattoo with custom fine-line and blackwork specialists serving 14 sessions daily across 4 resident artists',
  },
  {
    id: 'tp-richard',
    name: 'Richard Steele Tokyo',
    lat: 35.66,
    lng: 139.7,
    status: 'moderate',
    value: 78,
    sessionsPerDay: 10,
    artistsOnDuty: 3,
    avgSessionHr: 5.2,
    trend: 'up' as const,
    description: 'Tokyo Richard Steele tattoo studio specializing in Japanese traditional irezumi with longer sessions and 3 master artists',
  },
  {
    id: 'tp-paradise',
    name: 'Tattoo Paradise Miami',
    lat: 25.79,
    lng: -80.132,
    status: 'warning',
    value: 64,
    sessionsPerDay: 8,
    artistsOnDuty: 2,
    avgSessionHr: 3.2,
    trend: 'down' as const,
    description: 'Miami Beach Tattoo Paradise impacted by off-season slowdown with reduced artist availability and shorter sessions',
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

export function TattooParlorStudioMonitor() {
  const state = useMapStore((s) => s.tattooParlorStudio)
  const setState = useMapStore((s) => s.setTattooParlorStudio)

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
    if (filteredData.length === 0) return { totalSessions: 0, totalArtists: 0, avgSession: '0h', totalHours: 0 }
    const totalSessions = filteredData.reduce((s: number, d: any) => s + (d.sessionsPerDay as number), 0)
    const totalArtists = filteredData.reduce((s: number, d: any) => s + (d.artistsOnDuty as number), 0)
    const avgSession = filteredData.reduce((s: number, d: any) => s + (d.avgSessionHr as number), 0) / filteredData.length
    const totalHours = filteredData.reduce((s: number, d: any) => s + (d.sessionsPerDay as number) * (d.avgSessionHr as number), 0)
    return {
      totalSessions,
      totalArtists,
      avgSession: avgSession.toFixed(1) + 'h',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700 to-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128156;</span>
          <h3 className="text-sm font-semibold text-white">Tattoo Parlor Studio</h3>
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
            <div className="text-slate-400">Artists</div>
            <div className="text-sm font-semibold text-white">{metrics.totalArtists}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.sessionsPerDay} sessions/day, {activeItem.artistsOnDuty} artists, {activeItem.avgSessionHr}h avg session</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
