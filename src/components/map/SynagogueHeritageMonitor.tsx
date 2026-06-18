'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sh-western',
    name: 'Western Wall Jerusalem',
    lat: 31.78,
    lng: 35.23,
    status: 'stable',
    value: 60000,
    weeklyWorshippers: 60000,
    dailyVisitors: 12000,
    yearBuilt: -19,
    unescoListed: true,
    trend: 'up' as const,
    description: 'Holiest Jewish site, retaining wall of Second Temple esplanade in Jerusalem Old City, Plaza hosting prayer and Bar Mitzvah ceremonies',
  },
  {
    id: 'sh-belz',
    name: 'Belz Great Synagogue',
    lat: 31.78,
    lng: 35.24,
    status: 'stable',
    value: 10000,
    weeklyWorshippers: 10000,
    dailyVisitors: 200,
    yearBuilt: 2000,
    unescoListed: false,
    trend: 'stable' as const,
    description: 'Hasidic Belz Great Synagogue in Jerusalem with main sanctuary seating 10,000, largest synagogue in Israel',
  },
  {
    id: 'sh-pest',
    name: 'Dohany Street Synagogue',
    lat: 47.49,
    lng: 19.06,
    status: 'moderate',
    value: 3000,
    weeklyWorshippers: 600,
    dailyVisitors: 1800,
    yearBuilt: 1859,
    unescoListed: false,
    trend: 'stable' as const,
    description: 'Budapest Moorish-revival synagogue, largest in Europe seating 3,000, restored after WWII with adjacent Jewish Museum',
  },
  {
    id: 'sh-eldridge',
    name: 'Eldridge Street Synagogue',
    lat: 40.71,
    lng: -73.99,
    status: 'warning',
    value: 800,
    weeklyWorshippers: 250,
    dailyVisitors: 400,
    yearBuilt: 1887,
    unescoListed: false,
    trend: 'down' as const,
    description: 'NYC Lower East Side 1887 Moorish synagogue, restored as museum with active congregation, attendance decline in gentrifying neighborhood',
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

export function SynagogueHeritageMonitor() {
  const state = useMapStore((s) => s.synagogueHeritage)
  const setState = useMapStore((s) => s.setSynagogueHeritage)

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
    if (filteredData.length === 0) return { weeklyWorshippers: 0, dailyVisitors: 0, unescoListed: 0 }
    const weeklyWorshippers = filteredData.reduce((s: number, d: any) => s + (d.weeklyWorshippers as number), 0)
    const dailyVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const unescoListed = filteredData.filter((d: any) => d.unescoListed).length
    return {
      weeklyWorshippers: weeklyWorshippers.toLocaleString(),
      dailyVisitors: dailyVisitors.toLocaleString(),
      unescoListed: unescoListed + '/' + filteredData.length,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-700 to-indigo-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128334;</span>
          <h3 className="text-sm font-semibold text-white">Synagogue Heritage</h3>
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
            <div className="text-slate-400">Weekly Worshippers</div>
            <div className="text-sm font-semibold text-white">{metrics.weeklyWorshippers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">UNESCO Listed</div>
            <div className="text-sm font-semibold text-white">{metrics.unescoListed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">19 BCE</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} weekly worshippers, built {activeItem.yearBuilt}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
