'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pat-sv',
    name: 'Silicon Valley',
    lat: 37.3874,
    lng: -122.0575,
    status: 'critical',
    value: 142,
    patents: 142,
    trademarks: 318,
    rnd: 4200,
    startups: 845,
    trend: 'down' as const,
    description: 'Low innovation quarter as capital contraction slows patent filings across semiconductor firms',
  },
  {
    id: 'pat-haifa',
    name: 'Israel Tech Haifa',
    lat: 32.7775,
    lng: 35.0216,
    status: 'warning',
    value: 218,
    patents: 218,
    trademarks: 268,
    rnd: 1180,
    startups: 412,
    trend: 'stable' as const,
    description: 'Below average output following defense sector reorganization and reduced cybersecurity funding',
  },
  {
    id: 'pat-shenzhen',
    name: 'Shenzhen',
    lat: 22.5431,
    lng: 114.0579,
    status: 'moderate',
    value: 482,
    patents: 482,
    trademarks: 540,
    rnd: 2940,
    startups: 620,
    trend: 'up' as const,
    description: 'Average output with steady hardware patent flow from electronics manufacturing ecosystem',
  },
  {
    id: 'pat-helsinki',
    name: 'Helsinki',
    lat: 60.1699,
    lng: 24.9384,
    status: 'stable',
    value: 374,
    patents: 374,
    trademarks: 412,
    rnd: 1620,
    startups: 510,
    trend: 'up' as const,
    description: 'High innovation driven by telecom, gaming, and clean-tech clusters with strong university spinouts',
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

export function InnovationPatentMonitor() {
  const state = useMapStore((s) => s.innovationPatentMonitor)
  const setState = useMapStore((s) => s.setInnovationPatentMonitor)

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
    if (filteredData.length === 0) return { totalPatents: 0, totalTrademarks: 0, totalRnd: 0, totalStartups: 0 }
    const totalPatents = filteredData.reduce((s: number, d: any) => s + (d.patents as number), 0)
    const totalTrademarks = filteredData.reduce((s: number, d: any) => s + (d.trademarks as number), 0)
    const totalRnd = filteredData.reduce((s: number, d: any) => s + (d.rnd as number), 0)
    const totalStartups = filteredData.reduce((s: number, d: any) => s + (d.startups as number), 0)
    return {
      totalPatents: totalPatents.toLocaleString(),
      totalTrademarks: totalTrademarks.toLocaleString(),
      totalRnd: totalRnd.toLocaleString(),
      totalStartups: totalStartups.toLocaleString(),
    }
  }, [filteredData])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500 to-amber-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <h3 className="text-sm font-semibold text-white">Innovation Patent Monitor</h3>
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
            <div className="text-slate-400">Patents Filed</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPatents}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Trademarks</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTrademarks}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">R&amp;D $M</div>
            <div className="text-sm font-semibold text-white">${metrics.totalRnd}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Startups Spawned</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStartups}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} patents</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
