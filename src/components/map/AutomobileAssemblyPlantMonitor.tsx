'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ap-toyota',
    name: 'Toyota Tsutsumi Plant',
    lat: 35.08,
    lng: 137.16,
    status: 'stable',
    value: 720,
    vehiclesPerDay: 720,
    evShare: 38,
    cycleTime: 58,
    oee: 88,
    trend: 'up' as const,
    description: 'Toyota City mother plant producing Crown and bZ4X with mixed ICE/EV line, lean TPS rolling chassis and just-in-sequence parts delivery',
  },
  {
    id: 'ap-vw',
    name: 'VW Wolfsburg',
    lat: 52.43,
    lng: 10.79,
    status: 'warning',
    value: 3400,
    vehiclesPerDay: 3400,
    evShare: 14,
    cycleTime: 62,
    oee: 76,
    trend: 'down' as const,
    description: 'Largest single-car plant in Europe running Golf and ID.3 production but EV ramp slowed by battery supply and software platform delays',
  },
  {
    id: 'ap-tesla',
    name: 'Tesla Fremont Factory',
    lat: 37.49,
    lng: -121.94,
    status: 'moderate',
    value: 2100,
    vehiclesPerDay: 2100,
    evShare: 100,
    cycleTime: 45,
    oee: 81,
    trend: 'up' as const,
    description: 'California ex-NUMMI plant building Model 3 / Y at high line speed with giga-pressing casting, monosigma quality and 100% electric output',
  },
  {
    id: 'ap-hyundai',
    name: 'Hyundai Ulsan Complex',
    lat: 35.55,
    lng: 129.32,
    status: 'stable',
    value: 5600,
    vehiclesPerDay: 5600,
    evShare: 22,
    cycleTime: 53,
    oee: 90,
    trend: 'up' as const,
    description: 'Korean mega-assembly complex with five independent plants on one site, exporting Ioniq EV and Santa Fe to 200+ countries from dedicated port',
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

export function AutomobileAssemblyPlantMonitor() {
  const state = useMapStore((s) => s.automobileAssemblyPlant)
  const setState = useMapStore((s) => s.setAutomobileAssemblyPlant)

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
    if (filteredData.length === 0) return { vehiclesPerDay: 0, evShare: 0, cycleTime: 0, oee: 0 }
    const vehiclesPerDay = filteredData.reduce((s: number, d: any) => s + (d.vehiclesPerDay as number), 0)
    const evShare = filteredData.reduce((s: number, d: any) => s + (d.evShare as number), 0) / filteredData.length
    const cycleTime = filteredData.reduce((s: number, d: any) => s + (d.cycleTime as number), 0) / filteredData.length
    const oee = filteredData.reduce((s: number, d: any) => s + (d.oee as number), 0) / filteredData.length
    return {
      vehiclesPerDay: vehiclesPerDay.toLocaleString() + ' / d',
      evShare: evShare.toFixed(0) + '%',
      cycleTime: cycleTime.toFixed(0) + ' s',
      oee: oee.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-600 to-orange-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128663;</span>
          <h3 className="text-sm font-semibold text-white">Auto Assembly Plant</h3>
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
            <div className="text-slate-400">Vehicles / Day</div>
            <div className="text-sm font-semibold text-white">{metrics.vehiclesPerDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg EV Share</div>
            <div className="text-sm font-semibold text-white">{metrics.evShare}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Cycle Time</div>
            <div className="text-sm font-semibold text-white">{metrics.cycleTime}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg OEE</div>
            <div className="text-sm font-semibold text-white">{metrics.oee}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()} / d</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} vehicles assembled per day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
