'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'oc-valvoline',
    name: 'Valvoline Instant Houston',
    lat: 29.735,
    lng: -95.464,
    status: 'stable',
    value: 88,
    oilChangesPerDay: 52,
    avgServiceMin: 12,
    techniciansOnDuty: 4,
    trend: 'up' as const,
    description: 'Valvoline Instant Oil Change Houston with 15-min stay-in-car service, 4 technicians and 52 daily oil changes',
  },
  {
    id: 'oc-jiffy',
    name: 'Jiffy Lube Phoenix',
    lat: 33.448,
    lng: -112.074,
    status: 'stable',
    value: 84,
    oilChangesPerDay: 45,
    avgServiceMin: 14,
    techniciansOnDuty: 3,
    trend: 'stable' as const,
    description: 'Jiffy Lube Phoenix signature service with 3 technicians and 45 daily oil changes including fluid top-offs and tire rotation',
  },
  {
    id: 'oc-take5',
    name: 'Take 5 Oil Change Atlanta',
    lat: 33.767,
    lng: -84.521,
    status: 'moderate',
    value: 76,
    oilChangesPerDay: 38,
    avgServiceMin: 10,
    techniciansOnDuty: 3,
    trend: 'up' as const,
    description: 'Take 5 Atlanta stay-in-car oil change with 10-min average service, 3 technicians and 38 daily customers',
  },
  {
    id: 'oc-greasemonkey',
    name: 'Grease Monkey Denver',
    lat: 39.739,
    lng: -104.99,
    status: 'warning',
    value: 62,
    oilChangesPerDay: 25,
    avgServiceMin: 22,
    techniciansOnDuty: 2,
    trend: 'down' as const,
    description: 'Grease Monkey Denver facing staffing shortage with 2 technicians, 25 daily changes and longer 22-min service times',
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

export function OilChangeQuickMonitor() {
  const state = useMapStore((s) => s.oilChangeQuick)
  const setState = useMapStore((s) => s.setOilChangeQuick)

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
    if (filteredData.length === 0) return { totalChanges: 0, avgService: '0m', totalTechs: 0, avgPerTech: '0' }
    const totalChanges = filteredData.reduce((s: number, d: any) => s + (d.oilChangesPerDay as number), 0)
    const avgService = filteredData.reduce((s: number, d: any) => s + (d.avgServiceMin as number), 0) / filteredData.length
    const totalTechs = filteredData.reduce((s: number, d: any) => s + (d.techniciansOnDuty as number), 0)
    const avgPerTech = totalTechs > 0 ? totalChanges / totalTechs : 0
    return {
      totalChanges,
      avgService: avgService.toFixed(0) + 'm',
      totalTechs,
      avgPerTech: avgPerTech.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-orange-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128167;</span>
          <h3 className="text-sm font-semibold text-white">Oil Change Quick</h3>
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
            <div className="text-slate-400">Changes / day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalChanges}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Service</div>
            <div className="text-sm font-semibold text-white">{metrics.avgService}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Technicians</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTechs}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Changes / tech</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPerTech}</div>
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
                <span className="text-xs text-slate-300">{loc.oilChangesPerDay}/day</span>
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
              <span className="text-slate-300 font-medium">{activeItem.oilChangesPerDay} changes/day, {activeItem.avgServiceMin}m service, {activeItem.techniciansOnDuty} techs</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
