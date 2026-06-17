'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bk-paul',
    name: 'Paul Bakery Paris Champs',
    lat: 48.872,
    lng: 2.302,
    status: 'stable',
    value: 91,
    loavesPerDay: 850,
    pastryVariety: 38,
    dailyRevenue: 4250,
    trend: 'up' as const,
    description: 'Original Paul bakery near Champs-Elysees baking 850+ baguettes daily with 38 pastry varieties including classic eclairs and macarons',
  },
  {
    id: 'bk-panera',
    name: 'Panera Bread NYC Midtown',
    lat: 40.755,
    lng: -73.984,
    status: 'moderate',
    value: 74,
    loavesPerDay: 420,
    pastryVariety: 22,
    dailyRevenue: 6800,
    trend: 'stable' as const,
    description: 'Midtown Panera bakery-cafe serving sourdough bread bowls, pastries and unlimited coffee subscription to office workers',
  },
  {
    id: 'bk-greggs',
    name: 'Greggs Newcastle Quayside',
    lat: 54.97,
    lng: -1.608,
    status: 'stable',
    value: 88,
    loavesPerDay: 620,
    pastryVariety: 28,
    dailyRevenue: 3900,
    trend: 'up' as const,
    description: 'Greggs flagship at Newcastle Quayside famous for sausage rolls, vegan steak bakes and British bakery staples since 1939',
  },
  {
    id: 'bk-pret',
    name: 'Pret a Manger London Bridge',
    lat: 51.505,
    lng: -0.086,
    status: 'warning',
    value: 65,
    loavesPerDay: 305,
    pastryVariety: 18,
    dailyRevenue: 4100,
    trend: 'down' as const,
    description: 'Pret a Manger near London Bridge Station recovering from post-pandemic commuter slowdown with expanded dinner menu',
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

export function BakeryPastryShopMonitor() {
  const state = useMapStore((s) => s.bakeryPastryShop)
  const setState = useMapStore((s) => s.setBakeryPastryShop)

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
    if (filteredData.length === 0) return { totalLoaves: 0, avgVariety: 0, totalRevenue: '$0', avgRevPerLoaf: '$0' }
    const totalLoaves = filteredData.reduce((s: number, d: any) => s + (d.loavesPerDay as number), 0)
    const avgVariety = filteredData.reduce((s: number, d: any) => s + (d.pastryVariety as number), 0) / filteredData.length
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.dailyRevenue as number), 0)
    return {
      totalLoaves,
      avgVariety: Math.round(avgVariety),
      totalRevenue: '$' + (totalRevenue / 1000).toFixed(1) + 'K',
      avgRevPerLoaf: '$' + (totalRevenue / totalLoaves).toFixed(2),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-600 to-orange-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129360;</span>
          <h3 className="text-sm font-semibold text-white">Bakery Pastry Shop</h3>
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
            <div className="text-slate-400">Loaves / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalLoaves.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Variety</div>
            <div className="text-sm font-semibold text-white">{metrics.avgVariety} types</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Revenue</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Rev / loaf</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRevPerLoaf}</div>
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
                <span className="text-xs text-slate-300">{loc.loavesPerDay}/day</span>
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
              <span className="text-slate-300 font-medium">{activeItem.loavesPerDay} loaves/day, {activeItem.pastryVariety} varieties, ${activeItem.dailyRevenue.toLocaleString()} revenue</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
