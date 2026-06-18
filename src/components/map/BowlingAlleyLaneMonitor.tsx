'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ba-high-rollers',
    name: 'High Roller Pool &amp; Bowls Las Vegas',
    lat: 36.111,
    lng: -115.170,
    status: 'stable',
    value: 580000,
    totalLanes: 50,
    leagueTeams: 64,
    avgDailyGames: 1200,
    trend: 'up' as const,
    description: 'The LINQ Promenade luxury boutique bowling alley with 50 lanes on two floors, cocktail lounge and DJ booth, Las Vegas Strip entertainment venue',
  },
  {
    id: 'ba-bowlmor',
    name: 'Bowlmor Times Square',
    lat: 40.757,
    lng: -73.987,
    status: 'stable',
    value: 720000,
    totalLanes: 42,
    leagueTeams: 38,
    avgDailyGames: 980,
    trend: 'stable' as const,
    description: 'Manhattan 1938 Bowlmor Lanes reimagined as upscale nightlife bowling with 42 lanes across 90,000 sq ft, NYC corporate event destination',
  },
  {
    id: 'ba-jbs-tokyo',
    name: 'JBs Bowling Tokyo Joypolis',
    lat: 35.630,
    lng: 139.783,
    status: 'moderate',
    value: 410000,
    totalLanes: 24,
    leagueTeams: 22,
    avgDailyGames: 540,
    trend: 'down' as const,
    description: 'Odaiba Sega Joypolis entertainment complex 24-lane bowling with arcade integration, declining youth bowling participation in Japan',
  },
  {
    id: 'ba-star-lanes',
    name: 'All Star Lanes London Brick Lane',
    lat: 51.521,
    lng: -0.075,
    status: 'stable',
    value: 320000,
    totalLanes: 12,
    leagueTeams: 18,
    avgDailyGames: 360,
    trend: 'up' as const,
    description: 'UK boutique retro bowling brand founded 2007 Shoreditch, 12 lanes with diner, karaoke rooms and live music; expanding to Leeds and Manchester',
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

export function BowlingAlleyLaneMonitor() {
  const state = useMapStore((s) => s.bowlingAlleyLane)
  const setState = useMapStore((s) => s.setBowlingAlleyLane)

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
    if (filteredData.length === 0) return { totalLanes: 0, totalTeams: 0, totalGames: 0 }
    const totalLanes = filteredData.reduce((s: number, d: any) => s + (d.totalLanes as number), 0)
    const totalTeams = filteredData.reduce((s: number, d: any) => s + (d.leagueTeams as number), 0)
    const totalGames = filteredData.reduce((s: number, d: any) => s + (d.avgDailyGames as number), 0)
    return {
      totalLanes,
      totalTeams,
      totalGames,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-700 to-pink-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127923;</span>
          <h3 className="text-sm font-semibold text-white">Bowling Alley Lane</h3>
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
            <div className="text-slate-400">Total Lanes</div>
            <div className="text-sm font-semibold text-white">{metrics.totalLanes}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">League Teams</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTeams}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Games</div>
            <div className="text-sm font-semibold text-white">{metrics.totalGames.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">1938</div>
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
                <span className="text-xs text-slate-300">{loc.totalLanes}L</span>
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
              <span className="text-slate-300 font-medium">{activeItem.totalLanes} lanes, {activeItem.leagueTeams} league teams, {activeItem.avgDailyGames.toLocaleString()} daily games, ${activeItem.value.toLocaleString()} annual revenue</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
