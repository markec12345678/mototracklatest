'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'tp-lipton-london',
    name: 'Lipton Tea Processing London Hub',
    lat: 51.50,
    lng: -0.16,
    status: 'stable',
    value: 24000000,
    processingLines: 6,
    oxidationHours: 4,
    blendVarieties: 32,
    trend: 'stable' as const,
    description: 'Global blending and packaging facility for Lipton black tea, 24M kg annual across 32 blend varieties with 6 processing lines',
  },
  {
    id: 'tp-tetley-kolkata',
    name: 'Tetley Tea Auction Kolkata',
    lat: 22.57,
    lng: 88.36,
    status: 'stable',
    value: 18000000,
    processingLines: 4,
    oxidationHours: 3,
    blendVarieties: 18,
    trend: 'up' as const,
    description: 'Indian sourcing hub processing Assam and Darjeeling leaf, 18M kg annual supply chain from 240 partner estates across 6 regions',
  },
  {
    id: 'tp-itoen-shizuoka',
    name: 'Ito En Shizuoka Green Tea Plant',
    lat: 34.97,
    lng: 138.38,
    status: 'moderate',
    value: 14500000,
    processingLines: 8,
    oxidationHours: 0,
    blendVarieties: 24,
    trend: 'up' as const,
    description: 'Japanese sencha and matcha producer, steam-kill green tea processing with no oxidation, 14.5M kg annual serving domestic and export markets',
  },
  {
    id: 'tp-dilmah-ceylon',
    name: 'Dilmah Ceylon Tea Plantation',
    lat: 6.97,
    lng: 80.76,
    status: 'warning',
    value: 9800000,
    processingLines: 3,
    oxidationHours: 5,
    blendVarieties: 14,
    trend: 'down' as const,
    description: 'Sri Lankan single-origin CTC processor, 9.8M kg annual facing climate stress reducing highland yields and increasing leaf disease pressure',
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

export function TeaProcessingFacilityMonitor() {
  const state = useMapStore((s) => s.teaProcessingFacility)
  const setState = useMapStore((s) => s.setTeaProcessingFacility)

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
    if (filteredData.length === 0) return { totalOutput: '0', totalLines: 0, totalVarieties: 0 }
    const totalOutput = filteredData.reduce((s: number, d: any) => s + (d.value as number), 0)
    const totalLines = filteredData.reduce((s: number, d: any) => s + (d.processingLines as number), 0)
    const totalVarieties = filteredData.reduce((s: number, d: any) => s + (d.blendVarieties as number), 0)
    return {
      totalOutput: (totalOutput / 1000000).toFixed(1) + 'M kg',
      totalLines,
      totalVarieties,
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-600 to-green-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127861;</span>
          <h3 className="text-sm font-semibold text-white">Tea Processing Facility</h3>
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
            <div className="text-slate-400">Annual Output</div>
            <div className="text-sm font-semibold text-white">{metrics.totalOutput}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Processing Lines</div>
            <div className="text-sm font-semibold text-white">{metrics.totalLines}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Blend Varieties</div>
            <div className="text-sm font-semibold text-white">{metrics.totalVarieties}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Origin</div>
            <div className="text-sm font-semibold text-white">Assam</div>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} kg annual, {activeItem.processingLines} lines, {activeItem.oxidationHours}h oxidation, {activeItem.blendVarieties} blends</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
