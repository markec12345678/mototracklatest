'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'beach-bondi',
    name: 'Bondi Sydney',
    lat: -33.8915,
    lng: 151.2767,
    status: 'critical',
    value: 11,
    uvIndex: 11,
    waveHeight: 2.4,
    lifeguards: 8,
    ripRisk: 5,
    trend: 'up' as const,
    description: 'Extreme UV and dangerous rip currents with red flags flying along the entire beach',
  },
  {
    id: 'beach-copacabana',
    name: 'Copacabana Rio',
    lat: -22.9711,
    lng: -43.1822,
    status: 'warning',
    value: 9,
    uvIndex: 9,
    waveHeight: 1.8,
    lifeguards: 12,
    ripRisk: 3,
    trend: 'stable' as const,
    description: 'High UV with moderate rip activity; swimmers advised to stay between flagged zones',
  },
  {
    id: 'beach-malibu',
    name: 'Malibu CA',
    lat: 34.0259,
    lng: -118.7798,
    status: 'moderate',
    value: 7,
    uvIndex: 7,
    waveHeight: 1.2,
    lifeguards: 6,
    ripRisk: 2,
    trend: 'up' as const,
    description: 'Moderate conditions with steady surf and low rip current risk at Zuma and Surfrider',
  },
  {
    id: 'beach-patong',
    name: 'Phuket Patong',
    lat: 7.8965,
    lng: 98.2966,
    status: 'stable',
    value: 5,
    uvIndex: 5,
    waveHeight: 0.8,
    lifeguards: 10,
    ripRisk: 1,
    trend: 'down' as const,
    description: 'Calm monsoon-off season with gentle waves and minimal rip current activity',
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

export function BeachSafetyMonitor() {
  const state = useMapStore((s) => s.beachSafetyMonitor)
  const setState = useMapStore((s) => s.setBeachSafetyMonitor)

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
    if (filteredData.length === 0) return { avgUv: 0, avgWave: 0, totalLifeguards: 0, maxRip: 0 }
    const avgUv = filteredData.reduce((s: number, d: any) => s + (d.uvIndex as number), 0) / filteredData.length
    const avgWave = filteredData.reduce((s: number, d: any) => s + (d.waveHeight as number), 0) / filteredData.length
    const totalLifeguards = filteredData.reduce((s: number, d: any) => s + (d.lifeguards as number), 0)
    const maxRip = filteredData.reduce((m: number, d: any) => Math.max(m, d.ripRisk as number), 0)
    return {
      avgUv: avgUv.toFixed(1),
      avgWave: avgWave.toFixed(1),
      totalLifeguards,
      maxRip,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-blue-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏖️</span>
          <h3 className="text-sm font-semibold text-white">Beach Safety Monitor</h3>
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
            <div className="text-slate-400">UV Index</div>
            <div className="text-sm font-semibold text-white">{metrics.avgUv}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Wave Height m</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWave}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Lifeguards</div>
            <div className="text-sm font-semibold text-white">{metrics.totalLifeguards}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Rip Current Risk</div>
            <div className="text-sm font-semibold text-white">{metrics.maxRip}/5</div>
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
                <span className="text-xs text-slate-300">UV {loc.value}</span>
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
              Primary metric: <span className="text-slate-300 font-medium">UV Index {activeItem.value}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
