'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fc-ashley',
    name: 'Ashley HomeStore Arcadia WI HQ',
    lat: 44.252,
    lng: -90.504,
    status: 'stable',
    value: 91,
    dailyCustomers: 540,
    monthlySales: 1850,
    avgTicketSize: 2400,
    brandLines: 'Ashley, Signature Design, BenchMade',
    trend: 'up' as const,
    description: 'Ashley HomeStore Arcadia WI headquarters, 540 daily customers with $2,400 avg ticket across Ashley, Signature Design and BenchMade upholstery collections',
  },
  {
    id: 'fc-ikea',
    name: 'IKEA Brooklyn NY',
    lat: 40.672,
    lng: -74.011,
    status: 'stable',
    value: 88,
    dailyCustomers: 1850,
    monthlySales: 4200,
    avgTicketSize: 165,
    brandLines: 'MALM, KALLAX, BILLY, POÄNG',
    trend: 'stable' as const,
    description: 'IKEA Brooklyn flagship, 1,850 daily customers with self-serve flat-pack furniture and Swedish meatballs cafeteria, $165 avg ticket',
  },
  {
    id: 'fc-lazboy',
    name: 'La-Z-Boy Monroe MI',
    lat: 41.916,
    lng: -83.533,
    status: 'moderate',
    value: 73,
    dailyCustomers: 220,
    monthlySales: 680,
    avgTicketSize: 1850,
    brandLines: 'Recliners, ComfortCore, Bauhaus',
    trend: 'stable' as const,
    description: 'La-Z-Boy Monroe MI flagship gallery, 220 daily customers featuring the iconic recliner line and custom ComfortCore upholstery program',
  },
  {
    id: 'fc-ethanallen',
    name: 'Ethan Allen Danbury CT Design Center',
    lat: 41.395,
    lng: -73.454,
    status: 'warning',
    value: 58,
    dailyCustomers: 95,
    monthlySales: 320,
    avgTicketSize: 4200,
    brandLines: 'American Classic, Modern, Elegance',
    trend: 'down' as const,
    description: 'Ethan Allen Danbury CT design center facing softer demand, 95 daily customers with $4,200 avg ticket for premium American-made case goods',
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

export function FurnitureRetailChainMonitor() {
  const state = useMapStore((s) => s.furnitureRetailChain)
  const setState = useMapStore((s) => s.setFurnitureRetailChain)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalSales: 0, avgTicket: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalSales = filteredData.reduce((s: number, d: any) => s + (d.monthlySales as number), 0)
    const avgTicket = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgTicketSize as number), 0) / filteredData.length)
    return { totalCustomers, totalSales, avgTicket }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-orange-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129685;</span>
          <h3 className="text-sm font-semibold text-white">Furniture Retail Chain</h3>
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
            <div className="text-slate-400">Daily Customers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Monthly Sales</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSales.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ticket</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgTicket / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stores</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.brandLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.avgTicketSize / 1000).toFixed(1)}k</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.monthlySales.toLocaleString()} sales/mo
              &nbsp;&middot;&nbsp; ${activeItem.avgTicketSize.toLocaleString()} avg ticket
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
