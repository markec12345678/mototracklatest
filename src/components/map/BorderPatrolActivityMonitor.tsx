'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bp-sanysidro',
    name: 'US-Mexico San Diego',
    lat: 32.5489,
    lng: -117.03,
    status: 'critical',
    value: 850,
    crossingsPerHr: 850,
    agentsDeployed: 4200,
    apprehensions: 320,
    waitTimeMin: 180,
    trend: 'up' as const,
    description: 'Surge at San Ysidro with sustained crossings, heavy apprehensions and multi-hour vehicle wait times',
  },
  {
    id: 'bp-detroit',
    name: 'US-Canada Detroit',
    lat: 42.3314,
    lng: -82.957,
    status: 'warning',
    value: 320,
    crossingsPerHr: 320,
    agentsDeployed: 1100,
    apprehensions: 45,
    waitTimeMin: 60,
    trend: 'up' as const,
    description: 'Ambassador Bridge and tunnel corridors experiencing elevated commercial traffic and scrutiny',
  },
  {
    id: 'bp-schengen',
    name: 'EU Schengen Paris',
    lat: 48.8566,
    lng: 2.3522,
    status: 'moderate',
    value: 540,
    crossingsPerHr: 540,
    agentsDeployed: 800,
    apprehensions: 28,
    waitTimeMin: 25,
    trend: 'stable' as const,
    description: 'Free-movement zone operating with routine passport checks and steady passenger throughput',
  },
  {
    id: 'bp-wagah',
    name: 'India-Pakistan Wagah',
    lat: 31.61,
    lng: 74.573,
    status: 'stable',
    value: 40,
    crossingsPerHr: 40,
    agentsDeployed: 180,
    apprehensions: 4,
    waitTimeMin: 90,
    trend: 'down' as const,
    description: 'Ceremonial border crossing at reduced tempo with limited pedestrian and cargo movement',
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

export function BorderPatrolActivityMonitor() {
  const state = useMapStore((s) => s.borderPatrolActivity)
  const setState = useMapStore((s) => s.setBorderPatrolActivity)

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
      return { crossingsPerHr: 0, agentsDeployed: 0, apprehensions: 0, waitTimeMin: 0 }
    const crossingsPerHr = filteredData.reduce((s: number, d: any) => s + (d.crossingsPerHr as number), 0)
    const agentsDeployed = filteredData.reduce((s: number, d: any) => s + (d.agentsDeployed as number), 0)
    const apprehensions = filteredData.reduce((s: number, d: any) => s + (d.apprehensions as number), 0)
    const waitTimeMin =
      filteredData.reduce((s: number, d: any) => s + (d.waitTimeMin as number), 0) / filteredData.length
    return {
      crossingsPerHr: crossingsPerHr.toLocaleString(),
      agentsDeployed: agentsDeployed.toLocaleString(),
      apprehensions: apprehensions.toLocaleString(),
      waitTimeMin: waitTimeMin.toFixed(0) + ' min',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛂</span>
          <h3 className="text-sm font-semibold text-white">Border Patrol Activity Monitor</h3>
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
            <div className="text-slate-400">Crossings/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.crossingsPerHr}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Agents Deployed</div>
            <div className="text-sm font-semibold text-white">{metrics.agentsDeployed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Apprehensions</div>
            <div className="text-sm font-semibold text-white">{metrics.apprehensions}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Wait Time min</div>
            <div className="text-sm font-semibold text-white">{metrics.waitTimeMin}</div>
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
              <span className="text-slate-300 font-medium">
                {activeItem.value.toLocaleString()} crossings/hr
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
