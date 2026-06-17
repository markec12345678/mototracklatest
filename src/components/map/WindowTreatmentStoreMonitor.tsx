'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'wt-budgetblinds',
    name: 'Budget Blinds Irvine CA HQ',
    lat: 33.679,
    lng: -117.773,
    status: 'stable',
    value: 90,
    weeklyInstallations: 185,
    avgOrderValue: 1650,
    franchisesActive: 1200,
    productLines: 'Blinds, Shades, Shutters, Drapes',
    trend: 'up' as const,
    description: 'Budget Blinds Irvine CA headquarters, 185 weekly in-home installations with $1,650 avg order across 1,200 active franchise territories',
  },
  {
    id: 'wt-nextday',
    name: 'Next Day Blinds Elkridge MD',
    lat: 39.198,
    lng: -76.709,
    status: 'stable',
    value: 84,
    weeklyInstallations: 92,
    avgOrderValue: 1280,
    franchisesActive: 38,
    productLines: 'Wood Blinds, Faux Wood, Cellular, Roller',
    trend: 'stable' as const,
    description: 'Next Day Blinds Elkridge MD, 92 weekly installations with $1,280 avg order specializing in 24-hour turnaround custom blinds',
  },
  {
    id: 'wt-3day',
    name: '3 Day Blinds Corona CA',
    lat: 33.875,
    lng: -117.566,
    status: 'moderate',
    value: 73,
    weeklyInstallations: 68,
    avgOrderValue: 1450,
    franchisesActive: 24,
    productLines: 'Cellular, Roman, Solar, Vertical',
    trend: 'stable' as const,
    description: '3 Day Blinds Corona CA, 68 weekly installations with $1,450 avg order for cellular, Roman and solar shades with 3-day production',
  },
  {
    id: 'wt-shadestore',
    name: 'The Shade Store New York NYC',
    lat: 40.758,
    lng: -73.975,
    status: 'warning',
    value: 62,
    weeklyInstallations: 42,
    avgOrderValue: 3200,
    franchisesActive: 12,
    productLines: 'Woven Woods, Roman, Roller, Drapery',
    trend: 'down' as const,
    description: 'The Shade Store NYC flagship facing softer high-end demand, 42 weekly installations with $3,200 avg order for custom woven wood and Roman shades',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-emerald-400">&uarr;</span>
  if (trend === 'down') return <span className="text-rose-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function WindowTreatmentStoreMonitor() {
  const state = useMapStore((s) => s.windowTreatmentStore)
  const setState = useMapStore((s) => s.setWindowTreatmentStore)

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
    if (filteredData.length === 0) return { totalInstalls: 0, totalOrderValue: 0, totalFranchises: 0 }
    const totalInstalls = filteredData.reduce((s: number, d: any) => s + (d.weeklyInstallations as number), 0)
    const totalOrderValue = filteredData.reduce((s: number, d: any) => s + (d.avgOrderValue as number), 0)
    const totalFranchises = filteredData.reduce((s: number, d: any) => s + (d.franchisesActive as number), 0)
    return { totalInstalls, totalOrderValue, totalFranchises }
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
          <span className="text-lg">&#128713;</span>
          <h3 className="text-sm font-semibold text-white">Window Treatment Store</h3>
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
            <div className="text-slate-400">Weekly Installs</div>
            <div className="text-sm font-semibold text-white">{metrics.totalInstalls}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Order</div>
            <div className="text-sm font-semibold text-white">${(metrics.totalOrderValue / 1000).toFixed(1)}k</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Franchises</div>
            <div className="text-sm font-semibold text-white">{metrics.totalFranchises.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stores</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.productLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">${(loc.avgOrderValue / 1000).toFixed(1)}k</span>
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
              {activeItem.weeklyInstallations} installs/week &middot; ${activeItem.avgOrderValue.toLocaleString()} avg order
              &nbsp;&middot;&nbsp; {activeItem.franchisesActive.toLocaleString()} franchises
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
