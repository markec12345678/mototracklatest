'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'rc-sims',
    name: 'Sims Metal Jersey City NJ',
    lat: 40.717,
    lng: -74.043,
    status: 'stable',
    value: 90,
    tonsPerDay: 1200,
    recoveryRate: 94,
    balesShipped: 42,
    materialTypes: 'Ferrous & Non-Ferrous Metal',
    trend: 'up' as const,
    description: 'Sims Metal Jersey City flagship shredder, 1,200 tons/day of ferrous and non-ferrous metal with 94% recovery rate and 42 bales shipped daily',
  },
  {
    id: 'rc-strategic',
    name: 'Strategic Materials Houston TX',
    lat: 29.760,
    lng: -95.369,
    status: 'stable',
    value: 86,
    tonsPerDay: 850,
    recoveryRate: 91,
    balesShipped: 36,
    materialTypes: 'Glass Cullet (Amber/Clear/Green)',
    trend: 'stable' as const,
    description: 'Strategic Materials Houston glass processor, 850 tons/day of amber, clear and green cullet with 91% recovery serving container industry',
  },
  {
    id: 'rc-sonoco',
    name: 'Sonoco Hartsville SC',
    lat: 34.366,
    lng: -80.079,
    status: 'moderate',
    value: 72,
    tonsPerDay: 640,
    recoveryRate: 88,
    balesShipped: 28,
    materialTypes: 'OCC, Mixed Paper, Old Newsprint',
    trend: 'stable' as const,
    description: 'Sonoco Hartsville SC paper recovery mill, 640 tons/day of OCC and mixed paper with 88% recovery feeding Sonoco recycled paperboard',
  },
  {
    id: 'rc-purecycle',
    name: 'PureCycle Technologies Ironton OH',
    lat: 38.537,
    lng: -82.680,
    status: 'warning',
    value: 58,
    tonsPerDay: 420,
    recoveryRate: 79,
    balesShipped: 19,
    materialTypes: 'Polypropylene (PP) Plastic',
    trend: 'down' as const,
    description: 'PureCycle Ironton OH polypropylene purification facility, 420 tons/day with patented solvent-based process facing feedstock contamination',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function RecyclingCenterMonitor() {
  const state = useMapStore((s) => s.recyclingCenter)
  const setState = useMapStore((s) => s.setRecyclingCenter)

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
    if (filteredData.length === 0) return { totalTons: 0, avgRecovery: 0, totalBales: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tonsPerDay as number), 0)
    const avgRecovery = Math.round(filteredData.reduce((s: number, d: any) => s + (d.recoveryRate as number), 0) / filteredData.length)
    const totalBales = filteredData.reduce((s: number, d: any) => s + (d.balesShipped as number), 0)
    return { totalTons, avgRecovery, totalBales }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9851;&#65039;</span>
          <h3 className="text-sm font-semibold text-white">Recycling Center</h3>
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
            <div className="text-slate-400">Tons / Day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTons.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Recovery</div>
            <div className="text-sm font-semibold text-white">{metrics.avgRecovery}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bales Shipped</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBales}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Facilities</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.materialTypes}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.tonsPerDay} t/d</span>
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
              {activeItem.tonsPerDay} t/day &middot; {activeItem.recoveryRate}% recovery &middot; {activeItem.balesShipped} bales/day
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
