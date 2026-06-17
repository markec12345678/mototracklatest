'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'vr-grimey',
    name: 'Grimey\'s Too Nashville TN',
    lat: 36.157,
    lng: -86.782,
    status: 'stable',
    value: 89,
    dailyCustomers: 220,
    lpsInStock: 12000,
    newReleasesWeekly: 85,
    specialty: 'Indie, Country, Americana',
    trend: 'up' as const,
    description: "Grimey's Too Nashville TN, 220 daily customers with 12K LPs — indie and Americana hub with in-store performances",
  },
  {
    id: 'vr-amoeba',
    name: 'Amoeba Music Berkeley CA',
    lat: 37.861,
    lng: -122.259,
    status: 'stable',
    value: 91,
    dailyCustomers: 580,
    lpsInStock: 85000,
    newReleasesWeekly: 240,
    specialty: 'Comprehensive Catalog, Used',
    trend: 'stable' as const,
    description: 'Amoeba Music Berkeley CA flagship, 580 daily customers with 85K LPs — largest independent record store in the US',
  },
  {
    id: 'vr-waterloo',
    name: 'Waterloo Records Austin TX',
    lat: 30.299,
    lng: -97.741,
    status: 'moderate',
    value: 76,
    dailyCustomers: 165,
    lpsInStock: 22000,
    newReleasesWeekly: 110,
    specialty: 'Indie, Vinyl Reissues, Local',
    trend: 'stable' as const,
    description: 'Waterloo Records Austin TX, 165 daily customers with 22K LPs — Austin indie staple since 1982',
  },
  {
    id: 'vr-princeton',
    name: 'Princeton Record Exchange Princeton NJ',
    lat: 40.350,
    lng: -74.659,
    status: 'warning',
    value: 62,
    dailyCustomers: 78,
    lpsInStock: 32000,
    newReleasesWeekly: 45,
    specialty: 'Used Vinyl, Jazz, Classical',
    trend: 'down' as const,
    description: 'Princeton Record Exchange Princeton NJ, 78 daily customers with 32K LPs — used vinyl heavy; new release flow slowing',
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

export function VinylRecordStoreMonitor() {
  const state = useMapStore((s) => s.vinylRecordStore)
  const setState = useMapStore((s) => s.setVinylRecordStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalLps: 0, totalReleases: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalLps = filteredData.reduce((s: number, d: any) => s + (d.lpsInStock as number), 0)
    const totalReleases = filteredData.reduce((s: number, d: any) => s + (d.newReleasesWeekly as number), 0)
    return { totalCustomers, totalLps, totalReleases }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-pink-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128191;</span>
          <h3 className="text-sm font-semibold text-white">Vinyl Record Store</h3>
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
            <div className="text-slate-400">Daily Customers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">LPs In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalLps / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">New Releases/wk</div>
            <div className="text-sm font-semibold text-white">{metrics.totalReleases}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.specialty}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.lpsInStock / 1000).toFixed(0)}K</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.lpsInStock.toLocaleString()} LPs in stock
              &nbsp;&middot;&nbsp; {activeItem.newReleasesWeekly} new releases/wk &middot; {activeItem.specialty}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
