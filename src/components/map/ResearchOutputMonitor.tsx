'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'res-stanford',
    name: 'Stanford',
    lat: 37.4275,
    lng: -122.1697,
    status: 'critical',
    value: 680,
    papers: 680,
    citations: 18400,
    patents: 142,
    hindex: 89,
    trend: 'down' as const,
    description: 'Low output this quarter as research effort shifts toward AI safety policy submissions',
  },
  {
    id: 'res-cambridge',
    name: 'Cambridge UK',
    lat: 52.2053,
    lng: 0.1218,
    status: 'warning',
    value: 920,
    papers: 920,
    citations: 22100,
    patents: 96,
    hindex: 84,
    trend: 'down' as const,
    description: 'Below average output following departmental restructuring and reduced PhD intake',
  },
  {
    id: 'res-caltech',
    name: 'Caltech',
    lat: 34.1377,
    lng: -118.1253,
    status: 'moderate',
    value: 1140,
    papers: 1140,
    citations: 28600,
    patents: 78,
    hindex: 92,
    trend: 'stable' as const,
    description: 'Average publication pace with strong JPL collaboration driving physics and astronomy output',
  },
  {
    id: 'res-cern',
    name: 'CERN Geneva',
    lat: 46.2333,
    lng: 6.05,
    status: 'stable',
    value: 1820,
    papers: 1820,
    citations: 64200,
    patents: 24,
    hindex: 187,
    trend: 'up' as const,
    description: 'High output from LHC Run 3 with multi-institution collaborations producing landmark particle physics results',
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

export function ResearchOutputMonitor() {
  const state = useMapStore((s) => s.researchOutputMonitor)
  const setState = useMapStore((s) => s.setResearchOutputMonitor)

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
    if (filteredData.length === 0) return { totalPapers: 0, totalCitations: 0, totalPatents: 0, avgHindex: 0 }
    const totalPapers = filteredData.reduce((s: number, d: any) => s + (d.papers as number), 0)
    const totalCitations = filteredData.reduce((s: number, d: any) => s + (d.citations as number), 0)
    const totalPatents = filteredData.reduce((s: number, d: any) => s + (d.patents as number), 0)
    const avgHindex = filteredData.reduce((s: number, d: any) => s + (d.hindex as number), 0) / filteredData.length
    return {
      totalPapers: totalPapers.toLocaleString(),
      totalCitations: totalCitations.toLocaleString(),
      totalPatents: totalPatents.toLocaleString(),
      avgHindex: avgHindex.toFixed(0),
    }
  }, [filteredData])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧪</span>
          <h3 className="text-sm font-semibold text-white">Research Output Monitor</h3>
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
            <div className="text-slate-400">Papers Published</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPapers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Citations</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCitations}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Patents Filed</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPatents}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">h-index</div>
            <div className="text-sm font-semibold text-white">{metrics.avgHindex}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} papers</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
