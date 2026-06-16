'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'gold-fortknox',
    name: 'Fort Knox',
    lat: 37.8892,
    lng: -85.958,
    status: 'critical',
    value: 4580,
    tons: 4580,
    valueUsd: 290,
    security: 62,
    audit: 48,
    trend: 'down' as const,
    description: 'Breach risk flagged with perimeter sensors tripping repeatedly and pending reinforcement of vault door seals',
  },
  {
    id: 'gold-nyfed',
    name: 'NYC Fed Vault',
    lat: 40.7079,
    lng: -74.0085,
    status: 'warning',
    value: 6350,
    tons: 6350,
    valueUsd: 402,
    security: 78,
    audit: 64,
    trend: 'stable' as const,
    description: 'Audit due with several subvaults pending recount and inventory reconciliation running behind schedule',
  },
  {
    id: 'gold-boe',
    name: 'London BoE',
    lat: 51.5142,
    lng: -0.0876,
    status: 'moderate',
    value: 4980,
    tons: 4980,
    valueUsd: 315,
    security: 88,
    audit: 86,
    trend: 'stable' as const,
    description: 'Secure facility with multi-party custodian controls and routine quarterly audits running on schedule',
  },
  {
    id: 'gold-zurich',
    name: 'Zurich Swiss',
    lat: 47.3769,
    lng: 8.5417,
    status: 'stable',
    value: 2720,
    tons: 2720,
    valueUsd: 172,
    security: 96,
    audit: 98,
    trend: 'up' as const,
    description: 'Optimal posture with biometric access controls and continuous audit coverage across allocated and unallocated accounts',
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

export function GoldReserveVaultMonitor() {
  const state = useMapStore((s) => s.goldReserveVault)
  const setState = useMapStore((s) => s.setGoldReserveVault)

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
    if (filteredData.length === 0) return { totalTons: 0, totalValue: 0, avgSecurity: 0, avgAudit: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tons as number), 0)
    const totalValue = filteredData.reduce((s: number, d: any) => s + (d.valueUsd as number), 0)
    const avgSecurity = filteredData.reduce((s: number, d: any) => s + (d.security as number), 0) / filteredData.length
    const avgAudit = filteredData.reduce((s: number, d: any) => s + (d.audit as number), 0) / filteredData.length
    return {
      totalTons: totalTons.toLocaleString(),
      totalValue: totalValue.toLocaleString(),
      avgSecurity: avgSecurity.toFixed(0),
      avgAudit: avgAudit.toFixed(0),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500 to-amber-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h3 className="text-sm font-semibold text-white">Gold Reserve Vault Monitor</h3>
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
            <div className="text-slate-400">Gold Tons</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTons}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Value $B</div>
            <div className="text-sm font-semibold text-white">${metrics.totalValue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Security Score</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSecurity}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Audit Status %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgAudit}%</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} tons</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
