'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'heat-helsinki',
    name: 'Helsinki',
    lat: 60.1699,
    lng: 24.9384,
    status: 'stable',
    value: 1820,
    outputMW: 1820,
    supplyTempC: 115,
    networkKm: 1300,
    customers: 560000,
    trend: 'up' as const,
    description: 'Finnish capital district heating grid operating at optimal supply temperature with full winter load coverage',
  },
  {
    id: 'heat-copenhagen',
    name: 'Copenhagen',
    lat: 55.6761,
    lng: 12.5683,
    status: 'moderate',
    value: 1450,
    outputMW: 1450,
    supplyTempC: 102,
    networkKm: 1550,
    customers: 480000,
    trend: 'stable' as const,
    description: 'Danish capital network running at moderate load with balanced supply across the integrated district heating loop',
  },
  {
    id: 'heat-reykjavik',
    name: 'Reykjavik',
    lat: 64.1466,
    lng: -21.9426,
    status: 'stable',
    value: 980,
    outputMW: 980,
    supplyTempC: 98,
    networkKm: 870,
    customers: 210000,
    trend: 'down' as const,
    description: 'Geothermal powered district heating supplying the city with steady output and decreasing seasonal demand profile',
  },
  {
    id: 'heat-moscow',
    name: 'Moscow',
    lat: 55.7558,
    lng: 37.6173,
    status: 'critical',
    value: 0,
    outputMW: 0,
    supplyTempC: 41,
    networkKm: 4200,
    customers: 1240000,
    trend: 'down' as const,
    description: 'Capital heating network outage following distribution failure with restored supply temperatures critically low',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function DistrictHeatingPlantMonitor() {
  const state = useMapStore((s) => s.districtHeatingPlant)
  const setState = useMapStore((s) => s.setDistrictHeatingPlant)

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
    if (filteredData.length === 0) return { outputMW: 0, supplyTempC: 0, networkKm: 0, customers: 0 }
    const outputMW = filteredData.reduce((s: number, d: any) => s + (d.outputMW as number), 0)
    const supplyTempC = filteredData.reduce((s: number, d: any) => s + (d.supplyTempC as number), 0) / filteredData.length
    const networkKm = filteredData.reduce((s: number, d: any) => s + (d.networkKm as number), 0)
    const customers = filteredData.reduce((s: number, d: any) => s + (d.customers as number), 0)
    return {
      outputMW: outputMW.toLocaleString() + ' MW',
      supplyTempC: supplyTempC.toFixed(0) + ' C',
      networkKm: networkKm.toLocaleString() + ' km',
      customers: customers.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌡️</span>
          <h3 className="text-sm font-semibold text-white">District Heating Plant Monitor</h3>
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
            <div className="text-slate-400">Output MW</div>
            <div className="text-sm font-semibold text-white">{metrics.outputMW}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Supply Temp C</div>
            <div className="text-sm font-semibold text-white">{metrics.supplyTempC}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Network km</div>
            <div className="text-sm font-semibold text-white">{metrics.networkKm}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Customers</div>
            <div className="text-sm font-semibold text-white">{metrics.customers}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} MW output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
