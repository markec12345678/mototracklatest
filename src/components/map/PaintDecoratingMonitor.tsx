'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pd-sherwin',
    name: 'Sherwin-Williams Cleveland HQ',
    lat: 41.499,
    lng: -81.695,
    status: 'stable',
    value: 91,
    gallonsSoldDay: 1850,
    colorsMixedDay: 420,
    contractorsServed: 880,
    brandLines: 'ProClassic, SuperPaint, Emerald',
    trend: 'up' as const,
    description: 'Sherwin-Williams Cleveland HQ flagship with 1,850 gallons sold daily, 420 custom colors mixed and ProMar 200 contractor program',
  },
  {
    id: 'pd-benjamin',
    name: 'Benjamin Moore Montvale NJ',
    lat: 41.036,
    lng: -74.051,
    status: 'stable',
    value: 86,
    gallonsSoldDay: 1420,
    colorsMixedDay: 340,
    contractorsServed: 640,
    brandLines: 'Regal Select, Aura, Natura',
    trend: 'stable' as const,
    description: 'Benjamin Moore Montvale HQ with 1,420 gallons sold daily, Gennex colorant technology and 3,500+ color palette',
  },
  {
    id: 'pd-ppg',
    name: 'PPG Paints Pittsburgh HQ',
    lat: 40.440,
    lng: -79.997,
    status: 'moderate',
    value: 74,
    gallonsSoldDay: 1180,
    colorsMixedDay: 280,
    contractorsServed: 520,
    brandLines: 'Diamond, ProLuxe, Manor Hall',
    trend: 'stable' as const,
    description: 'PPG Pittsburgh headquarters flagship with 1,180 gallons sold daily and Timeless interior and ProLuxe exterior lines',
  },
  {
    id: 'pd-valspar',
    name: 'Valspar Minneapolis MN',
    lat: 44.978,
    lng: -93.265,
    status: 'warning',
    value: 60,
    gallonsSoldDay: 760,
    colorsMixedDay: 195,
    contractorsServed: 380,
    brandLines: 'Reserve, Signature, Aspire',
    trend: 'down' as const,
    description: "Valspar Minneapolis branch facing contractor attrition, 760 gallons sold daily and Lowe's exclusive Reserve line",
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

export function PaintDecoratingMonitor() {
  const state = useMapStore((s) => s.paintDecorating)
  const setState = useMapStore((s) => s.setPaintDecorating)

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
    if (filteredData.length === 0) return { totalGallons: 0, totalColors: 0, totalContractors: 0 }
    const totalGallons = filteredData.reduce((s: number, d: any) => s + (d.gallonsSoldDay as number), 0)
    const totalColors = filteredData.reduce((s: number, d: any) => s + (d.colorsMixedDay as number), 0)
    const totalContractors = filteredData.reduce((s: number, d: any) => s + (d.contractorsServed as number), 0)
    return { totalGallons, totalColors, totalContractors }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-fuchsia-500 to-purple-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127912;</span>
          <h3 className="text-sm font-semibold text-white">Paint & Decorating</h3>
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
            <div className="text-slate-400">Gallons/Day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalGallons.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Colors Mixed</div>
            <div className="text-sm font-semibold text-white">{metrics.totalColors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Contractors</div>
            <div className="text-sm font-semibold text-white">{metrics.totalContractors.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stores</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.brandLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.gallonsSoldDay} gal</span>
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
              {activeItem.gallonsSoldDay} gal/day &middot; {activeItem.colorsMixedDay} colors/day
              &nbsp;&middot;&nbsp; {activeItem.contractorsServed} contractors
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
