'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pay-stripe',
    name: 'Stripe San Francisco',
    lat: 37.7749,
    lng: -122.4194,
    status: 'critical',
    value: 0,
    tps: 0,
    uptime: 94.2,
    latency: 2400,
    decline: 12.8,
    trend: 'down' as const,
    description: 'Outage affecting API endpoint with all transactions failing and incident response team engaged on root cause',
  },
  {
    id: 'pay-paypal',
    name: 'PayPal San Jose',
    lat: 37.3362,
    lng: -121.8906,
    status: 'warning',
    value: 8400,
    tps: 8400,
    uptime: 99.1,
    latency: 680,
    decline: 5.4,
    trend: 'down' as const,
    description: 'Slow responses during peak checkout window with elevated latency and intermittent 5xx errors on webhook delivery',
  },
  {
    id: 'pay-adyen',
    name: 'Adyen Amsterdam',
    lat: 52.3676,
    lng: 4.9041,
    status: 'moderate',
    value: 12600,
    tps: 12600,
    uptime: 99.95,
    latency: 220,
    decline: 1.8,
    trend: 'stable' as const,
    description: 'Normal throughput with steady transaction mix across European rails and balanced 3DS authentication flow',
  },
  {
    id: 'pay-square',
    name: 'Square NYC',
    lat: 40.7282,
    lng: -73.9942,
    status: 'stable',
    value: 18200,
    tps: 18200,
    uptime: 99.99,
    latency: 140,
    decline: 1.1,
    trend: 'up' as const,
    description: 'Optimal performance with sub-150ms latency and decline rate well below target across card-present rails',
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

export function PaymentGatewayStatusMonitor() {
  const state = useMapStore((s) => s.paymentGatewayStatus)
  const setState = useMapStore((s) => s.setPaymentGatewayStatus)

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
    if (filteredData.length === 0) return { totalTps: 0, avgUptime: 0, avgLatency: 0, avgDecline: 0 }
    const totalTps = filteredData.reduce((s: number, d: any) => s + (d.tps as number), 0)
    const avgUptime = filteredData.reduce((s: number, d: any) => s + (d.uptime as number), 0) / filteredData.length
    const avgLatency = filteredData.reduce((s: number, d: any) => s + (d.latency as number), 0) / filteredData.length
    const avgDecline = filteredData.reduce((s: number, d: any) => s + (d.decline as number), 0) / filteredData.length
    return {
      totalTps: totalTps.toLocaleString(),
      avgUptime: avgUptime.toFixed(2),
      avgLatency: avgLatency.toFixed(0),
      avgDecline: avgDecline.toFixed(2),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-500 to-pink-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">💸</span>
          <h3 className="text-sm font-semibold text-white">Payment Gateway Status Monitor</h3>
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
            <div className="text-slate-400">TPS</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTps}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Uptime %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgUptime}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Latency ms</div>
            <div className="text-sm font-semibold text-white">{metrics.avgLatency}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Decline Rate %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgDecline}%</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} TPS</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
