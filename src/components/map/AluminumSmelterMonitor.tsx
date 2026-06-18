'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'as-riotinto',
    name: 'Rio Tinto Saguenay',
    lat: 48.43,
    lng: -71.07,
    status: 'stable',
    value: 380,
    moltenAluminum: 380,
    energyPerKg: 13.2,
    potlinesActive: 4,
    capacityUse: 94,
    trend: 'up' as const,
    description: 'Hydro-powered Quebec smelter complex running AP60 next-generation cells at industry-leading energy efficiency for low-carbon aluminum',
  },
  {
    id: 'as-hydro',
    name: 'Norsk Hydro Karmoy',
    lat: 59.28,
    lng: 5.23,
    status: 'moderate',
    value: 270,
    moltenAluminum: 270,
    energyPerKg: 14.8,
    potlinesActive: 3,
    capacityUse: 86,
    trend: 'stable' as const,
    description: 'Norwegian west-coast smelter piloting HAL4e Ultra cells targeting 12 kWh/kg while supplying low-carbon aluminum to European EV makers',
  },
  {
    id: 'as-rusal',
    name: 'Rusal Bratsk',
    lat: 56.15,
    lng: 101.61,
    status: 'warning',
    value: 920,
    moltenAluminum: 920,
    energyPerKg: 15.4,
    potlinesActive: 6,
    capacityUse: 71,
    trend: 'down' as const,
    description: 'Siberian mega-smelter drawing hydropower from Bratsk Dam but running below capacity due to sanctions, alumina supply disruption, and EU export curbs',
  },
  {
    id: 'as-alcoa',
    name: 'Alcoa Wagerup',
    lat: -32.96,
    lng: 115.92,
    status: 'critical',
    value: 220,
    moltenAluminum: 220,
    energyPerKg: 16.1,
    potlinesActive: 2,
    capacityUse: 64,
    trend: 'down' as const,
    description: 'Western Australian refinery-smelter complex under environmental review with potline idling to manage bauxite residue and gas-power cost spikes',
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

export function AluminumSmelterMonitor() {
  const state = useMapStore((s) => s.aluminumSmelter)
  const setState = useMapStore((s) => s.setAluminumSmelter)

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
    if (filteredData.length === 0) return { moltenAluminum: 0, energyPerKg: 0, potlinesActive: 0, capacityUse: 0 }
    const moltenAluminum = filteredData.reduce((s: number, d: any) => s + (d.moltenAluminum as number), 0)
    const energyPerKg = filteredData.reduce((s: number, d: any) => s + (d.energyPerKg as number), 0) / filteredData.length
    const potlinesActive = filteredData.reduce((s: number, d: any) => s + (d.potlinesActive as number), 0)
    const capacityUse = filteredData.reduce((s: number, d: any) => s + (d.capacityUse as number), 0) / filteredData.length
    return {
      moltenAluminum: moltenAluminum.toLocaleString() + ' kt/y',
      energyPerKg: energyPerKg.toFixed(1) + ' kWh',
      potlinesActive: potlinesActive.toLocaleString(),
      capacityUse: capacityUse.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-600 to-cyan-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9889;</span>
          <h3 className="text-sm font-semibold text-white">Aluminum Smelter</h3>
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
            <div className="text-slate-400">Molten Output</div>
            <div className="text-sm font-semibold text-white">{metrics.moltenAluminum}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Energy / kg</div>
            <div className="text-sm font-semibold text-white">{metrics.energyPerKg}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Active Potlines</div>
            <div className="text-sm font-semibold text-white">{metrics.potlinesActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Capacity Use</div>
            <div className="text-sm font-semibold text-white">{metrics.capacityUse}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()} kt</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} kt/year molten aluminum</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
