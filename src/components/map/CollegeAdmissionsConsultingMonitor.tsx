'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'ca-ivywise-newyork',
    name: 'IvyWise - New York NY',
    lat: 40.7549,
    lng: -73.984,
    status: 'stable',
    value: 86,
    activeClients: 130,
    monthlyRevenue: 1.0,
    consultantsAvailable: 6,
    flagshipLines: 'IvyWise, Ivy League, Top-Tier Counseling',
    trend: 'up' as const,
    description: 'IvyWise New York NY office serving 130 active clients with 6 consultants; premier independent admissions counseling focused on Ivy League and top-tier universities',
  },
  {
    id: 'ca-collegevine-cambridge',
    name: 'CollegeVine - Cambridge MA',
    lat: 42.3736,
    lng: -71.1097,
    status: 'stable',
    value: 88,
    activeClients: 150,
    monthlyRevenue: 1.2,
    consultantsAvailable: 8,
    flagshipLines: 'CollegeVine, Mentorship Network, Admissions Chancing',
    trend: 'up' as const,
    description: 'CollegeVine Cambridge MA headquarters serving 150 active clients with 8 consultants; data-driven admissions platform and mentorship network for high schoolers',
  },
  {
    id: 'ca-command-la',
    name: 'Command Education - Los Angeles CA',
    lat: 34.0522,
    lng: -118.2437,
    status: 'warning',
    value: 54,
    activeClients: 80,
    monthlyRevenue: 0.6,
    consultantsAvailable: 4,
    flagshipLines: 'Command Education, Boutique, Private Counseling',
    trend: 'down' as const,
    description: 'Command Education Los Angeles CA office serving 80 active clients with 4 consultants; boutique firm facing consultant capacity pressures during peak application season',
  },
  {
    id: 'ca-spark-paloalto',
    name: 'Spark Admissions - Palo Alto CA',
    lat: 37.4419,
    lng: -122.143,
    status: 'stable',
    value: 80,
    activeClients: 100,
    monthlyRevenue: 0.6,
    consultantsAvailable: 6,
    flagshipLines: 'Spark Admissions, STEM, Elite Universities',
    trend: 'stable' as const,
    description: 'Spark Admissions Palo Alto CA office serving 100 active clients with 6 consultants; Bay Area firm specializing in STEM and elite university admissions',
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

export function CollegeAdmissionsConsultingMonitor() {
  const state = useMapStore((s) => s.collegeAdmissionsConsulting)
  const setState = useMapStore((s) => s.setCollegeAdmissionsConsulting)

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
    if (filteredData.length === 0) return { totalClients: 0, totalRevenue: 0, totalConsultants: 0 }
    const totalClients = filteredData.reduce((s: number, d: any) => s + (d.activeClients as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalConsultants = filteredData.reduce((s: number, d: any) => s + (d.consultantsAvailable as number), 0)
    return { totalClients, totalRevenue, totalConsultants }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-stone-500 to-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127891;</span>
          <h3 className="text-sm font-semibold text-white">College Admissions Consulting</h3>
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
            <div className="text-slate-400">Active Clients</div>
            <div className="text-sm font-semibold text-white">{metrics.totalClients.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Revenue $M/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.totalRevenue.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Consultants</div>
            <div className="text-sm font-semibold text-white">{metrics.totalConsultants}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Offices</div>
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
                <span className="text-xs text-slate-300">{loc.consultantsAvailable} consultants</span>
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
              {activeItem.activeClients.toLocaleString()} active clients &middot; ${activeItem.monthlyRevenue.toFixed(2)}M revenue/mo
              &nbsp;&middot;&nbsp; {activeItem.consultantsAvailable} consultants available
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
