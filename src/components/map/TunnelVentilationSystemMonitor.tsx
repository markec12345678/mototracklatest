'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tvs-gotthard',
    name: 'Gotthard Base Tunnel',
    lat: 46.55,
    lng: 8.78,
    status: 'warning',
    value: 620,
    airVelocity: 620,
    coLevel: 8,
    visibility: 92,
    fanUnitsActive: 18,
    trend: 'stable' as const,
    description: 'Swiss 57km rail tunnel ventilation system managing diesel locomotive exhaust during maintenance window with reversible jet fans in operation',
  },
  {
    id: 'tvs-eurotunnel',
    name: 'Channel Tunnel',
    lat: 50.92,
    lng: 1.28,
    status: 'stable',
    value: 540,
    airVelocity: 540,
    coLevel: 3,
    visibility: 98,
    fanUnitsActive: 14,
    trend: 'down' as const,
    description: 'France-UK 50km undersea rail tunnel with cross-passage piston effect and four main ventilation plants maintaining clean air for Le Shuttle operations',
  },
  {
    id: 'tvs-laerdal',
    name: 'Lardal Tunnel',
    lat: 61.08,
    lng: 7.48,
    status: 'moderate',
    value: 380,
    airVelocity: 380,
    coLevel: 12,
    visibility: 84,
    fanUnitsActive: 9,
    trend: 'up' as const,
    description: 'Norwegian 24.5km road tunnel on E16 using three large caverns for air purification and driver rest breaks with longitudinal ventilation',
  },
  {
    id: 'tvs-tomohiro',
    name: 'Yamate Tunnel',
    lat: 35.68,
    lng: 139.74,
    status: 'critical',
    value: 720,
    airVelocity: 720,
    coLevel: 18,
    visibility: 71,
    fanUnitsActive: 24,
    trend: 'up' as const,
    description: 'Tokyo 18.2km urban expressway tunnel under heavy rush hour load with electrostatic precipitators at maximum capacity to filter diesel particulate',
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

export function TunnelVentilationSystemMonitor() {
  const state = useMapStore((s) => s.tunnelVentilationSystem)
  const setState = useMapStore((s) => s.setTunnelVentilationSystem)

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
    if (filteredData.length === 0) return { airVelocity: 0, coLevel: 0, visibility: 0, fanUnitsActive: 0 }
    const airVelocity = filteredData.reduce((s: number, d: any) => s + (d.airVelocity as number), 0) / filteredData.length
    const coLevel = filteredData.reduce((s: number, d: any) => s + (d.coLevel as number), 0) / filteredData.length
    const visibility = filteredData.reduce((s: number, d: any) => s + (d.visibility as number), 0) / filteredData.length
    const fanUnitsActive = filteredData.reduce((s: number, d: any) => s + (d.fanUnitsActive as number), 0)
    return {
      airVelocity: airVelocity.toFixed(0) + ' m/min',
      coLevel: coLevel.toFixed(1) + ' ppm',
      visibility: visibility.toFixed(0) + '%',
      fanUnitsActive: fanUnitsActive.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-600 to-stone-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128682;</span>
          <h3 className="text-sm font-semibold text-white">Tunnel Ventilation System</h3>
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
            <div className="text-slate-400">Avg Air Velocity</div>
            <div className="text-sm font-semibold text-white">{metrics.airVelocity}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg CO Level</div>
            <div className="text-sm font-semibold text-white">{metrics.coLevel}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Visibility</div>
            <div className="text-sm font-semibold text-white">{metrics.visibility}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Active Fans</div>
            <div className="text-sm font-semibold text-white">{metrics.fanUnitsActive}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} m/min air velocity</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
