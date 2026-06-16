'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'nuc-diablocanyon',
    name: 'Diablo Canyon CA',
    lat: 35.2347,
    lng: -120.8567,
    status: 'stable',
    value: 2200,
    reactorOutputMW: 2200,
    coolantTempC: 298,
    safetyScorePct: 94,
    fuelDays: 540,
    trend: 'stable' as const,
    description: 'Pressurized water reactor running at full capacity with robust containment and extended fuel cycle ahead of planned retirement',
  },
  {
    id: 'nuc-fukushima',
    name: 'Fukushima Japan',
    lat: 37.4214,
    lng: 141.0328,
    status: 'critical',
    value: 0,
    reactorOutputMW: 0,
    coolantTempC: 64,
    safetyScorePct: 32,
    fuelDays: 0,
    trend: 'down' as const,
    description: 'Decommissioning site under emergency management with ongoing coolant challenges and contaminated water storage concerns',
  },
  {
    id: 'nuc-chernobyl',
    name: 'Chernobyl Ukraine',
    lat: 51.2763,
    lng: 30.2219,
    status: 'warning',
    value: 0,
    reactorOutputMW: 0,
    coolantTempC: 58,
    safetyScorePct: 48,
    fuelDays: 0,
    trend: 'stable' as const,
    description: 'Exclusion zone containment shelter monitored continuously with radiation shielding and structural integrity under review',
  },
  {
    id: 'nuc-threemileisland',
    name: 'Three Mile Island PA',
    lat: 40.1533,
    lng: -76.7236,
    status: 'moderate',
    value: 820,
    reactorOutputMW: 820,
    coolantTempC: 286,
    safetyScorePct: 81,
    fuelDays: 410,
    trend: 'up' as const,
    description: 'Unit 1 returning to service under revised safety protocols with stable coolant loop and operational monitoring in place',
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

export function NuclearPowerPlantMonitor() {
  const state = useMapStore((s) => s.nuclearPowerPlant)
  const setState = useMapStore((s) => s.setNuclearPowerPlant)

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
    if (filteredData.length === 0) return { reactorOutputMW: 0, coolantTempC: 0, safetyScorePct: 0, fuelDays: 0 }
    const reactorOutputMW = filteredData.reduce((s: number, d: any) => s + (d.reactorOutputMW as number), 0)
    const coolantTempC = filteredData.reduce((s: number, d: any) => s + (d.coolantTempC as number), 0) / filteredData.length
    const safetyScorePct = filteredData.reduce((s: number, d: any) => s + (d.safetyScorePct as number), 0) / filteredData.length
    const fuelDays = filteredData.reduce((s: number, d: any) => s + (d.fuelDays as number), 0)
    return {
      reactorOutputMW: reactorOutputMW.toLocaleString() + ' MW',
      coolantTempC: coolantTempC.toFixed(0) + ' C',
      safetyScorePct: safetyScorePct.toFixed(0) + ' %',
      fuelDays: fuelDays.toLocaleString() + ' d',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-500 to-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">☢️</span>
          <h3 className="text-sm font-semibold text-white">Nuclear Power Plant Monitor</h3>
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
            <div className="text-slate-400">Reactor Output MW</div>
            <div className="text-sm font-semibold text-white">{metrics.reactorOutputMW}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Coolant Temp C</div>
            <div className="text-sm font-semibold text-white">{metrics.coolantTempC}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Safety Score %</div>
            <div className="text-sm font-semibold text-white">{metrics.safetyScorePct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Fuel Days</div>
            <div className="text-sm font-semibold text-white">{metrics.fuelDays}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} MW reactor output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
