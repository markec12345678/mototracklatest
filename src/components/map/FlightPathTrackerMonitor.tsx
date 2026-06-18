'use client'

import { useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMapStore, type FlightPathTrackerState, type FlightPathTrackerData } from '@/lib/map-store'
import { Plane as PlaneIcon, X, Navigation, Clock, Compass, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: FlightPathTrackerData[] = [
  {
    id: 'fpt-jfk',
    name: 'JFK Terminal',
    lat: 40.641,
    lng: -73.778,
    altitude: 35000,
    speed: 480,
    heading: 65,
    delayMinutes: 12,
    status: 'on-time',
    description: 'John F Kennedy International Airport active departure corridor',
  },
  {
    id: 'fpt-heathrow',
    name: 'Heathrow Hub',
    lat: 51.470,
    lng: -0.462,
    altitude: 38000,
    speed: 510,
    heading: 90,
    delayMinutes: 28,
    status: 'delayed',
    description: 'London Heathrow holding pattern with ground delays reported',
  },
  {
    id: 'fpt-dubai',
    name: 'Dubai Intl',
    lat: 25.253,
    lng: 55.366,
    altitude: 36000,
    speed: 495,
    heading: 270,
    delayMinutes: 5,
    status: 'on-time',
    description: 'Dubai International busy approach corridor with normal flow',
  },
  {
    id: 'fpt-narita',
    name: 'Tokyo Narita',
    lat: 35.764,
    lng: 140.386,
    altitude: 32000,
    speed: 460,
    heading: 180,
    delayMinutes: 45,
    status: 'diverted',
    description: 'Narita experiencing weather-related diversions and delays',
  },
]

const STATUS_COLORS: Record<FlightPathTrackerData['status'], { label: string; color: string; bgClass: string }> = {
  'on-time': { label: 'On Time', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  delayed: { label: 'Delayed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  diverted: { label: 'Diverted', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: FlightPathTrackerData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function FlightPathTrackerMonitor() {
  const state = useMapStore((s) => s.flightPathTracker)
  const setState = useMapStore((s) => s.setFlightPathTracker)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && state.statusFilter !== '' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFlights: 0, avgDelay: 0, onTimePct: 0, avgAltitude: 0 }
    }
    const avgDelay = filteredItems.reduce((sum, e) => sum + e.delayMinutes, 0) / filteredItems.length
    const onTimeCount = filteredItems.filter((e) => e.status === 'on-time').length
    const avgAltitude = filteredItems.reduce((sum, e) => sum + e.altitude, 0) / filteredItems.length
    return {
      totalFlights: filteredItems.length,
      avgDelay: avgDelay.toFixed(1),
      onTimePct: Math.round((onTimeCount / filteredItems.length) * 100),
      avgAltitude: Math.round(avgAltitude / 1000),
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeItemId) ?? null,
    [events, state.activeItemId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, speed: e.speed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setFlightPathTracker({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof FlightPathTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAltitude', label: 'Altitude', icon: Navigation },
    { key: 'showSpeed', label: 'Speed', icon: Compass },
    { key: 'showHeading', label: 'Heading', icon: Compass },
    { key: 'showDelayMinutes', label: 'Delay', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <PlaneIcon className="h-4 w-4 text-sky-400" />
              Flight Path Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-300 hover:text-slate-100 hover:bg-slate-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-slate-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as FlightPathTrackerState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="on-time">On Time</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="diverted">Diverted</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Icon className="h-3 w-3 text-slate-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Active Flights</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalFlights}</div>
              <div className="text-[9px] text-slate-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Delay</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgDelay}</div>
              <div className="text-[9px] text-slate-400/60">minutes</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">On-time %</div>
              <div className="text-sm font-semibold text-green-400">{summary.onTimePct}%</div>
              <div className="text-[9px] text-slate-400/60">compliance</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Capacity Load</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgAltitude}k</div>
              <div className="text-[9px] text-slate-400/60">avg altitude ft</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Flight Zones ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeItemId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showAltitude && (
                          <div>
                            Altitude:{' '}
                            <span className="text-slate-100 font-medium">{e.altitude.toLocaleString()} ft</span>
                          </div>
                        )}
                        {state.showSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-slate-100 font-medium">{e.speed} kts</span>
                          </div>
                        )}
                        {state.showHeading && (
                          <div>
                            Heading:{' '}
                            <span className="text-slate-100 font-medium">{e.heading} deg</span>
                          </div>
                        )}
                        {state.showDelayMinutes && (
                          <div>
                            Delay:{' '}
                            <span className="text-slate-100 font-medium">{e.delayMinutes} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No flights match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <Navigation className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Altitude: </span>
                    <span className="font-medium text-sky-400">{activeItem.altitude.toLocaleString()} ft</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Speed: </span>
                    <span className="font-medium text-blue-400">{activeItem.speed} kts</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Delay: </span>
                    <span className="font-medium text-amber-400">{activeItem.delayMinutes} min</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
