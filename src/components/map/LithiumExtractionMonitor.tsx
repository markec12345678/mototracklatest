'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'li-atacama',
    name: 'Salar de Atacama Chile',
    lat: -23.5,
    lng: -68.0,
    status: 'critical',
    value: 320,
    outputTDay: 320,
    li2oPct: 1.42,
    brinePumps: 64,
    evapDays: 540,
    trend: 'down' as const,
    description: 'Aquifer brine levels falling below sustainable yield with reduced recharge stressing pumping infrastructure',
  },
  {
    id: 'li-greenbushes',
    name: 'Greenbushes AU',
    lat: -33.85,
    lng: 116.05,
    status: 'warning',
    value: 480,
    outputTDay: 480,
    li2oPct: 1.86,
    brinePumps: 0,
    evapDays: 0,
    trend: 'down' as const,
    description: 'Spodumene concentrate output easing as the new chemical-grade plant ramps up slower than planned schedule',
  },
  {
    id: 'li-clayton',
    name: 'Clayton Valley NV',
    lat: 38.2,
    lng: -117.6,
    status: 'moderate',
    value: 180,
    outputTDay: 180,
    li2oPct: 0.94,
    brinePumps: 38,
    evapDays: 420,
    trend: 'stable' as const,
    description: 'Brine pond operations running at steady state with moderate evaporation rates and consistent lithium carbonate output',
  },
  {
    id: 'li-uyuni',
    name: 'Salar de Uyuni Bolivia',
    lat: -20.0,
    lng: -67.0,
    status: 'stable',
    value: 240,
    outputTDay: 240,
    li2oPct: 1.18,
    brinePumps: 52,
    evapDays: 480,
    trend: 'up' as const,
    description: 'Pilot evaporation ponds performing optimally with strong brine concentration and full pilot plant throughput',
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

export function LithiumExtractionMonitor() {
  const state = useMapStore((s) => s.lithiumExtraction)
  const setState = useMapStore((s) => s.setLithiumExtraction)

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
    if (filteredData.length === 0) return { li2oPct: 0, outputTDay: 0, brinePumps: 0, evapDays: 0 }
    const outputTDay = filteredData.reduce((s: number, d: any) => s + (d.outputTDay as number), 0)
    const li2oPct = filteredData.reduce((s: number, d: any) => s + (d.li2oPct as number), 0) / filteredData.length
    const brinePumps = filteredData.reduce((s: number, d: any) => s + (d.brinePumps as number), 0)
    const evapLocations = filteredData.filter((d: any) => (d.evapDays as number) > 0)
    const evapDays = evapLocations.length === 0
      ? 0
      : evapLocations.reduce((s: number, d: any) => s + (d.evapDays as number), 0) / evapLocations.length
    return {
      li2oPct: li2oPct.toFixed(2) + '%',
      outputTDay: outputTDay.toLocaleString(),
      brinePumps: brinePumps.toLocaleString(),
      evapDays: evapDays.toFixed(0) + ' days',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-500 to-green-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔋</span>
          <h3 className="text-sm font-semibold text-white">Lithium Extraction Monitor</h3>
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
            <div className="text-slate-400">Li2O %</div>
            <div className="text-sm font-semibold text-white">{metrics.li2oPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Output T/day</div>
            <div className="text-sm font-semibold text-white">{metrics.outputTDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Brine Pumps</div>
            <div className="text-sm font-semibold text-white">{metrics.brinePumps}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Evap days</div>
            <div className="text-sm font-semibold text-white">{metrics.evapDays}</div>
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
