'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'hs-wombat',
    name: 'Wombats City Hostel Berlin',
    lat: 52.509,
    lng: 13.463,
    status: 'stable',
    value: 87,
    occupancyPct: 87,
    totalBeds: 320,
    nightlyRate: 28,
    trend: 'up' as const,
    description: 'Friedrichshain budget hostel near East Side Gallery with 320 beds, rooftop bar and free walking tours',
  },
  {
    id: 'hs-generator',
    name: 'Generator London',
    lat: 51.526,
    lng: -0.124,
    status: 'moderate',
    value: 74,
    occupancyPct: 74,
    totalBeds: 870,
    nightlyRate: 35,
    trend: 'stable' as const,
    description: 'Russell Square design hostel with 870 beds, 24-hour bar and cafe serving international backpacker community',
  },
  {
    id: 'hs-st-christophers',
    name: 'St Christophers Amsterdam',
    lat: 52.370,
    lng: 4.895,
    status: 'warning',
    value: 62,
    occupancyPct: 62,
    totalBeds: 184,
    nightlyRate: 42,
    trend: 'down' as const,
    description: 'Amsterdam canal belt hostel with 184 beds facing increased competition from vacation rental platforms',
  },
  {
    id: 'hs-jazzhostels',
    name: 'Jazz Hostel Barcelona',
    lat: 41.382,
    lng: 2.177,
    status: 'stable',
    value: 91,
    occupancyPct: 91,
    totalBeds: 156,
    nightlyRate: 31,
    trend: 'up' as const,
    description: 'Gothic Quarter social hostel with 156 beds, nightly jazz sessions and rooftop terrace near Las Ramblas',
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

export function HostelBackpackerMonitor() {
  const state = useMapStore((s) => s.hostelBackpacker)
  const setState = useMapStore((s) => s.setHostelBackpacker)

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
    if (filteredData.length === 0) return { avgOcc: '0', totalBeds: 0, avgRate: 0 }
    const avgOcc = filteredData.reduce((s: number, d: any) => s + (d.occupancyPct as number), 0) / filteredData.length
    const totalBeds = filteredData.reduce((s: number, d: any) => s + (d.totalBeds as number), 0)
    const avgRate = filteredData.reduce((s: number, d: any) => s + (d.nightlyRate as number), 0) / filteredData.length
    return {
      avgOcc: avgOcc.toFixed(0) + '%',
      totalBeds,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-600 to-amber-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127881;</span>
          <h3 className="text-sm font-semibold text-white">Hostel &amp; Backpacker</h3>
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
            <div className="text-slate-400">Total Beds</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBeds}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Rate</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Stay</div>
            <div className="text-sm font-semibold text-white">2.8 nights</div>
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
              <span className="text-slate-300 font-medium">{activeItem.occupancyPct}% occupancy, {activeItem.totalBeds} beds, ${activeItem.nightlyRate}/night</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
