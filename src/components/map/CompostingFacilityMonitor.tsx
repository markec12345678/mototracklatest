'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'co-cedar',
    name: 'Cedar Grove Composting Maple Valley WA',
    lat: 47.394,
    lng: -122.046,
    status: 'stable',
    value: 90,
    tonsPerDay: 600,
    curingDays: 45,
    cubicYards: 28000,
    organicCertified: true,
    trend: 'up' as const,
    description: 'Cedar Grove Composting Maple Valley WA, 600 t/day of yard and food waste with 45-day curing cycle, OMRI organic certified',
  },
  {
    id: 'co-recology',
    name: 'Recology Compost Vacaville CA',
    lat: 38.357,
    lng: -121.989,
    status: 'stable',
    value: 86,
    tonsPerDay: 450,
    curingDays: 60,
    cubicYards: 21000,
    organicCertified: true,
    trend: 'stable' as const,
    description: 'Recology Compost Vacaville CA, 450 t/day serving San Francisco organics program with 60-day curing and organic certification',
  },
  {
    id: 'co-angel',
    name: 'Angel Valley Organics Georgetown TX',
    lat: 30.633,
    lng: -97.678,
    status: 'moderate',
    value: 73,
    tonsPerDay: 320,
    curingDays: 75,
    cubicYards: 14000,
    organicCertified: true,
    trend: 'up' as const,
    description: 'Angel Valley Organics Georgetown TX, 320 t/day with 75-day extended curing for Texas heat climate, OMRI organic certified',
  },
  {
    id: 'co-stl',
    name: 'St. Louis Composting Valley Park MO',
    lat: 38.542,
    lng: -90.490,
    status: 'warning',
    value: 58,
    tonsPerDay: 280,
    curingDays: 90,
    cubicYards: 11000,
    organicCertified: false,
    trend: 'down' as const,
    description: 'St. Louis Composting Valley Park MO, 280 t/day with 90-day curing cycle; certification pending, facing odor complaints',
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

export function CompostingFacilityMonitor() {
  const state = useMapStore((s) => s.compostingFacility)
  const setState = useMapStore((s) => s.setCompostingFacility)

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
    if (filteredData.length === 0) return { totalTons: 0, totalYards: 0, certifiedPct: 0 }
    const totalTons = filteredData.reduce((s: number, d: any) => s + (d.tonsPerDay as number), 0)
    const totalYards = filteredData.reduce((s: number, d: any) => s + (d.cubicYards as number), 0)
    const certifiedCount = filteredData.filter((d: any) => d.organicCertified).length
    const certifiedPct = Math.round((certifiedCount / filteredData.length) * 100)
    return { totalTons, totalYards, certifiedPct }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-lime-500 to-emerald-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127793;</span>
          <h3 className="text-sm font-semibold text-white">Composting Facility</h3>
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
            <div className="text-slate-400">Tons / Day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTons.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Inventory CY</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalYards / 1000).toFixed(1)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Organic Certified</div>
            <div className="text-sm font-semibold text-white">{metrics.certifiedPct}%</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Sites</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.curingDays}-day cure &middot; {loc.organicCertified ? 'Organic' : 'Pending'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{loc.tonsPerDay} t/d</span>
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
              {activeItem.tonsPerDay} t/day &middot; {activeItem.curingDays}-day cure &middot; {activeItem.cubicYards.toLocaleString()} cu yd inventory
              &nbsp;&middot;&nbsp; {activeItem.organicCertified ? 'OMRI Organic Certified' : 'Certification pending'}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
