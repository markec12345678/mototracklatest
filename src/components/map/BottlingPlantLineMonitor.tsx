'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bp-coca-atlanta',
    name: 'Coca-Cola Atlanta Bottling Plant',
    lat: 33.75,
    lng: -84.39,
    status: 'stable',
    value: 1850000000,
    lineSpeedBpm: 1800,
    bottleFormats: 8,
    uptimePercent: 96.5,
    trend: 'up' as const,
    description: 'Flagship bottling line processing 1800 bottles/min across 8 format sizes, 1.85B unit annual throughput with high-speed PET blow molding',
  },
  {
    id: 'bp-heineken-denmark',
    name: 'Carlsberg Fredericia Bottling',
    lat: 55.57,
    lng: 9.76,
    status: 'stable',
    value: 940000000,
    lineSpeedBpm: 1200,
    bottleFormats: 6,
    uptimePercent: 94.8,
    trend: 'stable' as const,
    description: 'European high-speed canning and bottling line, 940M unit annual capacity for Carlsberg group brands with returnable glass program',
  },
  {
    id: 'bp-pepsico-texas',
    name: 'PepsiCo Dallas Bottling Facility',
    lat: 32.78,
    lng: -96.80,
    status: 'moderate',
    value: 720000000,
    lineSpeedBpm: 1500,
    bottleFormats: 5,
    uptimePercent: 92.3,
    trend: 'up' as const,
    description: 'Multi-format bottling plant producing Pepsi, Mountain Dew and Gatorade lines with water conservation recycling 85% process water',
  },
  {
    id: 'bp-nestle-perrier',
    name: 'Perrier Vergeze Bottling Plant',
    lat: 43.78,
    lng: 4.26,
    status: 'warning',
    value: 480000000,
    lineSpeedBpm: 950,
    bottleFormats: 4,
    uptimePercent: 88.7,
    trend: 'down' as const,
    description: 'French sparkling mineral water source threatened by drought reducing aquifer recharge, 480M unit annual bottling with aging equipment',
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

export function BottlingPlantLineMonitor() {
  const state = useMapStore((s) => s.bottlingPlantLine)
  const setState = useMapStore((s) => s.setBottlingPlantLine)

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
    if (filteredData.length === 0) return { totalUnits: '0', avgSpeed: 0, avgUptime: '0.0' }
    const totalUnits = filteredData.reduce((s: number, d: any) => s + (d.value as number), 0)
    const avgSpeed = filteredData.reduce((s: number, d: any) => s + (d.lineSpeedBpm as number), 0) / filteredData.length
    const avgUptime = filteredData.reduce((s: number, d: any) => s + (d.uptimePercent as number), 0) / filteredData.length
    return {
      totalUnits: (totalUnits / 1000000000).toFixed(2) + 'B',
      avgSpeed,
      avgUptime: avgUptime.toFixed(1) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-600 to-blue-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127870;</span>
          <h3 className="text-sm font-semibold text-white">Bottling Plant Line</h3>
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
            <div className="text-slate-400">Annual Units</div>
            <div className="text-sm font-semibold text-white">{metrics.totalUnits}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Line Speed</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSpeed} bpm</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Uptime</div>
            <div className="text-sm font-semibold text-white">{metrics.avgUptime}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Format Span</div>
            <div className="text-sm font-semibold text-white">4-8 SKUs</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(0)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} units annual, {activeItem.lineSpeedBpm} bpm, {activeItem.bottleFormats} formats, {activeItem.uptimePercent}% uptime</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
