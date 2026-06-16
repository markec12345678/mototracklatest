'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'nb-norfolk',
    name: 'Naval Station Norfolk',
    lat: 36.94,
    lng: -76.31,
    status: 'stable',
    value: 78,
    shipsBerthed: 78,
    personnelOnBase: 83000,
    dryDockActive: 5,
    readinessLevel: 'C2',
    trend: 'stable' as const,
    description: 'US Navy Atlantic Fleet flagship homeport, largest naval complex in the world with 14 piers supporting carriers, destroyers and submarines',
  },
  {
    id: 'nb-portsmouth',
    name: 'HMNB Portsmouth',
    lat: 50.79,
    lng: -1.11,
    status: 'moderate',
    value: 22,
    shipsBerthed: 22,
    personnelOnBase: 17000,
    dryDockActive: 3,
    readinessLevel: 'C2',
    trend: 'up' as const,
    description: 'Royal Navy homeport hosting Queen Elizabeth-class carriers and Type 45 destroyers, ongoing frigate modernization program',
  },
  {
    id: 'nb-yokosuka',
    name: 'Fleet Activities Yokosuka',
    lat: 35.29,
    lng: 139.67,
    status: 'stable',
    value: 14,
    shipsBerthed: 14,
    personnelOnBase: 23000,
    dryDockActive: 2,
    readinessLevel: 'C1',
    trend: 'stable' as const,
    description: 'US 7th Fleet forward-deployed homeport for USS Ronald Reagan carrier strike group and Aegis destroyers in Western Pacific',
  },
  {
    id: 'nb-toulon',
    name: 'Base Navale Toulon',
    lat: 43.12,
    lng: 5.93,
    status: 'warning',
    value: 18,
    shipsBerthed: 18,
    personnelOnBase: 12000,
    dryDockActive: 4,
    readinessLevel: 'C3',
    trend: 'down' as const,
    description: 'French Navy Mediterranean flagship base hosting Charles de Gaulle carrier and SSN submarines, dry-dock congestion during frigate refit cycle',
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

export function NavalBaseOperationMonitor() {
  const state = useMapStore((s) => s.navalBaseOperation)
  const setState = useMapStore((s) => s.setNavalBaseOperation)

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
    if (filteredData.length === 0) return { shipsBerthed: 0, personnelOnBase: 0, dryDockActive: 0 }
    const shipsBerthed = filteredData.reduce((s: number, d: any) => s + (d.shipsBerthed as number), 0)
    const personnelOnBase = filteredData.reduce((s: number, d: any) => s + (d.personnelOnBase as number), 0)
    const dryDockActive = filteredData.reduce((s: number, d: any) => s + (d.dryDockActive as number), 0)
    return {
      shipsBerthed: shipsBerthed.toLocaleString(),
      personnelOnBase: (personnelOnBase / 1000).toFixed(0) + 'k',
      dryDockActive: dryDockActive.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-700 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9875;</span>
          <h3 className="text-sm font-semibold text-white">Naval Base Operation</h3>
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
            <div className="text-slate-400">Ships Berthed</div>
            <div className="text-sm font-semibold text-white">{metrics.shipsBerthed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Personnel</div>
            <div className="text-sm font-semibold text-white">{metrics.personnelOnBase}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Dry Docks Active</div>
            <div className="text-sm font-semibold text-white">{metrics.dryDockActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Readiness</div>
            <div className="text-sm font-semibold text-white">C1 / C2</div>
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
                <span className="text-xs text-slate-300">{loc.value} ships</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} ships berthed at {activeItem.readinessLevel} readiness</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
