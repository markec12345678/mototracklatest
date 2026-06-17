'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'cb-midtown',
    name: 'Midtown Comics NYC',
    lat: 40.754,
    lng: -73.987,
    status: 'stable',
    value: 90,
    dailyCustomers: 420,
    issuesInStock: 48000,
    newReleasesWeekly: 120,
    gradingService: 'CGC Authorized',
    trend: 'up' as const,
    description: 'Midtown Comics Times Square NYC flagship, 420 daily customers with 48K issues in stock and 120 new releases weekly',
  },
  {
    id: 'cb-milehigh',
    name: 'Mile High Comics Denver CO',
    lat: 39.739,
    lng: -104.990,
    status: 'stable',
    value: 84,
    dailyCustomers: 180,
    issuesInStock: 320000,
    newReleasesWeekly: 95,
    gradingService: 'In-House Grading',
    trend: 'stable' as const,
    description: 'Mile High Comics Denver CO, 180 daily customers with massive 320K issue backstock — one of largest US comic retailers',
  },
  {
    id: 'cb-ine',
    name: 'Isotope Comics San Francisco CA',
    lat: 37.760,
    lng: -122.435,
    status: 'moderate',
    value: 72,
    dailyCustomers: 95,
    issuesInStock: 18000,
    newReleasesWeekly: 78,
    gradingService: 'Submission Service',
    trend: 'stable' as const,
    description: 'Isotope Comics San Francisco CA indie favorite, 95 daily customers with curated indie and art comics selection',
  },
  {
    id: 'cb-ekg',
    name: 'Emerald Knight Comics Portland OR',
    lat: 45.515,
    lng: -122.679,
    status: 'warning',
    value: 59,
    dailyCustomers: 65,
    issuesInStock: 12000,
    newReleasesWeekly: 52,
    gradingService: 'None',
    trend: 'down' as const,
    description: 'Emerald Knight Comics Portland OR, 65 daily customers — facing competition from digital and subscription box services',
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

export function ComicBookShopMonitor() {
  const state = useMapStore((s) => s.comicBookShop)
  const setState = useMapStore((s) => s.setComicBookShop)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalIssues: 0, totalReleases: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalIssues = filteredData.reduce((s: number, d: any) => s + (d.issuesInStock as number), 0)
    const totalReleases = filteredData.reduce((s: number, d: any) => s + (d.newReleasesWeekly as number), 0)
    return { totalCustomers, totalIssues, totalReleases }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-600 to-fuchsia-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128214;</span>
          <h3 className="text-sm font-semibold text-white">Comic Book Shop</h3>
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
            <div className="text-slate-400">Issues In Stock</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalIssues / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">New Releases/wk</div>
            <div className="text-sm font-semibold text-white">{metrics.totalReleases}</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.gradingService}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.issuesInStock / 1000).toFixed(0)}K iss</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.issuesInStock.toLocaleString()} issues in stock
              &nbsp;&middot;&nbsp; {activeItem.newReleasesWeekly} new/wk &middot; {activeItem.gradingService}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
