'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ps-hajj',
    name: 'Hajj Pilgrimage Mecca',
    lat: 21.39,
    lng: 39.86,
    status: 'stable',
    value: 2500000,
    annualPilgrims: 2500000,
    festivalDuration: 6,
    yearEstablished: 632,
    trend: 'up' as const,
    description: 'Annual Islamic Hajj pilgrimage to Mecca, 2.5 million pilgrims over 6 days performing rituals at Kaaba, Arafat and Mina',
  },
  {
    id: 'ps-kumbh',
    name: 'Kumbh Mela Prayagraj',
    lat: 25.43,
    lng: 81.85,
    status: 'stable',
    value: 120000000,
    annualPilgrims: 120000000,
    festivalDuration: 48,
    yearEstablished: 600,
    trend: 'up' as const,
    description: 'Largest peaceful human gathering on earth, 120 million Hindu pilgrims bathing at Triveni Sangam over 48-day festival cycle',
  },
  {
    id: 'ps-lourdes',
    name: 'Sanctuary of Lourdes',
    lat: 43.09,
    lng: -0.05,
    status: 'moderate',
    value: 3500000,
    annualPilgrims: 3500000,
    festivalDuration: 365,
    yearEstablished: 1858,
    trend: 'stable' as const,
    description: 'French Catholic Marian shrine where Bernadette Soubirous saw Virgin Mary, 3.5 million annual pilgrims seeking healing baths',
  },
  {
    id: 'ps-via',
    name: 'Camino de Santiago',
    lat: 42.88,
    lng: -8.54,
    status: 'warning',
    value: 446000,
    annualPilgrims: 446000,
    festivalDuration: 365,
    yearEstablished: 814,
    trend: 'down' as const,
    description: 'Christian pilgrimage routes to Cathedral of Santiago de Compostela, 446k walkers arriving in 2023 with declining post-pandemic recovery',
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

export function PilgrimageSiteMonitor() {
  const state = useMapStore((s) => s.pilgrimageSite)
  const setState = useMapStore((s) => s.setPilgrimageSite)

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
    if (filteredData.length === 0) return { annualPilgrims: 0, festivalDuration: 0 }
    const annualPilgrims = filteredData.reduce((s: number, d: any) => s + (d.annualPilgrims as number), 0)
    const festivalDuration = filteredData.reduce((s: number, d: any) => s + (d.festivalDuration as number), 0) / filteredData.length
    return {
      annualPilgrims: (annualPilgrims / 1000000).toFixed(0) + 'M',
      festivalDuration: festivalDuration.toFixed(0) + ' d',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-600 to-purple-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128739;</span>
          <h3 className="text-sm font-semibold text-white">Pilgrimage Site</h3>
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
            <div className="text-slate-400">Annual Pilgrims</div>
            <div className="text-sm font-semibold text-white">{metrics.annualPilgrims}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Duration</div>
            <div className="text-sm font-semibold text-white">{metrics.festivalDuration}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Largest</div>
            <div className="text-sm font-semibold text-white">Kumbh Mela</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">600 CE</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000000).toFixed(1)}M</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} annual pilgrims over {activeItem.festivalDuration} days, established {activeItem.yearEstablished}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
