'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pol-nypd',
    name: 'NYPD HQ NYC',
    lat: 40.7128,
    lng: -74.0014,
    status: 'critical',
    value: 3200,
    officersOnDuty: 3200,
    carsDeployed: 480,
    casesOpen: 1240,
    responseTimeMin: 14,
    trend: 'up' as const,
    description: 'Manhattan command at full deployment with all precincts reporting heavy caseloads and extended tour shifts',
  },
  {
    id: 'pol-scotlandyard',
    name: 'Scotland Yard London',
    lat: 51.4986,
    lng: -0.1414,
    status: 'warning',
    value: 1850,
    officersOnDuty: 1850,
    carsDeployed: 290,
    casesOpen: 620,
    responseTimeMin: 9,
    trend: 'up' as const,
    description: 'Metropolitan Service operating under heightened threat posture with surge patrols across central boroughs',
  },
  {
    id: 'pol-tokyompd',
    name: 'Tokyo MPD',
    lat: 35.6895,
    lng: 139.6917,
    status: 'moderate',
    value: 2100,
    officersOnDuty: 2100,
    carsDeployed: 220,
    casesOpen: 410,
    responseTimeMin: 6,
    trend: 'stable' as const,
    description: 'Steady deployment with routine neighborhood patrols and moderate case intake across wards',
  },
  {
    id: 'pol-rcmp',
    name: 'RCMP Ottawa',
    lat: 45.4215,
    lng: -75.6972,
    status: 'stable',
    value: 720,
    officersOnDuty: 720,
    carsDeployed: 95,
    casesOpen: 180,
    responseTimeMin: 11,
    trend: 'down' as const,
    description: 'Quiet shift with light call volume and standard detachment coverage across the capital region',
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

export function PoliceStationStatusMonitor() {
  const state = useMapStore((s) => s.policeStationStatus)
  const setState = useMapStore((s) => s.setPoliceStationStatus)

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
    if (filteredData.length === 0) return { officersOnDuty: 0, carsDeployed: 0, casesOpen: 0, responseTimeMin: 0 }
    const officersOnDuty = filteredData.reduce((s: number, d: any) => s + (d.officersOnDuty as number), 0)
    const carsDeployed = filteredData.reduce((s: number, d: any) => s + (d.carsDeployed as number), 0)
    const casesOpen = filteredData.reduce((s: number, d: any) => s + (d.casesOpen as number), 0)
    const responseTimeMin = filteredData.reduce((s: number, d: any) => s + (d.responseTimeMin as number), 0) / filteredData.length
    return {
      officersOnDuty: officersOnDuty.toLocaleString(),
      carsDeployed: carsDeployed.toLocaleString(),
      casesOpen: casesOpen.toLocaleString(),
      responseTimeMin: responseTimeMin.toFixed(1) + ' min',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">👮</span>
          <h3 className="text-sm font-semibold text-white">Police Station Status Monitor</h3>
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
            <div className="text-slate-400">Officers On Duty</div>
            <div className="text-sm font-semibold text-white">{metrics.officersOnDuty}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cars Deployed</div>
            <div className="text-sm font-semibold text-white">{metrics.carsDeployed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cases Open</div>
            <div className="text-sm font-semibold text-white">{metrics.casesOpen}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Response Time min</div>
            <div className="text-sm font-semibold text-white">{metrics.responseTimeMin}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} officers on duty</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
