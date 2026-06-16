'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ski-aspen',
    name: 'Aspen',
    lat: 39.1911,
    lng: -106.8175,
    status: 'critical',
    value: 245,
    snowDepth: 245,
    tempC: -8,
    liftsOpen: 21,
    avalancheRisk: 5,
    trend: 'up' as const,
    description: 'High avalanche danger rating on backcountry terrain after fresh 30cm storm cycle',
  },
  {
    id: 'ski-chamonix',
    name: 'Chamonix',
    lat: 45.9237,
    lng: 6.8694,
    status: 'warning',
    value: 310,
    snowDepth: 310,
    tempC: -12,
    liftsOpen: 28,
    avalancheRisk: 3,
    trend: 'stable' as const,
    description: 'Moderate avalanche risk with off-piste restrictions on the Aiguille Rouge sector',
  },
  {
    id: 'ski-niseko',
    name: 'Niseko',
    lat: 42.8049,
    lng: 140.6874,
    status: 'moderate',
    value: 420,
    snowDepth: 420,
    tempC: -6,
    liftsOpen: 18,
    avalancheRisk: 2,
    trend: 'up' as const,
    description: 'Good powder conditions with low avalanche risk across all four resort sectors',
  },
  {
    id: 'ski-whistler',
    name: 'Whistler',
    lat: 50.1163,
    lng: -122.9574,
    status: 'stable',
    value: 180,
    snowDepth: 180,
    tempC: -3,
    liftsOpen: 24,
    avalancheRisk: 1,
    trend: 'down' as const,
    description: 'Excellent early-season conditions with low avalanche hazard and full lift operations',
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

export function SkiResortConditionMonitor() {
  const state = useMapStore((s) => s.skiResortConditionMonitor)
  const setState = useMapStore((s) => s.setSkiResortConditionMonitor)

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
    if (filteredData.length === 0) return { avgSnow: 0, avgTemp: 0, totalLifts: 0, maxAvalanche: 0 }
    const avgSnow = filteredData.reduce((s: number, d: any) => s + (d.snowDepth as number), 0) / filteredData.length
    const avgTemp = filteredData.reduce((s: number, d: any) => s + (d.tempC as number), 0) / filteredData.length
    const totalLifts = filteredData.reduce((s: number, d: any) => s + (d.liftsOpen as number), 0)
    const maxAvalanche = filteredData.reduce((m: number, d: any) => Math.max(m, d.avalancheRisk as number), 0)
    return {
      avgSnow: avgSnow.toFixed(0),
      avgTemp: avgTemp.toFixed(0),
      totalLifts,
      maxAvalanche,
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

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-500 to-indigo-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">⛷️</span>
          <h3 className="text-sm font-semibold text-white">Ski Resort Condition Monitor</h3>
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
            <div className="text-slate-400">Snow Depth cm</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSnow}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Temp C</div>
            <div className="text-sm font-semibold text-white">{metrics.avgTemp}&deg;C</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Lifts Open</div>
            <div className="text-sm font-semibold text-white">{metrics.totalLifts}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avalanche Risk</div>
            <div className="text-sm font-semibold text-white">{metrics.maxAvalanche}/5</div>
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
                <span className="text-xs text-slate-300">{loc.value}cm</span>
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
              Primary metric: <span className="text-slate-300 font-medium">{activeItem.value} cm snow depth</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
