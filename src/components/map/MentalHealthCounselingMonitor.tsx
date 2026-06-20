'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'mhc-betterhelp-mountainview',
    name: 'BetterHelp HQ Mountain View CA',
    lat: 37.386,
    lng: -122.083,
    status: 'stable',
    value: 84,
    dailyPatients: 420,
    monthlyRevenue: 2.4,
    therapyRooms: 16,
    flagshipLines: 'BetterHelp, online therapy, couples counseling, CBT, mindfulness',
    trend: 'up' as const,
    description: 'BetterHelp HQ Mountain View CA flagship office, 420 daily patients across 16 therapy rooms; largest online therapy platform with hybrid in-person suites',
  },
  {
    id: 'mhc-talkspace-nyc',
    name: 'Talkspace NYC New York NY',
    lat: 40.718,
    lng: -74.001,
    status: 'stable',
    value: 79,
    dailyPatients: 360,
    monthlyRevenue: 2.1,
    therapyRooms: 14,
    flagshipLines: 'Talkspace, text therapy, psychiatry, teen counseling, EAP',
    trend: 'up' as const,
    description: 'Talkspace NYC New York NY flagship office, 360 daily patients across 14 therapy rooms; telehealth-led mental health provider with employer network reach',
  },
  {
    id: 'mhc-pathlight-chicago',
    name: 'Pathlight Behavioral Health Chicago IL',
    lat: 41.881,
    lng: -87.63,
    status: 'moderate',
    value: 71,
    dailyPatients: 295,
    monthlyRevenue: 1.8,
    therapyRooms: 18,
    flagshipLines: 'Pathlight, mood disorder, anxiety, IOP, PHP, group therapy',
    trend: 'stable' as const,
    description: 'Pathlight Behavioral Health Chicago IL flagship clinic, 295 daily patients across 18 therapy rooms; intensive outpatient and partial hospitalization programs',
  },
  {
    id: 'mhc-brightside-sanfrancisco',
    name: 'Brightside Health San Francisco CA',
    lat: 37.779,
    lng: -122.393,
    status: 'stable',
    value: 82,
    dailyPatients: 245,
    monthlyRevenue: 1.6,
    therapyRooms: 12,
    flagshipLines: 'Brightside, depression care, anxiety medication, psychiatry, coaching',
    trend: 'up' as const,
    description: 'Brightside Health San Francisco CA flagship office, 245 daily patients across 12 therapy rooms; telepsychiatry leader targeting depression and anxiety treatment',
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

export function MentalHealthCounselingMonitor() {
  const state = useMapStore((s) => s.mentalHealthCounseling)
  const setState = useMapStore((s) => s.setMentalHealthCounseling)

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
    if (filteredData.length === 0) return { totalPatients: 0, totalRevenue: 0, totalTherapyRooms: 0 }
    const totalPatients = filteredData.reduce((s: number, d: any) => s + (d.dailyPatients as number), 0)
    const totalRevenue = filteredData.reduce((s: number, d: any) => s + (d.monthlyRevenue as number), 0)
    const totalTherapyRooms = filteredData.reduce((s: number, d: any) => s + (d.therapyRooms as number), 0)
    return { totalPatients, totalRevenue, totalTherapyRooms }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-700 to-purple-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#129504;</span>
          <h3 className="text-sm font-semibold text-white">Mental Health Counseling</h3>
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
            <div className="text-slate-400">Rooms</div>
            <div className="text-sm font-semibold text-white">{metrics.totalTherapyRooms.toLocaleString()}</div>
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
                <span className="text-xs text-slate-300">{loc.therapyRooms} rm</span>
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
              &nbsp;&middot;&nbsp; {activeItem.therapyRooms.toLocaleString()} therapy rooms
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
