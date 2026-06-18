'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bm-84lumber',
    name: '84 Lumber Eighty Four PA HQ',
    lat: 40.176,
    lng: -80.131,
    status: 'stable',
    value: 88,
    dailyShipments: 215,
    skusInStock: 45000,
    contractorsServed: 720,
    materialTypes: 'Lumber, Plywood, Trusses',
    trend: 'stable' as const,
    description: '84 Lumber corporate headquarters with 45,000 SKUs, 215 daily shipments of dimensional lumber and engineered wood products',
  },
  {
    id: 'bm-abcsupply',
    name: 'ABC Supply Beloit WI',
    lat: 42.508,
    lng: -89.032,
    status: 'stable',
    value: 86,
    dailyShipments: 184,
    skusInStock: 38000,
    contractorsServed: 640,
    materialTypes: 'Roofing, Siding, Windows',
    trend: 'up' as const,
    description: 'ABC Supply Beloit HQ with 38,000 SKUs, leading roofing and siding distributor serving 640 roofing contractors',
  },
  {
    id: 'bm-beacon',
    name: 'Beacon Building Materials Herndon VA',
    lat: 38.970,
    lng: -77.386,
    status: 'moderate',
    value: 72,
    dailyShipments: 142,
    skusInStock: 32000,
    contractorsServed: 480,
    materialTypes: 'Roofing, Insulation, Gutter',
    trend: 'stable' as const,
    description: 'Beacon Herndon branch with 32,000 SKUs, expanding solar roofing offerings and premium synthetic underlayment lines',
  },
  {
    id: 'bm-buildersfs',
    name: 'Builders FirstSource Dallas TX',
    lat: 32.777,
    lng: -96.797,
    status: 'warning',
    value: 58,
    dailyShipments: 96,
    skusInStock: 24000,
    contractorsServed: 320,
    materialTypes: 'Trusses, Millwork, Lumber',
    trend: 'down' as const,
    description: 'Builders FirstSource Dallas facing millwork lead-time issues, 24,000 SKUs serving 320 home builder accounts',
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

export function BuildingMaterialsMonitor() {
  const state = useMapStore((s) => s.buildingMaterials)
  const setState = useMapStore((s) => s.setBuildingMaterials)

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
    if (filteredData.length === 0) return { totalShipments: 0, totalSkus: 0, totalContractors: 0 }
    const totalShipments = filteredData.reduce((s: number, d: any) => s + (d.dailyShipments as number), 0)
    const totalSkus = filteredData.reduce((s: number, d: any) => s + (d.skusInStock as number), 0)
    const totalContractors = filteredData.reduce((s: number, d: any) => s + (d.contractorsServed as number), 0)
    return { totalShipments, totalSkus, totalContractors }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127959;</span>
          <h3 className="text-sm font-semibold text-white">Building Materials</h3>
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
            <div className="text-slate-400">Daily Shipments</div>
            <div className="text-sm font-semibold text-white">{metrics.totalShipments}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">SKUs In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalSkus / 1000).toFixed(0)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Contractors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalContractors.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Branches</div>
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
                  <div className="text-[10px] text-slate-400">{loc.materialTypes}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.dailyShipments}/day</span>
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
              {activeItem.skusInStock.toLocaleString()} SKUs &middot; {activeItem.dailyShipments} shipments/day
              &nbsp;&middot;&nbsp; {activeItem.contractorsServed.toLocaleString()} contractors
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
