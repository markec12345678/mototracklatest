'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cpo-anhui',
    name: 'Anhui Conch Plant',
    lat: 31.35,
    lng: 118.31,
    status: 'warning',
    value: 18500,
    dailyOutput: 18500,
    kilnUtilization: 92,
    co2Emissions: 14800,
    energyConsumption: 3.8,
    trend: 'up' as const,
    description: 'Chinas largest cement producer operating 6 precalciner kilns with co-processing of alternative fuels and ongoing carbon capture pilot retrofit',
  },
  {
    id: 'cpo-lafargeholcim',
    name: 'LafargeHolcim Holz',
    lat: 50.92,
    lng: 6.36,
    status: 'stable',
    value: 8200,
    dailyOutput: 8200,
    kilnUtilization: 78,
    co2Emissions: 6560,
    energyConsumption: 3.4,
    trend: 'stable' as const,
    description: 'German Rhineland cement plant with vertical roller mill and 4-stage cyclone preheater producing low-carbon cements using calcined clay blends',
  },
  {
    id: 'cpo-cemex',
    name: 'CEMEX Balcones',
    lat: 29.55,
    lng: -98.45,
    status: 'moderate',
    value: 6800,
    dailyOutput: 6800,
    kilnUtilization: 71,
    co2Emissions: 5440,
    energyConsumption: 4.1,
    trend: 'down' as const,
    description: 'Texas cement plant utilizing petroleum coke and tire-derived fuel with new baghouse filtration meeting EPA NESHAP mercury emission limits',
  },
  {
    id: 'cpo-dangote',
    name: 'Dangote Obajana',
    lat: 7.91,
    lng: 7.1,
    status: 'critical',
    value: 22000,
    dailyOutput: 22000,
    kilnUtilization: 98,
    co2Emissions: 17600,
    energyConsumption: 4.6,
    trend: 'up' as const,
    description: 'Nigerias largest cement complex operating 4 kiln lines at peak output to satisfy West African demand but exceeding local NOx emission thresholds',
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

export function CementPlantOutputMonitor() {
  const state = useMapStore((s) => s.cementPlantOutput)
  const setState = useMapStore((s) => s.setCementPlantOutput)

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
    if (filteredData.length === 0) return { dailyOutput: 0, kilnUtilization: 0, co2Emissions: 0, energyConsumption: 0 }
    const dailyOutput = filteredData.reduce((s: number, d: any) => s + (d.dailyOutput as number), 0)
    const kilnUtilization = filteredData.reduce((s: number, d: any) => s + (d.kilnUtilization as number), 0) / filteredData.length
    const co2Emissions = filteredData.reduce((s: number, d: any) => s + (d.co2Emissions as number), 0)
    const energyConsumption = filteredData.reduce((s: number, d: any) => s + (d.energyConsumption as number), 0) / filteredData.length
    return {
      dailyOutput: (dailyOutput / 1000).toFixed(1) + 'k t/d',
      kilnUtilization: kilnUtilization.toFixed(0) + '%',
      co2Emissions: (co2Emissions / 1000).toFixed(1) + 'k t/d',
      energyConsumption: energyConsumption.toFixed(1) + ' GJ/t',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-zinc-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127959;</span>
          <h3 className="text-sm font-semibold text-white">Cement Plant Output</h3>
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
            <div className="text-slate-400">Total Daily Output</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Kiln Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.kilnUtilization}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">CO2 Emissions</div>
            <div className="text-sm font-semibold text-white">{metrics.co2Emissions}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Energy Consumption</div>
            <div className="text-sm font-semibold text-white">{metrics.energyConsumption}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} tonnes daily output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
