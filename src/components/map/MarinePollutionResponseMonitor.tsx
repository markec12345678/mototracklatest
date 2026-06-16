'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mpr-gulf',
    name: 'Gulf of Mexico Response',
    lat: 28.5,
    lng: -89.0,
    status: 'stable',
    value: 2,
    activeSpills: 2,
    containmentPct: 92,
    skimmersDeployed: 12,
    dispersantGal: 4500,
    trend: 'down' as const,
    description: 'Incident response team managing residual sheen from previously contained platform discharge with boom deployment protecting shoreline',
  },
  {
    id: 'mpr-mediterranean',
    name: 'Mediterranean Response',
    lat: 38.0,
    lng: 18.0,
    status: 'warning',
    value: 5,
    activeSpills: 5,
    containmentPct: 64,
    skimmersDeployed: 18,
    dispersantGal: 12800,
    trend: 'up' as const,
    description: 'Multi-agency response to vessel collision spill with aerial dispersant application and offshore boom deployment near sensitive marine protected areas',
  },
  {
    id: 'mpr-baltic',
    name: 'Baltic Sea Response',
    lat: 56.0,
    lng: 19.0,
    status: 'moderate',
    value: 3,
    activeSpills: 3,
    containmentPct: 78,
    skimmersDeployed: 9,
    dispersantGal: 3200,
    trend: 'stable' as const,
    description: 'HELCOM coordinated response to bunker fuel spill with cold-water recovery challenges and ice-edge boom deployment tactics in use',
  },
  {
    id: 'mpr-southchina',
    name: 'South China Sea',
    lat: 15.0,
    lng: 115.0,
    status: 'critical',
    value: 7,
    activeSpills: 7,
    containmentPct: 41,
    skimmersDeployed: 22,
    dispersantGal: 18500,
    trend: 'up' as const,
    description: 'Major tanker grounding response with hundreds of tonnes of crude released and adverse weather hampering recovery efforts near coral reef systems',
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

export function MarinePollutionResponseMonitor() {
  const state = useMapStore((s) => s.marinePollutionResponse)
  const setState = useMapStore((s) => s.setMarinePollutionResponse)

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
    if (filteredData.length === 0) return { activeSpills: 0, containmentPct: 0, skimmersDeployed: 0, dispersantGal: 0 }
    const activeSpills = filteredData.reduce((s: number, d: any) => s + (d.activeSpills as number), 0)
    const containmentPct = filteredData.reduce((s: number, d: any) => s + (d.containmentPct as number), 0) / filteredData.length
    const skimmersDeployed = filteredData.reduce((s: number, d: any) => s + (d.skimmersDeployed as number), 0)
    const dispersantGal = filteredData.reduce((s: number, d: any) => s + (d.dispersantGal as number), 0)
    return {
      activeSpills: activeSpills.toLocaleString(),
      containmentPct: containmentPct.toFixed(0) + '%',
      skimmersDeployed: skimmersDeployed.toLocaleString(),
      dispersantGal: dispersantGal.toLocaleString() + ' gal',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-amber-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9888;</span>
          <h3 className="text-sm font-semibold text-white">Marine Pollution Response</h3>
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
            <div className="text-slate-400">Active Spills</div>
            <div className="text-sm font-semibold text-white">{metrics.activeSpills}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Containment</div>
            <div className="text-sm font-semibold text-white">{metrics.containmentPct}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Skimmers Out</div>
            <div className="text-sm font-semibold text-white">{metrics.skimmersDeployed}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Dispersant</div>
            <div className="text-sm font-semibold text-white">{metrics.dispersantGal}</div>
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
                <span className="text-xs text-slate-300">{loc.value} spills</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} active pollution incidents</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
