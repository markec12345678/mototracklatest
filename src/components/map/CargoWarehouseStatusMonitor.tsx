'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'wh-memphis',
    name: 'Memphis FedEx Hub',
    lat: 35.04,
    lng: -89.98,
    status: 'stable',
    value: 8500,
    parcelsHour: 8500,
    utilPct: 88,
    dockDoorsOpen: 156,
    conveyorUtilPct: 92,
    trend: 'up' as const,
    description: 'Superhub sortation running at peak with automated dimensioning systems processing express parcels across the night sort window',
  },
  {
    id: 'wh-shenzhen',
    name: 'Shenzhen DC',
    lat: 22.54,
    lng: 114.06,
    status: 'warning',
    value: 12000,
    parcelsHour: 12000,
    utilPct: 96,
    dockDoorsOpen: 184,
    conveyorUtilPct: 98,
    trend: 'up' as const,
    description: 'E-commerce fulfillment center near capacity with inbound container backlog creating yard congestion and delayed putaway cycles',
  },
  {
    id: 'wh-rotterdam',
    name: 'Rotterdam Districenter',
    lat: 51.95,
    lng: 4.14,
    status: 'moderate',
    value: 4200,
    parcelsHour: 4200,
    utilPct: 72,
    dockDoorsOpen: 64,
    conveyorUtilPct: 78,
    trend: 'stable' as const,
    description: 'Cross-dock facility handling European distribution with balanced inbound and outbound flows supporting retail replenishment',
  },
  {
    id: 'wh-dubai',
    name: 'Dubai Logistics City',
    lat: 24.9,
    lng: 55.06,
    status: 'stable',
    value: 6800,
    parcelsHour: 6800,
    utilPct: 81,
    dockDoorsOpen: 92,
    conveyorUtilPct: 84,
    trend: 'up' as const,
    description: 'Free zone warehouse operating efficiently with temperature-controlled pharma chambers and high-value goods cage handling steady volumes',
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

export function CargoWarehouseStatusMonitor() {
  const state = useMapStore((s) => s.cargoWarehouseStatus)
  const setState = useMapStore((s) => s.setCargoWarehouseStatus)

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
    if (filteredData.length === 0) return { parcelsHour: 0, utilPct: 0, dockDoorsOpen: 0, conveyorUtilPct: 0 }
    const parcelsHour = filteredData.reduce((s: number, d: any) => s + (d.parcelsHour as number), 0)
    const utilPct = filteredData.reduce((s: number, d: any) => s + (d.utilPct as number), 0) / filteredData.length
    const dockDoorsOpen = filteredData.reduce((s: number, d: any) => s + (d.dockDoorsOpen as number), 0)
    const conveyorUtilPct = filteredData.reduce((s: number, d: any) => s + (d.conveyorUtilPct as number), 0) / filteredData.length
    return {
      parcelsHour: parcelsHour.toLocaleString(),
      utilPct: utilPct.toFixed(0) + '%',
      dockDoorsOpen: dockDoorsOpen.toLocaleString(),
      conveyorUtilPct: conveyorUtilPct.toFixed(0) + '%',
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
          <span className="text-lg">&#128230;</span>
          <h3 className="text-sm font-semibold text-white">Cargo Warehouse Status</h3>
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
            <div className="text-slate-400">Parcels/hr</div>
            <div className="text-sm font-semibold text-white">{metrics.parcelsHour}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Capacity Util</div>
            <div className="text-sm font-semibold text-white">{metrics.utilPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Dock Doors Open</div>
            <div className="text-sm font-semibold text-white">{metrics.dockDoorsOpen}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Conveyor Util</div>
            <div className="text-sm font-semibold text-white">{metrics.conveyorUtilPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} parcels/hr processed</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
