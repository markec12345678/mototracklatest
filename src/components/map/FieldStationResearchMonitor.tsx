'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'fs-mcmurdo',
    name: 'McMurdo Antarctica',
    lat: -77.8419,
    lng: 166.6863,
    status: 'critical',
    value: 14,
    projects: 14,
    researchers: 240,
    dataPoints: 8.4,
    uptime: 62,
    trend: 'down' as const,
    description: 'Offline winter conditions with satellite link degraded and several automated stations unresponsive',
  },
  {
    id: 'fs-barrow',
    name: 'Barrow Alaska',
    lat: 71.2906,
    lng: -156.7886,
    status: 'warning',
    value: 22,
    projects: 22,
    researchers: 84,
    dataPoints: 5.1,
    uptime: 78,
    trend: 'stable' as const,
    description: 'Limited operations during polar night with reduced flights and constrained atmospheric sampling',
  },
  {
    id: 'fs-manaus',
    name: 'Amazon Manaus',
    lat: -3.119,
    lng: -60.0217,
    status: 'moderate',
    value: 38,
    projects: 38,
    researchers: 152,
    dataPoints: 14.6,
    uptime: 94,
    trend: 'up' as const,
    description: 'Operational with active biodiversity and climate flux monitoring across canopy tower network',
  },
  {
    id: 'fs-svalbard',
    name: 'Svalbard',
    lat: 78.2232,
    lng: 15.6267,
    status: 'stable',
    value: 46,
    projects: 46,
    researchers: 198,
    dataPoints: 21.3,
    uptime: 99,
    trend: 'up' as const,
    description: 'Optimal performance with seed vault and Arctic observatory running at full telemetry uptime',
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

export function FieldStationResearchMonitor() {
  const state = useMapStore((s) => s.fieldStationResearch)
  const setState = useMapStore((s) => s.setFieldStationResearch)

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
    if (filteredData.length === 0) return { totalProjects: 0, totalResearchers: 0, totalData: 0, avgUptime: 0 }
    const totalProjects = filteredData.reduce((s: number, d: any) => s + (d.projects as number), 0)
    const totalResearchers = filteredData.reduce((s: number, d: any) => s + (d.researchers as number), 0)
    const totalData = filteredData.reduce((s: number, d: any) => s + (d.dataPoints as number), 0)
    const avgUptime = filteredData.reduce((s: number, d: any) => s + (d.uptime as number), 0) / filteredData.length
    return {
      totalProjects: totalProjects.toLocaleString(),
      totalResearchers: totalResearchers.toLocaleString(),
      totalData: totalData.toFixed(1),
      avgUptime: avgUptime.toFixed(1),
    }
  }, [filteredData])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const activeItem: any = state.activeItemId
    ? state.data.find((d: any) => d.id === state.activeItemId)
    : filteredData[0]

  return (
    <Card className="fixed right-4 top-16 z-[60] w-[340px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-slate-900/95 border-slate-700 text-slate-100 backdrop-blur-md">
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-emerald-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">📐</span>
          <h3 className="text-sm font-semibold text-white">Field Station Research Monitor</h3>
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
            <div className="text-slate-400">Active Projects</div>
            <div className="text-sm font-semibold text-white">{metrics.totalProjects}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Researchers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalResearchers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Data Points M</div>
            <div className="text-sm font-semibold text-white">{metrics.totalData}M</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Uptime %</div>
            <div className="text-sm font-semibold text-white">{metrics.avgUptime}%</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} projects</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
