'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dcp-grandethiopia',
    name: 'GERD Main Dam',
    lat: 11.21,
    lng: 35.3,
    status: 'warning',
    value: 84,
    progressPercent: 84,
    concretePoured: 12500000,
    turbinesInstalled: 11,
    workersOnSite: 12000,
    trend: 'up' as const,
    description: 'Grand Ethiopian Renaissance Dam on Blue Nile with main concrete section near completion and penstock installation underway for remaining 2 turbines',
  },
  {
    id: 'dcp-bakun',
    name: 'Bakun Dam Project',
    lat: 2.75,
    lng: 113.75,
    status: 'stable',
    value: 100,
    progressPercent: 100,
    concretePoured: 3800000,
    turbinesInstalled: 8,
    workersOnSite: 1800,
    trend: 'stable' as const,
    description: 'Malaysian Sarawak CFRD mega-dam on Balui River completed and commissioned with full 2400MW capacity feeding the SCORE industrial corridor',
  },
  {
    id: 'dcp-rogun',
    name: 'Rogun Dam Expansion',
    lat: 38.67,
    lng: 70.85,
    status: 'critical',
    value: 62,
    progressPercent: 62,
    concretePoured: 7800000,
    turbinesInstalled: 3,
    workersOnSite: 8500,
    trend: 'up' as const,
    description: 'Tajikistan Vakhsh River worlds tallest embankment dam at 335m with diversion tunnel phase complete and spillway excavation behind schedule',
  },
  {
    id: 'dcp-diamerbhasha',
    name: 'Diamer-Bhasha Dam',
    lat: 35.49,
    lng: 74.34,
    status: 'moderate',
    value: 28,
    progressPercent: 28,
    concretePoured: 2100000,
    turbinesInstalled: 0,
    workersOnSite: 6200,
    trend: 'stable' as const,
    description: 'Pakistan Indus River mega-project with 272m roller-compacted concrete structure in early stages facing funding constraints and land acquisition delays',
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

export function DamConstructionProgressMonitor() {
  const state = useMapStore((s) => s.damConstructionProgress)
  const setState = useMapStore((s) => s.setDamConstructionProgress)

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
    if (filteredData.length === 0) return { progressPercent: 0, concretePoured: 0, turbinesInstalled: 0, workersOnSite: 0 }
    const progressPercent = filteredData.reduce((s: number, d: any) => s + (d.progressPercent as number), 0) / filteredData.length
    const concretePoured = filteredData.reduce((s: number, d: any) => s + (d.concretePoured as number), 0)
    const turbinesInstalled = filteredData.reduce((s: number, d: any) => s + (d.turbinesInstalled as number), 0)
    const workersOnSite = filteredData.reduce((s: number, d: any) => s + (d.workersOnSite as number), 0)
    return {
      progressPercent: progressPercent.toFixed(0) + '%',
      concretePoured: (concretePoured / 1000000).toFixed(1) + 'M m3',
      turbinesInstalled: turbinesInstalled.toLocaleString(),
      workersOnSite: workersOnSite.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-cyan-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9987;</span>
          <h3 className="text-sm font-semibold text-white">Dam Construction Progress</h3>
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
            <div className="text-slate-400">Avg Progress</div>
            <div className="text-sm font-semibold text-white">{metrics.progressPercent}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Concrete Poured</div>
            <div className="text-sm font-semibold text-white">{metrics.concretePoured}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Turbines Installed</div>
            <div className="text-sm font-semibold text-white">{metrics.turbinesInstalled}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Workers On Site</div>
            <div className="text-sm font-semibold text-white">{metrics.workersOnSite}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}%</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()}% construction complete</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
