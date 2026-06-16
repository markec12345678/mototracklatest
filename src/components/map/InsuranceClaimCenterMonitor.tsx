'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ins-hartford',
    name: 'Hartford CT',
    lat: 41.7658,
    lng: -72.6734,
    status: 'critical',
    value: 4200,
    claims: 4200,
    payout: 88,
    approval: 52,
    pending: 1840,
    trend: 'up' as const,
    description: 'Backlog of unprocessed claims following regional storm activity with queue times exceeding three weeks',
  },
  {
    id: 'ins-lloyd',
    name: 'London Lloyd',
    lat: 51.513,
    lng: -0.083,
    status: 'warning',
    value: 2860,
    claims: 2860,
    payout: 142,
    approval: 68,
    pending: 920,
    trend: 'up' as const,
    description: 'Delayed specialty and marine claims with extended review cycles for complex reinsurance treaty submissions',
  },
  {
    id: 'ins-zurich',
    name: 'Zurich Swiss',
    lat: 47.3769,
    lng: 8.5417,
    status: 'moderate',
    value: 1980,
    claims: 1980,
    payout: 96,
    approval: 78,
    pending: 410,
    trend: 'stable' as const,
    description: 'Normal processing cadence with balanced intake and steady life and property claim throughput',
  },
  {
    id: 'ins-munich',
    name: 'Munich Re',
    lat: 48.1366,
    lng: 11.5772,
    status: 'stable',
    value: 1240,
    claims: 1240,
    payout: 110,
    approval: 88,
    pending: 180,
    trend: 'down' as const,
    description: 'Fast turnaround on industrial risk claims with automated triage keeping the pending queue well below target',
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

export function InsuranceClaimCenterMonitor() {
  const state = useMapStore((s) => s.insuranceClaimCenter)
  const setState = useMapStore((s) => s.setInsuranceClaimCenter)

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
    if (filteredData.length === 0) return { totalClaims: 0, avgPayout: 0, avgApproval: 0, totalPending: 0 }
    const totalClaims = filteredData.reduce((s: number, d: any) => s + (d.claims as number), 0)
    const avgPayout = filteredData.reduce((s: number, d: any) => s + (d.payout as number), 0) / filteredData.length
    const avgApproval = filteredData.reduce((s: number, d: any) => s + (d.approval as number), 0) / filteredData.length
    const totalPending = filteredData.reduce((s: number, d: any) => s + (d.pending as number), 0)
    return {
      totalClaims: totalClaims.toLocaleString(),
      avgPayout: avgPayout.toFixed(0),
      avgApproval: avgApproval.toFixed(0),
      totalPending: totalPending.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <h3 className="text-sm font-semibold text-white">Insurance Claim Center Monitor</h3>
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
            <div className="text-slate-400">Claims Processed</div>
            <div className="text-sm font-semibold text-white">{metrics.totalClaims}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Payout $K</div>
            <div className="text-sm font-semibold text-white">${metrics.avgPayout}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Approval %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgApproval}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Pending</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPending}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} claims</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
