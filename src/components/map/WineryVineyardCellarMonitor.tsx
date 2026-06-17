'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'wv-bordeaux',
    name: 'Chateau Margaux Bordeaux',
    lat: 45.04,
    lng: -0.68,
    status: 'stable',
    value: 380000,
    cellarBottles: 850000,
    vintageYear: 2019,
    agingMonths: 24,
    trend: 'up' as const,
    description: 'Premier Cru estate since 1855, Cabernet Sauvignon dominant blend aged 24 months in new French oak, 380k bottle annual production',
  },
  {
    id: 'wv-napa',
    name: 'Robert Mondavi Napa Valley',
    lat: 38.50,
    lng: -122.41,
    status: 'stable',
    value: 1800000,
    cellarBottles: 4200000,
    vintageYear: 2021,
    agingMonths: 18,
    trend: 'stable' as const,
    description: 'Iconic Napa winery established 1966, 1.8M cases annual production across Cabernet, Chardonnay and Fume Blanc varieties',
  },
  {
    id: 'wv-tuscany',
    name: 'Antinori Chianti Classico',
    lat: 43.46,
    lng: 11.23,
    status: 'moderate',
    value: 920000,
    cellarBottles: 2800000,
    vintageYear: 2020,
    agingMonths: 24,
    trend: 'down' as const,
    description: '26 generations of Tuscan winemaking since 1385, Sangiovese based Super Tuscans aged in underground cellars carved from hillside',
  },
  {
    id: 'wv-barossa',
    name: 'Penfolds Barossa Valley',
    lat: -34.55,
    lng: 138.97,
    status: 'warning',
    value: 1450000,
    cellarBottles: 3100000,
    vintageYear: 2018,
    agingMonths: 20,
    trend: 'down' as const,
    description: 'South Australian Shiraz producer of Grange, climate change impacting 2024 vintage with heat spikes causing earlier harvests',
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

export function WineryVineyardCellarMonitor() {
  const state = useMapStore((s) => s.wineryVineyardCellar)
  const setState = useMapStore((s) => s.setWineryVineyardCellar)

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
    if (filteredData.length === 0) return { totalBottles: '0', avgAging: 0, totalCellar: '0' }
    const totalBottles = filteredData.reduce((s: number, d: any) => s + (d.value as number), 0)
    const avgAging = filteredData.reduce((s: number, d: any) => s + (d.agingMonths as number), 0) / filteredData.length
    const totalCellar = filteredData.reduce((s: number, d: any) => s + (d.cellarBottles as number), 0)
    return {
      totalBottles: (totalBottles / 1000000).toFixed(2) + 'M',
      avgAging,
      totalCellar: (totalCellar / 1000000).toFixed(1) + 'M',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-600 to-red-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127815;</span>
          <h3 className="text-sm font-semibold text-white">Winery & Vineyard Cellar</h3>
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
            <div className="text-slate-400">Annual Bottles</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBottles}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Aging</div>
            <div className="text-sm font-semibold text-white">{metrics.avgAging} mo</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cellar Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCellar}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest Estate</div>
            <div className="text-sm font-semibold text-white">1385</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(2)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} bottles vintage {activeItem.vintageYear}, {activeItem.cellarBottles.toLocaleString()} cellar stock, {activeItem.agingMonths} mo oak aging</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
