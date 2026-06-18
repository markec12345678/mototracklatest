'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'pp-whitehouse',
    name: 'The White House',
    lat: 38.9,
    lng: -77.04,
    status: 'stable',
    value: 132,
    roomsTotal: 132,
    staffOnPremise: 410,
    dailyVisitors: 380,
    securityLevel: 'high',
    trend: 'stable' as const,
    description: 'US presidential residence and executive office at 1600 Pennsylvania Avenue with 132 rooms hosting 380 daily visitors and 410 staff',
  },
  {
    id: 'pp-elysee',
    name: 'Palais de l Elysee',
    lat: 48.87,
    lng: 2.32,
    status: 'stable',
    value: 365,
    roomsTotal: 365,
    staffOnPremise: 220,
    dailyVisitors: 140,
    securityLevel: 'high',
    trend: 'up' as const,
    description: 'French presidential palace in Paris 8th arrondissement, official residence of the President of the Republic with 365 rooms',
  },
  {
    id: 'pp-akorda',
    name: 'Akorda Palace Astana',
    lat: 51.13,
    lng: 71.43,
    status: 'moderate',
    value: 120,
    roomsTotal: 120,
    staffOnPremise: 95,
    dailyVisitors: 60,
    securityLevel: 'high',
    trend: 'stable' as const,
    description: 'Kazakh presidential residence on Ishim river bank in Astana, modern Ak Orda building hosting heads of state and diplomatic ceremonies',
  },
  {
    id: 'pp-cremlin',
    name: 'Moscow Kremlin',
    lat: 55.75,
    lng: 37.62,
    status: 'warning',
    value: 700,
    roomsTotal: 700,
    staffOnPremise: 850,
    dailyVisitors: 30,
    securityLevel: 'high',
    trend: 'down' as const,
    description: 'Russian presidential executive office complex with 700 rooms in historic Kremlin, visitor access sharply restricted since 2022',
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

export function PresidentialPalaceMonitor() {
  const state = useMapStore((s) => s.presidentialPalace)
  const setState = useMapStore((s) => s.setPresidentialPalace)

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
    if (filteredData.length === 0) return { roomsTotal: 0, staffOnPremise: 0, dailyVisitors: 0 }
    const roomsTotal = filteredData.reduce((s: number, d: any) => s + (d.roomsTotal as number), 0)
    const staffOnPremise = filteredData.reduce((s: number, d: any) => s + (d.staffOnPremise as number), 0)
    const dailyVisitors = filteredData.reduce((s: number, d: any) => s + (d.dailyVisitors as number), 0)
    return {
      roomsTotal: roomsTotal.toLocaleString(),
      staffOnPremise: staffOnPremise.toLocaleString(),
      dailyVisitors: dailyVisitors.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-700 to-orange-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#128081;</span>
          <h3 className="text-sm font-semibold text-white">Presidential Palace</h3>
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
            <div className="text-slate-400">Total Rooms</div>
            <div className="text-sm font-semibold text-white">{metrics.roomsTotal}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Staff on Premise</div>
            <div className="text-sm font-semibold text-white">{metrics.staffOnPremise}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Visitors</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyVisitors}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Security Level</div>
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
                <span className="text-xs text-slate-300">{loc.value} rm</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value} rooms, {activeItem.staffOnPremise} staff, {activeItem.dailyVisitors} visitors/day</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
