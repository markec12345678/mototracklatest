'use client'

import { useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { useMapStore } from '@/lib/map-store'

const SAMPLE_LOCATIONS = [
  {
    id: 'se-burjkhalifa',
    name: 'Burj Khalifa',
    lat: 25.2,
    lng: 55.27,
    status: 'warning',
    value: 57,
    elevatorsRunning: 57,
    avgWaitTime: 18,
    dailyTrips: 9400,
    maintenanceBacklog: 4,
    trend: 'up' as const,
    description: 'Dubai 828m super-tall with 57 high-speed elevators including the worlds longest single-run travel distance experiencing peak observation deck congestion',
  },
  {
    id: 'se-shanghaitower',
    name: 'Shanghai Tower',
    lat: 31.23,
    lng: 121.5,
    status: 'stable',
    value: 106,
    elevatorsRunning: 106,
    avgWaitTime: 9,
    dailyTrips: 18200,
    maintenanceBacklog: 1,
    trend: 'down' as const,
    description: '632m twisted mega-tower with double-deck elevator shuttles reaching 20.5 m/s serving office hotel and observation deck zoning efficiently',
  },
  {
    id: 'se-oneworld',
    name: 'One World Trade Center',
    lat: 40.71,
    lng: -74.01,
    status: 'moderate',
    value: 73,
    elevatorsRunning: 73,
    avgWaitTime: 14,
    dailyTrips: 12800,
    maintenanceBacklog: 2,
    trend: 'stable' as const,
    description: 'NYC 541m Freedom Tower with sky-lobby express elevators handling morning commuter surge from Fulton Center transit connection',
  },
  {
    id: 'se-pingan',
    name: 'Ping An Finance Center',
    lat: 22.54,
    lng: 114.06,
    status: 'critical',
    value: 81,
    elevatorsRunning: 81,
    avgWaitTime: 26,
    dailyTrips: 15600,
    maintenanceBacklog: 7,
    trend: 'up' as const,
    description: 'Shenzhen 599m financial tower under tenant fit-out with elevator commissioning delays causing extended morning wait times on banked elevator groups',
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

export function SkyscraperElevatorMonitor() {
  const state = useMapStore((s) => s.skyscraperElevator)
  const setState = useMapStore((s) => s.setSkyscraperElevator)

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
    if (filteredData.length === 0) return { elevatorsRunning: 0, avgWaitTime: 0, dailyTrips: 0, maintenanceBacklog: 0 }
    const elevatorsRunning = filteredData.reduce((s: number, d: any) => s + (d.elevatorsRunning as number), 0)
    const avgWaitTime = filteredData.reduce((s: number, d: any) => s + (d.avgWaitTime as number), 0) / filteredData.length
    const dailyTrips = filteredData.reduce((s: number, d: any) => s + (d.dailyTrips as number), 0)
    const maintenanceBacklog = filteredData.reduce((s: number, d: any) => s + (d.maintenanceBacklog as number), 0)
    return {
      elevatorsRunning: elevatorsRunning.toLocaleString(),
      avgWaitTime: avgWaitTime.toFixed(0) + ' s',
      dailyTrips: dailyTrips.toLocaleString(),
      maintenanceBacklog: maintenanceBacklog.toLocaleString(),
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
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">&#127957;</span>
          <h3 className="text-sm font-semibold text-white">Skyscraper Elevator</h3>
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
            <div className="text-slate-400">Elevators Running</div>
            <div className="text-sm font-semibold text-white">{metrics.elevatorsRunning}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Avg Wait Time</div>
            <div className="text-sm font-semibold text-white">{metrics.avgWaitTime}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Daily Trips</div>
            <div className="text-sm font-semibold text-white">{metrics.dailyTrips}</div>
          </div>
          <div className="bg-slate-800/60 rounded p-2">
            <div className="text-slate-400">Maintenance Backlog</div>
            <div className="text-sm font-semibold text-white">{metrics.maintenanceBacklog}</div>
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
                <span className="text-xs text-slate-300">{loc.value.toLocaleString()}</span>
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
              <span className="text-slate-300 font-medium">{activeItem.value.toLocaleString()} elevators running</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
