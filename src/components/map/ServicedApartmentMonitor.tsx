'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sa-ascott',
    name: 'Ascott Orchard Singapore',
    lat: 1.305,
    lng: 103.840,
    status: 'stable',
    value: 88,
    occupancyPct: 88,
    totalUnits: 220,
    avgStayDays: 21,
    trend: 'up' as const,
    description: 'Somerset serviced residence on Orchard Road with 220 studio to 3-bedroom units for corporate expatriate extended stays',
  },
  {
    id: 'sa-oakwood',
    name: 'Oakwood Premier Tokyo',
    lat: 35.660,
    lng: 139.700,
    status: 'moderate',
    value: 76,
    occupancyPct: 76,
    totalUnits: 124,
    avgStayDays: 35,
    trend: 'stable' as const,
    description: 'Minato-ku luxury serviced apartments with 124 units serving multinational corporate assignments and diplomatic postings',
  },
  {
    id: 'sa-savoy',
    name: 'Savoy Suites London',
    lat: 51.509,
    lng: -0.124,
    status: 'stable',
    value: 91,
    occupancyPct: 91,
    totalUnits: 68,
    avgStayDays: 28,
    trend: 'up' as const,
    description: 'Covent Garden extended-stay suites with 68 units combining hotel services with apartment privacy for business travelers',
  },
  {
    id: 'sa-fraser',
    name: 'Fraser Place Seoul',
    lat: 37.513,
    lng: 127.059,
    status: 'warning',
    value: 64,
    occupancyPct: 64,
    totalUnits: 152,
    avgStayDays: 42,
    trend: 'down' as const,
    description: 'Gangnam business district serviced apartments with 152 units, reduced corporate travel impacting long-stay bookings',
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

export function ServicedApartmentMonitor() {
  const state = useMapStore((s) => s.servicedApartment)
  const setState = useMapStore((s) => s.setServicedApartment)

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
    if (filteredData.length === 0) return { avgOcc: '0', totalUnits: 0, avgStay: 0 }
    const avgOcc = filteredData.reduce((s: number, d: any) => s + (d.occupancyPct as number), 0) / filteredData.length
    const totalUnits = filteredData.reduce((s: number, d: any) => s + (d.totalUnits as number), 0)
    const avgStay = filteredData.reduce((s: number, d: any) => s + (d.avgStayDays as number), 0) / filteredData.length
    return {
      avgOcc: avgOcc.toFixed(0) + '%',
      totalUnits,
      avgStay: avgStay.toFixed(0) + ' days',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-600 to-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127968;</span>
          <h3 className="text-sm font-semibold text-white">Serviced Apartment</h3>
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
            <div className="text-slate-400">Avg Occupancy</div>
            <div className="text-sm font-semibold text-white">{metrics.avgOcc}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Total Units</div>
            <div className="text-sm font-semibold text-white">{metrics.totalUnits}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Stay</div>
            <div className="text-sm font-semibold text-white">{metrics.avgStay}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Min Lease</div>
            <div className="text-sm font-semibold text-white">7 days</div>
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
                <span className="text-xs text-slate-300">{loc.occupancyPct}%</span>
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
              <span className="text-slate-300 font-medium">{activeItem.occupancyPct}% occupancy, {activeItem.totalUnits} units, {activeItem.avgStayDays} days avg stay</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
