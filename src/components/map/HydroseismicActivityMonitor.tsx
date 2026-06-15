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
import { useMapStore, type HydroseismicActivityState, type HydroseismicActivityData } from '@/lib/map-store'
import { Activity as ActivityIcon5, X, Gauge, Waves, MapPin, Filter, TrendingUp } from 'lucide-react'

const SAMPLE_LOCATIONS: HydroseismicActivityData[] = [
  {
    id: 'hs-koyna',
    name: 'Koyna Reservoir',
    lat: 17.4,
    lng: 73.7,
    magnitude: 5.2,
    depth: 8,
    waterLevel: 92,
    activityType: 'reservoir_induced',
    status: 'active',
    description: 'Reservoir-induced seismicity at Koyna Dam',
  },
  {
    id: 'hs-geysers',
    name: 'The Geysers Field',
    lat: 38.8,
    lng: -122.8,
    magnitude: 3.5,
    depth: 3,
    waterLevel: 45,
    activityType: 'geothermal',
    status: 'swarming',
    description: 'Geothermal-induced earthquake swarm',
  },
  {
    id: 'hs-midatlantic',
    name: 'Mid-Atlantic Ridge',
    lat: 37.0,
    lng: -32.0,
    magnitude: 4.1,
    depth: 5,
    waterLevel: 0,
    activityType: 'submarine',
    status: 'active',
    description: 'Hydrothermal seismicity at mid-ocean ridge',
  },
  {
    id: 'hs-grímsvötn',
    name: 'Grímsvötn Glacier',
    lat: 64.4,
    lng: -17.3,
    magnitude: 3.8,
    depth: 2,
    waterLevel: 78,
    activityType: 'glacial',
    status: 'quiet',
    description: 'Glacial isostatic adjustment seismicity',
  },
]

const STATUS_COLORS: Record<HydroseismicActivityData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  quiet: { label: 'Quiet', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  swarming: { label: 'Swarming', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

const TYPE_COLORS: Record<HydroseismicActivityData['activityType'], { label: string; bgClass: string }> = {
  reservoir_induced: { label: 'Reservoir', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  geothermal: { label: 'Geothermal', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  submarine: { label: 'Submarine', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
  glacial: { label: 'Glacial', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ status }: { status: HydroseismicActivityData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HydroseismicActivityMonitor() {
  const state = useMapStore((s) => s.hydroseismicActivity)
  const setState = useMapStore((s) => s.setHydroseismicActivity)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : SAMPLE_LOCATIONS),
    [state.events]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (state.typeFilter !== 'all' && e.activityType !== state.typeFilter) return false
      return true
    })
  }, [events, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredEvents.length === 0) {
      return { totalEvents: 0, avgMagnitude: 0, avgDepth: 0, activeSwarmingCount: 0 }
    }
    const avgMagnitude = filteredEvents.reduce((sum, e) => sum + e.magnitude, 0) / filteredEvents.length
    const avgDepth = filteredEvents.reduce((sum, e) => sum + e.depth, 0) / filteredEvents.length
    const activeSwarmingCount = filteredEvents.filter((e) => e.status === 'active' || e.status === 'swarming').length
    return {
      totalEvents: filteredEvents.length,
      avgMagnitude: Math.round(avgMagnitude * 100) / 100,
      avgDepth: Math.round(avgDepth * 10) / 10,
      activeSwarmingCount,
    }
  }, [filteredEvents])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredEvents.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, magnitude: e.magnitude },
    })),
  }), [filteredEvents])

  useEffect(() => {
    if (state.events.length === 0) {
      useMapStore.getState().setHydroseismicActivity({ events: SAMPLE_LOCATIONS })
    }
  }, [state.events.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydroseismicActivityState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMagnitude', label: 'Magnitude', icon: Gauge },
    { key: 'showDepth', label: 'Depth', icon: Waves },
    { key: 'showWaterLevel', label: 'Water Level', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-fuchsia-950/95 to-pink-950/95 backdrop-blur-xl border border-fuchsia-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-fuchsia-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-fuchsia-100">
              <ActivityIcon5 className="h-4 w-4 text-fuchsia-400" />
              Hydroseismic Activity Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-fuchsia-300 hover:text-fuchsia-100 hover:bg-fuchsia-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-fuchsia-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-fuchsia-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Activity Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as HydroseismicActivityState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-fuchsia-900/40 border-fuchsia-700/40 text-fuchsia-100 hover:bg-fuchsia-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reservoir_induced">Reservoir Induced</SelectItem>
                <SelectItem value="geothermal">Geothermal</SelectItem>
                <SelectItem value="submarine">Submarine</SelectItem>
                <SelectItem value="glacial">Glacial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-fuchsia-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-fuchsia-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-fuchsia-200">
                  <Icon className="h-3 w-3 text-fuchsia-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-fuchsia-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-fuchsia-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-fuchsia-700/30 bg-fuchsia-900/30 p-2 text-center">
              <div className="text-[10px] text-fuchsia-400/70">Total Events</div>
              <div className="text-sm font-semibold text-fuchsia-200">{summary.totalEvents}</div>
              <div className="text-[9px] text-fuchsia-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-fuchsia-700/30 bg-fuchsia-900/30 p-2 text-center">
              <div className="text-[10px] text-fuchsia-400/70">Avg Magnitude</div>
              <div className="text-sm font-semibold text-pink-400">{summary.avgMagnitude}</div>
              <div className="text-[9px] text-fuchsia-400/60">Mw</div>
            </div>
            <div className="rounded-lg border border-fuchsia-700/30 bg-fuchsia-900/30 p-2 text-center">
              <div className="text-[10px] text-fuchsia-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-fuchsia-300">{summary.avgDepth}</div>
              <div className="text-[9px] text-fuchsia-400/60">km</div>
            </div>
            <div className="rounded-lg border border-fuchsia-700/30 bg-fuchsia-900/30 p-2 text-center">
              <div className="text-[10px] text-fuchsia-400/70">Active/Swarming</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeSwarmingCount}</div>
              <div className="text-[9px] text-fuchsia-400/60">events</div>
            </div>
          </div>

          <Separator className="bg-fuchsia-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-fuchsia-300/80">
              Seismic Events ({filteredEvents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredEvents.map((event) => {
                  const isActive = state.activeEventId === event.id
                  const statusCfg = STATUS_COLORS[event.status]
                  const typeCfg = TYPE_COLORS[event.activityType]
                  return (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-fuchsia-500/50 bg-fuchsia-800/30'
                          : 'border-fuchsia-700/30 hover:border-fuchsia-500/30 hover:bg-fuchsia-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : event.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={event.status} />
                          <span className="text-xs font-medium text-fuchsia-100">{event.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 ${typeCfg.bgClass}`}
                          >
                            {typeCfg.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                          >
                            {statusCfg.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-fuchsia-300/60">
                        {state.showMagnitude && (
                          <div>
                            Magnitude:{' '}
                            <span className="text-fuchsia-100 font-medium">{event.magnitude}Mw</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-fuchsia-100 font-medium">{event.depth}km</span>
                          </div>
                        )}
                        {state.showWaterLevel && (
                          <div>
                            Water Level:{' '}
                            <span className="text-fuchsia-100 font-medium">{event.waterLevel}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredEvents.length === 0 && (
                  <div className="text-center text-xs text-fuchsia-400/50 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeItem && (
            <>
              <Separator className="bg-fuchsia-700/30" />
              <div className="space-y-2 rounded-lg border border-fuchsia-600/30 bg-fuchsia-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-fuchsia-400" />
                  <span className="text-xs font-semibold text-fuchsia-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-fuchsia-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-fuchsia-400/70">Coordinates: </span>
                    <span className="font-medium text-fuchsia-100">
                      {activeItem.lat.toFixed(1)}, {activeItem.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-fuchsia-400/70">Magnitude: </span>
                    <span className="font-medium text-pink-400">{activeItem.magnitude}Mw</span>
                  </div>
                  <div>
                    <span className="text-fuchsia-400/70">Depth: </span>
                    <span className="font-medium text-fuchsia-200">{activeItem.depth}km</span>
                  </div>
                  <div>
                    <span className="text-fuchsia-400/70">Water Level: </span>
                    <span className="font-medium text-blue-400">{activeItem.waterLevel}%</span>
                  </div>
                  <div>
                    <span className="text-fuchsia-400/70">Type: </span>
                    <span className="font-medium text-fuchsia-200">{activeItem.activityType.replace('_', ' ')}</span>
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
