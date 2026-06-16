'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tr-nttr',
    name: 'Nellis NTTR Nevada',
    lat: 37.2,
    lng: -116.1,
    status: 'stable',
    value: 12400,
    rangeAreaKm2: 12400,
    sortiesDay: 84,
    liveFireActive: true,
    trend: 'up' as const,
    description: 'Nevada Test and Training Range hosting Red Flag, Green Flag and USAF Weapons School large-force employment exercises',
  },
  {
    id: 'tr-grafenwoehr',
    name: 'Grafenwoehr Training Area',
    lat: 49.71,
    lng: 11.91,
    status: 'stable',
    value: 390,
    rangeAreaKm2: 390,
    sortiesDay: 32,
    liveFireActive: true,
    trend: 'up' as const,
    description: 'Bavarian combined-arms range hosting rotational US Army armored brigade combat team exercises and multinational Joint Warrior drills',
  },
  {
    id: 'tr-shoalwater',
    name: 'Shoalwater Bay Training Area',
    lat: -22.46,
    lng: 150.49,
    status: 'moderate',
    value: 4545,
    rangeAreaKm2: 4545,
    sortiesDay: 18,
    liveFireActive: false,
    trend: 'stable' as const,
    description: 'Australian Defence Force flagship training area hosting biennial Talisman Sabre and Sea Eagle multinational amphibious exercises',
  },
  {
    id: 'tr-yakima',
    name: 'Yakima Training Center',
    lat: 46.68,
    lng: -120.45,
    status: 'warning',
    value: 1315,
    rangeAreaKm2: 1315,
    sortiesDay: 12,
    liveFireActive: false,
    trend: 'down' as const,
    description: 'Washington state high-desert maneuver area for Stryker and armored brigade training, suspended live-fire activity during wildfire season',
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

export function MilitaryTrainingRangeMonitor() {
  const state = useMapStore((s) => s.militaryTrainingRange)
  const setState = useMapStore((s) => s.setMilitaryTrainingRange)

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
    if (filteredData.length === 0) return { rangeAreaKm2: 0, sortiesDay: 0, liveFireActive: 0 }
    const rangeAreaKm2 = filteredData.reduce((s: number, d: any) => s + (d.rangeAreaKm2 as number), 0)
    const sortiesDay = filteredData.reduce((s: number, d: any) => s + (d.sortiesDay as number), 0)
    const liveFireActive = filteredData.filter((d: any) => d.liveFireActive).length
    return {
      rangeAreaKm2: rangeAreaKm2.toLocaleString() + ' km2',
      sortiesDay: sortiesDay.toLocaleString() + ' /d',
      liveFireActive: liveFireActive + '/' + filteredData.length,
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
          <span className="text-lg">&#127919;</span>
          <h3 className="text-sm font-semibold text-white">Military Training Range</h3>
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
            <div className="text-slate-400">Total Range Area</div>
            <div className="text-sm font-semibold text-white">{metrics.rangeAreaKm2}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Sorties</div>
            <div className="text-sm font-semibold text-white">{metrics.sortiesDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Live-Fire Active</div>
            <div className="text-sm font-semibold text-white">{metrics.liveFireActive}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Exercise</div>
            <div className="text-sm font-semibold text-white">Red Flag</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000).toFixed(1)}k km2</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} km2 area, {activeItem.sortiesDay} sorties / day, live-fire {activeItem.liveFireActive ? 'active' : 'suspended'}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
