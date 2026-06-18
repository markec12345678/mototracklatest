'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ac-brimfield',
    name: 'Brimfield MA Antique Show',
    lat: 42.126,
    lng: -72.201,
    status: 'stable',
    value: 92,
    dailyVisitors: 25000,
    monthlyRevenue: 4.8,
    dealerBooths: 6000,
    flagshipLines: 'May/July/Sept Shows, Open-Air Fields',
    trend: 'up' as const,
    description: 'Brimfield MA Antique Show (3x/year), 25,000 daily visitors with 6,000 dealer booths; largest outdoor antiques show in the world since 1959',
  },
  {
    id: 'ac-baltimore',
    name: 'Antique Row Baltimore MD',
    lat: 39.290,
    lng: -76.612,
    status: 'moderate',
    value: 71,
    dailyVisitors: 480,
    monthlyRevenue: 1.2,
    dealerBooths: 80,
    flagshipLines: 'Federal Hill, Mt. Washington, Howard St',
    trend: 'stable' as const,
    description: 'Antique Row Baltimore MD historic district, 480 daily visitors with 80 dealer shops; century-old antiques corridor with curated multi-dealer stores',
  },
  {
    id: 'ac-manhattan',
    name: 'Manhattan Art & Antique Center NYC',
    lat: 40.754,
    lng: -73.974,
    status: 'stable',
    value: 84,
    dailyVisitors: 720,
    monthlyRevenue: 2.8,
    dealerBooths: 100,
    flagshipLines: 'Fine Art, Silver, Asian Antiques',
    trend: 'up' as const,
    description: 'Manhattan Art & Antique Center NYC flagship, 720 daily visitors with 100 dealer booths; 25th Street multi-dealer antiques emporium since 1992',
  },
  {
    id: 'ac-scott',
    name: 'Scott Antique Markets Atlanta GA',
    lat: 33.749,
    lng: -84.388,
    status: 'stable',
    value: 80,
    dailyVisitors: 3800,
    monthlyRevenue: 1.9,
    dealerBooths: 2500,
    flagshipLines: 'Mid-Century, Folk Art, Estate Jewelry',
    trend: 'stable' as const,
    description: 'Scott Antique Markets Atlanta GA (monthly), 3,800 daily visitors with 2,500 dealer booths; Americas largest indoor antique market since 1985',
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

export function AntiquesCollectiblesStoreMonitor() {
  const state = useMapStore((s) => s.antiquesCollectiblesStore)
  const setState = useMapStore((s) => s.setAntiquesCollectiblesStore)

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
    if (filteredData.length === 0) return { totalVisitors: 0, totalRevenue: 0, totalBooths: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalBooths = filteredData.reduce((s: number, d: any) => s + (d.dealerBooths as number), 0)
    return { totalVisitors, totalRevenue, totalBooths }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-700 to-yellow-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128081;</span>
          <h3 className="text-sm font-semibold text-white">Antiques & Collectibles Store</h3>
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
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Dealer Booths</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBooths.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Markets</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.flagshipLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.dealerBooths.toLocaleString()}</span>
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
              {activeItem.dailyVisitors.toLocaleString()} visitors/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.dealerBooths.toLocaleString()} dealer booths
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
