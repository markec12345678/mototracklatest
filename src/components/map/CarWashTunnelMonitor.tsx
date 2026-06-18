'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cw-mister',
    name: 'Mr. Car Wash Houston',
    lat: 29.738,
    lng: -95.476,
    status: 'stable',
    value: 88,
    carsPerHour: 42,
    tunnelLengthM: 36,
    avgServiceMin: 18,
    trend: 'up' as const,
    description: 'Mr. Car Wash Houston flagship with 36-meter express tunnel processing 42 vehicles per hour and 18-min full-service detail',
  },
  {
    id: 'cw-zips',
    name: 'Zips Car Wash Dallas',
    lat: 32.897,
    lng: -97.041,
    status: 'stable',
    value: 84,
    carsPerHour: 38,
    tunnelLengthM: 30,
    avgServiceMin: 15,
    trend: 'stable' as const,
    description: 'Zips Car Wash Dallas location with unlimited wash club membership, 30m tunnel and express 15-min exterior wash',
  },
  {
    id: 'cw-tommy',
    name: 'Tommys Express Phoenix',
    lat: 33.448,
    lng: -112.074,
    status: 'moderate',
    value: 76,
    carsPerHour: 32,
    tunnelLengthM: 28,
    avgServiceMin: 20,
    trend: 'up' as const,
    description: 'Tommys Express Phoenix modern facility with app-based member recognition and 28m soft-cloth tunnel wash system',
  },
  {
    id: 'cw-supersplash',
    name: 'Super Splash Seattle',
    lat: 47.614,
    lng: -122.321,
    status: 'warning',
    value: 62,
    carsPerHour: 22,
    tunnelLengthM: 24,
    avgServiceMin: 25,
    trend: 'down' as const,
    description: 'Seattle Super Splash facing winter slowdown with reduced vehicle throughput and 25-min average service during rainy season',
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

export function CarWashTunnelMonitor() {
  const state = useMapStore((s) => s.carWashTunnel)
  const setState = useMapStore((s) => s.setCarWashTunnel)

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
    if (filteredData.length === 0) return { totalCars: 0, avgTunnel: '0m', avgService: '0m', peakCars: 0 }
    const totalCars = filteredData.reduce((s: number, d: any) => s + (d.carsPerHour as number), 0)
    const avgTunnel = filteredData.reduce((s: number, d: any) => s + (d.tunnelLengthM as number), 0) / filteredData.length
    const avgService = filteredData.reduce((s: number, d: any) => s + (d.avgServiceMin as number), 0) / filteredData.length
    const peakCars = Math.max(...filteredData.map((d: any) => d.carsPerHour as number))
    return {
      totalCars,
      avgTunnel: avgTunnel.toFixed(0) + 'm',
      avgService: avgService.toFixed(0) + 'm',
      peakCars,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-cyan-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128663;</span>
          <h3 className="text-sm font-semibold text-white">Car Wash Tunnel</h3>
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
            <div className="text-slate-400">Cars / hr</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCars}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Tunnel</div>
            <div className="text-sm font-semibold text-white">{metrics.avgTunnel}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Service</div>
            <div className="text-sm font-semibold text-white">{metrics.avgService}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Peak Location</div>
            <div className="text-sm font-semibold text-white">{metrics.peakCars}/hr</div>
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
                <span className="text-xs text-slate-300">{loc.carsPerHour}/hr</span>
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
              <span className="text-slate-300 font-medium">{activeItem.carsPerHour} cars/hr, {activeItem.tunnelLengthM}m tunnel, {activeItem.avgServiceMin}m service</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
