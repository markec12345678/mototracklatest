'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'jr-fastfix',
    name: 'Fast-Fix Jewelry Repairs Mall of America',
    lat: 44.855,
    lng: -93.242,
    status: 'stable',
    value: 86,
    repairsPerWeek: 145,
    avgRepairValue: 95,
    certifiedGemologists: 3,
    services: 'Ring Sizing, Stone Setting, Watch Battery',
    trend: 'up' as const,
    description: 'Fast-Fix Jewelry Repairs Mall of America with 145 repairs/week, while-you-wear ring sizing and 3 certified gemologists on staff',
  },
  {
    id: 'jr-myclean',
    name: 'My Jewelry Repair Online Service',
    lat: 40.760,
    lng: -73.982,
    status: 'stable',
    value: 88,
    repairsPerWeek: 320,
    avgRepairValue: 145,
    certifiedGemologists: 8,
    services: 'Mail-in, Refurbish, Stone Replace, Engraving',
    trend: 'up' as const,
    description: 'My Jewelry Repair online mail-in service with 320 repairs/week, white-glove shipping and 8 GIA-certified gemologists',
  },
  {
    id: 'jr-idjewelry',
    name: 'ID Jewelry Repair Diamond District NYC',
    lat: 40.760,
    lng: -73.984,
    status: 'moderate',
    value: 74,
    repairsPerWeek: 95,
    avgRepairValue: 180,
    certifiedGemologists: 4,
    services: 'Laser Welding, Platinum, Custom Repairs',
    trend: 'stable' as const,
    description: 'ID Jewelry Repair 47th Street NYC with 95 repairs/week, laser welding for platinum and antique jewelry restoration',
  },
  {
    id: 'jr-local',
    name: 'Local Watchmaker & Jeweler Portland OR',
    lat: 45.523,
    lng: -122.676,
    status: 'warning',
    value: 60,
    repairsPerWeek: 42,
    avgRepairValue: 220,
    certifiedGemologists: 2,
    services: 'Watch Repair, Appraisals, Restring',
    trend: 'down' as const,
    description: 'Local Watchmaker & Jeweler Portland OR facing staffing, 42 repairs/week with GIA appraisal services and pearl restringing',
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

export function JewelryRepairAppraisalMonitor() {
  const state = useMapStore((s) => s.jewelryRepairAppraisal)
  const setState = useMapStore((s) => s.setJewelryRepairAppraisal)

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
    if (filteredData.length === 0) return { totalRepairs: 0, totalGemologists: 0, avgValue: 0 }
    const totalRepairs = filteredData.reduce((s: number, d: any) => s + (d.repairsPerWeek as number), 0)
    const totalGemologists = filteredData.reduce((s: number, d: any) => s + (d.certifiedGemologists as number), 0)
    const avgValue = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgRepairValue as number), 0) / filteredData.length)
    return { totalRepairs, totalGemologists, avgValue }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-500 to-cyan-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9203;&#65039;</span>
          <h3 className="text-sm font-semibold text-white">Jewelry Repair & Appraisal</h3>
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
            <div className="text-slate-400">Repairs/Week</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRepairs}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Repair Value</div>
            <div className="text-sm font-semibold text-white">${metrics.avgValue}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">GIA Gemologists</div>
            <div className="text-sm font-semibold text-white">{metrics.totalGemologists}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Shops</div>
            <div className="text-sm font-semibold text-white">{filteredData.length}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.services}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.repairsPerWeek}/wk</span>
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
              {activeItem.repairsPerWeek} repairs/wk &middot; {activeItem.certifiedGemologists} GIA gemologists
              &nbsp;&middot;&nbsp; ${activeItem.avgRepairValue} avg ticket
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
