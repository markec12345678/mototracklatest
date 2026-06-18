'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'hydro-threegorges',
    name: 'Three Gorges China',
    lat: 30.823,
    lng: 111.003,
    status: 'stable',
    value: 22500,
    outputMW: 22500,
    waterLevelM: 175,
    flowM3s: 32000,
    turbinesActive: 32,
    trend: 'up' as const,
    description: 'Worlds largest hydroelectric facility operating at full reservoir level with all turbines generating near nameplate',
  },
  {
    id: 'hydro-hoover',
    name: 'Hoover Dam NV',
    lat: 36.016,
    lng: -114.737,
    status: 'warning',
    value: 1300,
    outputMW: 1300,
    waterLevelM: 319,
    flowM3s: 460,
    turbinesActive: 13,
    trend: 'down' as const,
    description: 'Lake Mead at historically low levels reducing hydraulic head and constraining generation output across the turbine array',
  },
  {
    id: 'hydro-itaipu',
    name: 'Itaipu Brazil',
    lat: -25.405,
    lng: -54.588,
    status: 'moderate',
    value: 14200,
    outputMW: 14200,
    waterLevelM: 215,
    flowM3s: 12400,
    turbinesActive: 18,
    trend: 'stable' as const,
    description: 'Binational Paraná facility running at moderate capacity with seasonal flow management and routine turbine maintenance cycle',
  },
  {
    id: 'hydro-grandcoulee',
    name: 'Grand Coulee WA',
    lat: 47.965,
    lng: -119.046,
    status: 'stable',
    value: 6800,
    outputMW: 6800,
    waterLevelM: 395,
    flowM3s: 3100,
    turbinesActive: 27,
    trend: 'stable' as const,
    description: 'Columbia River complex running optimally with strong snowmelt inflows and balanced discharge across the pump generators',
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

export function HydroelectricDamMonitor() {
  const state = useMapStore((s) => s.hydroelectricDam)
  const setState = useMapStore((s) => s.setHydroelectricDam)

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
    if (filteredData.length === 0) return { outputMW: 0, waterLevelM: 0, flowM3s: 0, turbinesActive: 0 }
    const outputMW = filteredData.reduce((s: number, d: any) => s + (d.outputMW as number), 0)
    const waterLevelM = filteredData.reduce((s: number, d: any) => s + (d.waterLevelM as number), 0) / filteredData.length
    const flowM3s = filteredData.reduce((s: number, d: any) => s + (d.flowM3s as number), 0)
    const turbinesActive = filteredData.reduce((s: number, d: any) => s + (d.turbinesActive as number), 0)
    return {
      outputMW: outputMW.toLocaleString() + ' MW',
      waterLevelM: waterLevelM.toFixed(0) + ' m',
      flowM3s: flowM3s.toLocaleString() + ' m3/s',
      turbinesActive: turbinesActive.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌊</span>
          <h3 className="text-sm font-semibold text-white">Hydroelectric Dam Monitor</h3>
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
            <div className="text-slate-400">Water Level m</div>
            <div className="text-sm font-semibold text-white">{metrics.waterLevelM}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Flow m3/s</div>
            <div className="text-sm font-semibold text-white">{metrics.flowM3s}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Turbines Active</div>
            <div className="text-sm font-semibold text-white">{metrics.turbinesActive}</div>
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
