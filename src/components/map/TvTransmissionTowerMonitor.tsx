'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tv-empire',
    name: 'Empire State NYC',
    lat: 40.7484,
    lng: -73.9857,
    status: 'critical',
    value: 0,
    channelsBroadcasting: 0,
    signalPowerKw: 0,
    coverageAreaKm2: 0,
    viewersM: 0,
    trend: 'down' as const,
    description: 'Total signal loss across all digital multiplexes leaving metro viewers without broadcast service',
  },
  {
    id: 'tv-skytree',
    name: 'Tokyo Skytree',
    lat: 35.7101,
    lng: 139.8107,
    status: 'warning',
    value: 14,
    channelsBroadcasting: 14,
    signalPowerKw: 8.5,
    coverageAreaKm2: 9400,
    viewersM: 18.2,
    trend: 'down' as const,
    description: 'Degraded ISDB-T signal with multiplex errors affecting reception in outer Kanto region',
  },
  {
    id: 'tv-cntower',
    name: 'CN Tower Toronto',
    lat: 43.6426,
    lng: -79.3871,
    status: 'moderate',
    value: 22,
    channelsBroadcasting: 22,
    signalPowerKw: 12.4,
    coverageAreaKm2: 12800,
    viewersM: 9.6,
    trend: 'stable' as const,
    description: 'Normal ATSC broadcast operations with steady viewership across the Golden Horseshoe',
  },
  {
    id: 'tv-ostankino',
    name: 'Ostankino Moscow',
    lat: 55.8192,
    lng: 37.6108,
    status: 'stable',
    value: 28,
    channelsBroadcasting: 28,
    signalPowerKw: 15.2,
    coverageAreaKm2: 16200,
    viewersM: 14.1,
    trend: 'up' as const,
    description: 'Optimal DVB-T2 transmission with full multiplex coverage reaching the entire Moscow region',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function TvTransmissionTowerMonitor() {
  const state = useMapStore((s) => s.tvTransmissionTower)
  const setState = useMapStore((s) => s.setTvTransmissionTower)

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
    if (filteredData.length === 0)
      return { channelsBroadcasting: 0, signalPowerKw: 0, coverageAreaKm2: 0, viewersM: 0 }
    const channelsBroadcasting = filteredData.reduce((s: number, d: any) => s + (d.channelsBroadcasting as number), 0)
    const signalPowerKw = filteredData.reduce((s: number, d: any) => s + (d.signalPowerKw as number), 0)
    const coverageAreaKm2 = filteredData.reduce((s: number, d: any) => s + (d.coverageAreaKm2 as number), 0)
    const viewersM = filteredData.reduce((s: number, d: any) => s + (d.viewersM as number), 0)
    return {
      channelsBroadcasting: channelsBroadcasting.toLocaleString(),
      signalPowerKw: signalPowerKw.toFixed(1) + ' kW',
      coverageAreaKm2: coverageAreaKm2.toLocaleString() + ' km2',
      viewersM: viewersM.toFixed(1) + ' M',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-500 to-pink-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">📺</span>
          <h3 className="text-sm font-semibold text-white">TV Transmission Tower Monitor</h3>
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
            <div className="text-slate-400">Channels Broadcasting</div>
            <div className="text-sm font-semibold text-white">{metrics.channelsBroadcasting}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Signal Power kW</div>
            <div className="text-sm font-semibold text-white">{metrics.signalPowerKw}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Coverage Area km2</div>
            <div className="text-sm font-semibold text-white">{metrics.coverageAreaKm2}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Viewers M</div>
            <div className="text-sm font-semibold text-white">{metrics.viewersM}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} channels broadcasting</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
