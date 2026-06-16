'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sf-tsmc',
    name: 'TSMC Fab 18 Hsinchu',
    lat: 24.78,
    lng: 121.0,
    status: 'stable',
    value: 220000,
    waferStarts: 220000,
    defectDensity: 0.09,
    processNode: '3nm',
    yieldRate: 92,
    trend: 'up' as const,
    description: 'Taiwan flagship GigaFab running 3nm N3E process for Apple A17 and AI accelerators with EUV lithography at industry-leading defect density',
  },
  {
    id: 'sf-samsung',
    name: 'Samsung Hwaseong Campus',
    lat: 37.21,
    lng: 127.05,
    status: 'warning',
    value: 160000,
    waferStarts: 160000,
    defectDensity: 0.13,
    processNode: '3nm GAA',
    yieldRate: 78,
    trend: 'stable' as const,
    description: 'Korean mega-fab first to commercialize gate-all-around transistors but yields below target for Exynos and foundry customer ramp',
  },
  {
    id: 'sf-intel',
    name: 'Intel D1X Hillsboro',
    lat: 45.54,
    lng: -122.95,
    status: 'moderate',
    value: 95000,
    waferStarts: 95000,
    defectDensity: 0.18,
    processNode: 'Intel 18A',
    yieldRate: 68,
    trend: 'up' as const,
    description: 'Oregon development fab piloting Intel 18A with backside power and RibbonFET under IDM 2.0 strategy ahead of Arizona high-volume fab',
  },
  {
    id: 'sf-asml',
    name: 'ASML EUV Center Veldhoven',
    lat: 51.41,
    lng: 5.4,
    status: 'stable',
    value: 60,
    waferStarts: 60,
    defectDensity: 0.0,
    processNode: 'High-NA EUV',
    yieldRate: 100,
    trend: 'stable' as const,
    description: 'Dutch headquarters producing and integrating next-gen High-NA EXE:5000 EUV scanners destined for Intel and TSMC 2nm process nodes',
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

export function SemiconductorFabMonitor() {
  const state = useMapStore((s) => s.semiconductorFab)
  const setState = useMapStore((s) => s.setSemiconductorFab)

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
    if (filteredData.length === 0) return { waferStarts: 0, defectDensity: 0, yieldRate: 0 }
    const waferStarts = filteredData.reduce((s: number, d: any) => s + (d.waferStarts as number), 0)
    const defectDensity = filteredData.reduce((s: number, d: any) => s + (d.defectDensity as number), 0) / filteredData.length
    const yieldRate = filteredData.reduce((s: number, d: any) => s + (d.yieldRate as number), 0) / filteredData.length
    return {
      waferStarts: waferStarts.toLocaleString() + ' / mo',
      defectDensity: defectDensity.toFixed(2) + ' /cm2',
      yieldRate: yieldRate.toFixed(0) + '%',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-indigo-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129518;</span>
          <h3 className="text-sm font-semibold text-white">Semiconductor Fab</h3>
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
            <div className="text-slate-400">Wafer Starts</div>
            <div className="text-sm font-semibold text-white">{metrics.waferStarts}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Defect Density</div>
            <div className="text-sm font-semibold text-white">{metrics.defectDensity}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Yield</div>
            <div className="text-sm font-semibold text-white">{metrics.yieldRate}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Node</div>
            <div className="text-sm font-semibold text-white">3nm / 18A</div>
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
                <span className="text-xs text-slate-300">{loc.processNode}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} wafer starts / month at {activeItem.processNode}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
