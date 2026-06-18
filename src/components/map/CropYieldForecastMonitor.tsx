'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'crop-iowa',
    name: 'Iowa Corn Belt',
    lat: 41.878,
    lng: -93.0977,
    status: 'critical',
    value: 7.2,
    yieldTonsPerHa: 7.2,
    acresPlanted: 13500000,
    harvestReadyPct: 32,
    moisturePct: 28,
    trend: 'down' as const,
    description: 'Drought-stressed corn with collapsing yields across central Iowa; harvest delayed by high grain moisture',
  },
  {
    id: 'crop-punjab',
    name: 'Punjab India',
    lat: 30.7333,
    lng: 76.7794,
    status: 'warning',
    value: 4.1,
    yieldTonsPerHa: 4.1,
    acresPlanted: 7400000,
    harvestReadyPct: 58,
    moisturePct: 14,
    trend: 'down' as const,
    description: 'Wheat yield down 12% from heat stress during grain fill; monsoon recovery helping late harvest',
  },
  {
    id: 'crop-pampas',
    name: 'Pampas Argentina',
    lat: -34.6037,
    lng: -58.3816,
    status: 'moderate',
    value: 6.8,
    yieldTonsPerHa: 6.8,
    acresPlanted: 5200000,
    harvestReadyPct: 71,
    moisturePct: 13,
    trend: 'stable' as const,
    description: 'Soybean and corn pacing near five-year averages with favorable soil moisture across the belt',
  },
  {
    id: 'crop-ukraine',
    name: 'Ukraine Plains',
    lat: 49.0,
    lng: 32.0,
    status: 'stable',
    value: 8.4,
    yieldTonsPerHa: 8.4,
    acresPlanted: 9100000,
    harvestReadyPct: 84,
    moisturePct: 12,
    trend: 'up' as const,
    description: 'Bumper wheat harvest underway with record yields reported and rapid combine progress',
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

export function CropYieldForecastMonitor() {
  const state = useMapStore((s) => s.cropYieldForecast)
  const setState = useMapStore((s) => s.setCropYieldForecast)

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
    if (filteredData.length === 0) return { yieldTonsPerHa: 0, acresPlanted: 0, harvestReadyPct: 0, moisturePct: 0 }
    const yieldTonsPerHa = filteredData.reduce((s: number, d: any) => s + (d.yieldTonsPerHa as number), 0) / filteredData.length
    const acresPlanted = filteredData.reduce((s: number, d: any) => s + (d.acresPlanted as number), 0)
    const harvestReadyPct = filteredData.reduce((s: number, d: any) => s + (d.harvestReadyPct as number), 0) / filteredData.length
    const moisturePct = filteredData.reduce((s: number, d: any) => s + (d.moisturePct as number), 0) / filteredData.length
    return {
      yieldTonsPerHa: yieldTonsPerHa.toFixed(2) + ' t/ha',
      acresPlanted: acresPlanted.toLocaleString(),
      harvestReadyPct: harvestReadyPct.toFixed(0) + '%',
      moisturePct: moisturePct.toFixed(1) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-yellow-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌾</span>
          <h3 className="text-sm font-semibold text-white">Crop Yield Forecast Monitor</h3>
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
            <div className="text-slate-400">Yield Tons/ha</div>
            <div className="text-sm font-semibold text-white">{metrics.yieldTonsPerHa}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Acres Planted</div>
            <div className="text-sm font-semibold text-white">{metrics.acresPlanted}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Harvest Ready %</div>
            <div className="text-sm font-semibold text-white">{metrics.harvestReadyPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Moisture %</div>
            <div className="text-sm font-semibold text-white">{metrics.moisturePct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} tons/ha forecast</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
