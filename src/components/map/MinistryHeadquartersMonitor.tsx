'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mh-pentagon',
    name: 'The Pentagon',
    lat: 38.87,
    lng: -77.06,
    status: 'stable',
    value: 26700,
    employeesOnSite: 26700,
    floorsTotal: 7,
    dailyVisitors: 4000,
    securityLevel: 'high',
    trend: 'stable' as const,
    description: 'US DoD headquarters with 26,700 employees and 4,000 daily visitors across 7 floors, world largest office building by floor area',
  },
  {
    id: 'mh-whitehall',
    name: 'Whitehall MoD Main Building',
    lat: 51.5,
    lng: -0.13,
    status: 'stable',
    value: 3300,
    employeesOnSite: 3300,
    floorsTotal: 6,
    dailyVisitors: 320,
    securityLevel: 'high',
    trend: 'stable' as const,
    description: 'UK Ministry of Defence headquarters on Whitehall, 3,300 staff coordinating UK armed forces and defence policy',
  },
  {
    id: 'mh-quai',
    name: 'Quai d Orsay Paris',
    lat: 48.86,
    lng: 2.32,
    status: 'moderate',
    value: 1800,
    employeesOnSite: 1800,
    floorsTotal: 5,
    dailyVisitors: 280,
    securityLevel: 'high',
    trend: 'up' as const,
    description: 'French Ministry of Europe and Foreign Affairs on Quai d Orsay, 1,800 staff managing French diplomatic network',
  },
  {
    id: 'mh-ndrc',
    name: 'NDRC Beijing',
    lat: 39.91,
    lng: 116.4,
    status: 'warning',
    value: 2400,
    employeesOnSite: 2400,
    floorsTotal: 8,
    dailyVisitors: 510,
    securityLevel: 'high',
    trend: 'down' as const,
    description: 'China National Development and Reform Commission on Chang An Avenue, 2,400 staff directing macroeconomic planning',
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

export function MinistryHeadquartersMonitor() {
  const state = useMapStore((s) => s.ministryHeadquarters)
  const setState = useMapStore((s) => s.setMinistryHeadquarters)

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
    if (filteredData.length === 0) return { employeesOnSite: 0, floorsTotal: 0, dailyVisitors: 0 }
    const employeesOnSite = filteredData.reduce((s: number, d: any) => s + (d.employeesOnSite as number), 0)
    const floorsTotal = filteredData.reduce((s: number, d: any) => s + (d.floorsTotal as number), 0)
    const dailyVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    return {
      employeesOnSite: employeesOnSite.toLocaleString(),
      floorsTotal: floorsTotal.toLocaleString(),
      dailyVisitors: dailyVisitors.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-600 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127970;</span>
          <h3 className="text-sm font-semibold text-white">Ministry Headquarters</h3>
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
            <div className="text-slate-400">On-Site Employees</div>
            <div className="text-sm font-semibold text-white">{metrics.employeesOnSite}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Floors</div>
            <div className="text-sm font-semibold text-white">{metrics.floorsTotal}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Security Level</div>
            <div className="text-sm font-semibold text-white">High</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000).toFixed(1)}k</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} employees, {activeItem.floorsTotal} floors, {activeItem.dailyVisitors} visitors/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
