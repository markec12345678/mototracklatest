'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tc-discount',
    name: 'Discount Tire Phoenix',
    lat: 33.448,
    lng: -112.074,
    status: 'stable',
    value: 88,
    tiresInstalledDay: 68,
    tireBrands: 18,
    avgWaitMin: 25,
    trend: 'up' as const,
    description: 'Discount Tire Phoenix flagship installing 68 tires daily across 18 brands including Michelin, Goodyear and BF Goodrich',
  },
  {
    id: 'tc-bigotires',
    name: 'Big O Tires Denver',
    lat: 39.739,
    lng: -104.99,
    status: 'moderate',
    value: 76,
    tiresInstalledDay: 48,
    tireBrands: 14,
    avgWaitMin: 32,
    trend: 'stable' as const,
    description: 'Big O Tires Denver Cherry Creek location with 14 brands and 48 daily installs including tire rotations and alignments',
  },
  {
    id: 'tc-firestone',
    name: 'Firestone Atlanta',
    lat: 33.767,
    lng: -84.521,
    status: 'stable',
    value: 82,
    tiresInstalledDay: 55,
    tireBrands: 12,
    avgWaitMin: 28,
    trend: 'up' as const,
    description: 'Firestone Complete Auto Care Atlanta with Bridgestone-brand focus, 12 brands and 55 daily tire installations',
  },
  {
    id: 'tc-ntb',
    name: 'NTB Miami',
    lat: 25.781,
    lng: -80.134,
    status: 'warning',
    value: 64,
    tiresInstalledDay: 35,
    tireBrands: 10,
    avgWaitMin: 42,
    trend: 'down' as const,
    description: 'NTB Miami Beach location facing reduced volume with 35 daily installs and longer 42-min waits during staffing shortage',
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

export function TireAutoCareMonitor() {
  const state = useMapStore((s) => s.tireAutoCare)
  const setState = useMapStore((s) => s.setTireAutoCare)

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
    if (filteredData.length === 0) return { totalTires: 0, avgBrands: 0, avgWait: '0m', peakTires: 0 }
    const totalTires = filteredData.reduce((s: number, d: any) => s + (d.tiresInstalledDay as number), 0)
    const avgBrands = filteredData.reduce((s: number, d: any) => s + (d.tireBrands as number), 0) / filteredData.length
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.avgWaitMin as number), 0) / filteredData.length
    const peakTires = Math.max(...filteredData.map((d: any) => d.tiresInstalledDay as number))
    return {
      totalTires,
      avgBrands: Math.round(avgBrands),
      avgWait: avgWait.toFixed(0) + 'm',
      peakTires,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-700 to-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128302;</span>
          <h3 className="text-sm font-semibold text-white">Tire Auto Care</h3>
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
            <div className="text-slate-400">Tires / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTires}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Brands</div>
            <div className="text-sm font-semibold text-white">{metrics.avgBrands}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Peak Location</div>
            <div className="text-sm font-semibold text-white">{metrics.peakTires}/day</div>
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
                <span className="text-xs text-slate-300">{loc.tiresInstalledDay}/day</span>
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
              <span className="text-slate-300 font-medium">{activeItem.tiresInstalledDay} tires/day, {activeItem.tireBrands} brands, {activeItem.avgWaitMin}m wait</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
