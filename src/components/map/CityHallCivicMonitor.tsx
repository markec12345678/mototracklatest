'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ch-nyc',
    name: 'NYC City Hall',
    lat: 40.71,
    lng: -74.01,
    status: 'stable',
    value: 325000,
    populationServed: 325000,
    dailyVisitors: 1100,
    servicesOnline: 184,
    permitApplicationsWeek: 740,
    trend: 'up' as const,
    description: 'New York City Hall serving 325,000 residents of Manhattan with 184 online services and 1,100 daily in-person visitors',
  },
  {
    id: 'ch-tokyo',
    name: 'Tokyo Metropolitan Gov',
    lat: 35.69,
    lng: 139.69,
    status: 'stable',
    value: 14000000,
    populationServed: 14000000,
    dailyVisitors: 2400,
    servicesOnline: 268,
    permitApplicationsWeek: 1820,
    trend: 'stable' as const,
    description: 'Tokyo Metropolitan Government building in Shinjuku serving 14M residents with 268 online services and 2,400 daily visitors',
  },
  {
    id: 'ch-paris',
    name: 'Hotel de Ville Paris',
    lat: 48.86,
    lng: 2.35,
    status: 'moderate',
    value: 2100000,
    populationServed: 2100000,
    dailyVisitors: 880,
    servicesOnline: 142,
    permitApplicationsWeek: 610,
    trend: 'up' as const,
    description: 'Paris City Hall serving 2.1M Parisians with 142 online services, ongoing civic marriage and civil registration appointments',
  },
  {
    id: 'ch-detroit',
    name: 'Detroit City Hall',
    lat: 42.33,
    lng: -83.05,
    status: 'warning',
    value: 670000,
    populationServed: 670000,
    dailyVisitors: 240,
    servicesOnline: 78,
    permitApplicationsWeek: 180,
    trend: 'down' as const,
    description: 'Detroit Coleman A Young Municipal Center serving 670k residents, legacy IT systems limiting online service availability',
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

export function CityHallCivicMonitor() {
  const state = useMapStore((s) => s.cityHallCivic)
  const setState = useMapStore((s) => s.setCityHallCivic)

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
    if (filteredData.length === 0) return { populationServed: 0, dailyVisitors: 0, servicesOnline: 0 }
    const populationServed = filteredData.reduce((s: number, d: any) => s + (d.populationServed as number), 0)
    const dailyVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    const servicesOnline = filteredData.reduce((s: number, d: any) => s + (d.servicesOnline as number), 0)
    return {
      populationServed: (populationServed / 1000000).toFixed(1) + 'M',
      dailyVisitors: dailyVisitors.toLocaleString(),
      servicesOnline: servicesOnline.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-cyan-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127963;</span>
          <h3 className="text-sm font-semibold text-white">City Hall Civic</h3>
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
            <div className="text-slate-400">Population Served</div>
            <div className="text-sm font-semibold text-white">{metrics.populationServed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Online Services</div>
            <div className="text-sm font-semibold text-white">{metrics.servicesOnline}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Population</div>
            <div className="text-sm font-semibold text-white">14M Tokyo</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(1)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} residents, {activeItem.servicesOnline} online services</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
