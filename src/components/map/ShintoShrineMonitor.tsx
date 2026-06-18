'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ss-ise',
    name: 'Ise Jingu Naiku',
    lat: 34.45,
    lng: 136.73,
    status: 'stable',
    value: 8000000,
    annualVisitors: 8000000,
    yearBuilt: 4,
    rebuildCycle: 20,
    trend: 'stable' as const,
    description: 'Most sacred Shinto shrine in Mie Prefecture dedicated to sun goddess Amaterasu, rebuilt every 20 years in shikinen sengu tradition',
  },
  {
    id: 'ss-meiji',
    name: 'Meiji Jingu Tokyo',
    lat: 35.68,
    lng: 139.7,
    status: 'stable',
    value: 10000000,
    annualVisitors: 10000000,
    yearBuilt: 1920,
    rebuildCycle: 0,
    trend: 'up' as const,
    description: 'Tokyo forest shrine dedicated to Emperor Meiji and Empress Shoken, hosting New Year hatsumode with 3 million worshippers in 3 days',
  },
  {
    id: 'ss-fushimi',
    name: 'Fushimi Inari Taisha',
    lat: 34.97,
    lng: 135.77,
    status: 'stable',
    value: 5000000,
    annualVisitors: 5000000,
    yearBuilt: 711,
    rebuildCycle: 0,
    trend: 'up' as const,
    description: 'Kyoto head shrine of Inari fox deity with 10,000 vermilion torii gates climbing Mount Inari, most visited shrine in Japan',
  },
  {
    id: 'ss-izumo',
    name: 'Izumo Taisha',
    lat: 35.41,
    lng: 132.69,
    status: 'moderate',
    value: 2100000,
    annualVisitors: 2100000,
    yearBuilt: 950,
    rebuildCycle: 0,
    trend: 'stable' as const,
    description: 'Shimane shrine dedicated to Okuninushi, kami of marriage, where all gods gather in October (Kamiarizuki) for annual meeting',
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

export function ShintoShrineMonitor() {
  const state = useMapStore((s) => s.shintoShrine)
  const setState = useMapStore((s) => s.setShintoShrine)

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
    if (filteredData.length === 0) return { annualVisitors: 0, rebuildCycle: 0 }
    const annualVisitors = filteredData.reduce((s: number, d: any) => s + (d.annualVisitors as number), 0)
    const rebuildShrines = filteredData.filter((d: any) => d.rebuildCycle > 0).length
    return {
      annualVisitors: (annualVisitors / 1000000).toFixed(1) + 'M',
      rebuildShrines: rebuildShrines + '/' + filteredData.length,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-600 to-rose-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9961;</span>
          <h3 className="text-sm font-semibold text-white">Shinto Shrine</h3>
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
            <div className="text-slate-400">Annual Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.annualVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cyclical Rebuild</div>
            <div className="text-sm font-semibold text-white">{metrics.rebuildShrines}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">4 CE</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Festival</div>
            <div className="text-sm font-semibold text-white">Hatsumode</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(1)}M/y</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} annual visitors, built {activeItem.yearBuilt}{activeItem.rebuildCycle > 0 ? `, rebuilt every ${activeItem.rebuildCycle} years` : ''}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
