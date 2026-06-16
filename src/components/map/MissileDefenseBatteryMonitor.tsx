'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'md-thaad-pacific',
    name: 'THAAD Battery Pacific',
    lat: 13.58,
    lng: 144.92,
    status: 'stable',
    value: 48,
    interceptorsReady: 48,
    radarTrackingRange: 1000,
    successfulTests: 17,
    readinessLevel: 'C1',
    trend: 'up' as const,
    description: 'Terminal High Altitude Area Defense battery on Guam defending against regional ballistic missile threats with AN/TPY-2 X-band radar',
  },
  {
    id: 'md-aegis-poland',
    name: 'Aegis Ashore Poland',
    lat: 54.59,
    lng: 18.39,
    status: 'moderate',
    value: 24,
    interceptorsReady: 24,
    radarTrackingRange: 1900,
    successfulTests: 9,
    readinessLevel: 'C2',
    trend: 'stable' as const,
    description: 'NATO BMD land-based Aegis Ashore site at Redzikowo hosting Standard Missile-3 Block IIA interceptors against regional threats',
  },
  {
    id: 'md-irondome',
    name: 'Iron Dome Battery Israel',
    lat: 31.5,
    lng: 34.6,
    status: 'warning',
    value: 60,
    interceptorsReady: 60,
    radarTrackingRange: 70,
    successfulTests: 250,
    readinessLevel: 'C1',
    trend: 'up' as const,
    description: 'Israeli multi-battery Iron Dome counter-rocket system engaged at high operational tempo with Tamir interceptors exceeding 90% success rate',
  },
  {
    id: 'md-s400',
    name: 'S-400 Battery Kaliningrad',
    lat: 54.71,
    lng: 20.51,
    status: 'critical',
    value: 32,
    interceptorsReady: 32,
    radarTrackingRange: 600,
    successfulTests: 14,
    readinessLevel: 'C3',
    trend: 'down' as const,
    description: 'Russian S-400 Triumf long-range air defense system forward-deployed at Kaliningrad, NATO monitoring amid Ukraine conflict supply drain',
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

export function MissileDefenseBatteryMonitor() {
  const state = useMapStore((s) => s.missileDefenseBattery)
  const setState = useMapStore((s) => s.setMissileDefenseBattery)

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
    if (filteredData.length === 0) return { interceptorsReady: 0, radarTrackingRange: 0, successfulTests: 0 }
    const interceptorsReady = filteredData.reduce((s: number, d: any) => s + (d.interceptorsReady as number), 0)
    const radarTrackingRange = filteredData.reduce((s: number, d: any) => s + (d.radarTrackingRange as number), 0) / filteredData.length
    const successfulTests = filteredData.reduce((s: number, d: any) => s + (d.successfulTests as number), 0)
    return {
      interceptorsReady: interceptorsReady.toLocaleString(),
      radarTrackingRange: radarTrackingRange.toFixed(0) + ' km',
      successfulTests: successfulTests.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-700 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127919;</span>
          <h3 className="text-sm font-semibold text-white">Missile Defense Battery</h3>
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
            <div className="text-slate-400">Interceptors Ready</div>
            <div className="text-sm font-semibold text-white">{metrics.interceptorsReady}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Radar Range</div>
            <div className="text-sm font-semibold text-white">{metrics.radarTrackingRange}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Successful Tests</div>
            <div className="text-sm font-semibold text-white">{metrics.successfulTests}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Readiness</div>
            <div className="text-sm font-semibold text-white">C1</div>
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
                <span className="text-xs text-slate-300">{loc.value} ints</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} interceptors at {activeItem.readinessLevel} readiness, {activeItem.radarTrackingRange} km radar range</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
