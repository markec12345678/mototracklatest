'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pc-westminster',
    name: 'Palace of Westminster',
    lat: 51.5,
    lng: -0.12,
    status: 'stable',
    value: 650,
    seatsTotal: 650,
    seatsOccupied: 650,
    billsInSession: 38,
    securityLevel: 'high',
    trend: 'stable' as const,
    description: 'UK Parliament Houses of Commons and Lords meeting at Westminster Palace, 650 MPs in active session with 38 bills under consideration',
  },
  {
    id: 'pc-capitol',
    name: 'US Capitol Building',
    lat: 38.89,
    lng: -77.01,
    status: 'moderate',
    value: 535,
    seatsTotal: 535,
    seatsOccupied: 535,
    billsInSession: 124,
    securityLevel: 'high',
    trend: 'up' as const,
    description: 'US Congress with 100 senators and 435 representatives, 124 bills in active committee markup and floor consideration',
  },
  {
    id: 'pc-bundestag',
    name: 'Reichstag Berlin',
    lat: 52.52,
    lng: 13.38,
    status: 'stable',
    value: 736,
    seatsTotal: 736,
    seatsOccupied: 733,
    billsInSession: 56,
    securityLevel: 'medium',
    trend: 'stable' as const,
    description: 'German Bundestag in renovated Reichstag building hosting 736 members with 56 bills in coalition government legislative pipeline',
  },
  {
    id: 'pc-european',
    name: 'European Parliament Strasbourg',
    lat: 48.6,
    lng: 7.77,
    status: 'warning',
    value: 720,
    seatsTotal: 720,
    seatsOccupied: 705,
    billsInSession: 89,
    securityLevel: 'medium',
    trend: 'down' as const,
    description: 'EU Parliament hosting 720 MEPs in monthly Strasbourg plenary, 89 regulations and directives under trilogue negotiation',
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

export function ParliamentChamberMonitor() {
  const state = useMapStore((s) => s.parliamentChamber)
  const setState = useMapStore((s) => s.setParliamentChamber)

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
    if (filteredData.length === 0) return { seatsTotal: 0, seatsOccupied: 0, billsInSession: 0 }
    const seatsTotal = filteredData.reduce((s: number, d: any) => s + (d.seatsTotal as number), 0)
    const seatsOccupied = filteredData.reduce((s: number, d: any) => s + (d.seatsOccupied as number), 0)
    const billsInSession = filteredData.reduce((s: number, d: any) => s + (d.billsInSession as number), 0)
    return {
      seatsTotal: seatsTotal.toLocaleString(),
      seatsOccupied: seatsOccupied.toLocaleString(),
      billsInSession: billsInSession.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-600 to-yellow-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127963;</span>
          <h3 className="text-sm font-semibold text-white">Parliament Chamber</h3>
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
            <div className="text-slate-400">Total Seats</div>
            <div className="text-sm font-semibold text-white">{metrics.seatsTotal}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Seats Occupied</div>
            <div className="text-sm font-semibold text-white">{metrics.seatsOccupied}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Bills in Session</div>
            <div className="text-sm font-semibold text-white">{metrics.billsInSession}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Top Security</div>
            <div className="text-sm font-semibold text-white">High</div>
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
                <span className="text-xs text-slate-300">{loc.value} seats</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} seats, {activeItem.billsInSession} bills in session</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
