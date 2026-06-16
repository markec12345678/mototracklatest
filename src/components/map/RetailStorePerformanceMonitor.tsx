'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'retail-5thave',
    name: '5th Ave NYC',
    lat: 40.7637,
    lng: -73.974,
    status: 'critical',
    value: 18,
    revenue: 18,
    conversion: 12,
    footTraffic: 5400,
    avgTransaction: 320,
    trend: 'down' as const,
    description: 'Low conversion despite heavy foot traffic as window shoppers dominate over buyers',
  },
  {
    id: 'retail-oxford',
    name: 'Oxford St London',
    lat: 51.5154,
    lng: -0.1411,
    status: 'warning',
    value: 24,
    revenue: 24,
    conversion: 18,
    footTraffic: 4200,
    avgTransaction: 185,
    trend: 'down' as const,
    description: 'Below target weekday sales with tourists browsing but slow checkout conversion',
  },
  {
    id: 'retail-ginza',
    name: 'Ginza Tokyo',
    lat: 35.671,
    lng: 139.7646,
    status: 'moderate',
    value: 42,
    revenue: 42,
    conversion: 27,
    footTraffic: 3100,
    avgTransaction: 410,
    trend: 'stable' as const,
    description: 'On target weekend performance with strong luxury sales and steady conversion',
  },
  {
    id: 'retail-champs',
    name: 'Champs Elysees Paris',
    lat: 48.8698,
    lng: 2.3078,
    status: 'stable',
    value: 65,
    revenue: 65,
    conversion: 34,
    footTraffic: 2800,
    avgTransaction: 520,
    trend: 'up' as const,
    description: 'Exceeding targets with premium flagship stores driving strong average transaction value',
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

export function RetailStorePerformanceMonitor() {
  const state = useMapStore((s) => s.retailStorePerformance)
  const setState = useMapStore((s) => s.setRetailStorePerformance)

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
    if (filteredData.length === 0) return { totalRevenue: 0, avgConversion: 0, totalFoot: 0, avgTrans: 0 }
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.revenue as number), 0)
    const avgConversion = filteredData.reduce((s: number, d: any) => s + (d.conversion as number), 0) / filteredData.length
    const totalFoot = filteredData.reduce((s: number, d: any) => s + (d.footTraffic as number), 0)
    const avgTrans = filteredData.reduce((s: number, d: any) => s + (d.avgTransaction as number), 0) / filteredData.length
    return {
      totalRevenue: totalRevenue.toLocaleString(),
      avgConversion: avgConversion.toFixed(0),
      totalFoot: totalFoot.toLocaleString(),
      avgTrans: avgTrans.toFixed(0),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏪</span>
          <h3 className="text-sm font-semibold text-white">Retail Store Performance Monitor</h3>
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
            <div className="text-slate-400">Revenue $K</div>
            <div className="text-sm font-semibold text-white">${metrics.totalRevenue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Conversion %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgConversion}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Foot Traffic</div>
            <div className="text-sm font-semibold text-white">{metrics.totalFoot}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Transaction $</div>
            <div className="text-sm font-semibold text-white">${metrics.avgTrans}</div>
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
                <span className="text-xs text-slate-300">${loc.value}K</span>
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
              <span className="text-slate-300 font-medium">${activeItem.value}K revenue</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
