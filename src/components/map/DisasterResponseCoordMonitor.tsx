'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'dr-fema',
    name: 'FEMA HQ DC',
    lat: 38.8951,
    lng: -77.0364,
    status: 'critical',
    value: 18,
    activeOps: 18,
    personnelDeployed: 8500,
    reliefM: 2400,
    regionsCovered: 8,
    trend: 'up' as const,
    description: 'Major disaster activations across multiple states with mass-care logistics and federal tasking',
  },
  {
    id: 'dr-unocha',
    name: 'UN OCHA Geneva',
    lat: 46.2273,
    lng: 6.146,
    status: 'warning',
    value: 8,
    activeOps: 8,
    personnelDeployed: 3200,
    reliefM: 850,
    regionsCovered: 14,
    trend: 'up' as const,
    description: 'Active international response coordination with cluster leads mobilized across crisis regions',
  },
  {
    id: 'dr-redcross',
    name: 'Red Cross Geneva',
    lat: 46.822,
    lng: 6.133,
    status: 'moderate',
    value: 5,
    activeOps: 5,
    personnelDeployed: 2400,
    reliefM: 410,
    regionsCovered: 22,
    trend: 'stable' as const,
    description: 'Steady monitoring posture with national-society deployments tracking evolving humanitarian needs',
  },
  {
    id: 'dr-euecho',
    name: 'EU ECHO Brussels',
    lat: 50.8503,
    lng: 4.3517,
    status: 'stable',
    value: 2,
    activeOps: 2,
    personnelDeployed: 900,
    reliefM: 180,
    regionsCovered: 10,
    trend: 'down' as const,
    description: 'Standby readiness with light operational tempo and reserve capacity across partner networks',
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

export function DisasterResponseCoordMonitor() {
  const state = useMapStore((s) => s.disasterResponseCoord)
  const setState = useMapStore((s) => s.setDisasterResponseCoord)

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
      return { activeOps: 0, personnelDeployed: 0, reliefM: 0, regionsCovered: 0 }
    const activeOps = filteredData.reduce((s: number, d: any) => s + (d.activeOps as number), 0)
    const personnelDeployed = filteredData.reduce(
      (s: number, d: any) => s + (d.personnelDeployed as number),
      0
    )
    const reliefM = filteredData.reduce((s: number, d: any) => s + (d.reliefM as number), 0)
    const regionsCovered = filteredData.reduce((s: number, d: any) => s + (d.regionsCovered as number), 0)
    return {
      activeOps: activeOps.toLocaleString(),
      personnelDeployed: personnelDeployed.toLocaleString(),
      reliefM: '$' + reliefM.toLocaleString() + 'M',
      regionsCovered: regionsCovered.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-red-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🆘</span>
          <h3 className="text-sm font-semibold text-white">Disaster Response Coord Monitor</h3>
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
            <div className="text-slate-400">Active Ops</div>
            <div className="text-sm font-semibold text-white">{metrics.activeOps}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Personnel Deployed</div>
            <div className="text-sm font-semibold text-white">{metrics.personnelDeployed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Relief $M</div>
            <div className="text-sm font-semibold text-white">{metrics.reliefM}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Regions Covered</div>
            <div className="text-sm font-semibold text-white">{metrics.regionsCovered}</div>
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
                {activeItem.value.toLocaleString()} active ops
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
