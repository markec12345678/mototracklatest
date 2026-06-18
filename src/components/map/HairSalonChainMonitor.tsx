'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'hs-greatclips',
    name: 'Great Clips Minneapolis',
    lat: 44.979,
    lng: -93.265,
    status: 'stable',
    value: 88,
    customersPerHour: 24,
    avgWaitMin: 18,
    stylistsOnDuty: 6,
    trend: 'up' as const,
    description: 'Great Clips flagship in Minneapolis HQ area with online check-in and 6 stylists serving 24 customers per hour on average',
  },
  {
    id: 'hs-supercuts',
    name: 'Supercuts LA Westwood',
    lat: 34.063,
    lng: -118.446,
    status: 'moderate',
    value: 74,
    customersPerHour: 18,
    avgWaitMin: 25,
    stylistsOnDuty: 4,
    trend: 'stable' as const,
    description: 'Supercuts Westwood location near UCLA campus serving students with affordable haircuts and Supercut color services',
  },
  {
    id: 'hs-fantasticsams',
    name: 'Fantastic Sams Boston',
    lat: 42.36,
    lng: -71.058,
    status: 'stable',
    value: 82,
    customersPerHour: 21,
    avgWaitMin: 15,
    stylistsOnDuty: 5,
    trend: 'up' as const,
    description: 'Fantastic Sams Boston downtown location offering full-service hair care including color, perms and highlights for families',
  },
  {
    id: 'hs-costcutters',
    name: 'Cost Cutters Houston',
    lat: 29.763,
    lng: -95.363,
    status: 'warning',
    value: 62,
    customersPerHour: 12,
    avgWaitMin: 35,
    stylistsOnDuty: 3,
    trend: 'down' as const,
    description: 'Cost Cutters Houston suburban location facing staffing shortages with reduced stylist coverage and longer wait times',
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

export function HairSalonChainMonitor() {
  const state = useMapStore((s) => s.hairSalonChain)
  const setState = useMapStore((s) => s.setHairSalonChain)

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
    if (filteredData.length === 0) return { totalCustomers: 0, avgWait: '0m', totalStylists: 0, avgPerStylist: '0' }
    const totalCustomers = filteredData.reduce((s: number, d: any) => s + (d.customersPerHour as number), 0)
    const avgWait = filteredData.reduce((s: number, d: any) => s + (d.avgWaitMin as number), 0) / filteredData.length
    const totalStylists = filteredData.reduce((s: number, d: any) => s + (d.stylistsOnDuty as number), 0)
    const avgPerStylist = totalStylists > 0 ? totalCustomers / totalStylists : 0
    return {
      totalCustomers,
      avgWait: avgWait.toFixed(0) + 'm',
      totalStylists,
      avgPerStylist: avgPerStylist.toFixed(1),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-600 to-pink-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9986;</span>
          <h3 className="text-sm font-semibold text-white">Hair Salon Chain</h3>
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
            <div className="text-slate-400">Customers / hr</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCustomers}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWait}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Stylists On Duty</div>
            <div className="text-sm font-semibold text-white">{metrics.totalStylists}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Cust / stylist</div>
            <div className="text-sm font-semibold text-white">{metrics.avgPerStylist}</div>
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
                <span className="text-xs text-slate-300">{loc.customersPerHour}/hr</span>
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
              <span className="text-slate-300 font-medium">{activeItem.customersPerHour} customers/hr, {activeItem.avgWaitMin}m wait, {activeItem.stylistsOnDuty} stylists</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
