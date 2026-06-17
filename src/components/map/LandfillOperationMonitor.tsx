'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'lf-apex',
    name: 'Apex Regional Landfill Las Vegas NV',
    lat: 36.317,
    lng: -115.284,
    status: 'stable',
    value: 89,
    tonsPerDay: 9000,
    cellsActive: 6,
    capacityRemaining: 215,
    gasRecoveryMW: 12.4,
    trend: 'up' as const,
    description: 'Apex Regional Las Vegas — largest US landfill by volume, 9,000 t/day across 6 active cells with 215 years capacity and 12.4 MW gas-to-energy',
  },
  {
    id: 'lf-atlantic',
    name: 'Atlantic Waste Disposal Waverly VA',
    lat: 37.034,
    lng: -77.094,
    status: 'stable',
    value: 84,
    tonsPerDay: 3200,
    cellsActive: 4,
    capacityRemaining: 28,
    gasRecoveryMW: 4.8,
    trend: 'stable' as const,
    description: 'Atlantic Waste Disposal Waverly VA, 3,200 t/day across 4 active cells with 28 years capacity and 4.8 MW landfill gas recovery',
  },
  {
    id: 'lf-columbia',
    name: 'Columbia Ridge Landfill Arlington OR',
    lat: 45.732,
    lng: -120.213,
    status: 'moderate',
    value: 71,
    tonsPerDay: 2800,
    cellsActive: 3,
    capacityRemaining: 95,
    gasRecoveryMW: 6.2,
    trend: 'stable' as const,
    description: 'Columbia Ridge Landfill Arlington OR serving Pacific Northwest, 2,800 t/day across 3 cells with 95 years capacity and 6.2 MW gas recovery',
  },
  {
    id: 'lf-newton',
    name: 'Newton County Landfill Brooks IN',
    lat: 40.856,
    lng: -87.353,
    status: 'warning',
    value: 59,
    tonsPerDay: 1800,
    cellsActive: 2,
    capacityRemaining: 14,
    gasRecoveryMW: 2.1,
    trend: 'down' as const,
    description: 'Newton County Landfill Brooks IN, 1,800 t/day across 2 cells with only 14 years capacity remaining — expansion permitting underway',
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

export function LandfillOperationMonitor() {
  const state = useMapStore((s) => s.landfillOperation)
  const setState = useMapStore((s) => s.setLandfillOperation)

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
    if (filteredData.length === 0) return { totalTons: 0, totalMW: 0, avgCapacity: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tonsPerDay as number), 0)
    const totalMW = filteredData.reduce((s: number, d: any) => s + (d.gasRecoveryMW as number), 0)
    const avgCapacity = Math.round(filteredData.reduce((s: number, d: any) => s + (d.capacityRemaining as number), 0) / filteredData.length)
    return { totalTons, totalMW, avgCapacity }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-500 to-stone-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128465;&#65039;</span>
          <h3 className="text-sm font-semibold text-white">Landfill Operation</h3>
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
            <div className="text-slate-400">Gas Recovery</div>
            <div className="text-sm font-semibold text-white">{metrics.totalMW.toFixed(1)} MW</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Capacity</div>
            <div className="text-sm font-semibold text-white">{metrics.avgCapacity} yrs</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Sites</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.cellsActive} cells &middot; {loc.gasRecoveryMW} MW gas</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.capacityRemaining} yr</span>
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
              {activeItem.tonsPerDay.toLocaleString()} t/day &middot; {activeItem.cellsActive} active cells &middot; {activeItem.capacityRemaining} yrs capacity
              &nbsp;&middot;&nbsp; {activeItem.gasRecoveryMW} MW gas-to-energy
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
