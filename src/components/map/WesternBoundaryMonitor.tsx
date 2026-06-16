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
import { useMapStore, type WesternBoundaryState, type WesternBoundaryData } from '@/lib/map-store'
import { ArrowRight as ArrowRightIcon, X, Wind, Waves, Route, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: WesternBoundaryData[] = [
  {
    id: 'wb-gulfstream',
    name: 'Gulf Stream',
    lat: 36.0000,
    lng: -72.0000,
    peakVelocity: 2.8,
    transportVolume: 30,
    meanderAmplitude: 120,
    status: 'intensified',
    description: 'Intensified Gulf Stream flow',
  },
  {
    id: 'wb-kuroshio',
    name: 'Kuroshio Current',
    lat: 32.0000,
    lng: 140.0000,
    peakVelocity: 2.0,
    transportVolume: 22,
    meanderAmplitude: 80,
    status: 'normal',
    description: 'Normal Kuroshio transport',
  },
  {
    id: 'wb-agulhas',
    name: 'Agulhas Current',
    lat: -32.0000,
    lng: 30.0000,
    peakVelocity: 1.2,
    transportVolume: 15,
    meanderAmplitude: 45,
    status: 'weakened',
    description: 'Weakened Agulhas retroflection',
  },
  {
    id: 'wb-brazil',
    name: 'Brazil Current',
    lat: -25.0000,
    lng: -42.0000,
    peakVelocity: 0.3,
    transportVolume: 5,
    meanderAmplitude: 200,
    status: 'detached',
    description: 'Detached warm-core ring',
  },
]

const STATUS_COLORS: Record<WesternBoundaryData['status'], { label: string; color: string; bgClass: string }> = {
  intensified: { label: 'Intensified', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  weakened: { label: 'Weakened', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  detached: { label: 'Detached', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ status }: { status: WesternBoundaryData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WesternBoundaryMonitor() {
  const state = useMapStore((s) => s.westernBoundary)
  const setState = useMapStore((s) => s.setWesternBoundary)

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
      return { totalPaths: 0, avgPeakVelocity: 0, avgTransportVolume: 0, avgMeanderAmplitude: 0 }
    }
    const avgPeakVelocity = filteredItems.reduce((sum, e) => sum + e.peakVelocity, 0) / filteredItems.length
    const avgTransportVolume = filteredItems.reduce((sum, e) => sum + e.transportVolume, 0) / filteredItems.length
    const avgMeanderAmplitude = filteredItems.reduce((sum, e) => sum + e.meanderAmplitude, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgPeakVelocity: Math.round(avgPeakVelocity * 100) / 100,
      avgTransportVolume: Math.round(avgTransportVolume * 10) / 10,
      avgMeanderAmplitude: Math.round(avgMeanderAmplitude),
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
      properties: { id: e.id, name: e.name, status: e.status, peakVelocity: e.peakVelocity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWesternBoundary({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WesternBoundaryState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPeakVelocity', label: 'Peak Velocity', icon: Wind },
    { key: 'showTransportVolume', label: 'Transport Volume', icon: Waves },
    { key: 'showMeanderAmplitude', label: 'Meander Amplitude', icon: Route },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <ArrowRightIcon className="h-4 w-4 text-blue-400" />
              Western Boundary Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as WesternBoundaryState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intensified">Intensified</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="weakened">Weakened</SelectItem>
                <SelectItem value="detached">Detached</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
                  <Icon className="h-3 w-3 text-blue-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Currents</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Peak Velocity</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgPeakVelocity}</div>
              <div className="text-[9px] text-blue-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Transport</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgTransportVolume}</div>
              <div className="text-[9px] text-blue-400/60">Sv</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Meander</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgMeanderAmplitude}</div>
              <div className="text-[9px] text-blue-400/60">km</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Currents ({filteredItems.length})
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
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-blue-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showPeakVelocity && (
                          <div>
                            Peak Vel:{' '}
                            <span className="text-blue-100 font-medium">{e.peakVelocity} m/s</span>
                          </div>
                        )}
                        {state.showTransportVolume && (
                          <div>
                            Transport:{' '}
                            <span className="text-blue-100 font-medium">{e.transportVolume} Sv</span>
                          </div>
                        )}
                        {state.showMeanderAmplitude && (
                          <div>
                            Meander:{' '}
                            <span className="text-blue-100 font-medium">{e.meanderAmplitude} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No currents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Peak Vel: </span>
                    <span className="font-medium text-indigo-400">{activeItem.peakVelocity} m/s</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Transport: </span>
                    <span className="font-medium text-blue-400">{activeItem.transportVolume} Sv</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Meander: </span>
                    <span className="font-medium text-purple-400">{activeItem.meanderAmplitude} km</span>
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
