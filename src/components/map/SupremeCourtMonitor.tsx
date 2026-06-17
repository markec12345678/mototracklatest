'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sc-us',
    name: 'US Supreme Court',
    lat: 38.89,
    lng: -77.0,
    status: 'stable',
    value: 9,
    justicesActive: 9,
    casesDocket: 62,
    opinionsIssued: 58,
    trend: 'stable' as const,
    description: 'US Supreme Court at One First Street NE with 9 justices hearing 62 docketed cases and issuing 58 signed opinions per term',
  },
  {
    id: 'sc-echr',
    name: 'European Court HR Strasbourg',
    lat: 48.57,
    lng: 7.74,
    status: 'warning',
    value: 47,
    justicesActive: 47,
    casesDocket: 68000,
    opinionsIssued: 940,
    trend: 'down' as const,
    description: 'European Court of Human Rights with 47 judges from Council of Europe states, 68,000 pending applications creating severe backlog',
  },
  {
    id: 'sc-india',
    name: 'Supreme Court of India',
    lat: 28.61,
    lng: 77.24,
    status: 'critical',
    value: 34,
    justicesActive: 34,
    casesDocket: 79000,
    opinionsIssued: 1100,
    trend: 'down' as const,
    description: 'Indian Supreme Court in New Delhi with 34 judges, 79,000 pending cases highlighting chronic backlog and constitutional bench delays',
  },
  {
    id: 'sc-uk',
    name: 'UK Supreme Court',
    lat: 51.5,
    lng: -0.12,
    status: 'stable',
    value: 12,
    justicesActive: 12,
    casesDocket: 280,
    opinionsIssued: 75,
    trend: 'up' as const,
    description: 'UK Supreme Court at Parliament Square with 12 justices hearing 280 permission-to-appeal applications and issuing 75 judgments annually',
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

export function SupremeCourtMonitor() {
  const state = useMapStore((s) => s.supremeCourt)
  const setState = useMapStore((s) => s.setSupremeCourt)

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
    if (filteredData.length === 0) return { justicesActive: 0, casesDocket: 0, opinionsIssued: 0 }
    const justicesActive = filteredData.reduce((s: number, d: any) => s + (d.justicesActive as number), 0)
    const casesDocket = filteredData.reduce((s: number, d: any) => s + (d.casesDocket as number), 0)
    const opinionsIssued = filteredData.reduce((s: number, d: any) => s + (d.opinionsIssued as number), 0)
    return {
      justicesActive: justicesActive.toLocaleString(),
      casesDocket: (casesDocket / 1000).toFixed(0) + 'k',
      opinionsIssued: opinionsIssued.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-700 to-red-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9878;</span>
          <h3 className="text-sm font-semibold text-white">Supreme Court</h3>
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
            <div className="text-slate-400">Active Justices</div>
            <div className="text-sm font-semibold text-white">{metrics.justicesActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cases Docketed</div>
            <div className="text-sm font-semibold text-white">{metrics.casesDocket}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Opinions Issued</div>
            <div className="text-sm font-semibold text-white">{metrics.opinionsIssued}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Backlog</div>
            <div className="text-sm font-semibold text-white">high</div>
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
                <span className="text-xs text-slate-300">{loc.value} justices</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} justices, {activeItem.casesDocket.toLocaleString()} docketed cases</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
