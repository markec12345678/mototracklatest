'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fd-frenchlaundry',
    name: 'The French Laundry',
    lat: 38.404,
    lng: -122.365,
    status: 'stable',
    value: 99,
    michelinStars: 3,
    tastingMenuPrice: 425,
    reservationPct: 100,
    trend: 'stable' as const,
    description: 'Thomas Keller 3-Michelin-star Yountville restaurant serving two 9-course tasting menus daily since 1994 in a stone cottage',
  },
  {
    id: 'fd-noma',
    name: 'Noma Copenhagen',
    lat: 55.681,
    lng: 12.601,
    status: 'stable',
    value: 97,
    michelinStars: 3,
    tastingMenuPrice: 575,
    reservationPct: 100,
    trend: 'up' as const,
    description: 'Rene Redzepi 3-Michelin-star Nordic foraging restaurant with seasonal menus (Seafood, Vegetable, Game) and 6-month waitlist',
  },
  {
    id: 'fd-elevenmadison',
    name: 'Eleven Madison Park',
    lat: 40.743,
    lng: -73.987,
    status: 'moderate',
    value: 82,
    michelinStars: 3,
    tastingMenuPrice: 365,
    reservationPct: 100,
    trend: 'stable' as const,
    description: 'Daniel Humm 3-Michelin-star NYC plant-based fine dining with seasonal 10-course menu in restored Art Deco space',
  },
  {
    id: 'fd-sukiyabashi',
    name: 'Sukiyabashi Jiro',
    lat: 35.67,
    lng: 139.763,
    status: 'warning',
    value: 71,
    michelinStars: 3,
    tastingMenuPrice: 400,
    reservationPct: 100,
    trend: 'down' as const,
    description: 'Jiro Onos 3-Michelin-star 10-seat sushi counter in Ginza with legendary 20-piece omakase and aging chef concerns',
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

export function FineDiningRestaurantMonitor() {
  const state = useMapStore((s) => s.fineDiningRestaurant)
  const setState = useMapStore((s) => s.setFineDiningRestaurant)

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
    if (filteredData.length === 0) return { totalStars: 0, avgMenu: '$0', totalReservations: 0, topPrice: 0 }
    const totalStars = filteredData.reduce((s: number, d: any) => s + (d.michelinStars as number), 0)
    const avgMenu = filteredData.reduce((s: number, d: any) => s + (d.tastingMenuPrice as number), 0) / filteredData.length
    const totalReservations = filteredData.length * 30
    const topPrice = Math.max(...filteredData.map((d: any) => d.tastingMenuPrice as number))
    return {
      totalStars,
      avgMenu: '$' + avgMenu.toFixed(0),
      totalReservations,
      topPrice,
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
          <span className="text-lg">&#127866;</span>
          <h3 className="text-sm font-semibold text-white">Fine Dining Restaurant</h3>
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
            <div className="text-slate-400">Total Stars</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStars} &#9733;</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Menu</div>
            <div className="text-sm font-semibold text-white">{metrics.avgMenu}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Resv / mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalReservations}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Menu</div>
            <div className="text-sm font-semibold text-white">${metrics.topPrice}</div>
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
                <span className="text-xs text-amber-300">{loc.michelinStars}&#9733;</span>
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
              <span className="text-slate-300 font-medium">{activeItem.michelinStars} Michelin stars, ${activeItem.tastingMenuPrice} tasting menu, {activeItem.reservationPct}% reservation rate</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
