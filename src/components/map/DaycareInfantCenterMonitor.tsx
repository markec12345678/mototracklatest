'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'di-bright',
    name: 'Bright Horizons Boston Infant',
    lat: 42.360,
    lng: -71.060,
    status: 'stable',
    value: 90,
    infantsEnrolled: 32,
    capacity: 36,
    caregiversOnDuty: 8,
    staffRatio: '1:4',
    ageRange: '6 weeks - 18 months',
    trend: 'up' as const,
    description: 'Bright Horizons Boston infant center with 1:4 staff ratio, 32 of 36 spots filled and individualized care plans for each baby',
  },
  {
    id: 'di-childrens',
    name: 'Children\'s Courtyard Dallas',
    lat: 32.813,
    lng: -96.771,
    status: 'stable',
    value: 84,
    infantsEnrolled: 28,
    capacity: 32,
    caregiversOnDuty: 7,
    staffRatio: '1:4',
    ageRange: '6 weeks - 24 months',
    trend: 'stable' as const,
    description: 'Children\'s Courtyard Dallas with dedicated infant suites, 28 enrolled and weekly developmental milestone tracking',
  },
  {
    id: 'di-tutor',
    name: 'Tutor Time NYC Infant Center',
    lat: 40.744,
    lng: -73.985,
    status: 'moderate',
    value: 74,
    infantsEnrolled: 22,
    capacity: 28,
    caregiversOnDuty: 6,
    staffRatio: '1:4',
    ageRange: '6 weeks - 18 months',
    trend: 'up' as const,
    description: 'Tutor Time Manhattan infant center with 22 of 28 spots filled, breastmilk storage and parent app daily photo updates',
  },
  {
    id: 'di-little',
    name: 'Little Sprouts Atlanta',
    lat: 33.767,
    lng: -84.420,
    status: 'warning',
    value: 60,
    infantsEnrolled: 16,
    capacity: 24,
    caregiversOnDuty: 4,
    staffRatio: '1:4',
    ageRange: '6 weeks - 18 months',
    trend: 'down' as const,
    description: 'Little Sprouts Atlanta facing enrollment decline post-pandemic, 16 of 24 spots with 4 caregivers and reduced operating hours',
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

export function DaycareInfantCenterMonitor() {
  const state = useMapStore((s) => s.daycareInfantCenter)
  const setState = useMapStore((s) => s.setDaycareInfantCenter)

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
    if (filteredData.length === 0) return { totalEnrolled: 0, totalCap: 0, utilization: '0%', totalCaregivers: 0 }
    const totalEnrolled = filteredData.reduce((s: number, d: any) => s + (d.infantsEnrolled as number), 0)
    const totalCap = filteredData.reduce((s: number, d: any) => s + (d.capacity as number), 0)
    const totalCaregivers = filteredData.reduce((s: number, d: any) => s + (d.caregiversOnDuty as number), 0)
    const utilization = totalCap > 0 ? ((totalEnrolled / totalCap) * 100).toFixed(0) : '0'
    return { totalEnrolled, totalCap, utilization: utilization + '%', totalCaregivers }
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-600 to-rose-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128118;</span>
          <h3 className="text-sm font-semibold text-white">Daycare Infant Center</h3>
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
            <div className="text-slate-400">Infants</div>
            <div className="text-sm font-semibold text-white">{metrics.totalEnrolled}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Capacity</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCap}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Utilization</div>
            <div className="text-sm font-semibold text-white">{metrics.utilization}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Caregivers</div>
            <div className="text-sm font-semibold text-white">{metrics.totalCaregivers}</div>
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
                <span className="text-xs text-slate-300">{loc.infantsEnrolled}/{loc.capacity}</span>
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
              Age range: <span className="text-slate-300 font-medium">{activeItem.ageRange}</span>
              &nbsp;&middot;&nbsp; Ratio {activeItem.staffRatio}, {activeItem.caregiversOnDuty} caregivers, {activeItem.infantsEnrolled}/{activeItem.capacity} infants
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
