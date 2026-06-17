'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sd-coca-atlanta',
    name: 'Coca-Cola Atlanta Syrup Plant',
    lat: 33.75,
    lng: -84.39,
    status: 'stable',
    value: 890000000,
    lineSpeedBpm: 2400,
    flavorVariants: 23,
    co2Volume: 3.8,
    trend: 'stable' as const,
    description: 'Global concentrate and bottling hub for Coca-Cola Classic, 890M liter annual production across 23 flavor variants with 3.8 CO2 volumes',
  },
  {
    id: 'sd-drpepper-texas',
    name: 'Dr Pepper Dallas Bottling Line',
    lat: 32.78,
    lng: -96.80,
    status: 'stable',
    value: 312000000,
    lineSpeedBpm: 1800,
    flavorVariants: 11,
    co2Volume: 3.2,
    trend: 'up' as const,
    description: 'Dr Pepper Snapple group flagship with 23-flavor recipe production, 312M liter annual across 11 SKUs with high-speed PET line',
  },
  {
    id: 'sd-redbull-austria',
    name: 'Red Bull Salzburg Production',
    lat: 47.81,
    lng: 13.04,
    status: 'moderate',
    value: 248000000,
    lineSpeedBpm: 1500,
    flavorVariants: 8,
    co2Volume: 4.0,
    trend: 'up' as const,
    description: 'Energy drink production facility, 248M liter annual across 8 flavor variants including Sugar Free and Editions with 4.0 CO2 volumes',
  },
  {
    id: 'sd-pepsi-newyork',
    name: 'PepsiCo New Rochelle Plant',
    lat: 40.91,
    lng: -73.78,
    status: 'warning',
    value: 425000000,
    lineSpeedBpm: 2000,
    flavorVariants: 14,
    co2Volume: 3.4,
    trend: 'down' as const,
    description: 'Pepsi-Cola bottling plant serving Northeast corridor, 425M liter annual facing aluminum can supply shortages reducing 2024 throughput',
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

export function SoftDrinkBottlingMonitor() {
  const state = useMapStore((s) => s.softDrinkBottling)
  const setState = useMapStore((s) => s.setSoftDrinkBottling)

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
    if (filteredData.length === 0) return { totalOutput: '0', avgSpeed: 0, avgCo2: '0.0' }
    const totalOutput = filteredData.reduce((s: number, d: any) => s + (d.value as number), 0)
    const avgSpeed = filteredData.reduce((s: number, d: any) => s + (d.lineSpeedBpm as number), 0) / filteredData.length
    const avgCo2 = filteredData.reduce((s: number, d: any) => s + (d.co2Volume as number), 0) / filteredData.length
    return {
      totalOutput: (totalOutput / 1000000).toFixed(0) + 'M L',
      avgSpeed,
      avgCo2: avgCo2.toFixed(1) + ' vol',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500 to-rose-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129380;</span>
          <h3 className="text-sm font-semibold text-white">Soft Drink Bottling</h3>
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
            <div className="text-slate-400">Annual Output</div>
            <div className="text-sm font-semibold text-white">{metrics.totalOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Line Speed</div>
            <div className="text-sm font-semibold text-white">{metrics.avgSpeed} bpm</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg CO2</div>
            <div className="text-sm font-semibold text-white">{metrics.avgCo2}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Brand</div>
            <div className="text-sm font-semibold text-white">Coca-Cola</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(0)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} L annual, {activeItem.lineSpeedBpm} bpm, {activeItem.flavorVariants} variants, {activeItem.co2Volume} CO2 volumes</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
