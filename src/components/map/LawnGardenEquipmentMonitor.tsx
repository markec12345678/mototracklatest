'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'lg-johndeere',
    name: 'John Deere Moline IL HQ',
    lat: 41.506,
    lng: -90.515,
    status: 'stable',
    value: 92,
    unitsInStock: 280,
    brandsCarried: 1,
    dailySales: 12,
    equipmentTypes: 'Tractors, Mowers, Gators',
    trend: 'up' as const,
    description: 'John Deere Moline corporate flagship with 280 units in stock including X700 series mowers and 1025R compact tractors',
  },
  {
    id: 'lg-toro',
    name: 'Toro Bloomington MN HQ',
    lat: 44.841,
    lng: -93.298,
    status: 'stable',
    value: 86,
    unitsInStock: 220,
    brandsCarried: 1,
    dailySales: 9,
    equipmentTypes: 'Mowers, Snow, Irrigation',
    trend: 'stable' as const,
    description: 'Toro Bloomington HQ with 220 units including Zero-Turn TimeCutter mowers and Power Max snowthrowers in season',
  },
  {
    id: 'lg-husqvarna',
    name: 'Husqvarna Charlotte NC',
    lat: 35.227,
    lng: -80.843,
    status: 'moderate',
    value: 72,
    unitsInStock: 165,
    brandsCarried: 1,
    dailySales: 7,
    equipmentTypes: 'Chainsaws, Trimmers, Bots',
    trend: 'stable' as const,
    description: 'Husqvarna Charlotte distribution center with 165 units including 460 chainsaws and automower robotic units',
  },
  {
    id: 'lg-cubcadet',
    name: 'Cub Cadet Cleveland OH',
    lat: 41.478,
    lng: -81.681,
    status: 'warning',
    value: 58,
    unitsInStock: 110,
    brandsCarried: 1,
    dailySales: 4,
    equipmentTypes: 'Riders, Z-Force, CC30',
    trend: 'down' as const,
    description: 'Cub Cadet Cleveland branch facing chip shortage impact on Ultima ZT1 riders, 110 units in stock and reduced Z-Force inventory',
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

export function LawnGardenEquipmentMonitor() {
  const state = useMapStore((s) => s.lawnGardenEquipment)
  const setState = useMapStore((s) => s.setLawnGardenEquipment)

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
    if (filteredData.length === 0) return { totalUnits: 0, totalSales: 0, avgBrands: 0 }
    const totalUnits = filteredData.reduce((s: number, d: any) => s + (d.unitsInStock as number), 0)
    const totalSales = filteredData.reduce((s: number, d: any) => s + (d.dailySales as number), 0)
    const avgBrands = Math.round(filteredData.reduce((s: number, d: any) => s + (d.brandsCarried as number), 0) / filteredData.length)
    return { totalUnits, totalSales, avgBrands }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500 to-lime-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127793;</span>
          <h3 className="text-sm font-semibold text-white">Lawn & Garden Equipment</h3>
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
            <div className="text-slate-400">Units In Stock</div>
            <div className="text-sm font-semibold text-white">{metrics.totalUnits}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Sales</div>
            <div className="text-sm font-semibold text-white">{metrics.totalSales}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Brands</div>
            <div className="text-sm font-semibold text-white">{metrics.avgBrands}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Locations</div>
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
                  <div className="text-[10px] text-slate-400">{loc.equipmentTypes}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.unitsInStock}u</span>
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
              {activeItem.unitsInStock} units &middot; {activeItem.dailySales} sales/day
              &nbsp;&middot;&nbsp; {activeItem.equipmentTypes}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
