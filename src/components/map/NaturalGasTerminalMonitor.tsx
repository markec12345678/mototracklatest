'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gas-sabinepass',
    name: 'Sabine Pass TX',
    lat: 29.735,
    lng: -93.87,
    status: 'stable',
    value: 78,
    gasFlowMcmd: 78,
    lngOutputKt: 42,
    storageFullPct: 88,
    pressureBar: 142,
    trend: 'up' as const,
    description: 'Largest US LNG export terminal operating at peak throughput with stable pipeline pressure and full storage tanks',
  },
  {
    id: 'gas-raslaffan',
    name: 'Ras Laffan Qatar',
    lat: 25.825,
    lng: 51.5961,
    status: 'moderate',
    value: 95,
    gasFlowMcmd: 95,
    lngOutputKt: 58,
    storageFullPct: 72,
    pressureBar: 138,
    trend: 'stable' as const,
    description: 'Qatari mega-terminal sustaining high export volume with moderate storage levels and routine maintenance rotation',
  },
  {
    id: 'gas-yamal',
    name: 'Yamal Russia',
    lat: 71.2,
    lng: 71.5,
    status: 'warning',
    value: 64,
    gasFlowMcmd: 64,
    lngOutputKt: 35,
    storageFullPct: 94,
    pressureBar: 168,
    trend: 'up' as const,
    description: 'Arctic liquefaction complex running under elevated pipeline pressure with storage approaching capacity limits',
  },
  {
    id: 'gas-gorgon',
    name: 'Gorgon Australia',
    lat: -21.9,
    lng: 113.9,
    status: 'critical',
    value: 21,
    gasFlowMcmd: 21,
    lngOutputKt: 12,
    storageFullPct: 46,
    pressureBar: 187,
    trend: 'down' as const,
    description: 'Offshore gas facility reporting pressure anomaly and reduced flow with leak detection protocols activated',
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

export function NaturalGasTerminalMonitor() {
  const state = useMapStore((s) => s.naturalGasTerminal)
  const setState = useMapStore((s) => s.setNaturalGasTerminal)

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
    if (filteredData.length === 0) return { gasFlowMcmd: 0, lngOutputKt: 0, storageFullPct: 0, pressureBar: 0 }
    const gasFlowMcmd = filteredData.reduce((s: number, d: any) => s + (d.gasFlowMcmd as number), 0)
    const lngOutputKt = filteredData.reduce((s: number, d: any) => s + (d.lngOutputKt as number), 0)
    const storageFullPct = filteredData.reduce((s: number, d: any) => s + (d.storageFullPct as number), 0) / filteredData.length
    const pressureBar = filteredData.reduce((s: number, d: any) => s + (d.pressureBar as number), 0) / filteredData.length
    return {
      gasFlowMcmd: gasFlowMcmd.toLocaleString() + ' mcm/d',
      lngOutputKt: lngOutputKt.toLocaleString() + ' kt',
      storageFullPct: storageFullPct.toFixed(0) + ' %',
      pressureBar: pressureBar.toFixed(0) + ' bar',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <h3 className="text-sm font-semibold text-white">Natural Gas Terminal Monitor</h3>
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
            <div className="text-slate-400">Gas Flow mcm/d</div>
            <div className="text-sm font-semibold text-white">{metrics.gasFlowMcmd}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">LNG Output kt</div>
            <div className="text-sm font-semibold text-white">{metrics.lngOutputKt}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Storage Full %</div>
            <div className="text-sm font-semibold text-white">{metrics.storageFullPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Pressure bar</div>
            <div className="text-sm font-semibold text-white">{metrics.pressureBar}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} mcm/d gas flow</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
