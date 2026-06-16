'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'coal-belchatow',
    name: 'Belchatow Poland',
    lat: 51.265,
    lng: 19.325,
    status: 'warning',
    value: 5300,
    outputMW: 5300,
    coalStockT: 82000,
    emissionsKgMwh: 980,
    efficiencyPct: 37,
    trend: 'up' as const,
    description: 'Largest European coal plant running near capacity with rising emissions output and stockpile rotation needed soon',
  },
  {
    id: 'coal-datong',
    name: 'Datong China',
    lat: 40.0764,
    lng: 113.3,
    status: 'moderate',
    value: 3600,
    outputMW: 3600,
    coalStockT: 156000,
    emissionsKgMwh: 880,
    efficiencyPct: 41,
    trend: 'stable' as const,
    description: 'Shanxi mining hub operating with ample coal reserves and standard particulate controls across the generating units',
  },
  {
    id: 'coal-mundra',
    name: 'Mundra India',
    lat: 22.83,
    lng: 69.52,
    status: 'stable',
    value: 4150,
    outputMW: 4150,
    coalStockT: 198000,
    emissionsKgMwh: 820,
    efficiencyPct: 44,
    trend: 'down' as const,
    description: 'Coastal thermal station performing optimally with imported coal supply secure and emissions trending lower',
  },
  {
    id: 'coal-kendal',
    name: 'Kendal SA',
    lat: -26.1,
    lng: 29.4,
    status: 'critical',
    value: 1200,
    outputMW: 1200,
    coalStockT: 18500,
    emissionsKgMwh: 1120,
    efficiencyPct: 33,
    trend: 'down' as const,
    description: 'South African station with depleted coal stockpiles and derated output as supply chain disruptions persist',
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

export function CoalPowerStationMonitor() {
  const state = useMapStore((s) => s.coalPowerStation)
  const setState = useMapStore((s) => s.setCoalPowerStation)

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
    if (filteredData.length === 0) return { outputMW: 0, coalStockT: 0, emissionsKgMwh: 0, efficiencyPct: 0 }
    const outputMW = filteredData.reduce((s: number, d: any) => s + (d.outputMW as number), 0)
    const coalStockT = filteredData.reduce((s: number, d: any) => s + (d.coalStockT as number), 0)
    const emissionsKgMwh = filteredData.reduce((s: number, d: any) => s + (d.emissionsKgMwh as number), 0) / filteredData.length
    const efficiencyPct = filteredData.reduce((s: number, d: any) => s + (d.efficiencyPct as number), 0) / filteredData.length
    return {
      outputMW: outputMW.toLocaleString() + ' MW',
      coalStockT: coalStockT.toLocaleString() + ' T',
      emissionsKgMwh: emissionsKgMwh.toFixed(0) + ' kg/MWh',
      efficiencyPct: efficiencyPct.toFixed(0) + ' %',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏭</span>
          <h3 className="text-sm font-semibold text-white">Coal Power Station Monitor</h3>
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
            <div className="text-slate-400">Coal Stock T</div>
            <div className="text-sm font-semibold text-white">{metrics.coalStockT}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Emissions kg/MWh</div>
            <div className="text-sm font-semibold text-white">{metrics.emissionsKgMwh}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Efficiency %</div>
            <div className="text-sm font-semibold text-white">{metrics.efficiencyPct}</div>
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
