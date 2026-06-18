'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bg-catan',
    name: 'The Uncommons Board Game Cafe NYC',
    lat: 40.728,
    lng: -73.989,
    status: 'stable',
    value: 89,
    dailyVisitors: 320,
    libraryGames: 850,
    tableFee: 10,
    foodSalesPct: 62,
    trend: 'up' as const,
    description: 'The Uncommons NYC board game cafe, 320 daily visitors with 850-game library and $10 table fee; 62% of revenue from food/drink',
  },
  {
    id: 'bg-snakes',
    name: 'Snakes & Lattes Toronto ON',
    lat: 43.664,
    lng: -79.419,
    status: 'stable',
    value: 86,
    dailyVisitors: 280,
    libraryGames: 1200,
    tableFee: 12,
    foodSalesPct: 68,
    trend: 'stable' as const,
    description: 'Snakes & Lattes Toronto board game cafe, 280 daily visitors with 1,200-game library — pioneer of the board game cafe model',
  },
  {
    id: 'bg-draughts',
    name: 'Draughts London UK',
    lat: 51.548,
    lng: -0.072,
    status: 'moderate',
    value: 73,
    dailyVisitors: 210,
    libraryGames: 900,
    tableFee: 8,
    foodSalesPct: 55,
    trend: 'stable' as const,
    description: 'Draughts London UK board game cafe, 210 daily visitors with 900-game library in Hackney location',
  },
  {
    id: 'bg-empire',
    name: 'Empire Board Game Library Columbus OH',
    lat: 39.961,
    lng: -82.999,
    status: 'warning',
    value: 58,
    dailyVisitors: 95,
    libraryGames: 480,
    tableFee: 5,
    foodSalesPct: 41,
    trend: 'down' as const,
    description: 'Empire Board Game Library Columbus OH, 95 daily visitors — struggling with low table fees and limited food sales',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function BoardGameCafeMonitor() {
  const state = useMapStore((s) => s.boardGameCafe)
  const setState = useMapStore((s) => s.setBoardGameCafe)

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
    if (filteredData.length === 0) return { totalVisitors: 0, totalGames: 0, avgFee: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const totalGames = filteredData.reduce((s: number, d: any) => s + (d.libraryGames as number), 0)
    const avgFee = Math.round(filteredData.reduce((s: number, d: any) => s + (d.tableFee as number), 0) / filteredData.length)
    return { totalVisitors, totalGames, avgFee }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-orange-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127922;</span>
          <h3 className="text-sm font-semibold text-white">Board Game Cafe</h3>
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
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Library Games</div>
            <div className="text-sm font-semibold text-white">{metrics.totalGames.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Table Fee</div>
            <div className="text-sm font-semibold text-white">${metrics.avgFee}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cafes</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.libraryGames} games &middot; {loc.foodSalesPct}% food</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${loc.tableFee}</span>
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
              {activeItem.dailyVisitors} visitors/day &middot; {activeItem.libraryGames} games in library
              &nbsp;&middot;&nbsp; ${activeItem.tableFee} table fee &middot; {activeItem.foodSalesPct}% food revenue
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
