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
import { useMapStore, type SubmarineLandslideState, type SubmarineLandslideData } from '@/lib/map-store'
import { TriangleAlert as TriangleAlertIcon3, X, Box, Ruler, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SubmarineLandslideData[] = [
  {
    id: 'sl-storegga',
    name: 'Storegga Slide',
    lat: 64.0,
    lng: 5.0,
    volume: 3500,
    depth: 800,
    slopeAngle: 12,
    status: 'post_failure',
    description: 'Worlds largest known submarine landslide',
  },
  {
    id: 'sl-grand-bahamas',
    name: 'Grand Bahama Canyon',
    lat: 25.0,
    lng: -77.0,
    volume: 120,
    depth: 2000,
    slopeAngle: 25,
    status: 'susceptible',
    description: 'Steep canyon walls prone to failure',
  },
  {
    id: 'sl-congo',
    name: 'Congo Canyon Slide',
    lat: -5.0,
    lng: 10.0,
    volume: 50,
    depth: 1500,
    slopeAngle: 18,
    status: 'creeping',
    description: 'Slowly creeping canyon wall deposits',
  },
  {
    id: 'sl-nankai',
    name: 'Nankai Trough Slide',
    lat: 33.0,
    lng: 136.0,
    volume: 200,
    depth: 3000,
    slopeAngle: 30,
    status: 'triggered',
    description: 'Seismically triggered landslide in accretionary prism',
  },
]

const STATUS_COLORS: Record<SubmarineLandslideData['status'], { label: string; color: string; bgClass: string }> = {
  susceptible: { label: 'Susceptible', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  creeping: { label: 'Creeping', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  triggered: { label: 'Triggered', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  post_failure: { label: 'Post-Failure', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: SubmarineLandslideData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubmarineLandslideMonitor() {
  const state = useMapStore((s) => s.submarineLandslide)
  const setState = useMapStore((s) => s.setSubmarineLandslide)

  const slides = useMemo(
    () => (state.slides.length > 0 ? state.slides : SAMPLE_LOCATIONS),
    [state.slides]
  )

  const filteredItems = useMemo(() => {
    return slides.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [slides, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSlides: 0, totalVolume: 0, avgDepth: 0, activeCount: 0 }
    }
    const totalVolume = filteredItems.reduce((sum, s) => sum + s.volume, 0)
    const avgDepth = filteredItems.reduce((sum, s) => sum + s.depth, 0) / filteredItems.length
    const activeCount = filteredItems.filter((s) => s.status === 'creeping' || s.status === 'triggered').length
    return {
      totalSlides: filteredItems.length,
      totalVolume,
      avgDepth: Math.round(avgDepth),
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => slides.find((s) => s.id === state.activeSlideId) ?? null,
    [slides, state.activeSlideId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, volume: s.volume },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.slides.length === 0) {
      useMapStore.getState().setSubmarineLandslide({ slides: SAMPLE_LOCATIONS })
    }
  }, [state.slides.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubmarineLandslideState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVolume', label: 'Volume', icon: Box },
    { key: 'showDepth', label: 'Depth', icon: Ruler },
    { key: 'showSlopeAngle', label: 'Slope Angle', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-red-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <TriangleAlertIcon3 className="h-4 w-4 text-orange-400" />
              Submarine Landslide Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-orange-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SubmarineLandslideState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="susceptible">Susceptible</SelectItem>
                <SelectItem value="creeping">Creeping</SelectItem>
                <SelectItem value="triggered">Triggered</SelectItem>
                <SelectItem value="post_failure">Post-Failure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Total Slides</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalSlides}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Total Volume</div>
              <div className="text-sm font-semibold text-red-400">{summary.totalVolume.toLocaleString()}</div>
              <div className="text-[9px] text-orange-400/60">km³</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgDepth.toLocaleString()}</div>
              <div className="text-[9px] text-orange-400/60">m</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Active Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-orange-400/60">slides</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Slide List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Submarine Landslides ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeSlideId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSlideId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-orange-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-orange-100 font-medium">{s.volume.toLocaleString()} km³</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-orange-100 font-medium">{s.depth.toLocaleString()}m</span>
                          </div>
                        )}
                        {state.showSlopeAngle && (
                          <div>
                            Slope:{' '}
                            <span className="text-orange-100 font-medium">{s.slopeAngle}°</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No slides match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Slide Details */}
          {activeItem && (
            <>
              <Separator className="bg-orange-700/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-orange-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400/70">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Volume: </span>
                    <span className="font-medium text-red-400">{activeItem.volume.toLocaleString()} km³</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Depth: </span>
                    <span className="font-medium text-amber-400">{activeItem.depth.toLocaleString()}m</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Slope Angle: </span>
                    <span className="font-medium text-yellow-400">{activeItem.slopeAngle}°</span>
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
