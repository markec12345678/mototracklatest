'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'lab-nih-bethesda',
    name: 'NIH Bethesda',
    lat: 39.003,
    lng: -77.105,
    status: 'critical',
    value: 4,
    activeTrials: 4,
    papersPublished: 12,
    labCapacityPct: 18,
    fundingM: 320,
    trend: 'down' as const,
    description: 'Shutdown posture following federal funding freeze with most trials paused and lab capacity idled below operating thresholds',
  },
  {
    id: 'lab-pasteur-paris',
    name: 'Pasteur Paris',
    lat: 48.8404,
    lng: 2.3106,
    status: 'warning',
    value: 14,
    activeTrials: 14,
    papersPublished: 48,
    labCapacityPct: 56,
    fundingM: 210,
    trend: 'stable' as const,
    description: 'Limited operations due to budget constraints with reduced trial throughput and constrained wet-lab scheduling',
  },
  {
    id: 'lab-riken-kobe',
    name: 'RIKEN Kobe',
    lat: 34.695,
    lng: 135.093,
    status: 'moderate',
    value: 28,
    activeTrials: 28,
    papersPublished: 96,
    labCapacityPct: 78,
    fundingM: 185,
    trend: 'up' as const,
    description: 'Active research programs across bioscience divisions with steady trial pipeline and productive publication output',
  },
  {
    id: 'lab-maxplanck-munich',
    name: 'Max Planck Munich',
    lat: 48.1476,
    lng: 11.6068,
    status: 'stable',
    value: 41,
    activeTrials: 41,
    papersPublished: 142,
    labCapacityPct: 92,
    fundingM: 260,
    trend: 'up' as const,
    description: 'Optimal research environment with full lab utilization, robust funding, and strong publication cadence across institutes',
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

export function MedicalResearchLabMonitor() {
  const state = useMapStore((s) => s.medicalResearchLab)
  const setState = useMapStore((s) => s.setMedicalResearchLab)

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
    if (filteredData.length === 0) return { activeTrials: 0, papersPublished: 0, labCapacityPct: 0, fundingM: 0 }
    const activeTrials = filteredData.reduce((s: number, d: any) => s + (d.activeTrials as number), 0)
    const papersPublished = filteredData.reduce((s: number, d: any) => s + (d.papersPublished as number), 0)
    const labCapacityPct = filteredData.reduce((s: number, d: any) => s + (d.labCapacityPct as number), 0) / filteredData.length
    const fundingM = filteredData.reduce((s: number, d: any) => s + (d.fundingM as number), 0)
    return {
      activeTrials: activeTrials.toLocaleString(),
      papersPublished: papersPublished.toLocaleString(),
      labCapacityPct: labCapacityPct.toFixed(0) + '%',
      fundingM: '$' + fundingM.toLocaleString() + 'M',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔬</span>
          <h3 className="text-sm font-semibold text-white">Medical Research Lab Monitor</h3>
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
            <div className="text-slate-400">Active Trials</div>
            <div className="text-sm font-semibold text-white">{metrics.activeTrials}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Papers Published</div>
            <div className="text-sm font-semibold text-white">{metrics.papersPublished}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Lab Capacity %</div>
            <div className="text-sm font-semibold text-white">{metrics.labCapacityPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Funding $M</div>
            <div className="text-sm font-semibold text-white">{metrics.fundingM}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} active trials</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
