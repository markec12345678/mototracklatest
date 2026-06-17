'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sm-schnitzer',
    name: 'Schnitzer Steel Industries Portland OR',
    lat: 45.640,
    lng: -122.730,
    status: 'stable',
    value: 90,
    tonsPerMonth: 8500,
    ferrousPct: 78,
    nonferrousPct: 22,
    pricePerTon: 480,
    trend: 'up' as const,
    description: 'Schnitzer Steel Industries Portland OR flagship shredder, 8,500 t/month with 78% ferrous and 22% non-ferrous output at $480/ton',
  },
  {
    id: 'sm-sims',
    name: 'Sims Metal Management Jersey City NJ',
    lat: 40.717,
    lng: -74.043,
    status: 'stable',
    value: 86,
    tonsPerMonth: 6200,
    ferrousPct: 82,
    nonferrousPct: 18,
    pricePerTon: 455,
    trend: 'stable' as const,
    description: 'Sims Metal Management Jersey City NJ, 6,200 t/month with 82% ferrous shred serving Northeast steel mills at $455/ton',
  },
  {
    id: 'sm-cmc',
    name: 'Commercial Metals Company Irving TX',
    lat: 32.814,
    lng: -96.949,
    status: 'moderate',
    value: 73,
    tonsPerMonth: 5400,
    ferrousPct: 85,
    nonferrousPct: 15,
    pricePerTon: 425,
    trend: 'stable' as const,
    description: 'Commercial Metals Company Irving TX mill-yard, 5,400 t/month of ferrous shred feeding CMC micro-mill rebar production at $425/ton',
  },
  {
    id: 'sm-nucor',
    name: 'Nucor Steel Charlotte NC',
    lat: 35.227,
    lng: -80.843,
    status: 'warning',
    value: 60,
    tonsPerMonth: 4800,
    ferrousPct: 88,
    nonferrousPct: 12,
    pricePerTon: 395,
    trend: 'down' as const,
    description: 'Nucor Steel Charlotte NC scrap yard, 4,800 t/month with 88% ferrous shred; price softened to $395/ton on weak steel demand',
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

export function ScrapMetalYardMonitor() {
  const state = useMapStore((s) => s.scrapMetalYard)
  const setState = useMapStore((s) => s.setScrapMetalYard)

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
    if (filteredData.length === 0) return { totalTons: 0, avgPrice: 0, totalFerrous: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tonsPerMonth as number), 0)
    const avgPrice = Math.round(filteredData.reduce((s: number, d: any) => s + (d.pricePerTon as number), 0) / filteredData.length)
    const totalFerrous = Math.round(filteredData.reduce((s: number, d: any) => s + (d.ferrousPct as number), 0) / filteredData.length)
    return { totalTons, avgPrice, totalFerrous }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-zinc-500 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9881;&#65039;</span>
          <h3 className="text-sm font-semibold text-white">Scrap Metal Yard</h3>
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
            <div className="text-slate-400">Tons / Month</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTons.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Price</div>
            <div className="text-sm font-semibold text-white">${metrics.avgPrice}/t</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ferrous</div>
            <div className="text-sm font-semibold text-white">{metrics.totalFerrous}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Yards</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.ferrousPct}% fe &middot; ${loc.pricePerTon}/t</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.tonsPerMonth / 1000).toFixed(1)}K t/mo</span>
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
              {activeItem.tonsPerMonth.toLocaleString()} t/mo &middot; {activeItem.ferrousPct}% ferrous / {activeItem.nonferrousPct}% non-ferrous
              &nbsp;&middot;&nbsp; ${activeItem.pricePerTon}/ton market price
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
