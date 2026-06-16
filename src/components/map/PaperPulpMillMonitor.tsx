'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pp-stora',
    name: 'Stora Enso Imatra',
    lat: 61.2,
    lng: 28.75,
    status: 'stable',
    value: 620,
    pulpOutput: 620,
    waterUse: 38,
    recycledFiber: 42,
    bioenergyShare: 88,
    trend: 'stable' as const,
    description: 'Finnish integrated pulp and board mill producing liquid packaging board with near-fossil-free operations using bark and lignin bioenergy',
  },
  {
    id: 'pp-upm',
    name: 'UPM Kaukas',
    lat: 60.52,
    lng: 25.43,
    status: 'moderate',
    value: 740,
    pulpOutput: 740,
    waterUse: 41,
    recycledFiber: 28,
    bioenergyShare: 82,
    trend: 'up' as const,
    description: 'Lappeenranta biorefinery complex co-producing hardwood pulp, renewable diesel from tall oil, and grid-scale bioelectricity',
  },
  {
    id: 'pp-suzano',
    name: 'Suzano Limeira',
    lat: -23.04,
    lng: -47.34,
    status: 'warning',
    value: 1450,
    pulpOutput: 1450,
    waterUse: 29,
    recycledFiber: 4,
    bioenergyShare: 91,
    trend: 'up' as const,
    description: 'Brazilian eucalyptus kraft pulp mill with world-lowest cash cost but facing drought-driven water permit reviews and export logistics strain',
  },
  {
    id: 'pp-ilim',
    name: 'Ilim Group Bratsk',
    lat: 56.15,
    lng: 101.61,
    status: 'critical',
    value: 980,
    pulpOutput: 980,
    waterUse: 52,
    recycledFiber: 8,
    bioenergyShare: 74,
    trend: 'down' as const,
    description: 'Siberian softwood pulp mill operating near capacity but cut off from European buyers, redirecting shipments to China at deep discount',
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

export function PaperPulpMillMonitor() {
  const state = useMapStore((s) => s.paperPulpMill)
  const setState = useMapStore((s) => s.setPaperPulpMill)

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
    if (filteredData.length === 0) return { pulpOutput: 0, waterUse: 0, recycledFiber: 0, bioenergyShare: 0 }
    const pulpOutput = filteredData.reduce((s: number, d: any) => s + (d.pulpOutput as number), 0)
    const waterUse = filteredData.reduce((s: number, d: any) => s + (d.waterUse as number), 0) / filteredData.length
    const recycledFiber = filteredData.reduce((s: number, d: any) => s + (d.recycledFiber as number), 0) / filteredData.length
    const bioenergyShare = filteredData.reduce((s: number, d: any) => s + (d.bioenergyShare as number), 0) / filteredData.length
    return {
      pulpOutput: pulpOutput.toLocaleString() + ' kt/y',
      waterUse: waterUse.toFixed(0) + ' m3/t',
      recycledFiber: recycledFiber.toFixed(0) + '%',
      bioenergyShare: bioenergyShare.toFixed(0) + '%',
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
          <span className="text-lg">&#128196;</span>
          <h3 className="text-sm font-semibold text-white">Paper &amp; Pulp Mill</h3>
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
            <div className="text-slate-400">Pulp Output</div>
            <div className="text-sm font-semibold text-white">{metrics.pulpOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Water Use</div>
            <div className="text-sm font-semibold text-white">{metrics.waterUse}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Recycled Fiber</div>
            <div className="text-sm font-semibold text-white">{metrics.recycledFiber}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bioenergy Share</div>
            <div className="text-sm font-semibold text-white">{metrics.bioenergyShare}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()} kt</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} kt/year pulp output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
