'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'afd-jfk',
    name: 'JFK Fuel Farm',
    lat: 40.64,
    lng: -73.78,
    status: 'warning',
    value: 18500,
    storageCapacity: 18500,
    currentInventory: 14200,
    dailyThroughput: 3200,
    trucksDispatched: 28,
    trend: 'up' as const,
    description: 'John F Kennedy International Jet-A fuel storage hydrant system under high demand with Transatlantic departure bank drawing 76% of usable inventory',
  },
  {
    id: 'afd-lax',
    name: 'LAX Fuel Depot',
    lat: 33.94,
    lng: -118.41,
    status: 'stable',
    value: 24000,
    storageCapacity: 24000,
    currentInventory: 19800,
    dailyThroughput: 4100,
    trucksDispatched: 35,
    trend: 'stable' as const,
    description: 'Los Angeles International consolidated fuel facility maintaining healthy reserves supporting transpacific long-haul departures',
  },
  {
    id: 'afd-dfw',
    name: 'DFW Fuel Center',
    lat: 32.9,
    lng: -97.04,
    status: 'critical',
    value: 21000,
    storageCapacity: 21000,
    currentInventory: 8400,
    dailyThroughput: 4800,
    trucksDispatched: 42,
    trend: 'down' as const,
    description: 'Dallas-Fort Worth mega-hub fuel depot critically low after pipeline supply interruption forcing rationing and emergency tanker truck resupply convoys',
  },
  {
    id: 'afd-atl',
    name: 'ATL Fuel Hydrant',
    lat: 33.64,
    lng: -84.43,
    status: 'moderate',
    value: 16500,
    storageCapacity: 16500,
    currentInventory: 11200,
    dailyThroughput: 3650,
    trucksDispatched: 31,
    trend: 'stable' as const,
    description: 'Hartsfield-Jackson Atlanta hydrant system replenished by Colonial Pipeline feeding worlds busiest airport with consistent turnaround for Delta hub operations',
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

export function AviationFuelDepotMonitor() {
  const state = useMapStore((s) => s.aviationFuelDepot)
  const setState = useMapStore((s) => s.setAviationFuelDepot)

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
    if (filteredData.length === 0) return { storageCapacity: 0, currentInventory: 0, dailyThroughput: 0, trucksDispatched: 0 }
    const storageCapacity = filteredData.reduce((s: number, d: any) => s + (d.storageCapacity as number), 0)
    const currentInventory = filteredData.reduce((s: number, d: any) => s + (d.currentInventory as number), 0)
    const dailyThroughput = filteredData.reduce((s: number, d: any) => s + (d.dailyThroughput as number), 0)
    const trucksDispatched = filteredData.reduce((s: number, d: any) => s + (d.trucksDispatched as number), 0)
    return {
      storageCapacity: (storageCapacity / 1000).toFixed(1) + 'k t',
      currentInventory: (currentInventory / 1000).toFixed(1) + 'k t',
      dailyThroughput: (dailyThroughput / 1000).toFixed(1) + 'k t/d',
      trucksDispatched: trucksDispatched.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-red-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9981;</span>
          <h3 className="text-sm font-semibold text-white">Aviation Fuel Depot</h3>
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
            <div className="text-slate-400">Total Capacity</div>
            <div className="text-sm font-semibold text-white">{metrics.storageCapacity}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Current Inventory</div>
            <div className="text-sm font-semibold text-white">{metrics.currentInventory}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Throughput</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyThroughput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Trucks Dispatched</div>
            <div className="text-sm font-semibold text-white">{metrics.trucksDispatched}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} tonnes storage capacity</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
