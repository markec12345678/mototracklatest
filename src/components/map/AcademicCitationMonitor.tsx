'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cit-princeton',
    name: 'Princeton',
    lat: 40.344,
    lng: -74.6514,
    status: 'critical',
    value: 42,
    avgCit: 42,
    topCit: 318,
    hindex: 78,
    impact: 6.8,
    trend: 'down' as const,
    description: 'Declining citation impact following reduced output from theoretical physics and math departments',
  },
  {
    id: 'cit-heidelberg',
    name: 'Heidelberg',
    lat: 49.3987,
    lng: 8.6724,
    status: 'warning',
    value: 51,
    avgCit: 51,
    topCit: 412,
    hindex: 84,
    impact: 7.4,
    trend: 'stable' as const,
    description: 'Below average impact relative to peers despite steady publication volume in life sciences',
  },
  {
    id: 'cit-toronto',
    name: 'Toronto',
    lat: 43.6629,
    lng: -79.3957,
    status: 'moderate',
    value: 68,
    avgCit: 68,
    topCit: 945,
    hindex: 96,
    impact: 9.1,
    trend: 'up' as const,
    description: 'Average impact with strong showing from medicine and computer science faculties',
  },
  {
    id: 'cit-nus',
    name: 'NUS Singapore',
    lat: 1.2966,
    lng: 103.7764,
    status: 'stable',
    value: 84,
    avgCit: 84,
    topCit: 1280,
    hindex: 112,
    impact: 11.6,
    trend: 'up' as const,
    description: 'High impact output driven by engineering and AI research with growing global collaboration footprint',
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

export function AcademicCitationMonitor() {
  const state = useMapStore((s) => s.academicCitationMonitor)
  const setState = useMapStore((s) => s.setAcademicCitationMonitor)

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
    if (filteredData.length === 0) return { avgCit: 0, maxTop: 0, avgHindex: 0, avgImpact: 0 }
    const avgCit = filteredData.reduce((s: number, d: any) => s + (d.avgCit as number), 0) / filteredData.length
    const maxTop = filteredData.reduce((m: number, d: any) => Math.max(m, d.topCit as number), 0)
    const avgHindex = filteredData.reduce((s: number, d: any) => s + (d.hindex as number), 0) / filteredData.length
    const avgImpact = filteredData.reduce((s: number, d: any) => s + (d.impact as number), 0) / filteredData.length
    return {
      avgCit: avgCit.toFixed(1),
      maxTop: maxTop.toLocaleString(),
      avgHindex: avgHindex.toFixed(0),
      avgImpact: avgImpact.toFixed(2),
    }
  }, [filteredData])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-500 to-pink-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <h3 className="text-sm font-semibold text-white">Academic Citation Monitor</h3>
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
            <div className="text-slate-400">Avg Citations</div>
            <div className="text-sm font-semibold text-white">{metrics.avgCit}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Paper Cites</div>
            <div className="text-sm font-semibold text-white">{metrics.maxTop}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">H-index</div>
            <div className="text-sm font-semibold text-white">{metrics.avgHindex}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Impact Factor</div>
            <div className="text-sm font-semibold text-white">{metrics.avgImpact}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} avg citations</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
