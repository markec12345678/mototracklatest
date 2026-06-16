'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sls-starlink',
    name: 'Starlink Group 7-12',
    lat: 28.4,
    lng: -80.6,
    status: 'warning',
    value: 22,
    satellitesInPayload: 22,
    targetOrbit: 550,
    launchWindow: '2024-03-15 04:32 UTC',
    confidenceLevel: 88,
    trend: 'up' as const,
    description: 'SpaceX Falcon 9 launching 22 v2 Mini Starlink satellites to low Earth orbit from SLC-40 with booster recovery on drone ship A Shortfall of Gravitas',
  },
  {
    id: 'sls-oneweb',
    name: 'OneWeb Flight 19',
    lat: 45.96,
    lng: 63.31,
    status: 'moderate',
    value: 36,
    satellitesInPayload: 36,
    targetOrbit: 1200,
    launchWindow: '2024-03-22 09:15 UTC',
    confidenceLevel: 74,
    trend: 'stable' as const,
    description: 'Soyuz 2.1b launching 36 OneWeb broadband satellites to polar LEO from Baikonur with separations over the Indian Ocean',
  },
  {
    id: 'sls-gpsiii',
    name: 'GPS III-7 Magellan',
    lat: 28.57,
    lng: -80.65,
    status: 'stable',
    value: 1,
    satellitesInPayload: 1,
    targetOrbit: 20180,
    launchWindow: '2024-04-08 13:20 UTC',
    confidenceLevel: 95,
    trend: 'down' as const,
    description: 'United Launch Alliance Atlas V 551 launching US Space Force GPS III SV07 navigation satellite to medium Earth orbit from SLC-41',
  },
  {
    id: 'sls-pslv',
    name: 'PSLV-C55 TeLEOS-2',
    lat: 13.72,
    lng: 80.23,
    status: 'critical',
    value: 7,
    satellitesInPayload: 7,
    targetOrbit: 580,
    launchWindow: '2024-03-30 02:45 UTC',
    confidenceLevel: 67,
    trend: 'up' as const,
    description: 'ISRO PSLV-CA launching Singapore TeLEOS-2 SAR earth observation satellite and six secondary payloads from Satish Dhawan Space Centre',
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

export function SatelliteLaunchScheduleMonitor() {
  const state = useMapStore((s) => s.satelliteLaunchSchedule)
  const setState = useMapStore((s) => s.setSatelliteLaunchSchedule)

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
    if (filteredData.length === 0) return { satellitesInPayload: 0, targetOrbit: 0, confidenceLevel: 0, upcomingCount: 0 }
    const satellitesInPayload = filteredData.reduce((s: number, d: any) => s + (d.satellitesInPayload as number), 0)
    const targetOrbit = filteredData.reduce((s: number, d: any) => s + (d.targetOrbit as number), 0) / filteredData.length
    const confidenceLevel = filteredData.reduce((s: number, d: any) => s + (d.confidenceLevel as number), 0) / filteredData.length
    return {
      satellitesInPayload: satellitesInPayload.toLocaleString(),
      targetOrbit: targetOrbit.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' km',
      confidenceLevel: confidenceLevel.toFixed(0) + '%',
      upcomingCount: filteredData.length.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-500 to-pink-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128752;</span>
          <h3 className="text-sm font-semibold text-white">Satellite Launch Schedule</h3>
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
            <div className="text-slate-400">Satellites Queued</div>
            <div className="text-sm font-semibold text-white">{metrics.satellitesInPayload}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Target Orbit</div>
            <div className="text-sm font-semibold text-white">{metrics.targetOrbit}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Confidence</div>
            <div className="text-sm font-semibold text-white">{metrics.confidenceLevel}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Upcoming Launches</div>
            <div className="text-sm font-semibold text-white">{metrics.upcomingCount}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} satellites in manifest</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
