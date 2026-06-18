'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fd-hbloom',
    name: 'HBloom New York NYC',
    lat: 40.728,
    lng: -73.997,
    status: 'stable',
    value: 89,
    weeklyEvents: 42,
    avgEventBudget: 8500,
    designersOnStaff: 18,
    designStyles: 'Modern Organic, Garden Romantic, Minimalist',
    trend: 'up' as const,
    description: 'HBloom NYC subscription and event florist, 42 weekly events averaging $8,500 with team of 18 designers specializing in modern organic style',
  },
  {
    id: 'fd-preston',
    name: 'Preston Bailey Productions NYC',
    lat: 40.758,
    lng: -73.985,
    status: 'stable',
    value: 95,
    weeklyEvents: 8,
    avgEventBudget: 125000,
    designersOnStaff: 35,
    designStyles: 'Lavish, Architectural, Fantasy',
    trend: 'stable' as const,
    description: 'Preston Bailey Productions luxury event florist, 8 weekly productions with $125k average budget for celebrity weddings and corporate galas',
  },
  {
    id: 'fd-joshua',
    name: 'Joshua Center For Flowers Los Angeles',
    lat: 34.090,
    lng: -118.361,
    status: 'moderate',
    value: 74,
    weeklyEvents: 24,
    avgEventBudget: 4200,
    designersOnStaff: 12,
    designStyles: 'California Native, Wildflower, Boho',
    trend: 'stable' as const,
    description: 'Joshua Center For Flowers LA boutique event studio, 24 weekly events with California-native and wildflower-forward aesthetic',
  },
  {
    id: 'fd-twigg',
    name: 'Twigg Studios San Francisco',
    lat: 37.765,
    lng: -122.410,
    status: 'warning',
    value: 61,
    weeklyEvents: 16,
    avgEventBudget: 3200,
    designersOnStaff: 8,
    designStyles: 'Botanical, Foraged, Sustainable',
    trend: 'down' as const,
    description: 'Twigg Studios SF sustainable florist, 16 weekly events facing reduced corporate event bookings with $3,200 avg budget and foraged botanical style',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function FloralDesignStudioMonitor() {
  const state = useMapStore((s) => s.floralDesignStudio)
  const setState = useMapStore((s) => s.setFloralDesignStudio)

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
    if (filteredData.length === 0) return { totalEvents: 0, totalBudget: 0, totalDesigners: 0 }
    const totalEvents = filteredData.reduce((s: number, d: any) => s + (d.weeklyEvents as number), 0)
    const totalBudget = filteredData.reduce((s: number, d: any) => s + (d.avgEventBudget as number), 0)
    const totalDesigners = filteredData.reduce((s: number, d: any) => s + (d.designersOnStaff as number), 0)
    return { totalEvents, totalBudget, totalDesigners }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-fuchsia-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127804;</span>
          <h3 className="text-sm font-semibold text-white">Floral Design Studio</h3>
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
            <div className="text-slate-400">Weekly Events</div>
            <div className="text-sm font-semibold text-white">{metrics.totalEvents}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Event Budget</div>
            <div className="text-sm font-semibold text-white">${(metrics.totalBudget / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Designers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalDesigners}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Studios</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.designStyles}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.avgEventBudget / 1000).toFixed(0)}k</span>
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
              {activeItem.weeklyEvents} events/week &middot; ${activeItem.avgEventBudget.toLocaleString()} avg budget
              &nbsp;&middot;&nbsp; {activeItem.designersOnStaff} designers
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
