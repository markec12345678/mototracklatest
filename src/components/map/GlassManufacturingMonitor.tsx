'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gm-corning',
    name: 'Corning Harrodsburg',
    lat: 37.76,
    lng: -84.32,
    status: 'stable',
    value: 1800,
    furnaceOutput: 1800,
    culletRecycle: 32,
    energyPerTon: 8.4,
    trend: 'up' as const,
    description: 'Kentucky flagship producing Gorilla Glass and Lotus glass for smartphone and display cover with proprietary fusion-draw process',
  },
  {
    id: 'gm-agc',
    name: 'AGC Takasago',
    lat: 34.75,
    lng: 134.81,
    status: 'moderate',
    value: 2400,
    furnaceOutput: 2400,
    culletRecycle: 26,
    energyPerTon: 9.1,
    trend: 'stable' as const,
    description: 'Japanese float-glass and electronics glass plant supplying automotive glazing and semiconductor substrate glass to Asian market',
  },
  {
    id: 'gm-saint',
    name: 'Saint-Gobain Aniche',
    lat: 50.33,
    lng: 3.25,
    status: 'warning',
    value: 1200,
    furnaceOutput: 1200,
    culletRecycle: 38,
    energyPerTon: 8.9,
    trend: 'down' as const,
    description: 'Northern France flat glass plant running hybrid oxy-fuel furnace but throttled by weak European construction demand and high gas costs',
  },
  {
    id: 'gm-nsg',
    name: 'NSG Galleria Tsu',
    lat: 34.72,
    lng: 136.51,
    status: 'critical',
    value: 900,
    furnaceOutput: 900,
    culletRecycle: 22,
    energyPerTon: 10.2,
    trend: 'down' as const,
    description: 'Mie Prefecture specialty glass site for photovoltaic cover and TCO-coated substrates, idling one furnace after thin-film solar order collapse',
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

export function GlassManufacturingMonitor() {
  const state = useMapStore((s) => s.glassManufacturing)
  const setState = useMapStore((s) => s.setGlassManufacturing)

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
    if (filteredData.length === 0) return { furnaceOutput: 0, culletRecycle: 0, energyPerTon: 0 }
    const furnaceOutput = filteredData.reduce((s: number, d: any) => s + (d.furnaceOutput as number), 0)
    const culletRecycle = filteredData.reduce((s: number, d: any) => s + (d.culletRecycle as number), 0) / filteredData.length
    const energyPerTon = filteredData.reduce((s: number, d: any) => s + (d.energyPerTon as number), 0) / filteredData.length
    return {
      furnaceOutput: furnaceOutput.toLocaleString() + ' t/d',
      culletRecycle: culletRecycle.toFixed(0) + '%',
      energyPerTon: energyPerTon.toFixed(1) + ' GJ',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-500 to-cyan-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#10024;</span>
          <h3 className="text-sm font-semibold text-white">Glass Manufacturing</h3>
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
            <div className="text-slate-400">Furnace Output</div>
            <div className="text-sm font-semibold text-white">{metrics.furnaceOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Cullet Recycle</div>
            <div className="text-sm font-semibold text-white">{metrics.culletRecycle}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Energy / t</div>
            <div className="text-sm font-semibold text-white">{metrics.energyPerTon}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Yield</div>
            <div className="text-sm font-semibold text-white">87%</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()} t/d</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} t/day furnace pull</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
