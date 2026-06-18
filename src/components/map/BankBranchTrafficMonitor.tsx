'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bank-wallst',
    name: 'Wall St NYC',
    lat: 40.7074,
    lng: -74.0113,
    status: 'critical',
    value: 480,
    customers: 480,
    wait: 38,
    transactions: 1240,
    tellers: 6,
    trend: 'up' as const,
    description: 'Overcrowded lunchtime rush with queues spilling onto the lobby floor and teller wait times exceeding 30 minutes',
  },
  {
    id: 'bank-boe',
    name: 'Bank of England London',
    lat: 51.5142,
    lng: -0.0876,
    status: 'warning',
    value: 320,
    customers: 320,
    wait: 22,
    transactions: 890,
    tellers: 8,
    trend: 'up' as const,
    description: 'Busy midday period with steady corporate client traffic and increased currency exchange demand',
  },
  {
    id: 'bank-frankfurt',
    name: 'Frankfurt Bank',
    lat: 50.1109,
    lng: 8.6821,
    status: 'moderate',
    value: 180,
    customers: 180,
    wait: 12,
    transactions: 540,
    tellers: 5,
    trend: 'stable' as const,
    description: 'Normal afternoon traffic with steady flow of personal banking and mortgage consultation appointments',
  },
  {
    id: 'bank-tokyo',
    name: 'Tokyo Marunouchi',
    lat: 35.68,
    lng: 139.763,
    status: 'stable',
    value: 95,
    customers: 95,
    wait: 6,
    transactions: 310,
    tellers: 4,
    trend: 'down' as const,
    description: 'Quiet morning hours with light foot traffic and most customers preferring mobile banking options',
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

export function BankBranchTrafficMonitor() {
  const state = useMapStore((s) => s.bankBranchTraffic)
  const setState = useMapStore((s) => s.setBankBranchTraffic)

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
    if (filteredData.length === 0) return { totalCustomers: 0, avgWait: 0, totalTransactions: 0, totalTellers: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.customers as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.wait as number), 0) / filteredData.length
    const totalTransactions = filteredData.reduce((s: number, d: any) => s + (d.transactions as number), 0)
    const totalTellers = filteredData.reduce((s: number, d: any) => s + (d.tellers as number), 0)
    return {
      totalCustomers: totalCustomers.toLocaleString(),
      avgWait: avgWait.toFixed(0),
      totalTransactions: totalTransactions.toLocaleString(),
      totalTellers: totalTellers.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏦</span>
          <h3 className="text-sm font-semibold text-white">Bank Branch Traffic Monitor</h3>
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
            <div className="text-slate-400">Customers/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait min</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Transactions</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTransactions}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Teller Open</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTellers}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} customers/hr</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
