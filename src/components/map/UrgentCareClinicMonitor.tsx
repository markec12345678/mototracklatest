'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'uc-citymd',
    name: 'CityMD Manhattan NYC',
    lat: 40.7549,
    lng: -73.984,
    status: 'stable',
    value: 86,
    dailyPatients: 240,
    monthlyRevenue: 1.8,
    bedsAvailable: 14,
    flagshipLines: 'CityMD, Summit Health, Walk-In X-Ray',
    trend: 'up' as const,
    description: 'CityMD Manhattan NYC flagship urgent care clinic in Midtown, 240 daily patients with 14 treatment beds; high-throughput walk-in model serving commuters and tourists',
  },
  {
    id: 'uc-carenow',
    name: 'CareNow Urgent Care Dallas TX',
    lat: 32.7781,
    lng: -96.7954,
    status: 'moderate',
    value: 71,
    dailyPatients: 165,
    monthlyRevenue: 1.2,
    bedsAvailable: 10,
    flagshipLines: 'CareNow, HCA Healthcare, Occupational Health',
    trend: 'stable' as const,
    description: 'CareNow Urgent Care Dallas TX clinic near Uptown district, 165 daily patients with 10 treatment beds; part of HCA Healthcare network serving DFW metroplex',
  },
  {
    id: 'uc-gohealth',
    name: 'GoHealth Urgent Care Atlanta GA',
    lat: 33.8489,
    lng: -84.3733,
    status: 'warning',
    value: 58,
    dailyPatients: 120,
    monthlyRevenue: 0.9,
    bedsAvailable: 8,
    flagshipLines: 'GoHealth, Northside Hospital, Telemedicine',
    trend: 'down' as const,
    description: 'GoHealth Urgent Care Atlanta GA clinic in Buckhead, 120 daily patients with 8 treatment beds; partnership with Northside Hospital facing staffing pressures',
  },
  {
    id: 'uc-fastmed',
    name: 'FastMed Urgent Care Phoenix AZ',
    lat: 33.4484,
    lng: -112.074,
    status: 'critical',
    value: 42,
    dailyPatients: 95,
    monthlyRevenue: 0.7,
    bedsAvailable: 6,
    flagshipLines: 'FastMed, ACL Digital, Occupational Med',
    trend: 'down' as const,
    description: 'FastMed Urgent Care Phoenix AZ clinic in Central Corridor, 95 daily patients with 6 treatment beds; respiratory illness surge straining capacity during peak season',
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

export function UrgentCareClinicMonitor() {
  const state = useMapStore((s) => s.urgentCareClinic)
  const setState = useMapStore((s) => s.setUrgentCareClinic)

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
    if (filteredData.length === 0) return { totalPatients: 0, totalRevenue: 0, totalBeds: 0 }
    const totalPatients = filteredData.reduce((s: number, d: any) => s + (d.dailyPatients as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalBeds = filteredData.reduce((s: number, d: any) => s + (d.bedsAvailable as number), 0)
    return { totalPatients, totalRevenue, totalBeds }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-700 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129658;</span>
          <h3 className="text-sm font-semibold text-white">Urgent Care Clinic</h3>
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
            <div className="text-slate-400">Daily Patients</div>
            <div className="text-sm font-semibold text-white">{metrics.totalPatients.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Beds Avail</div>
            <div className="text-sm font-semibold text-white">{metrics.totalBeds}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Clinics</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.flagshipLines}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.bedsAvailable} beds</span>
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
              {activeItem.dailyPatients.toLocaleString()} patients/day &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.bedsAvailable} beds available
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
