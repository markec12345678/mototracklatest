'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mpc-neom',
    name: 'NEOM Line Project',
    lat: 28.04,
    lng: 35.0,
    status: 'warning',
    value: 18,
    progressPercent: 18,
    workersOnSite: 48000,
    budgetSpent: 110000,
    timelineDelay: 14,
    trend: 'up' as const,
    description: 'Saudi Arabias 170km linear smart city megaproject under active excavation across the Tabuk desert with parallel infrastructure and foundation pours',
  },
  {
    id: 'mpc-grandcanal',
    name: 'Grand Canal Nicaragua',
    lat: 12.1,
    lng: -84.3,
    status: 'moderate',
    value: 7,
    progressPercent: 7,
    workersOnSite: 12000,
    budgetSpent: 28000,
    timelineDelay: 36,
    trend: 'stable' as const,
    description: 'Proposed inter-oceanic canal competing with Panama with Pacific-side earthworks paused awaiting environmental review and fresh capital injection',
  },
  {
    id: 'mpc-crossbay',
    name: 'Crossrail Elizabeth Line',
    lat: 51.51,
    lng: -0.13,
    status: 'stable',
    value: 96,
    progressPercent: 96,
    workersOnSite: 4200,
    budgetSpent: 18900,
    timelineDelay: 48,
    trend: 'up' as const,
    description: 'London east-west heavy rail tunnel system operational with remaining Bond Street and final station fit-out entering commissioning phase',
  },
  {
    id: 'mpc-threegorges',
    name: 'Three Gorges Dam Upgrade',
    lat: 30.82,
    lng: 111.0,
    status: 'critical',
    value: 88,
    progressPercent: 88,
    workersOnSite: 22000,
    budgetSpent: 31000,
    timelineDelay: 22,
    trend: 'up' as const,
    description: 'Yangtze mega-dam undergoing turbine generator expansion and spillway reinforcement with monsoon season constraints forcing tight scheduling',
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

export function MegaProjectConstructionMonitor() {
  const state = useMapStore((s) => s.megaProjectConstruction)
  const setState = useMapStore((s) => s.setMegaProjectConstruction)

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
    if (filteredData.length === 0) return { progressPercent: 0, workersOnSite: 0, budgetSpent: 0, timelineDelay: 0 }
    const progressPercent = filteredData.reduce((s: number, d: any) => s + (d.progressPercent as number), 0) / filteredData.length
    const workersOnSite = filteredData.reduce((s: number, d: any) => s + (d.workersOnSite as number), 0)
    const budgetSpent = filteredData.reduce((s: number, d: any) => s + (d.budgetSpent as number), 0)
    const timelineDelay = filteredData.reduce((s: number, d: any) => s + (d.timelineDelay as number), 0) / filteredData.length
    return {
      progressPercent: progressPercent.toFixed(0) + '%',
      workersOnSite: workersOnSite.toLocaleString(),
      budgetSpent: '$' + budgetSpent.toLocaleString() + 'M',
      timelineDelay: timelineDelay.toFixed(0) + ' mo',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-amber-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128737;</span>
          <h3 className="text-sm font-semibold text-white">Mega Project Construction</h3>
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
            <div className="text-slate-400">Workers On Site</div>
            <div className="text-sm font-semibold text-white">{metrics.workersOnSite}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Budget Spent</div>
            <div className="text-sm font-semibold text-white">{metrics.budgetSpent}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Delay</div>
            <div className="text-sm font-semibold text-white">{metrics.timelineDelay}</div>
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
