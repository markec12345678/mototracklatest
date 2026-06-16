'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tm-welspun',
    name: 'Welspun Anjar',
    lat: 23.41,
    lng: 70.03,
    status: 'stable',
    value: 92000,
    yarnOutput: 92000,
    cottonBalesDay: 540,
    waterRecovery: 71,
    trend: 'up' as const,
    description: 'Gujarat home-textile mega-mill spinning terry towels and bed linen for global retailers with vertically integrated cotton supply chain',
  },
  {
    id: 'tm-parkdale',
    name: 'Parkdale Gaffney',
    lat: 35.07,
    lng: -81.65,
    status: 'moderate',
    value: 38000,
    yarnOutput: 38000,
    cottonBalesDay: 240,
    waterRecovery: 58,
    trend: 'stable' as const,
    description: 'South Carolina yarn spinner running recycled-cotton blends to supply American denim and activewear brands under nearshoring push',
  },
  {
    id: 'tm-toyota',
    name: 'Toyota Industries Aichi',
    lat: 35.08,
    lng: 137.16,
    status: 'warning',
    value: 21000,
    yarnOutput: 21000,
    cottonBalesDay: 130,
    waterRecovery: 84,
    trend: 'down' as const,
    description: 'Japanese ring and air-jet spinning plant for technical yarns, hit by global cotton price surge and weak apparel demand from China',
  },
  {
    id: 'tm-shahi',
    name: 'Shahi Tirupur',
    lat: 11.11,
    lng: 77.35,
    status: 'critical',
    value: 145000,
    yarnOutput: 145000,
    cottonBalesDay: 880,
    waterRecovery: 49,
    trend: 'up' as const,
    description: 'Tamil Nadu knitwear cluster spinning and dyeing for fast-fashion export but flagged for dye-effluent discharge into Noyyal river basin',
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

export function TextileMillOperationMonitor() {
  const state = useMapStore((s) => s.textileMillOperation)
  const setState = useMapStore((s) => s.setTextileMillOperation)

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
    if (filteredData.length === 0) return { yarnOutput: 0, cottonBalesDay: 0, waterRecovery: 0 }
    const yarnOutput = filteredData.reduce((s: number, d: any) => s + (d.yarnOutput as number), 0)
    const cottonBalesDay = filteredData.reduce((s: number, d: any) => s + (d.cottonBalesDay as number), 0)
    const waterRecovery = filteredData.reduce((s: number, d: any) => s + (d.waterRecovery as number), 0) / filteredData.length
    return {
      yarnOutput: yarnOutput.toLocaleString() + ' kg/d',
      cottonBalesDay: cottonBalesDay.toLocaleString(),
      waterRecovery: waterRecovery.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128085;</span>
          <h3 className="text-sm font-semibold text-white">Textile Mill Operation</h3>
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
            <div className="text-slate-400">Yarn Output</div>
            <div className="text-sm font-semibold text-white">{metrics.yarnOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cotton Bales / d</div>
            <div className="text-sm font-semibold text-white">{metrics.cottonBalesDay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Water Recovery</div>
            <div className="text-sm font-semibold text-white">{metrics.waterRecovery}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg OEE</div>
            <div className="text-sm font-semibold text-white">79%</div>
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
                <span className="text-xs text-slate-300">{(loc.value / 1000).toFixed(0)}t</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} kg/day yarn output</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
