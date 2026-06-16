'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cb-cheyenne',
    name: 'NORAD Cheyenne Mountain',
    lat: 38.74,
    lng: -104.84,
    status: 'stable',
    value: 350,
    personnelSheltered: 350,
    blastDoorCount: 25,
    hardenedDepth: 600,
    commsUptime: 99,
    trend: 'stable' as const,
    description: 'US-Canada NORAD hardened command center inside Cheyenne Mountain granite, 25-ton blast doors protecting aerospace warning missions',
  },
  {
    id: 'cb-ravenrock',
    name: 'Site R Raven Rock',
    lat: 39.74,
    lng: -77.32,
    status: 'stable',
    value: 1200,
    personnelSheltered: 1200,
    blastDoorCount: 35,
    hardenedDepth: 280,
    commsUptime: 98,
    trend: 'stable' as const,
    description: 'Alternate Joint Communications Center for US DoD in Pennsylvania mountain, supporting National Military Command Center continuity',
  },
  {
    id: 'cb-pindar',
    name: 'PINDAR London',
    lat: 51.51,
    lng: -0.13,
    status: 'moderate',
    value: 380,
    personnelSheltered: 380,
    blastDoorCount: 18,
    hardenedDepth: 80,
    commsUptime: 97,
    trend: 'up' as const,
    description: 'UK Ministry of Defence Primary Command Centre deep below Whitehall for Strategic Command crisis and nuclear response operations',
  },
  {
    id: 'cb-kosvinsky',
    name: 'Kosvinsky Mountain Bunker',
    lat: 58.36,
    lng: 59.76,
    status: 'warning',
    value: 950,
    personnelSheltered: 950,
    blastDoorCount: 28,
    hardenedDepth: 700,
    commsUptime: 92,
    trend: 'down' as const,
    description: 'Russian Strategic Rocket Forces alternate command post in Ural Mountains withstanding near-miss nuclear detonation, aging comms systems',
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

export function CommandBunkerFacilityMonitor() {
  const state = useMapStore((s) => s.commandBunkerFacility)
  const setState = useMapStore((s) => s.setCommandBunkerFacility)

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
    if (filteredData.length === 0) return { personnelSheltered: 0, blastDoorCount: 0, hardenedDepth: 0, commsUptime: 0 }
    const personnelSheltered = filteredData.reduce((s: number, d: any) => s + (d.personnelSheltered as number), 0)
    const blastDoorCount = filteredData.reduce((s: number, d: any) => s + (d.blastDoorCount as number), 0)
    const hardenedDepth = filteredData.reduce((s: number, d: any) => s + (d.hardenedDepth as number), 0) / filteredData.length
    const commsUptime = filteredData.reduce((s: number, d: any) => s + (d.commsUptime as number), 0) / filteredData.length
    return {
      personnelSheltered: personnelSheltered.toLocaleString(),
      blastDoorCount: blastDoorCount.toLocaleString(),
      hardenedDepth: hardenedDepth.toFixed(0) + ' m',
      commsUptime: commsUptime.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-zinc-600 to-stone-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128737;</span>
          <h3 className="text-sm font-semibold text-white">Command Bunker Facility</h3>
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
            <div className="text-slate-400">Personnel Sheltered</div>
            <div className="text-sm font-semibold text-white">{metrics.personnelSheltered}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Blast Doors Total</div>
            <div className="text-sm font-semibold text-white">{metrics.blastDoorCount}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Hardened Depth</div>
            <div className="text-sm font-semibold text-white">{metrics.hardenedDepth}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Comms Uptime</div>
            <div className="text-sm font-semibold text-white">{metrics.commsUptime}</div>
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
                <span className="text-xs text-slate-300">{loc.value} pers</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} personnel sheltered at {activeItem.hardenedDepth} m depth</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
