'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'rs-anantara',
    name: 'Anantara Veli Maldives',
    lat: 4.176,
    lng: 73.495,
    status: 'stable',
    value: 95,
    occupancyPct: 95,
    totalSuites: 84,
    nightlyRate: 1240,
    trend: 'up' as const,
    description: 'Overwater bungalow resort in South Male Atoll with 84 overwater suites, private butler service and coral reef restoration program',
  },
  {
    id: 'rs-amanpulo',
    name: 'Amanpulo Pamalican',
    lat: 11.555,
    lng: 120.913,
    status: 'moderate',
    value: 82,
    occupancyPct: 82,
    totalSuites: 42,
    nightlyRate: 2850,
    trend: 'stable' as const,
    description: 'Private island resort in Philippines Cuyo Archipelago with 42 casitas, exclusive white sand beaches and diving excursions',
  },
  {
    id: 'rs-banyan',
    name: 'Banyan Tree Bintan',
    lat: 1.169,
    lng: 104.375,
    status: 'warning',
    value: 68,
    occupancyPct: 68,
    totalSuites: 64,
    nightlyRate: 680,
    trend: 'down' as const,
    description: 'Indonesian beachfront villa resort with 64 private pool villas, reduced bookings amid regional travel uncertainty',
  },
  {
    id: 'rs-six-senses',
    name: 'Six Senses Zighy Bay',
    lat: 25.783,
    lng: 56.403,
    status: 'stable',
    value: 89,
    occupancyPct: 89,
    totalSuites: 82,
    nightlyRate: 1450,
    trend: 'up' as const,
    description: 'Oman Musandam Peninsula luxury resort with 82 pool villas, paragliding arrival experience and award-winning spa wellness programs',
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

export function ResortSpaWellnessMonitor() {
  const state = useMapStore((s) => s.resortSpaWellness)
  const setState = useMapStore((s) => s.setResortSpaWellness)

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
    if (filteredData.length === 0) return { avgOcc: '0', totalSuites: 0, avgRate: 0 }
    const avgOcc = filteredData.reduce((s: number, d: any) => s + (d.occupancyPct as number), 0) / filteredData.length
    const totalSuites = filteredData.reduce((s: number, d: any) => s + (d.totalSuites as number), 0)
    const avgRate = filteredData.reduce((s: number, d: any) => s + (d.nightlyRate as number), 0) / filteredData.length
    return {
      avgOcc: avgOcc.toFixed(0) + '%',
      totalSuites,
      avgRate: '$' + avgRate.toFixed(0),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-600 to-cyan-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129703;</span>
          <h3 className="text-sm font-semibold text-white">Resort Spa &amp; Wellness</h3>
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
            <div className="text-slate-400">Avg Occupancy</div>
            <div className="text-sm font-semibold text-white">{metrics.avgOcc}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Suites</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSuites}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Nightly</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Spa Revenue</div>
            <div className="text-sm font-semibold text-white">$2.4M/mo</div>
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
                <span className="text-xs text-slate-300">${loc.nightlyRate}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.occupancyPct}% occupancy, {activeItem.totalSuites} suites, ${activeItem.nightlyRate}/night</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
