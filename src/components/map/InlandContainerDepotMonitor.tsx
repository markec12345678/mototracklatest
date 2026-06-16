'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'icd-delhi',
    name: 'ICD Tughlakabad Delhi',
    lat: 28.51,
    lng: 77.26,
    status: 'warning',
    value: 2400,
    teuStacked: 2400,
    trainMovementsDay: 14,
    truckTurnTimeMin: 86,
    yardUtilPct: 91,
    trend: 'up' as const,
    description: 'Inland container depot experiencing yard congestion as inbound rail volumes exceed available handling slots during festive season peak',
  },
  {
    id: 'icd-chicago',
    name: 'ICD Centerpoint Chicago',
    lat: 41.88,
    lng: -87.63,
    status: 'stable',
    value: 1850,
    teuStacked: 1850,
    trainMovementsDay: 18,
    truckTurnTimeMin: 42,
    yardUtilPct: 74,
    trend: 'stable' as const,
    description: 'Midwest rail ramp operating smoothly with balanced container dwell times and efficient intermodal crane operations across all tracks',
  },
  {
    id: 'icd-chengdu',
    name: 'ICD Chengdu Railport',
    lat: 30.67,
    lng: 104.07,
    status: 'moderate',
    value: 2100,
    teuStacked: 2100,
    trainMovementsDay: 22,
    truckTurnTimeMin: 58,
    yardUtilPct: 83,
    trend: 'up' as const,
    description: 'China-Europe freight train hub handling growing block train volumes with bonded zone expansion supporting trans-Eurasia trade',
  },
  {
    id: 'icd-duisburg',
    name: 'ICD Duisburg DUSS',
    lat: 51.43,
    lng: 6.76,
    status: 'stable',
    value: 1680,
    teuStacked: 1680,
    trainMovementsDay: 26,
    truckTurnTimeMin: 38,
    yardUtilPct: 79,
    trend: 'up' as const,
    description: 'European rail hub distributing China-Europe block trains across the continent with reliable short-sea feeder connections',
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

export function InlandContainerDepotMonitor() {
  const state = useMapStore((s) => s.inlandContainerDepot)
  const setState = useMapStore((s) => s.setInlandContainerDepot)

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
    if (filteredData.length === 0) return { teuStacked: 0, trainMovementsDay: 0, truckTurnTimeMin: 0, yardUtilPct: 0 }
    const teuStacked = filteredData.reduce((s: number, d: any) => s + (d.teuStacked as number), 0)
    const trainMovementsDay = filteredData.reduce((s: number, d: any) => s + (d.trainMovementsDay as number), 0)
    const truckTurnTimeMin = filteredData.reduce((s: number, d: any) => s + (d.truckTurnTimeMin as number), 0) / filteredData.length
    const yardUtilPct = filteredData.reduce((s: number, d: any) => s + (d.yardUtilPct as number), 0) / filteredData.length
    return {
      teuStacked: teuStacked.toLocaleString(),
      trainMovementsDay: trainMovementsDay.toLocaleString(),
      truckTurnTimeMin: truckTurnTimeMin.toFixed(0) + ' min',
      yardUtilPct: yardUtilPct.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128737;</span>
          <h3 className="text-sm font-semibold text-white">Inland Container Depot</h3>
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
            <div className="text-slate-400">TEU Stacked</div>
            <div className="text-sm font-semibold text-white">{metrics.teuStacked}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Trains/day</div>
            <div className="text-sm font-semibold text-white">{metrics.trainMovementsDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Truck Turn</div>
            <div className="text-sm font-semibold text-white">{metrics.truckTurnTimeMin}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Yard Util %</div>
            <div className="text-sm font-semibold text-white">{metrics.yardUtilPct}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} TEU currently stacked</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
