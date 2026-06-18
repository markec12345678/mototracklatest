'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pz-dominos',
    name: 'Dominos Ann Arbor HQ',
    lat: 42.28,
    lng: -83.744,
    status: 'stable',
    value: 91,
    pizzasPerHour: 215,
    deliveryPct: 78,
    avgDeliveryMin: 24,
    trend: 'up' as const,
    description: 'Dominos Pizza headquarters location in Ann Arbor Michigan with 78% delivery mix and AI-powered pizza tracking since 2008',
  },
  {
    id: 'pz-pizzahut',
    name: 'Pizza Hut Wichita HQ',
    lat: 37.689,
    lng: -97.344,
    status: 'moderate',
    value: 76,
    pizzasPerHour: 168,
    deliveryPct: 55,
    avgDeliveryMin: 32,
    trend: 'stable' as const,
    description: 'Pizza Hut founding location in Wichita Kansas serving Original Stuffed Crust and BookIt program alumni since 1958',
  },
  {
    id: 'pz-papajohns',
    name: 'Papa Johns Louisville HQ',
    lat: 38.247,
    lng: -85.762,
    status: 'warning',
    value: 64,
    pizzasPerHour: 132,
    deliveryPct: 72,
    avgDeliveryMin: 38,
    trend: 'down' as const,
    description: 'Papa Johns headquarters store in Louisville Kentucky facing slower delivery times and increased competition from third-party apps',
  },
  {
    id: 'pz-little',
    name: 'Little Caesars Detroit HQ',
    lat: 42.331,
    lng: -83.046,
    status: 'stable',
    value: 88,
    pizzasPerHour: 245,
    deliveryPct: 22,
    avgDeliveryMin: 0,
    trend: 'up' as const,
    description: 'Little Caesars Arena district location in Detroit famous for HOT-N-READY $5 pizzas with 78% carryout and Pizza Portal pickup',
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

export function PizzeriaChainMonitor() {
  const state = useMapStore((s) => s.pizzeriaChain)
  const setState = useMapStore((s) => s.setPizzeriaChain)

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
    if (filteredData.length === 0) return { totalPizzas: 0, avgDelivery: '0%', avgTime: '0m', peakPizzas: 0 }
    const totalPizzas = filteredData.reduce((s: number, d: any) => s + (d.pizzasPerHour as number), 0)
    const avgDelivery = filteredData.reduce((s: number, d: any) => s + (d.deliveryPct as number), 0) / filteredData.length
    const deliveryOnly = filteredData.filter((d: any) => (d.avgDeliveryMin as number) > 0)
    const avgTime = deliveryOnly.length > 0 ? deliveryOnly.reduce((s: number, d: any) => s + (d.avgDeliveryMin as number), 0) / deliveryOnly.length : 0
    const peakPizzas = Math.max(...filteredData.map((d: any) => d.pizzasPerHour as number))
    return {
      totalPizzas,
      avgDelivery: avgDelivery.toFixed(0) + '%',
      avgTime: avgTime.toFixed(0) + 'm',
      peakPizzas,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-700 to-amber-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127829;</span>
          <h3 className="text-sm font-semibold text-white">Pizzeria Chain</h3>
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
            <div className="text-slate-400">Pizzas / hr</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPizzas}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Delivery</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDelivery}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Delivery Time</div>
            <div className="text-sm font-semibold text-white">{metrics.avgTime}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Peak Location</div>
            <div className="text-sm font-semibold text-white">{metrics.peakPizzas}/hr</div>
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
                <span className="text-xs text-slate-300">{loc.pizzasPerHour}/hr</span>
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
              <span className="text-slate-300 font-medium">{activeItem.pizzasPerHour} pizzas/hr, {activeItem.deliveryPct}% delivery, {activeItem.avgDeliveryMin > 0 ? activeItem.avgDeliveryMin + 'm avg' : 'carryout focus'}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
