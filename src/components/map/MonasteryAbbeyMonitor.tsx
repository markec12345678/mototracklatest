'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ma-montecassino',
    name: 'Abbey of Monte Cassino',
    lat: 41.49,
    lng: 14.11,
    status: 'stable',
    value: 50,
    monksResident: 50,
    annualVisitors: 700000,
    yearFounded: 529,
    unescoListed: false,
    trend: 'stable' as const,
    description: 'Benedictine mother abbey founded by St Benedict on Monte Cassino hill, rebuilt after WWII bombing, 50 monks maintaining liturgical life',
  },
  {
    id: 'ma-metsats',
    name: 'Metsats Monastery Tibet',
    lat: 29.65,
    lng: 91.12,
    status: 'warning',
    value: 35,
    monksResident: 35,
    annualVisitors: 80000,
    yearFounded: 1414,
    unescoListed: false,
    trend: 'down' as const,
    description: 'Tibetan Gelug monastery near Lhasa with 35 resident monks, reduced from 500 pre-1959 and recovering slowly under current policies',
  },
  {
    id: 'ma-mountathos',
    name: 'Mount Athos Greece',
    lat: 40.16,
    lng: 24.31,
    status: 'stable',
    value: 2000,
    monksResident: 2000,
    annualVisitors: 120000,
    yearFounded: 963,
    unescoListed: true,
    trend: 'up' as const,
    description: 'Eastern Orthodox monastic republic on Chalkidiki peninsula with 20 monasteries and 2,000 monks, only male pilgrims allowed with permit',
  },
  {
    id: 'ma-stgall',
    name: 'Abbey of St Gall',
    lat: 47.42,
    lng: 9.37,
    status: 'moderate',
    value: 12,
    monksResident: 12,
    annualVisitors: 180000,
    yearFounded: 719,
    unescoListed: true,
    trend: 'stable' as const,
    description: 'Swiss UNESCO library and former Benedictine abbey with 12 resident monks, library holding 170,000 books including 2,100 medieval manuscripts',
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

export function MonasteryAbbeyMonitor() {
  const state = useMapStore((s) => s.monasteryAbbey)
  const setState = useMapStore((s) => s.setMonasteryAbbey)

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
    if (filteredData.length === 0) return { monksResident: 0, annualVisitors: 0, unescoListed: 0 }
    const monksResident = filteredData.reduce((s: number, d: any) => s + (d.monksResident as number), 0)
    const annualVisitors = filteredData.reduce((s: number, d: any) => s + (d.annualVisitors as number), 0)
    const unescoListed = filteredData.filter((d: any) => d.unescoListed).length
    return {
      monksResident: monksResident.toLocaleString(),
      annualVisitors: (annualVisitors / 1000).toFixed(0) + 'k',
      unescoListed: unescoListed + '/' + filteredData.length,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-600 to-amber-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9968;</span>
          <h3 className="text-sm font-semibold text-white">Monastery &amp; Abbey</h3>
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
            <div className="text-slate-400">Monks Resident</div>
            <div className="text-sm font-semibold text-white">{metrics.monksResident}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Annual Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.annualVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">UNESCO Listed</div>
            <div className="text-sm font-semibold text-white">{metrics.unescoListed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Oldest</div>
            <div className="text-sm font-semibold text-white">529 CE</div>
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
                <span className="text-xs text-slate-300">{loc.value} monks</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} monks, founded {activeItem.yearFounded}, {activeItem.annualVisitors.toLocaleString()} annual visitors</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
