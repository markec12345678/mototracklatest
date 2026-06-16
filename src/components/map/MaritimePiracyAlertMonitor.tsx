'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pir-gulf-aden',
    name: 'Gulf of Aden HRA',
    lat: 12.5,
    lng: 47.5,
    status: 'warning',
    value: 4,
    incidentsMonth: 4,
    suspiciousApproaches: 11,
    vesselsTransiting: 320,
    navalEscortAvail: 6,
    trend: 'up' as const,
    description: 'High Risk Area experiencing renewed skiff activity with combined task forces providing convoy escorts through the Internationally Recommended Transit Corridor',
  },
  {
    id: 'pir-guinea',
    name: 'Gulf of Guinea',
    lat: 3.5,
    lng: 5.5,
    status: 'critical',
    value: 8,
    incidentsMonth: 8,
    suspiciousApproaches: 14,
    vesselsTransiting: 185,
    navalEscortAvail: 2,
    trend: 'up' as const,
    description: 'West African waters showing elevated kidnap-for-ransom attacks with offshore supply vessels targeted at anchorage zones beyond national EEZ patrols',
  },
  {
    id: 'pir-malacca',
    name: 'Strait of Malacca',
    lat: 2.5,
    lng: 101.4,
    status: 'moderate',
    value: 2,
    incidentsMonth: 2,
    suspiciousApproaches: 5,
    vesselsTransiting: 1240,
    navalEscortAvail: 4,
    trend: 'down' as const,
    description: 'Regional cooperation between Indonesia Malaysia and Singapore reducing robbery attempts at anchorage with increased patrols showing results',
  },
  {
    id: 'pir-caribbean',
    name: 'Caribbean Basin',
    lat: 14.5,
    lng: -75.0,
    status: 'stable',
    value: 1,
    incidentsMonth: 1,
    suspiciousApproaches: 3,
    vesselsTransiting: 580,
    navalEscortAvail: 3,
    trend: 'down' as const,
    description: 'Low threat environment with occasional petty theft at anchorages countered by coast guard presence and crew watch-keeping diligence',
  },
]

const STATUS_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  moderate: 'bg-blue-500',
  stable: 'bg-emerald-500',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up') return <span className="text-red-400">&uarr;</span>
  if (trend === 'down') return <span className="text-emerald-400">&darr;</span>
  return <span className="text-slate-400">&rarr;</span>
}

export function MaritimePiracyAlertMonitor() {
  const state = useMapStore((s) => s.maritimePiracyAlert)
  const setState = useMapStore((s) => s.setMaritimePiracyAlert)

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
    if (filteredData.length === 0) return { incidentsMonth: 0, suspiciousApproaches: 0, vesselsTransiting: 0, navalEscortAvail: 0 }
    const incidentsMonth = filteredData.reduce((s: number, d: any) => s + (d.incidentsMonth as number), 0)
    const suspiciousApproaches = filteredData.reduce((s: number, d: any) => s + (d.suspiciousApproaches as number), 0)
    const vesselsTransiting = filteredData.reduce((s: number, d: any) => s + (d.vesselsTransiting as number), 0)
    const navalEscortAvail = filteredData.reduce((s: number, d: any) => s + (d.navalEscortAvail as number), 0)
    return {
      incidentsMonth: incidentsMonth.toLocaleString(),
      suspiciousApproaches: suspiciousApproaches.toLocaleString(),
      vesselsTransiting: vesselsTransiting.toLocaleString(),
      navalEscortAvail: navalEscortAvail.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500 to-rose-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#9876;</span>
          <h3 className="text-sm font-semibold text-white">Maritime Piracy Alert</h3>
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
            <div className="text-slate-400">Incidents/mo</div>
            <div className="text-sm font-semibold text-white">{metrics.incidentsMonth}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Suspicious Appr.</div>
            <div className="text-sm font-semibold text-white">{metrics.suspiciousApproaches}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Vessels Transiting</div>
            <div className="text-sm font-semibold text-white">{metrics.vesselsTransiting}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Naval Escorts</div>
            <div className="text-sm font-semibold text-white">{metrics.navalEscortAvail}</div>
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
                <span className="text-xs text-slate-300">{loc.value} incidents</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} piracy incidents this month</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
