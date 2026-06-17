'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mb-mattressfirm',
    name: 'Mattress Firm Houston TX HQ',
    lat: 29.760,
    lng: -95.369,
    status: 'stable',
    value: 89,
    dailyCustomers: 320,
    monthlyUnits: 1850,
    avgTicketSize: 1450,
    brandLines: 'Sealy, Serta, Simmons, Tempur-Pedic',
    trend: 'up' as const,
    description: 'Mattress Firm Houston TX headquarters, 320 daily customers and 1,850 mattresses sold monthly across Sealy, Serta, Simmons and Tempur-Pedic brands',
  },
  {
    id: 'mb-sleepnumber',
    name: 'Sleep Number Minneapolis MN',
    lat: 44.977,
    lng: -93.265,
    status: 'stable',
    value: 86,
    dailyCustomers: 145,
    monthlyUnits: 620,
    avgTicketSize: 3200,
    brandLines: '360 Smart Bed, Climate360, Memory Foam',
    trend: 'stable' as const,
    description: 'Sleep Number Minneapolis flagship, 145 daily customers with $3,200 avg ticket for adjustable-air 360 smart beds with sleep tracking',
  },
  {
    id: 'mb-casper',
    name: 'Casper Sleep NYC',
    lat: 40.728,
    lng: -73.997,
    status: 'moderate',
    value: 72,
    dailyCustomers: 180,
    monthlyUnits: 980,
    avgTicketSize: 1100,
    brandLines: 'Original, Wave Hybrid, Element, Nova',
    trend: 'stable' as const,
    description: 'Casper Sleep NYC showroom, 180 daily customers with $1,100 avg ticket for bed-in-a-box foam and hybrid mattresses with 100-night trial',
  },
  {
    id: 'mb-tempurpedic',
    name: 'Tempur-Pedic Lexington KY',
    lat: 38.041,
    lng: -84.503,
    status: 'warning',
    value: 61,
    dailyCustomers: 95,
    monthlyUnits: 410,
    avgTicketSize: 2800,
    brandLines: 'TEMPUR-ProAdapt, TEMPUR-LuxeAdapt, Breeze',
    trend: 'down' as const,
    description: 'Tempur-Pedic Lexington KY retail store facing softer demand, 95 daily customers with $2,800 avg ticket for memory foam mattresses',
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

export function MattressBeddingStoreMonitor() {
  const state = useMapStore((s) => s.mattressBeddingStore)
  const setState = useMapStore((s) => s.setMattressBeddingStore)

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
    if (filteredData.length === 0) return { totalCustomers: 0, totalUnits: 0, avgTicket: 0 }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.dailyCustomers as number), 0)
    const totalUnits = filteredData.reduce((s: number, d: any) => s + (d.monthlyUnits as number), 0)
    const avgTicket = Math.round(filteredData.reduce((s: number, d: any) => s + (d.avgTicketSize as number), 0) / filteredData.length)
    return { totalCustomers, totalUnits, avgTicket }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500 to-violet-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128716;</span>
          <h3 className="text-sm font-semibold text-white">Mattress & Bedding Store</h3>
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
            <div className="text-slate-400">Monthly Units</div>
            <div className="text-sm font-semibold text-white">{metrics.totalUnits.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Ticket</div>
            <div className="text-sm font-semibold text-white">${(metrics.avgTicket / 1000).toFixed(1)}k</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.brandLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.monthlyUnits}/mo</span>
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
              {activeItem.dailyCustomers} customers/day &middot; {activeItem.monthlyUnits.toLocaleString()} units/mo
              &nbsp;&middot;&nbsp; ${activeItem.avgTicketSize.toLocaleString()} avg ticket
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
