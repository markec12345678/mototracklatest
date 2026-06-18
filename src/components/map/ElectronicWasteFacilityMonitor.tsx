'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ew-eri',
    name: 'ERI Fresno CA',
    lat: 36.738,
    lng: -119.785,
    status: 'stable',
    value: 92,
    unitsPerDay: 15000,
    lbsRecovered: 92000,
    dataDestruction: 'NIST 800-88',
    certifications: 'R2v3, e-Stewards, ISO 14001',
    trend: 'up' as const,
    description: 'ERI Fresno CA flagship e-waste facility, 15,000 units/day with NIST 800-88 data destruction; R2v3, e-Stewards and ISO 14001 certified',
  },
  {
    id: 'ew-sims',
    name: 'Sims Recycling Solutions Roseville CA',
    lat: 38.752,
    lng: -121.288,
    status: 'stable',
    value: 87,
    unitsPerDay: 11000,
    lbsRecovered: 67000,
    dataDestruction: 'DoD 5220.22-M',
    certifications: 'R2v3, e-Stewards',
    trend: 'stable' as const,
    description: 'Sims Recycling Solutions Roseville CA, 11,000 units/day with DoD 5220.22-M wipe and physical shredding for high-security clients',
  },
  {
    id: 'ew-wmra',
    name: 'Waste Management Recycle America MN',
    lat: 44.977,
    lng: -93.265,
    status: 'moderate',
    value: 73,
    unitsPerDay: 8500,
    lbsRecovered: 51000,
    dataDestruction: 'NIST 800-88',
    certifications: 'R2v3',
    trend: 'stable' as const,
    description: 'Waste Management Recycle America Minneapolis MN, 8,500 units/day with R2v3 certification serving Midwest corporate take-back programs',
  },
  {
    id: 'ew-electronicicycle',
    name: 'ElectroniCycle Gardner MA',
    lat: 42.575,
    lng: -71.999,
    status: 'warning',
    value: 61,
    unitsPerDay: 6200,
    lbsRecovered: 38000,
    dataDestruction: 'Physical Destruction',
    certifications: 'State-Permitted',
    trend: 'down' as const,
    description: 'ElectroniCycle Gardner MA, 6,200 units/day — missing R2v3 certification limiting corporate contracts, physical destruction only',
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

export function ElectronicWasteFacilityMonitor() {
  const state = useMapStore((s) => s.electronicWasteFacility)
  const setState = useMapStore((s) => s.setElectronicWasteFacility)

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
    if (filteredData.length === 0) return { totalUnits: 0, totalLbs: 0, certifiedCount: 0 }
    const totalUnits = filteredData.reduce((s: number, d: any) => s + (d.unitsPerDay as number), 0)
    const totalLbs = filteredData.reduce((s: number, d: any) => s + (d.lbsRecovered as number), 0)
    const certifiedCount = filteredData.filter((d: any) => d.certifications.includes('R2v3')).length
    return { totalUnits, totalLbs, certifiedCount }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-600 to-blue-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128187;</span>
          <h3 className="text-sm font-semibold text-white">Electronic Waste Facility</h3>
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
            <div className="text-slate-400">Units / Day</div>
            <div className="text-sm font-semibold text-white">{metrics.totalUnits.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Lbs Recovered</div>
            <div className="text-sm font-semibold text-white">{(metrics.totalLbs / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">R2v3 Certified</div>
            <div className="text-sm font-semibold text-white">{metrics.certifiedCount}/{filteredData.length}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Facilities</div>
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
                  <div className="text-[10px] text-slate-400 truncate">{loc.dataDestruction}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-xs text-slate-300">{(loc.unitsPerDay / 1000).toFixed(1)}K u/d</span>
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
              {activeItem.unitsPerDay.toLocaleString()} units/day &middot; {activeItem.lbsRecovered.toLocaleString()} lbs recovered
              &nbsp;&middot;&nbsp; {activeItem.dataDestruction} &middot; {activeItem.certifications}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
