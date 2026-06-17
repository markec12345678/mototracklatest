'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pn-logee',
    name: "Logee's Greenhouse Danielson CT",
    lat: 41.793,
    lng: -71.880,
    status: 'stable',
    value: 88,
    plantsInStock: 1200,
    dailyCustomers: 95,
    rareSpecies: 420,
    specialtyPlants: 'Rare Tropicals, Begonias, Citrus, Carnivorous',
    trend: 'up' as const,
    description: "Logee's Greenhouse Danielson CT founded 1892, 1,200 plant SKUs including 420 rare tropical species shipped nationwide to collectors",
  },
  {
    id: 'pn-brentbeckys',
    name: 'Brent and Becky\'s Bulbs Gloucester VA',
    lat: 37.312,
    lng: -76.523,
    status: 'stable',
    value: 84,
    plantsInStock: 850,
    dailyCustomers: 72,
    rareSpecies: 180,
    specialtyPlants: 'Tulips, Daffodils, Hyacinths, Unusual Bulbs',
    trend: 'stable' as const,
    description: "Brent and Becky's Bulbs Gloucester VA, 850 bulb and plant SKUs with 180 rare and heritage varieties, fourth-generation family farm",
  },
  {
    id: 'pn-steve',
    name: "Steve's Leaves Crystal Lake IL",
    lat: 42.241,
    lng: -88.316,
    status: 'moderate',
    value: 73,
    plantsInStock: 680,
    dailyCustomers: 58,
    rareSpecies: 290,
    specialtyPlants: 'Aroids, Philodendron, Monstera, Hoya',
    trend: 'up' as const,
    description: "Steve's Leaves Crystal Lake IL specialty aroid grower, 680 SKUs with 290 rare variegated Philodendron, Monstera and Hoya cultivars",
  },
  {
    id: 'pn-plantproper',
    name: 'Plant Proper St Petersburg FL',
    lat: 27.761,
    lng: -82.643,
    status: 'warning',
    value: 59,
    plantsInStock: 540,
    dailyCustomers: 44,
    rareSpecies: 215,
    specialtyPlants: 'Tropicals, Rare Aroids, Bromeliads, Ferns',
    trend: 'down' as const,
    description: 'Plant Proper St Petersburg FL small-batch rare tropical grower, 540 SKUs facing softer collector demand with 215 rare aroid species',
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

export function PlantNurseryRetailMonitor() {
  const state = useMapStore((s) => s.plantNurseryRetail)
  const setState = useMapStore((s) => s.setPlantNurseryRetail)

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
    if (filteredData.length === 0) return { totalPlants: 0, totalCustomers: 0, totalRare: 0 }
    const totalPlants = filteredData.reduce((s: number, d: any) => s + (d.plantsInStock as number), 0)
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalRare = filteredData.reduce((s: number, d: any) => s + (d.rareSpecies as number), 0)
    return { totalPlants, totalCustomers, totalRare }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-cyan-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127811;</span>
          <h3 className="text-sm font-semibold text-white">Plant Nursery Retail</h3>
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
            <div className="text-slate-400">Plants In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPlants.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Customers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Rare Species</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRare}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Nurseries</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.specialtyPlants}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.rareSpecies} rare</span>
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
              {activeItem.plantsInStock.toLocaleString()} plants &middot; {activeItem.dailyCustomers} customers/day
              &nbsp;&middot;&nbsp; {activeItem.rareSpecies} rare species
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
