'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'bunk-fujairah',
    name: 'Fujairah Bunker Hub',
    lat: 25.17,
    lng: 56.36,
    status: 'stable',
    value: 18500,
    bunkerM3Day: 18500,
    vlsfoPrice: 542,
    mgoPrice: 768,
    bunkerVesselsActive: 24,
    trend: 'down' as const,
    description: 'Middle East bunker hub outside Hormuz Strait providing competitive VLSFO pricing with efficient STS transfer operations supporting round-the-clock supply',
  },
  {
    id: 'bunk-singapore',
    name: 'Singapore Bunker Hub',
    lat: 1.27,
    lng: 103.84,
    status: 'stable',
    value: 42000,
    bunkerM3Day: 42000,
    vlsfoPrice: 568,
    mgoPrice: 792,
    bunkerVesselsActive: 52,
    trend: 'stable' as const,
    description: 'World largest bunker port with mass flow metering mandatory and growing biofuel blends availability supporting decarbonization transitions',
  },
  {
    id: 'bunk-rotterdam',
    name: 'Rotterdam Bunker Hub',
    lat: 51.95,
    lng: 4.14,
    status: 'moderate',
    value: 22000,
    bunkerM3Day: 22000,
    vlsfoPrice: 555,
    mgoPrice: 785,
    bunkerVesselsActive: 38,
    trend: 'up' as const,
    description: 'European bunker hub offering methanol and ammonia bunker trials with growing demand for alternative fuels supporting green corridor initiatives',
  },
  {
    id: 'bunk-houston',
    name: 'Houston Bunker Hub',
    lat: 29.36,
    lng: -94.78,
    status: 'warning',
    value: 14500,
    bunkerM3Day: 14500,
    vlsfoPrice: 535,
    mgoPrice: 758,
    bunkerVesselsActive: 18,
    trend: 'down' as const,
    description: 'US Gulf bunker operations affected by refinery maintenance reducing LSFO availability with spot prices firming for prompt delivery windows',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function MaritimeFuelBunkerMonitor() {
  const state = useMapStore((s) => s.maritimeFuelBunker)
  const setState = useMapStore((s) => s.setMaritimeFuelBunker)

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
    if (filteredData.length === 0) return { bunkerM3Day: 0, vlsfoPrice: 0, mgoPrice: 0, bunkerVesselsActive: 0 }
    const bunkerM3Day = filteredData.reduce((s: number, d: any) => s + (d.bunkerM3Day as number), 0)
    const vlsfoPrice = filteredData.reduce((s: number, d: any) => s + (d.vlsfoPrice as number), 0) / filteredData.length
    const mgoPrice = filteredData.reduce((s: number, d: any) => s + (d.mgoPrice as number), 0) / filteredData.length
    const bunkerVesselsActive = filteredData.reduce((s: number, d: any) => s + (d.bunkerVesselsActive as number), 0)
    return {
      bunkerM3Day: bunkerM3Day.toLocaleString(),
      vlsfoPrice: '$' + vlsfoPrice.toFixed(0),
      mgoPrice: '$' + mgoPrice.toFixed(0),
      bunkerVesselsActive: bunkerVesselsActive.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-orange-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9981;</span>
          <h3 className="text-sm font-semibold text-white">Maritime Fuel Bunker</h3>
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
            <div className="text-slate-400">Bunker m&sup3;/day</div>
            <div className="text-sm font-semibold text-white">{metrics.bunkerM3Day}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">VLSFO Price</div>
            <div className="text-sm font-semibold text-white">{metrics.vlsfoPrice}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">MGO Price</div>
            <div className="text-sm font-semibold text-white">{metrics.mgoPrice}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bunker Vessels</div>
            <div className="text-sm font-semibold text-white">{metrics.bunkerVesselsActive}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} m&sup3; bunker fuel supplied daily</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
