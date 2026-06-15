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
import { useMapStore, type GlacierSurgeEventState, type GlacierSurgeEventData } from '@/lib/map-store'
import { Zap as ZapIcon3, X, ArrowRight, Mountain, Clock, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GlacierSurgeEventData[] = [
  {
    id: 'gs-bering',
    name: 'Bering Glacier Surge',
    lat: 60.3833,
    lng: -143.0333,
    surgeVelocity: 15,
    iceDisplacement: 1200,
    surgeDuration: 180,
    status: 'surging',
    description: 'Largest surge in North America',
  },
  {
    id: 'gs-variegated',
    name: 'Variegated Glacier',
    lat: 59.9333,
    lng: -139.75,
    surgeVelocity: 5,
    iceDisplacement: 600,
    surgeDuration: 90,
    status: 'slowing',
    description: 'Periodic surge cycles',
  },
  {
    id: 'gs-medvezhiy',
    name: 'Medvezhiy Glacier',
    lat: 38.8333,
    lng: 69.8333,
    surgeVelocity: 0.5,
    iceDisplacement: 50,
    surgeDuration: 0,
    status: 'stable',
    description: 'Known for catastrophic surges',
  },
  {
    id: 'gs-trapridge',
    name: 'Trapridge Glacier',
    lat: 61.2333,
    lng: -140.3667,
    surgeVelocity: 2,
    iceDisplacement: 300,
    surgeDuration: 365,
    status: 'post_surge',
    description: 'Slow surge progression',
  },
]

const STATUS_COLORS: Record<GlacierSurgeEventData['status'], { label: string; color: string; bgClass: string }> = {
  surging: { label: 'Surging', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  slowing: { label: 'Slowing', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  post_surge: { label: 'Post Surge', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: GlacierSurgeEventData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GlacierSurgeEventMonitor() {
  const state = useMapStore((s) => s.glacierSurgeEvent)
  const setState = useMapStore((s) => s.setGlacierSurgeEvent)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : SAMPLE_LOCATIONS),
    [state.events]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalGlaciers: 0, avgSurgeVelocity: 0, avgDisplacement: 0, surgingSlowingCount: 0 }
    }
    const avgSurgeVelocity = Math.round(filteredItems.reduce((sum, e) => sum + e.surgeVelocity, 0) / filteredItems.length)
    const avgDisplacement = Math.round(filteredItems.reduce((sum, e) => sum + e.iceDisplacement, 0) / filteredItems.length)
    const surgingSlowingCount = filteredItems.filter((e) => e.status === 'surging' || e.status === 'slowing').length
    return {
      totalGlaciers: filteredItems.length,
      avgSurgeVelocity,
      avgDisplacement,
      surgingSlowingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, surgeVelocity: e.surgeVelocity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.events.length === 0) {
      useMapStore.getState().setGlacierSurgeEvent({ events: SAMPLE_LOCATIONS })
    }
  }, [state.events.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GlacierSurgeEventState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSurgeVelocity', label: 'Surge Velocity', icon: ArrowRight },
    { key: 'showIceDisplacement', label: 'Ice Displacement', icon: Mountain },
    { key: 'showSurgeDuration', label: 'Surge Duration', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <ZapIcon3 className="h-4 w-4 text-sky-400" />
              Glacier Surge Event
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sky-300 hover:text-sky-100 hover:bg-sky-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-sky-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-sky-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as GlacierSurgeEventState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="surging">Surging</SelectItem>
                <SelectItem value="slowing">Slowing</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="post_surge">Post Surge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-sky-200">
                  <Icon className="h-3 w-3 text-sky-400" />
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

          <Separator className="bg-sky-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Total Glaciers</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalGlaciers}</div>
              <div className="text-[9px] text-sky-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Surge Velocity</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSurgeVelocity}</div>
              <div className="text-[9px] text-sky-400/60">m/day</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Displacement</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgDisplacement}</div>
              <div className="text-[9px] text-sky-400/60">m</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Surging+Slowing</div>
              <div className="text-sm font-semibold text-red-400">{summary.surgingSlowingCount}</div>
              <div className="text-[9px] text-sky-400/60">glaciers</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">
              Events ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeEventId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-sky-500/50 bg-sky-800/30'
                          : 'border-sky-700/30 hover:border-sky-500/30 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-sky-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-sky-300/60">
                        {state.showSurgeVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-sky-100 font-medium">{e.surgeVelocity} m/day</span>
                          </div>
                        )}
                        {state.showIceDisplacement && (
                          <div>
                            Displacement:{' '}
                            <span className="text-sky-100 font-medium">{e.iceDisplacement} m</span>
                          </div>
                        )}
                        {state.showSurgeDuration && (
                          <div>
                            Duration:{' '}
                            <span className="text-sky-100 font-medium">{e.surgeDuration} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-sky-400/50 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeItem && (
            <>
              <Separator className="bg-sky-700/30" />
              <div className="space-y-2 rounded-lg border border-sky-600/30 bg-sky-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-sky-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-sky-400/70">Coordinates: </span>
                    <span className="font-medium text-sky-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Surge Velocity: </span>
                    <span className="font-medium text-orange-400">{activeItem.surgeVelocity} m/day</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Displacement: </span>
                    <span className="font-medium text-yellow-400">{activeItem.iceDisplacement} m</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Duration: </span>
                    <span className="font-medium text-sky-400">{activeItem.surgeDuration} days</span>
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
