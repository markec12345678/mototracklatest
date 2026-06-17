'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'na-care',
    name: 'Care.com Nanny Network Boston',
    lat: 42.360,
    lng: -71.060,
    status: 'stable',
    value: 88,
    activeNannies: 248,
    familiesServed: 312,
    avgPlacementDays: 14,
    backgroundCheckPct: 100,
    trend: 'up' as const,
    description: 'Care.com Boston network with 248 active nannies, 312 families served and 14-day average placement with full background screening',
  },
  {
    id: 'na-sitter',
    name: 'Sittercity Nanny Agency Chicago',
    lat: 41.878,
    lng: -87.636,
    status: 'stable',
    value: 84,
    activeNannies: 184,
    familiesServed: 226,
    avgPlacementDays: 18,
    backgroundCheckPct: 100,
    trend: 'stable' as const,
    description: 'Sittercity Chicago agency with 184 active nannies, 226 families served and CPR-certified caregiver guarantee',
  },
  {
    id: 'na-nannylane',
    name: 'NannyLane Agency Seattle',
    lat: 47.612,
    lng: -122.332,
    status: 'moderate',
    value: 74,
    activeNannies: 128,
    familiesServed: 142,
    avgPlacementDays: 22,
    backgroundCheckPct: 100,
    trend: 'up' as const,
    description: 'NannyLane Seattle with 128 active nannies, 142 families served and specialized infant care placement matching',
  },
  {
    id: 'na-enannyl',
    name: 'eNannySource Atlanta',
    lat: 33.767,
    lng: -84.420,
    status: 'warning',
    value: 60,
    activeNannies: 76,
    familiesServed: 88,
    avgPlacementDays: 28,
    backgroundCheckPct: 95,
    trend: 'down' as const,
    description: 'eNannySource Atlanta facing recruitment challenges, 76 active nannies with 28-day placement times and 5% pending background checks',
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

export function NannyAgencyServiceMonitor() {
  const state = useMapStore((s) => s.nannyAgencyService)
  const setState = useMapStore((s) => s.setNannyAgencyService)

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
    if (filteredData.length === 0) return { totalNannies: 0, totalFamilies: 0, avgPlacement: '0d', avgBgCheck: '0%' }
    const totalNannies = filteredData.reduce((s: number, d: any) => s + (d.activeNannies as number), 0)
    const totalFamilies = filteredData.reduce((s: number, d: any) => s + (d.familiesServed as number), 0)
    const avgPlacement = filteredData.reduce((s: number, d: any) => s + (d.avgPlacementDays as number), 0) / filteredData.length
    const avgBgCheck = filteredData.reduce((s: number, d: any) => s + (d.backgroundCheckPct as number), 0) / filteredData.length
    return { totalNannies, totalFamilies, avgPlacement: avgPlacement.toFixed(0) + 'd', avgBgCheck: avgBgCheck.toFixed(0) + '%' }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-600 to-blue-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128105;</span>
          <h3 className="text-sm font-semibold text-white">Nanny Agency Service</h3>
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
            <div className="text-slate-400">Active Nannies</div>
            <div className="text-sm font-semibold text-white">{metrics.totalNannies}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Families Served</div>
            <div className="text-sm font-semibold text-white">{metrics.totalFamilies}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Placement</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPlacement}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">BG Check</div>
            <div className="text-sm font-semibold text-white">{metrics.avgBgCheck}</div>
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
                <span className="text-xs text-slate-300">{loc.activeNannies} nannies</span>
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
              Background check: <span className="text-emerald-300 font-medium">{activeItem.backgroundCheckPct}%</span>
              &nbsp;&middot;&nbsp; {activeItem.activeNannies} nannies, {activeItem.familiesServed} families, {activeItem.avgPlacementDays}d placement
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
