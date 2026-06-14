'use client'

import { useMemo } from 'react'
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
import { useMapStore, type TsunamiWaveHeightState, type TsunamiWaveHeightData } from '@/lib/map-store'
import { Waves as WavesIcon9, X, Activity, Clock, Droplets, Gauge, MapPin, Filter } from 'lucide-react'

const DEMO_EVENTS: TsunamiWaveHeightData[] = [
  {
    id: 'twh-1', name: 'Tohoku 2011', lat: 38, lng: 142, waveHeight: 40, arrivalTime: 25, inundation: 10, currentSpeed: 12, magnitude: 9.1, status: 'major', description: 'Devastating tsunami following M9.1 earthquake off Japan',
  },
  {
    id: 'twh-2', name: 'Indian Ocean 2004', lat: 5, lng: 95, waveHeight: 30, arrivalTime: 30, inundation: 8, currentSpeed: 10, magnitude: 9.1, status: 'major', description: 'Catastrophic tsunami affecting 14 countries',
  },
  {
    id: 'twh-3', name: 'Chile 1960', lat: -38, lng: -74, waveHeight: 25, arrivalTime: 20, inundation: 6, currentSpeed: 8, magnitude: 9.5, status: 'major', description: 'Largest earthquake ever recorded generating Pacific-wide tsunami',
  },
  {
    id: 'twh-4', name: 'Tonga 2022', lat: -21, lng: -175, waveHeight: 15, arrivalTime: 15, inundation: 3, currentSpeed: 5, magnitude: 7.4, status: 'warning', description: 'Volcanic eruption-generated tsunami across Pacific',
  },
  {
    id: 'twh-5', name: 'Alaska 1964', lat: 61, lng: -148, waveHeight: 10, arrivalTime: 45, inundation: 4, currentSpeed: 6, magnitude: 9.2, status: 'warning', description: 'Great Alaska earthquake causing widespread Pacific tsunami',
  },
  {
    id: 'twh-6', name: 'Crete 2024', lat: 35, lng: 24, waveHeight: 3, arrivalTime: 60, inundation: 0.5, currentSpeed: 2, magnitude: 6.3, status: 'advisory', description: 'Minor tsunami advisory following Mediterranean earthquake',
  },
]

const STATUS_CONFIG: Record<TsunamiWaveHeightData['status'], { label: string; color: string; bgClass: string }> = {
  advisory: { label: 'Advisory', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  watch: { label: 'Watch', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  warning: { label: 'Warning', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  major: { label: 'Major', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

export function TsunamiWaveHeightMonitor() {
  const state = useMapStore((s) => s.tsunamiWaveHeight)
  const setState = useMapStore((s) => s.setTsunamiWaveHeight)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : DEMO_EVENTS),
    [state.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (state.severityFilter !== 'all' && e.status !== state.severityFilter) return false
      return true
    })
  }, [events, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { avgWaveHeight: 0, avgMagnitude: 0, majorCount: 0 }
    }
    const avgWaveHeight = filteredEvents.reduce((sum, e) => sum + e.waveHeight, 0) / filteredEvents.length
    const avgMagnitude = filteredEvents.reduce((sum, e) => sum + e.magnitude, 0) / filteredEvents.length
    const majorCount = filteredEvents.filter((e) => e.status === 'major').length
    return {
      avgWaveHeight: Math.round(avgWaveHeight * 10) / 10,
      avgMagnitude: Math.round(avgMagnitude * 100) / 100,
      majorCount,
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TsunamiWaveHeightState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaveHeight', label: 'Wave Height', icon: Activity },
    { key: 'showArrivalTime', label: 'Arrival Time', icon: Clock },
    { key: 'showInundation', label: 'Inundation', icon: Droplets },
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: Gauge },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-slate-950/95 backdrop-blur-xl border border-blue-900/40 rounded-xl shadow-lg shadow-blue-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <WavesIcon9 className="h-4 w-4 text-blue-400" />
              Tsunami Wave Height Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-900/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-blue-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({ severityFilter: v as TsunamiWaveHeightState['severityFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-800/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="major">Major</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-900/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-700"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-900/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-blue-800/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Wave Height</div>
              <div className="text-sm font-semibold text-navy-300">{summary.avgWaveHeight}</div>
              <div className="text-[9px] text-blue-400">m</div>
            </div>
            <div className="rounded-lg border border-blue-800/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Avg Magnitude</div>
              <div className="text-sm font-semibold text-blue-300">{summary.avgMagnitude}</div>
              <div className="text-[9px] text-blue-400">Mw</div>
            </div>
            <div className="rounded-lg border border-blue-800/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400">Major Events</div>
              <div className="text-sm font-semibold text-red-400">{summary.majorCount}</div>
              <div className="text-[9px] text-blue-400">events</div>
            </div>
          </div>

          <Separator className="bg-blue-900/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300">
              Tsunami Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = state.activeEventId === event.id
                  const statusCfg = STATUS_CONFIG[event.status]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-600/60 bg-blue-800/30'
                          : 'border-blue-900/30 hover:border-blue-700/40 hover:bg-blue-900/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : event.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-blue-100">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300">
                        {state.showWaveHeight && (
                          <div>
                            Height: <span className="text-blue-100 font-medium">{event.waveHeight} m</span>
                          </div>
                        )}
                        {state.showArrivalTime && (
                          <div>
                            Arrival: <span className="text-blue-100 font-medium">{event.arrivalTime} min</span>
                          </div>
                        )}
                        {state.showInundation && (
                          <div>
                            Inundation: <span className="text-blue-100 font-medium">{event.inundation} km</span>
                          </div>
                        )}
                        {state.showCurrentSpeed && (
                          <div>
                            Current: <span className="text-blue-100 font-medium">{event.currentSpeed} m/s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-blue-400 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeEvent && (
            <>
              <Separator className="bg-blue-900/30" />
              <div className="space-y-2 rounded-lg border border-blue-700/30 bg-blue-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeEvent.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeEvent.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeEvent.lat.toFixed(1)}, {activeEvent.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400">Wave Height: </span>
                    <span className="font-medium text-red-400">{activeEvent.waveHeight} m</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Arrival Time: </span>
                    <span className="font-medium text-blue-200">{activeEvent.arrivalTime} min</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Magnitude: </span>
                    <span className="font-medium text-blue-200">M{activeEvent.magnitude}</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Inundation: </span>
                    <span className="font-medium text-blue-200">{activeEvent.inundation} km</span>
                  </div>
                  <div>
                    <span className="text-blue-400">Current Speed: </span>
                    <span className="font-medium text-blue-200">{activeEvent.currentSpeed} m/s</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-400">Description: </span>
                    <span className="font-medium text-blue-200">{activeEvent.description}</span>
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
