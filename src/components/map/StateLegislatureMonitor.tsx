'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'sl-sacramento',
    name: 'California State Capitol',
    lat: 38.58,
    lng: -121.5,
    status: 'stable',
    value: 120,
    senatorsTotal: 120,
    billsInSession: 1240,
    sessionDaysYear: 220,
    trend: 'up' as const,
    description: 'California legislature in Sacramento with 40 senators and 80 assembly members, 1,240 bills introduced in current two-year session',
  },
  {
    id: 'sl-texas',
    name: 'Texas State Capitol',
    lat: 30.27,
    lng: -97.74,
    status: 'moderate',
    value: 181,
    senatorsTotal: 181,
    billsInSession: 6800,
    sessionDaysYear: 140,
    trend: 'up' as const,
    description: 'Texas Legislature in Austin with 31 senators and 150 representatives, 6,800 bills filed in 140-day biennial session',
  },
  {
    id: 'sl-bavaria',
    name: 'Bavarian Landtag Munich',
    lat: 48.14,
    lng: 11.58,
    status: 'stable',
    value: 205,
    senatorsTotal: 205,
    billsInSession: 95,
    sessionDaysYear: 70,
    trend: 'stable' as const,
    description: 'Bavarian State Parliament in Munich Maximilianeum with 205 members, 95 bills under consideration in 70 session days',
  },
  {
    id: 'sl-new south wales',
    name: 'NSW Parliament Sydney',
    lat: -33.87,
    lng: 151.21,
    status: 'warning',
    value: 135,
    senatorsTotal: 135,
    billsInSession: 168,
    sessionDaysYear: 75,
    trend: 'down' as const,
    description: 'New South Wales Parliament in Sydney with 135 members, 168 bills in pipeline but session calendar compressed by budget debate',
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

export function StateLegislatureMonitor() {
  const state = useMapStore((s) => s.stateLegislature)
  const setState = useMapStore((s) => s.setStateLegislature)

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
    if (filteredData.length === 0) return { senatorsTotal: 0, billsInSession: 0, sessionDaysYear: 0 }
    const senatorsTotal = filteredData.reduce((s: number, d: any) => s + (d.senatorsTotal as number), 0)
    const billsInSession = filteredData.reduce((s: number, d: any) => s + (d.billsInSession as number), 0)
    const sessionDaysYear = filteredData.reduce((s: number, d: any) => s + (d.sessionDaysYear as number), 0) / filteredData.length
    return {
      senatorsTotal: senatorsTotal.toLocaleString(),
      billsInSession: billsInSession.toLocaleString(),
      sessionDaysYear: sessionDaysYear.toFixed(0) + ' /y',
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-violet-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128204;</span>
          <h3 className="text-sm font-semibold text-white">State Legislature</h3>
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
            <div className="text-slate-400">Total Members</div>
            <div className="text-sm font-semibold text-white">{metrics.senatorsTotal}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bills in Session</div>
            <div className="text-sm font-semibold text-white">{metrics.billsInSession}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Session Days</div>
            <div className="text-sm font-semibold text-white">{metrics.sessionDaysYear}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Throughput</div>
            <div className="text-sm font-semibold text-white">Texas</div>
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
                <span className="text-xs text-slate-300">{loc.value} mbrs</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} members, {activeItem.billsInSession.toLocaleString()} bills in {activeItem.sessionDaysYear} session days</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
