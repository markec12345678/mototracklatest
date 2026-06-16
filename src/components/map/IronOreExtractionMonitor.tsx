'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'iron-pilbara',
    name: 'Pilbara AU',
    lat: -21.5,
    lng: 117.5,
    status: 'critical',
    value: 580,
    outputKtDay: 580,
    feContentPct: 58.2,
    railCars: 420,
    stockpileT: 185000,
    trend: 'down' as const,
    description: 'Port stockpiles critically low as cyclone disruption and rail bottleneck reduce export loadout capacity',
  },
  {
    id: 'iron-carajas',
    name: 'Carajas Brazil',
    lat: -6.0667,
    lng: -50.25,
    status: 'warning',
    value: 720,
    outputKtDay: 720,
    feContentPct: 64.8,
    railCars: 510,
    stockpileT: 320000,
    trend: 'down' as const,
    description: 'High-grade ore output easing as wet season impacts haul road conditions and shovel availability',
  },
  {
    id: 'iron-kiruna',
    name: 'Kiruna Sweden',
    lat: 67.85,
    lng: 20.2,
    status: 'moderate',
    value: 380,
    outputKtDay: 380,
    feContentPct: 67.5,
    railCars: 280,
    stockpileT: 410000,
    trend: 'stable' as const,
    description: 'Underground block cave operating at planned rates with consistent magnetite feed to the processing plant',
  },
  {
    id: 'iron-tomprice',
    name: 'Mount Tom Price AU',
    lat: -22.7,
    lng: 117.8,
    status: 'stable',
    value: 810,
    outputKtDay: 810,
    feContentPct: 62.4,
    railCars: 620,
    stockpileT: 540000,
    trend: 'up' as const,
    description: 'Mining and rail logistics running optimally with strong product quality and balanced port inventory',
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

export function IronOreExtractionMonitor() {
  const state = useMapStore((s) => s.ironOreExtraction)
  const setState = useMapStore((s) => s.setIronOreExtraction)

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
    if (filteredData.length === 0) return { outputKtDay: 0, feContentPct: 0, railCars: 0, stockpileT: 0 }
    const outputKtDay = filteredData.reduce((s: number, d: any) => s + (d.outputKtDay as number), 0)
    const feContentPct = filteredData.reduce((s: number, d: any) => s + (d.feContentPct as number), 0) / filteredData.length
    const railCars = filteredData.reduce((s: number, d: any) => s + (d.railCars as number), 0)
    const stockpileT = filteredData.reduce((s: number, d: any) => s + (d.stockpileT as number), 0)
    return {
      outputKtDay: outputKtDay.toLocaleString(),
      feContentPct: feContentPct.toFixed(1) + '%',
      railCars: railCars.toLocaleString(),
      stockpileT: stockpileT.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-red-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛏️</span>
          <h3 className="text-sm font-semibold text-white">Iron Ore Extraction Monitor</h3>
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
            <div className="text-slate-400">Output kt/day</div>
            <div className="text-sm font-semibold text-white">{metrics.outputKtDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Fe Content %</div>
            <div className="text-sm font-semibold text-white">{metrics.feContentPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Rail Cars</div>
            <div className="text-sm font-semibold text-white">{metrics.railCars}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stockpile T</div>
            <div className="text-sm font-semibold text-white">{metrics.stockpileT}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} kt/day output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
