'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dia-mirny',
    name: 'Mirny Russia',
    lat: 62.5333,
    lng: 113.9833,
    status: 'critical',
    value: 1850,
    caratsDay: 1850,
    qualityCt: 2.8,
    sorters: 32,
    valueK: 9200,
    trend: 'down' as const,
    description: 'Underground operations showing sharply declining kimberlite yield as the working faces approach depleted zones',
  },
  {
    id: 'dia-jwaneng',
    name: 'Jwaneng Botswana',
    lat: -25.4,
    lng: 24.7,
    status: 'warning',
    value: 4200,
    caratsDay: 4200,
    qualityCt: 3.6,
    sorters: 58,
    valueK: 24500,
    trend: 'down' as const,
    description: 'Flagship pit yielding lower carat counts as the cut-9 deepening phase transitions through lower-grade ore zones',
  },
  {
    id: 'dia-argyle',
    name: 'Argyle AU',
    lat: -16.6333,
    lng: 128.4,
    status: 'moderate',
    value: 2800,
    caratsDay: 2800,
    qualityCt: 2.2,
    sorters: 41,
    valueK: 13800,
    trend: 'stable' as const,
    description: 'Fancy brown diamond production running at planned rates with consistent lamproite ore treatment through the plant',
  },
  {
    id: 'dia-ekati',
    name: 'Ekati Canada',
    lat: 64.7,
    lng: -110.5,
    status: 'stable',
    value: 3600,
    caratsDay: 3600,
    qualityCt: 4.1,
    sorters: 47,
    valueK: 21400,
    trend: 'up' as const,
    description: 'Sub-arctic open pit and underground mines delivering strong gem-quality recoveries with optimal processing uptime',
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

export function DiamondMineOutputMonitor() {
  const state = useMapStore((s) => s.diamondMineOutput)
  const setState = useMapStore((s) => s.setDiamondMineOutput)

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
    if (filteredData.length === 0) return { caratsDay: 0, qualityCt: 0, sorters: 0, valueK: 0 }
    const caratsDay = filteredData.reduce((s: number, d: any) => s + (d.caratsDay as number), 0)
    const qualityCt = filteredData.reduce((s: number, d: any) => s + (d.qualityCt as number), 0) / filteredData.length
    const sorters = filteredData.reduce((s: number, d: any) => s + (d.sorters as number), 0)
    const valueK = filteredData.reduce((s: number, d: any) => s + (d.valueK as number), 0)
    return {
      caratsDay: caratsDay.toLocaleString(),
      qualityCt: qualityCt.toFixed(2) + ' ct',
      sorters: sorters.toLocaleString(),
      valueK: '$' + valueK.toLocaleString() + 'K',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-400 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">💎</span>
          <h3 className="text-sm font-semibold text-white">Diamond Mine Output Monitor</h3>
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
            <div className="text-slate-400">Carats/day</div>
            <div className="text-sm font-semibold text-white">{metrics.caratsDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Quality ct</div>
            <div className="text-sm font-semibold text-white">{metrics.qualityCt}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Sorters</div>
            <div className="text-sm font-semibold text-white">{metrics.sorters}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Value $K</div>
            <div className="text-sm font-semibold text-white">{metrics.valueK}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} carats/day output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
