'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ewr-capecod',
    name: 'PAVE PAWS Cape Cod',
    lat: 41.75,
    lng: -70.54,
    status: 'stable',
    value: 5500,
    detectionRangeKm: 5500,
    trackedObjects: 3200,
    falseAlarmRate: 0.4,
    uptimePercent: 96,
    trend: 'stable' as const,
    description: 'US AN/FPS-132 solid-state phased-array radar on Cape Cod providing ballistic missile early warning for Atlantic seaboard approaches',
  },
  {
    id: 'ewr-fylingdales',
    name: 'RAF Fylingdales',
    lat: 54.21,
    lng: -0.72,
    status: 'stable',
    value: 5500,
    detectionRangeKm: 5500,
    trackedObjects: 4100,
    falseAlarmRate: 0.3,
    uptimePercent: 98,
    trend: 'up' as const,
    description: 'UK BMEWS three-faced phased-array radar on North York Moors tracking ICBM launches and orbital debris for US Space Force',
  },
  {
    id: 'ewr-voronezh',
    name: 'Voronezh Radar Lekhtusi',
    lat: 60.27,
    lng: 29.65,
    status: 'warning',
    value: 6000,
    detectionRangeKm: 6000,
    trackedObjects: 2800,
    falseAlarmRate: 0.8,
    uptimePercent: 88,
    trend: 'down' as const,
    description: 'Russian Voronezh-M early-warning radar near St Petersburg covering Arctic and North Atlantic missile approaches, intermittent maintenance',
  },
  {
    id: 'ewr-shigaraki',
    name: 'JFPS-3 Shigaraki',
    lat: 34.81,
    lng: 136.1,
    status: 'moderate',
    value: 3200,
    detectionRangeKm: 3200,
    trackedObjects: 1900,
    falseAlarmRate: 0.5,
    uptimePercent: 94,
    trend: 'up' as const,
    description: 'Japanese Air Self-Defense Force FPS-5 anti-ballistic-missile radar covering East China Sea and Korean peninsula launch trajectories',
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

export function EarlyWarningRadarMonitor() {
  const state = useMapStore((s) => s.earlyWarningRadar)
  const setState = useMapStore((s) => s.setEarlyWarningRadar)

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
    if (filteredData.length === 0) return { detectionRangeKm: 0, trackedObjects: 0, falseAlarmRate: 0, uptimePercent: 0 }
    const detectionRangeKm = filteredData.reduce((s: number, d: any) => s + (d.detectionRangeKm as number), 0) / filteredData.length
    const trackedObjects = filteredData.reduce((s: number, d: any) => s + (d.trackedObjects as number), 0)
    const falseAlarmRate = filteredData.reduce((s: number, d: any) => s + (d.falseAlarmRate as number), 0) / filteredData.length
    const uptimePercent = filteredData.reduce((s: number, d: any) => s + (d.uptimePercent as number), 0) / filteredData.length
    return {
      detectionRangeKm: detectionRangeKm.toFixed(0) + ' km',
      trackedObjects: trackedObjects.toLocaleString(),
      falseAlarmRate: falseAlarmRate.toFixed(1) + '%',
      uptimePercent: uptimePercent.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-600 to-teal-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128225;</span>
          <h3 className="text-sm font-semibold text-white">Early Warning Radar</h3>
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
            <div className="text-slate-400">Avg Detection Range</div>
            <div className="text-sm font-semibold text-white">{metrics.detectionRangeKm}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Objects Tracked</div>
            <div className="text-sm font-semibold text-white">{metrics.trackedObjects}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">False Alarm Rate</div>
            <div className="text-sm font-semibold text-white">{metrics.falseAlarmRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Uptime</div>
            <div className="text-sm font-semibold text-white">{metrics.uptimePercent}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()} km</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} km detection range, {activeItem.trackedObjects.toLocaleString()} objects tracked</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
