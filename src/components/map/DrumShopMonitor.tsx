'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ds-drumsmith',
    name: 'Drumsmith Nashville TN',
    lat: 36.162,
    lng: -86.781,
    status: 'stable',
    value: 87,
    dailyCustomers: 42,
    kitsInStock: 180,
    avgTicket: 1450,
    brandLines: 'Ludwig, Pearl, Tama, DW',
    trend: 'up' as const,
    description: 'Drumsmith Nashville TN, 42 daily customers with 180 kits — flagship Ludwig, Pearl, Tama and DW dealer serving country studio scene',
  },
  {
    id: 'ds-drumcenter',
    name: 'Drum Center of Portsmouth NH',
    lat: 43.072,
    lng: -70.763,
    status: 'stable',
    value: 84,
    dailyCustomers: 38,
    kitsInStock: 240,
    avgTicket: 1680,
    brandLines: 'Sonor, Yamaha, Craviotto, C&C',
    trend: 'stable' as const,
    description: 'Drum Center of Portsmouth NH, 38 daily customers with 240 kits — known for Sonor and Craviotto custom shop drums',
  },
  {
    id: 'ds-drumworld',
    name: 'Drum World Pittsburgh PA',
    lat: 40.440,
    lng: -79.996,
    status: 'moderate',
    value: 73,
    dailyCustomers: 28,
    kitsInStock: 145,
    avgTicket: 1180,
    brandLines: 'Mapex, PDP, Gretsch, Zildjian',
    trend: 'stable' as const,
    description: 'Drum World Pittsburgh PA, 28 daily customers with 145 kits — serving Western PA school and rock band market',
  },
  {
    id: 'ds-maxwells',
    name: "Maxwell's House of Drums Austin TX",
    lat: 30.267,
    lng: -97.743,
    status: 'warning',
    value: 58,
    dailyCustomers: 18,
    kitsInStock: 92,
    avgTicket: 850,
    brandLines: 'PDP, Mapex entry, Sound Percussion',
    trend: 'down' as const,
    description: "Maxwell's House of Drums Austin TX, 18 daily customers with 92 kits — entry-level positioning facing online competition",
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

export function DrumShopMonitor() {
  const state = useMapStore((s) => s.drumShop)
  const setState = useMapStore((s) => s.setDrumShop)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalKits: 0, avgTicket: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalKits = filteredData.reduce((s: number, d: any) => s + (d.kitsInStock as number), 0)
    const avgTicket = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgTicket as number), 0) / filteredData.length)
    return { totalCustomers, totalKits, avgTicket }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-600 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129688;</span>
          <h3 className="text-sm font-semibold text-white">Drum Shop</h3>
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
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Kits In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalKits}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ticket</div>
            <div className="text-sm font-semibold text-white">${metrics.avgTicket}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Shops</div>
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
                <span className="text-xs text-slate-300">{loc.kitsInStock}</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.kitsInStock} kits in stock
              &nbsp;&middot;&nbsp; ${activeItem.avgTicket.toLocaleString()} avg ticket
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
