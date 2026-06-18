'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ns-olivejune',
    name: 'Olive & June Santa Monica',
    lat: 34.019,
    lng: -118.481,
    status: 'stable',
    value: 92,
    manicuresPerDay: 85,
    polishVariety: 145,
    avgServiceMin: 45,
    trend: 'up' as const,
    description: 'Olive & June LA flagship nail studio with 145 polish shades, 45-min mani-pedi services and Instagram-worthy nail art',
  },
  {
    id: 'ns-paintbox',
    name: 'Paintbox NYC SoHo',
    lat: 40.724,
    lng: -74.001,
    status: 'stable',
    value: 89,
    manicuresPerDay: 72,
    polishVariety: 180,
    avgServiceMin: 55,
    trend: 'stable' as const,
    description: 'SoHo Paintbox nail art studio with seasonal design collections, 180 polish shades and 55-min luxury manicure experience',
  },
  {
    id: 'ns-varnish',
    name: 'Varnish Lane Chicago',
    lat: 41.89,
    lng: -87.624,
    status: 'moderate',
    value: 76,
    manicuresPerDay: 58,
    polishVariety: 120,
    avgServiceMin: 50,
    trend: 'up' as const,
    description: 'Chicago River North Varnish Lane with non-toxic 10-free polish formula and 120-shade curated color collection',
  },
  {
    id: 'ns-dashing',
    name: 'Dashing Diva Las Vegas',
    lat: 36.114,
    lng: -115.173,
    status: 'warning',
    value: 64,
    manicuresPerDay: 45,
    polishVariety: 95,
    avgServiceMin: 40,
    trend: 'down' as const,
    description: 'Las Vegas Strip Dashing Diva franchise impacted by post-pandemic recovery with reduced daily volume and shorter services',
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

export function NailSpaManicureMonitor() {
  const state = useMapStore((s) => s.nailSpaManicure)
  const setState = useMapStore((s) => s.setNailSpaManicure)

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
    if (filteredData.length === 0) return { totalManicures: 0, avgVariety: 0, avgService: '0m', peakDay: 0 }
    const totalManicures = filteredData.reduce((s: number, d: any) => s + (d.manicuresPerDay as number), 0)
    const avgVariety = filteredData.reduce((s: number, d: any) => s + (d.polishVariety as number), 0) / filteredData.length
    const avgService = filteredData.reduce((s: number, d: any) => s + (d.avgServiceMin as number), 0) / filteredData.length
    const peakDay = Math.max(...filteredData.map((d: any) => d.manicuresPerDay as number))
    return {
      totalManicures,
      avgVariety: Math.round(avgVariety),
      avgService: avgService.toFixed(0) + 'm',
      peakDay,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-600 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128133;</span>
          <h3 className="text-sm font-semibold text-white">Nail Spa Manicure</h3>
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
            <div className="text-slate-400">Manicures / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalManicures}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Polishes</div>
            <div className="text-sm font-semibold text-white">{metrics.avgVariety}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Service</div>
            <div className="text-sm font-semibold text-white">{metrics.avgService}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Peak Studio</div>
            <div className="text-sm font-semibold text-white">{metrics.peakDay}/day</div>
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
                <span className="text-xs text-slate-300">{loc.polishVariety} polishes</span>
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
              <span className="text-slate-300 font-medium">{activeItem.manicuresPerDay} manicures/day, {activeItem.polishVariety} polishes, {activeItem.avgServiceMin}m service</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
