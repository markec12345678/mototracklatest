'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sm-arcelor',
    name: 'ArcelorMittal Differdange',
    lat: 49.52,
    lng: 5.89,
    status: 'stable',
    value: 8400,
    hotMetalOutput: 8400,
    electricityUse: 580,
    co2PerTon: 1.85,
    utilizationRate: 92,
    trend: 'stable' as const,
    description: 'Flagship Luxembourg heavy-section beam mill producing wide-flange H-beams for European skyscraper and bridge markets using electric arc furnace recycling',
  },
  {
    id: 'sm-nippon',
    name: 'Nippon Steel Kashima',
    lat: 35.96,
    lng: 140.62,
    status: 'warning',
    value: 11200,
    hotMetalOutput: 11200,
    electricityUse: 740,
    co2PerTon: 2.05,
    utilizationRate: 78,
    trend: 'down' as const,
    description: 'Coastal integrated mill on Pacific coast running blast furnaces at reduced utilization amid weak Asian steel demand and decarbonization retrofit',
  },
  {
    id: 'sm-tata',
    name: 'Tata Steel Jamshedpur',
    lat: 22.77,
    lng: 86.21,
    status: 'critical',
    value: 9600,
    hotMetalOutput: 9600,
    electricityUse: 810,
    co2PerTon: 2.42,
    utilizationRate: 88,
    trend: 'up' as const,
    description: 'Centenary Indian integrated works pushing record crude output to meet domestic infra demand but posting highest CO2 intensity among global majors',
  },
  {
    id: 'sm-posco',
    name: 'POSCO Gwangyang',
    lat: 34.93,
    lng: 127.68,
    status: 'moderate',
    value: 13400,
    hotMetalOutput: 13400,
    electricityUse: 690,
    co2PerTon: 1.74,
    utilizationRate: 95,
    trend: 'up' as const,
    description: 'Korean mega-works running four blast furnaces near peak output with FINEX smelting-reduction pilots cutting coke reliance for low-carbon steel',
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

export function SteelMillOperationMonitor() {
  const state = useMapStore((s) => s.steelMillOperation)
  const setState = useMapStore((s) => s.setSteelMillOperation)

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
    if (filteredData.length === 0) return { hotMetalOutput: 0, electricityUse: 0, co2PerTon: 0, utilizationRate: 0 }
    const hotMetalOutput = filteredData.reduce((s: number, d: any) => s + (d.hotMetalOutput as number), 0)
    const electricityUse = filteredData.reduce((s: number, d: any) => s + (d.electricityUse as number), 0) / filteredData.length
    const co2PerTon = filteredData.reduce((s: number, d: any) => s + (d.co2PerTon as number), 0) / filteredData.length
    const utilizationRate = filteredData.reduce((s: number, d: any) => s + (d.utilizationRate as number), 0) / filteredData.length
    return {
      hotMetalOutput: hotMetalOutput.toLocaleString() + ' t/d',
      electricityUse: electricityUse.toFixed(0) + ' MW',
      co2PerTon: co2PerTon.toFixed(2) + ' t',
      utilizationRate: utilizationRate.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-600 to-red-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128293;</span>
          <h3 className="text-sm font-semibold text-white">Steel Mill Operation</h3>
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
            <div className="text-slate-400">Hot Metal Output</div>
            <div className="text-sm font-semibold text-white">{metrics.hotMetalOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Power</div>
            <div className="text-sm font-semibold text-white">{metrics.electricityUse}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">CO2 / Ton Steel</div>
            <div className="text-sm font-semibold text-white">{metrics.co2PerTon}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.utilizationRate}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()} t/d</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} t/day hot metal</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
