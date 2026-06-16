'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'u-olympic',
    name: 'Olympic Dam AU',
    lat: -30.45,
    lng: 137.0,
    status: 'critical',
    value: 180,
    outputTDay: 180,
    u3o8Pct: 0.84,
    radiationMSv: 4.2,
    workers: 1240,
    trend: 'up' as const,
    description: 'Underground workings reporting elevated radon daughter concentrations triggering radiation alerts and evacuations',
  },
  {
    id: 'u-cigar',
    name: 'Cigar Lake Canada',
    lat: 57.6,
    lng: -109.6,
    status: 'warning',
    value: 240,
    outputTDay: 240,
    u3o8Pct: 14.2,
    radiationMSv: 2.6,
    workers: 720,
    trend: 'down' as const,
    description: 'Jet boring operations showing elevated worker exposure readings in the high-grade cavities requiring controls',
  },
  {
    id: 'u-ranger',
    name: 'Ranger AU',
    lat: -12.7,
    lng: 132.9,
    status: 'moderate',
    value: 120,
    outputTDay: 120,
    u3o8Pct: 0.32,
    radiationMSv: 1.4,
    workers: 480,
    trend: 'stable' as const,
    description: 'Care and maintenance phase with controlled water treatment and monitored tailings under regulatory limits',
  },
  {
    id: 'u-kazakhstan',
    name: 'Kazakhstan Mine',
    lat: 48.0,
    lng: 70.0,
    status: 'stable',
    value: 320,
    outputTDay: 320,
    u3o8Pct: 0.18,
    radiationMSv: 0.9,
    workers: 980,
    trend: 'up' as const,
    description: 'In-situ recovery wellfields operating safely with low worker dose rates and steady uranium bearing solution flow',
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

export function UraniumMiningSiteMonitor() {
  const state = useMapStore((s) => s.uraniumMiningSite)
  const setState = useMapStore((s) => s.setUraniumMiningSite)

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
    if (filteredData.length === 0) return { outputTDay: 0, u3o8Pct: 0, radiationMSv: 0, workers: 0 }
    const outputTDay = filteredData.reduce((s: number, d: any) => s + (d.outputTDay as number), 0)
    const u3o8Pct = filteredData.reduce((s: number, d: any) => s + (d.u3o8Pct as number), 0) / filteredData.length
    const radiationMSv = filteredData.reduce((s: number, d: any) => s + (d.radiationMSv as number), 0) / filteredData.length
    const workers = filteredData.reduce((s: number, d: any) => s + (d.workers as number), 0)
    return {
      outputTDay: outputTDay.toLocaleString(),
      u3o8Pct: u3o8Pct.toFixed(2) + '%',
      radiationMSv: radiationMSv.toFixed(2) + ' mSv',
      workers: workers.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">☢️</span>
          <h3 className="text-sm font-semibold text-white">Uranium Mining Site Monitor</h3>
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
            <div className="text-slate-400">Output T/day</div>
            <div className="text-sm font-semibold text-white">{metrics.outputTDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">U3O8 Grade %</div>
            <div className="text-sm font-semibold text-white">{metrics.u3o8Pct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Radiation mSv</div>
            <div className="text-sm font-semibold text-white">{metrics.radiationMSv}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Workers</div>
            <div className="text-sm font-semibold text-white">{metrics.workers}</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} T/day output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
