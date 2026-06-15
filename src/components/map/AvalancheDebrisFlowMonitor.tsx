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
import { useMapStore, type AvalancheDebrisFlowState, type AvalancheDebrisFlowData } from '@/lib/map-store'
import { Mountain as MountainIcon9, X, Layers, Activity, MoveRight, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: AvalancheDebrisFlowData[] = [
  {
    id: 'adf-alps',
    name: 'Alps Path',
    lat: 46.8,
    lng: 10.5,
    volume: 50000,
    velocity: 80,
    runoutDistance: 2,
    eventType: 'snow_avalanche',
    slope: 38,
    description: 'Major alpine avalanche corridor',
  },
  {
    id: 'adf-andes',
    name: 'Andes Debris',
    lat: -33.4,
    lng: -70.3,
    volume: 200000,
    velocity: 40,
    runoutDistance: 5,
    eventType: 'debris_flow',
    slope: 30,
    description: 'Post-rainfall debris flow channel',
  },
  {
    id: 'adf-himalaya',
    name: 'Himalaya Rock',
    lat: 28.0,
    lng: 86.5,
    volume: 80000,
    velocity: 120,
    runoutDistance: 3,
    eventType: 'rockfall',
    slope: 55,
    description: 'High-altitude rockfall zone',
  },
  {
    id: 'adf-japan',
    name: 'Japan Mudslide',
    lat: 34.5,
    lng: 134.2,
    volume: 150000,
    velocity: 30,
    runoutDistance: 4,
    eventType: 'mudslide',
    slope: 25,
    description: 'Typhoon-triggered mudslide area',
  },
]

const EVENT_TYPE_LABELS: Record<AvalancheDebrisFlowData['eventType'], { label: string; color: string; bgClass: string }> = {
  snow_avalanche: { label: 'Snow Avalanche', color: '#60a5fa', bgClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  debris_flow: { label: 'Debris Flow', color: '#a78bfa', bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  rockfall: { label: 'Rockfall', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  mudslide: { label: 'Mudslide', color: '#a16207', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
}

function TrendIcon({ eventType }: { eventType: AvalancheDebrisFlowData['eventType'] }) {
  const cfg = EVENT_TYPE_LABELS[eventType]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AvalancheDebrisFlowMonitor() {
  const state = useMapStore((s) => s.avalancheDebrisFlow)
  const setState = useMapStore((s) => s.setAvalancheDebrisFlow)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : SAMPLE_LOCATIONS),
    [state.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (state.typeFilter !== 'all' && e.eventType !== state.typeFilter) return false
      return true
    })
  }, [events, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { totalEvents: 0, avgVelocity: 0, maxVolume: 0, avgRunoutDistance: 0 }
    }
    const avgVelocity = filteredEvents.reduce((sum, e) => sum + e.velocity, 0) / filteredEvents.length
    const maxVolume = Math.max(...filteredEvents.map((e) => e.volume))
    const avgRunoutDistance = filteredEvents.reduce((sum, e) => sum + e.runoutDistance, 0) / filteredEvents.length
    return {
      totalEvents: filteredEvents.length,
      avgVelocity: Math.round(avgVelocity * 10) / 10,
      maxVolume,
      avgRunoutDistance: Math.round(avgRunoutDistance * 10) / 10,
    }
  }, [filteredEvents])

  const activeEvent = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredEvents.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, eventType: e.eventType, volume: e.volume },
    })),
  }), [filteredEvents])

  useEffect(() => {
    if (state.events.length === 0) {
      useMapStore.getState().setAvalancheDebrisFlow({ events: SAMPLE_LOCATIONS })
    }
  }, [state.events.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AvalancheDebrisFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVolume', label: 'Volume', icon: Layers },
    { key: 'showVelocity', label: 'Velocity', icon: Activity },
    { key: 'showRunout', label: 'Runout Distance', icon: MoveRight },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-stone-950/95 backdrop-blur-xl border border-slate-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <MountainIcon9 className="h-4 w-4 text-slate-400" />
              Avalanche & Debris Flow Monitor
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
          {/* Event Type Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Event Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as AvalancheDebrisFlowState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="snow_avalanche">Snow Avalanche</SelectItem>
                <SelectItem value="debris_flow">Debris Flow</SelectItem>
                <SelectItem value="rockfall">Rockfall</SelectItem>
                <SelectItem value="mudslide">Mudslide</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-slate-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Events</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalEvents}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Velocity</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgVelocity}</div>
              <div className="text-[9px] text-slate-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Max Volume</div>
              <div className="text-sm font-semibold text-orange-400">{summary.maxVolume.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400/60">m³</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Runout Distance</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgRunoutDistance}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = state.activeEventId === event.id
                  const typeCfg = EVENT_TYPE_LABELS[event.eventType]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : event.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon eventType={event.eventType} />
                          <span className="text-xs font-medium text-slate-100">{event.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${typeCfg.bgClass}`}
                        >
                          {typeCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-slate-100 font-medium">{event.volume.toLocaleString()}m³</span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-slate-100 font-medium">{event.velocity}km/h</span>
                          </div>
                        )}
                        {state.showRunout && (
                          <div>
                            Runout:{' '}
                            <span className="text-slate-100 font-medium">{event.runoutDistance}km</span>
                          </div>
                        )}
                        <div>
                          Slope:{' '}
                          <span className="text-slate-100 font-medium">{event.slope}°</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeEvent && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeEvent.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${EVENT_TYPE_LABELS[activeEvent.eventType].bgClass}`}
                  >
                    {EVENT_TYPE_LABELS[activeEvent.eventType].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeEvent.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeEvent.lat.toFixed(1)}, {activeEvent.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Volume: </span>
                    <span className="font-medium text-slate-100">{activeEvent.volume.toLocaleString()}m³</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Velocity: </span>
                    <span className="font-medium text-orange-400">{activeEvent.velocity}km/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Runout: </span>
                    <span className="font-medium text-slate-100">{activeEvent.runoutDistance}km</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Slope: </span>
                    <span className="font-medium text-slate-100">{activeEvent.slope}°</span>
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
