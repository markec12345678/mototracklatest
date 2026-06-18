'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cold-lineage',
    name: 'Lineage Logistics',
    lat: 42.3314,
    lng: -83.0458,
    status: 'critical',
    value: 8.4,
    storageM3: 480000,
    tempC: 8.4,
    trucksActive: 96,
    spoilagePct: 6.2,
    trend: 'up' as const,
    description: 'Ammonia compressor failure pushed zone temperatures above 6C; product quarantine and emergency reefer dispatch underway',
  },
  {
    id: 'cold-americold',
    name: 'Americold Atlanta',
    lat: 33.749,
    lng: -84.388,
    status: 'warning',
    value: -14.2,
    storageM3: 410000,
    tempC: -14.2,
    trucksActive: 124,
    spoilagePct: 2.4,
    trend: 'stable' as const,
    description: 'Temperatures drifting 4C warmer than setpoint on evaporator icing; throughput holding but spoilage creeping up',
  },
  {
    id: 'cold-newcold-melbourne',
    name: 'New Cold Melbourne',
    lat: -37.8136,
    lng: 144.9631,
    status: 'moderate',
    value: -22.1,
    storageM3: 360000,
    tempC: -22.1,
    trucksActive: 78,
    spoilagePct: 0.9,
    trend: 'stable' as const,
    description: 'Automated high-bay facility at steady state with consistent frozen chain integrity for export shipments',
  },
  {
    id: 'cold-swift-sydney',
    name: 'Swift Sydney',
    lat: -33.8688,
    lng: 151.2093,
    status: 'stable',
    value: -24.6,
    storageM3: 295000,
    tempC: -24.6,
    trucksActive: 64,
    spoilagePct: 0.4,
    trend: 'down' as const,
    description: 'Deep-freeze terminal operating optimally with spoilage at record lows and rapid truck turnaround',
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

export function ColdChainLogisticsMonitor() {
  const state = useMapStore((s) => s.coldChainLogistics)
  const setState = useMapStore((s) => s.setColdChainLogistics)

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
    if (filteredData.length === 0) return { storageM3: 0, tempC: 0, trucksActive: 0, spoilagePct: 0 }
    const storageM3 = filteredData.reduce((s: number, d: any) => s + (d.storageM3 as number), 0)
    const tempC = filteredData.reduce((s: number, d: any) => s + (d.tempC as number), 0) / filteredData.length
    const trucksActive = filteredData.reduce((s: number, d: any) => s + (d.trucksActive as number), 0)
    const spoilagePct = filteredData.reduce((s: number, d: any) => s + (d.spoilagePct as number), 0) / filteredData.length
    return {
      storageM3: storageM3.toLocaleString(),
      tempC: tempC.toFixed(1) + ' C',
      trucksActive: trucksActive.toLocaleString(),
      spoilagePct: spoilagePct.toFixed(1) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-cyan-500 to-blue-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">❄️</span>
          <h3 className="text-sm font-semibold text-white">Cold Chain Logistics Monitor</h3>
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
            <div className="text-slate-400">Storage m3</div>
            <div className="text-sm font-semibold text-white">{metrics.storageM3}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Temp -C</div>
            <div className="text-sm font-semibold text-white">{metrics.tempC}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Trucks Active</div>
            <div className="text-sm font-semibold text-white">{metrics.trucksActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Spoilage %</div>
            <div className="text-sm font-semibold text-white">{metrics.spoilagePct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} C zone temperature</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
