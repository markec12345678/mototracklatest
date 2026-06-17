'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ts-palmbeach',
    name: 'Palm Beach Tan Phoenix',
    lat: 33.448,
    lng: -112.074,
    status: 'stable',
    value: 88,
    sessionsPerDay: 72,
    bedsAvailable: 8,
    avgSessionMin: 15,
    trend: 'up' as const,
    description: 'Palm Beach Tan Phoenix flagship with 8 tanning beds including HP stand-up and Mystic spray tan serving 72 sessions daily',
  },
  {
    id: 'ts-midnight',
    name: 'Midnight Sun Dallas',
    lat: 32.781,
    lng: -96.801,
    status: 'stable',
    value: 82,
    sessionsPerDay: 58,
    bedsAvailable: 6,
    avgSessionMin: 18,
    trend: 'stable' as const,
    description: 'Dallas Midnight Sun tanning salon with 6 beds offering UV tanning packages and red light therapy for 58 daily sessions',
  },
  {
    id: 'ts-tropical',
    name: 'Tropical Sun Orlando',
    lat: 28.538,
    lng: -81.379,
    status: 'moderate',
    value: 74,
    sessionsPerDay: 48,
    bedsAvailable: 5,
    avgSessionMin: 16,
    trend: 'up' as const,
    description: 'Orlando Tropical Sun tanning salon near theme parks serving tourists with 5 beds and 16-min sessions for 48 customers daily',
  },
  {
    id: 'ts-aunaturel',
    name: 'Au Naturel Seattle',
    lat: 47.614,
    lng: -122.321,
    status: 'warning',
    value: 62,
    sessionsPerDay: 32,
    bedsAvailable: 4,
    avgSessionMin: 20,
    trend: 'down' as const,
    description: 'Seattle Au Naturel organic spray tan boutique with 4 beds facing winter slowdown with reduced daily volume',
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

export function TanningSalonStudioMonitor() {
  const state = useMapStore((s) => s.tanningSalonStudio)
  const setState = useMapStore((s) => s.setTanningSalonStudio)

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
    if (filteredData.length === 0) return { totalSessions: 0, totalBeds: 0, avgSession: '0m', utilization: '0%' }
    const totalSessions = filteredData.reduce((s: number, d: any) => s + (d.sessionsPerDay as number), 0)
    const totalBeds = filteredData.reduce((s: number, d: any) => s + (d.bedsAvailable as number), 0)
    const avgSession = filteredData.reduce((s: number, d: any) => s + (d.avgSessionMin as number), 0) / filteredData.length
    // Assume 10 operating hours = 600 min per bed
    const maxCapacity = totalBeds * 600 / avgSession
    const utilization = maxCapacity > 0 ? (totalSessions / maxCapacity) * 100 : 0
    return {
      totalSessions,
      totalBeds,
      avgSession: avgSession.toFixed(0) + 'm',
      utilization: utilization.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-orange-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9728;</span>
          <h3 className="text-sm font-semibold text-white">Tanning Salon Studio</h3>
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
            <div className="text-slate-400">Sessions / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSessions}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Beds</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBeds}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Session</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSession}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bed Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.utilization}</div>
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
                <span className="text-xs text-slate-300">{loc.bedsAvailable} beds</span>
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
              <span className="text-slate-300 font-medium">{activeItem.sessionsPerDay} sessions/day, {activeItem.bedsAvailable} beds, {activeItem.avgSessionMin}m avg</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
