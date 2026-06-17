'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'br-sharpfade',
    name: 'SharpFade Brooklyn NYC',
    lat: 40.678,
    lng: -73.945,
    status: 'stable',
    value: 91,
    cutsPerDay: 68,
    barbersOnDuty: 4,
    walkInWaitMin: 22,
    trend: 'up' as const,
    description: 'Brooklyn hipster barbershop with classic fades, hot towel shaves and 4 master barbers serving 68 customers daily',
  },
  {
    id: 'br-fellowbarber',
    name: 'Fellow Barber San Francisco',
    lat: 37.76,
    lng: -122.434,
    status: 'stable',
    value: 87,
    cutsPerDay: 55,
    barbersOnDuty: 3,
    walkInWaitMin: 28,
    trend: 'stable' as const,
    description: 'Mission District Fellow Barber location offering classic cuts, beard trims and straight razor shaves since 2009',
  },
  {
    id: 'br-blindbarber',
    name: 'Blind Barber Chicago',
    lat: 41.894,
    lng: -87.637,
    status: 'moderate',
    value: 76,
    cutsPerDay: 42,
    barbersOnDuty: 3,
    walkInWaitMin: 35,
    trend: 'stable' as const,
    description: 'Chicago speakeasy-style barbershop with hidden cocktail lounge in back serving 42 cuts daily with 3 barbers',
  },
  {
    id: 'br-ruffians',
    name: 'Ruffians London Shoreditch',
    lat: 51.522,
    lng: -0.081,
    status: 'warning',
    value: 64,
    cutsPerDay: 35,
    barbersOnDuty: 2,
    walkInWaitMin: 45,
    trend: 'down' as const,
    description: 'Shoreditch Ruffians barbershop impacted by reduced staffing with longer wait times and reduced daily capacity',
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

export function BarberShopClassicMonitor() {
  const state = useMapStore((s) => s.barberShopClassic)
  const setState = useMapStore((s) => s.setBarberShopClassic)

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
    if (filteredData.length === 0) return { totalCuts: 0, totalBarbers: 0, avgWait: '0m', avgPerBarber: '0' }
    const totalCuts = filteredData.reduce((s: number, d: any) => s + (d.cutsPerDay as number), 0)
    const totalBarbers = filteredData.reduce((s: number, d: any) => s + (d.barbersOnDuty as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.walkInWaitMin as number), 0) / filteredData.length
    const avgPerBarber = totalBarbers > 0 ? totalCuts / totalBarbers : 0
    return {
      totalCuts,
      totalBarbers,
      avgWait: avgWait.toFixed(0) + 'm',
      avgPerBarber: avgPerBarber.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-700 to-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128136;</span>
          <h3 className="text-sm font-semibold text-white">Barber Shop Classic</h3>
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
            <div className="text-slate-400">Cuts / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCuts}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Barbers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBarbers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Walk-in Wait</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cuts / barber</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPerBarber}</div>
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
                <span className="text-xs text-slate-300">{loc.cutsPerDay}/day</span>
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
              <span className="text-slate-300 font-medium">{activeItem.cutsPerDay} cuts/day, {activeItem.barbersOnDuty} barbers, {activeItem.walkInWaitMin}m walk-in wait</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
