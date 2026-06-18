'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'lib-loc',
    name: 'Library of Congress',
    lat: 38.8888,
    lng: -77.0047,
    status: 'critical',
    value: 3200,
    volumes: 173,
    visitors: 3200,
    digital: 78,
    rare: 832,
    trend: 'up' as const,
    description: 'Limited access due to conservation work on Thomas Jefferson collection with appointment-only entries',
  },
  {
    id: 'lib-british',
    name: 'British Library',
    lat: 51.5299,
    lng: -0.127,
    status: 'warning',
    value: 5400,
    volumes: 200,
    visitors: 5400,
    digital: 85,
    rare: 425,
    trend: 'down' as const,
    description: 'Reduced hours during reading room renovation with limited exhibition gallery access',
  },
  {
    id: 'lib-bodleian',
    name: 'Bodleian Oxford',
    lat: 51.7548,
    lng: -1.2544,
    status: 'moderate',
    value: 2400,
    volumes: 13,
    visitors: 2400,
    digital: 72,
    rare: 1180,
    trend: 'stable' as const,
    description: 'Normal operations across reading rooms with steady digitization progress on medieval manuscripts',
  },
  {
    id: 'lib-nypl',
    name: 'NY Public Library',
    lat: 40.7532,
    lng: -73.981,
    status: 'stable',
    value: 4100,
    volumes: 55,
    visitors: 4100,
    digital: 91,
    rare: 430,
    trend: 'up' as const,
    description: 'Full service across branches with expanded digital access and robust public programming',
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

export function LibraryResourceMonitor() {
  const state = useMapStore((s) => s.libraryResourceMonitor)
  const setState = useMapStore((s) => s.setLibraryResourceMonitor)

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
    if (filteredData.length === 0) return { totalVolumes: 0, totalVisitors: 0, avgDigital: 0, totalRare: 0 }
    const totalVolumes = filteredData.reduce((s: number, d: any) => s + (d.volumes as number), 0)
    const totalVisitors = filteredData.reduce((s: number, d: any) => s + (d.visitors as number), 0)
    const avgDigital = filteredData.reduce((s: number, d: any) => s + (d.digital as number), 0) / filteredData.length
    const totalRare = filteredData.reduce((s: number, d: any) => s + (d.rare as number), 0)
    return {
      totalVolumes: totalVolumes.toLocaleString(),
      totalVisitors: totalVisitors.toLocaleString(),
      avgDigital: avgDigital.toFixed(1),
      totalRare: totalRare.toLocaleString(),
    }
  }, [filteredData])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">📚</span>
          <h3 className="text-sm font-semibold text-white">Library Resource Monitor</h3>
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
            <div className="text-slate-400">Volumes M</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVolumes}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Visitors/day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Digital Access %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDigital}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Rare Books</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRare}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} visitors/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
