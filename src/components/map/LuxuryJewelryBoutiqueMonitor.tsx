'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'lj-tiffany',
    name: 'Tiffany & Co. Fifth Avenue NYC Flagship',
    lat: 40.763,
    lng: -73.974,
    status: 'stable',
    value: 95,
    dailyVisitors: 420,
    avgTransaction: 12500,
    inventoryValue: 85000000,
    designerLines: 'Tiffany Setting, HardWear, T1',
    trend: 'up' as const,
    description: 'Tiffany & Co. landmark Fifth Avenue flagship with $85M inventory, exclusive HardWear by Tiffany and Blue Book high jewelry collection',
  },
  {
    id: 'lj-cartier',
    name: 'Cartier Fifth Avenue Mansion NYC',
    lat: 40.758,
    lng: -73.975,
    status: 'stable',
    value: 93,
    dailyVisitors: 310,
    avgTransaction: 18000,
    inventoryValue: 92000000,
    designerLines: 'Love, Trinity, Panthère, Tank',
    trend: 'up' as const,
    description: 'Cartier Fifth Avenue Mansion with $92M inventory, iconic Love bracelet, Trinity ring and Panthère high jewelry collection',
  },
  {
    id: 'lj-harrywinston',
    name: 'Harry Winston Beverly Hills',
    lat: 34.067,
    lng: -118.401,
    status: 'moderate',
    value: 78,
    dailyVisitors: 95,
    avgTransaction: 45000,
    inventoryValue: 120000000,
    designerLines: 'Cluster, Avenue, Premier',
    trend: 'stable' as const,
    description: 'Harry Winston Beverly Hills salon with $120M inventory, legendary Cluster diamond settings and red carpet loan program',
  },
  {
    id: 'lj-vancleef',
    name: 'Van Cleef & Arpels Madison Avenue NYC',
    lat: 40.766,
    lng: -73.967,
    status: 'warning',
    value: 62,
    dailyVisitors: 140,
    avgTransaction: 22000,
    inventoryValue: 64000000,
    designerLines: 'Alhambra, Perlée, Frivole',
    trend: 'down' as const,
    description: 'Van Cleef & Arpels Madison Avenue facing softer demand post-Q1, $64M inventory with signature Alhambra and high jewelry pieces',
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

export function LuxuryJewelryBoutiqueMonitor() {
  const state = useMapStore((s) => s.luxuryJewelryBoutique)
  const setState = useMapStore((s) => s.setLuxuryJewelryBoutique)

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
    if (filteredData.length === 0) return { totalVisitors: 0, totalInventory: 0, avgTransaction: 0 }
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const totalInventory = filteredData.reduce((s: number, d: any) => s + (d.inventoryValue as number), 0)
    const avgTransaction = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgTransaction as number), 0) / filteredData.length)
    return { totalVisitors, totalInventory, avgTransaction }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-400 to-yellow-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128142;</span>
          <h3 className="text-sm font-semibold text-white">Luxury Jewelry Boutique</h3>
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
            <div className="text-slate-400">Avg Transaction</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgTransaction / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Inventory</div>
            <div className="text-sm font-semibold text-white">${(metrics.totalInventory / 1000000).toFixed(0)}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Boutiques</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.designerLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.avgTransaction / 1000).toFixed(0)}k</span>
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
              ${(activeItem.inventoryValue / 1000000).toFixed(0)}M inventory &middot; {activeItem.dailyVisitors} visitors/day
              &nbsp;&middot;&nbsp; ${activeItem.avgTransaction.toLocaleString()} avg ticket
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
