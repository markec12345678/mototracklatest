'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ev-tesla',
    name: 'Tesla Supercharger CA',
    lat: 37.422,
    lng: -122.084,
    status: 'moderate',
    value: 24,
    stationsActive: 24,
    chargersInUse: 168,
    avgChargeKW: 210,
    queueLength: 12,
    trend: 'stable' as const,
    description: 'Bay Area Supercharger cluster with steady utilization and average wait times under five minutes',
  },
  {
    id: 'ev-ionity',
    name: 'Ionity EU',
    lat: 48.1372,
    lng: 11.5753,
    status: 'warning',
    value: 18,
    stationsActive: 18,
    chargersInUse: 132,
    avgChargeKW: 290,
    queueLength: 28,
    trend: 'up' as const,
    description: 'Munich corridor hub experiencing high demand with extended queues and reduced available stalls',
  },
  {
    id: 'ev-chargepoint',
    name: 'ChargePoint NYC',
    lat: 40.7128,
    lng: -74.0014,
    status: 'stable',
    value: 32,
    stationsActive: 32,
    chargersInUse: 96,
    avgChargeKW: 145,
    queueLength: 4,
    trend: 'down' as const,
    description: 'Manhattan network operating quietly with ample available chargers and short dwell times across stations',
  },
  {
    id: 'ev-bppulse',
    name: 'BP Pulse London',
    lat: 51.5074,
    lng: -0.1278,
    status: 'critical',
    value: 9,
    stationsActive: 9,
    chargersInUse: 38,
    avgChargeKW: 95,
    queueLength: 47,
    trend: 'up' as const,
    description: 'Multiple sites offline following grid fault with long queues at remaining hubs and degraded charge rates',
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

export function EvChargingNetworkMonitor() {
  const state = useMapStore((s) => s.evChargingNetwork)
  const setState = useMapStore((s) => s.setEvChargingNetwork)

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
    if (filteredData.length === 0) return { stationsActive: 0, chargersInUse: 0, avgChargeKW: 0, queueLength: 0 }
    const stationsActive = filteredData.reduce((s: number, d: any) => s + (d.stationsActive as number), 0)
    const chargersInUse = filteredData.reduce((s: number, d: any) => s + (d.chargersInUse as number), 0)
    const avgChargeKW = filteredData.reduce((s: number, d: any) => s + (d.avgChargeKW as number), 0) / filteredData.length
    const queueLength = filteredData.reduce((s: number, d: any) => s + (d.queueLength as number), 0)
    return {
      stationsActive: stationsActive.toLocaleString(),
      chargersInUse: chargersInUse.toLocaleString(),
      avgChargeKW: avgChargeKW.toFixed(0) + ' kW',
      queueLength: queueLength.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-sm font-semibold text-white">EV Charging Network Monitor</h3>
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
            <div className="text-slate-400">Stations Active</div>
            <div className="text-sm font-semibold text-white">{metrics.stationsActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Chargers In Use</div>
            <div className="text-sm font-semibold text-white">{metrics.chargersInUse}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Charge kW</div>
            <div className="text-sm font-semibold text-white">{metrics.avgChargeKW}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Queue Length</div>
            <div className="text-sm font-semibold text-white">{metrics.queueLength}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} stations active</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
