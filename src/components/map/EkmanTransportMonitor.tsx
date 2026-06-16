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
import { useMapStore, type EkmanTransportState, type EkmanTransportData } from '@/lib/map-store'
import { Wind as WindIcon14, X, Compass, Wind, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: EkmanTransportData[] = [
  {
    id: 'et-trades',
    name: 'Trade Wind Ekman',
    lat: 15.0000,
    lng: -30.0000,
    transportAngle: 90,
    windSpeed: 7.5,
    surfaceVelocity: 0.25,
    status: 'aligned',
    description: 'Classic Ekman transport in trade winds',
  },
  {
    id: 'et-westerlies',
    name: 'Westerlies Ekman',
    lat: 45.0000,
    lng: -30.0000,
    transportAngle: 75,
    windSpeed: 10.2,
    surfaceVelocity: 0.35,
    status: 'deflected',
    description: 'Deflected transport in westerly zone',
  },
  {
    id: 'et-arctic',
    name: 'Arctic Ekman Layer',
    lat: 80.0000,
    lng: 10.0000,
    transportAngle: 180,
    windSpeed: 4.0,
    surfaceVelocity: 0.08,
    status: 'reversed',
    description: 'Reversed transport under ice cover',
  },
  {
    id: 'et-doldrums',
    name: 'ITCZ Ekman Calm',
    lat: 5.0000,
    lng: 0.0000,
    transportAngle: 0,
    windSpeed: 0.5,
    surfaceVelocity: 0.01,
    status: 'calm',
    description: 'Near-zero transport in ITCZ',
  },
]

const STATUS_COLORS: Record<EkmanTransportData['status'], { label: string; color: string; bgClass: string }> = {
  aligned: { label: 'Aligned', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  deflected: { label: 'Deflected', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  reversed: { label: 'Reversed', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  calm: { label: 'Calm', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: EkmanTransportData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function EkmanTransportMonitor() {
  const state = useMapStore((s) => s.ekmanTransport)
  const setState = useMapStore((s) => s.setEkmanTransport)

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
      return { totalPaths: 0, avgTransportAngle: 0, avgWindSpeed: 0, avgSurfaceVelocity: 0 }
    }
    const avgTransportAngle = filteredItems.reduce((sum, e) => sum + e.transportAngle, 0) / filteredItems.length
    const avgWindSpeed = filteredItems.reduce((sum, e) => sum + e.windSpeed, 0) / filteredItems.length
    const avgSurfaceVelocity = filteredItems.reduce((sum, e) => sum + e.surfaceVelocity, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgTransportAngle: Math.round(avgTransportAngle * 100) / 100,
      avgWindSpeed: Math.round(avgWindSpeed * 100) / 100,
      avgSurfaceVelocity: Math.round(avgSurfaceVelocity * 1000) / 1000,
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
      properties: { id: e.id, name: e.name, status: e.status, transportAngle: e.transportAngle },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setEkmanTransport({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof EkmanTransportState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTransportAngle', label: 'Transport Angle', icon: Compass },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showSurfaceVelocity', label: 'Surface Velocity', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-cyan-950/95 backdrop-blur-xl border border-sky-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <WindIcon14 className="h-4 w-4 text-sky-400" />
              Ekman Transport Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as EkmanTransportState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="aligned">Aligned</SelectItem>
                <SelectItem value="deflected">Deflected</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
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
              <div className="text-[10px] text-sky-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-sky-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Transport Angle</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgTransportAngle}</div>
              <div className="text-[9px] text-sky-400/60">deg</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-sky-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Surface Vel</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgSurfaceVelocity}</div>
              <div className="text-[9px] text-sky-400/60">m/s</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">
              Zones ({filteredItems.length})
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
                          ? 'border-sky-500/50 bg-sky-800/30'
                          : 'border-sky-700/30 hover:border-sky-500/30 hover:bg-sky-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
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
                        {state.showTransportAngle && (
                          <div>
                            Angle:{' '}
                            <span className="text-sky-100 font-medium">{e.transportAngle} deg</span>
                          </div>
                        )}
                        {state.showWindSpeed && (
                          <div>
                            Wind Speed:{' '}
                            <span className="text-sky-100 font-medium">{e.windSpeed} m/s</span>
                          </div>
                        )}
                        {state.showSurfaceVelocity && (
                          <div>
                            Surface Vel:{' '}
                            <span className="text-sky-100 font-medium">{e.surfaceVelocity} m/s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-sky-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
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
                    <span className="text-sky-400/70">Angle: </span>
                    <span className="font-medium text-cyan-400">{activeItem.transportAngle} deg</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Wind Speed: </span>
                    <span className="font-medium text-sky-400">{activeItem.windSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Surface Vel: </span>
                    <span className="font-medium text-green-400">{activeItem.surfaceVelocity} m/s</span>
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
