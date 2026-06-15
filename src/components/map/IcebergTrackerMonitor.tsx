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
import { useMapStore, type IcebergTrackerState, type IcebergTrackerData } from '@/lib/map-store'
import { MountainSnow as MountainSnowIcon3, X, Navigation, Ruler, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IcebergTrackerData[] = [
  {
    id: 'it-b15',
    name: 'B15 Iceberg',
    lat: -75.0,
    lng: -170.0,
    length: 295,
    width: 37,
    driftSpeed: 0.2,
    thickness: 350,
    size: 'giant',
    description: 'Largest iceberg ever recorded from Ross Ice Shelf',
  },
  {
    id: 'it-a68',
    name: 'A68 Fragment',
    lat: -60.0,
    lng: -48.0,
    length: 130,
    width: 30,
    driftSpeed: 0.5,
    thickness: 200,
    size: 'large',
    description: 'Major fragment of A68 calved from Larsen C',
  },
  {
    id: 'it-labrador',
    name: 'Labrador Berg',
    lat: 52.0,
    lng: -50.0,
    length: 0.2,
    width: 0.15,
    driftSpeed: 1.2,
    thickness: 50,
    size: 'small',
    description: 'Small berg drifting in Labrador Sea shipping lanes',
  },
  {
    id: 'it-davis',
    name: 'Davis Strait',
    lat: 65.0,
    lng: -55.0,
    length: 2,
    width: 1.5,
    driftSpeed: 0.8,
    thickness: 120,
    size: 'medium',
    description: 'Medium iceberg tracked in Davis Strait',
  },
]

const STATUS_COLORS: Record<IcebergTrackerData['size'], { label: string; color: string; bgClass: string }> = {
  small: { label: 'Small', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  medium: { label: 'Medium', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  large: { label: 'Large', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  giant: { label: 'Giant', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ size }: { size: IcebergTrackerData['size'] }) {
  const cfg = STATUS_COLORS[size]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IcebergTrackerMonitor() {
  const state = useMapStore((s) => s.icebergTracker)
  const setState = useMapStore((s) => s.setIcebergTracker)

  const icebergs = useMemo(
    () => (state.icebergs.length > 0 ? state.icebergs : SAMPLE_LOCATIONS),
    [state.icebergs]
  )

  const filteredIcebergs = useMemo(() => {
    return icebergs.filter((b) => {
      if (state.sizeFilter !== 'all' && b.size !== state.sizeFilter) return false
      return true
    })
  }, [icebergs, state.sizeFilter])

  const summary = useMemo(() => {
    if (filteredIcebergs.length === 0) {
      return { totalIcebergs: 0, avgDriftSpeed: 0, avgThickness: 0, largestSize: 'small' as const }
    }
    const avgDriftSpeed = filteredIcebergs.reduce((sum, b) => sum + b.driftSpeed, 0) / filteredIcebergs.length
    const avgThickness = filteredIcebergs.reduce((sum, b) => sum + b.thickness, 0) / filteredIcebergs.length
    const sizeOrder: IcebergTrackerData['size'][] = ['giant', 'large', 'medium', 'small']
    const largestSize = sizeOrder.find((s) => filteredIcebergs.some((b) => b.size === s)) ?? 'small'
    return {
      totalIcebergs: filteredIcebergs.length,
      avgDriftSpeed: Math.round(avgDriftSpeed * 10) / 10,
      avgThickness: Math.round(avgThickness),
      largestSize,
    }
  }, [filteredIcebergs])

  const activeIceberg = useMemo(
    () => icebergs.find((b) => b.id === state.activeIcebergId) ?? null,
    [icebergs, state.activeIcebergId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredIcebergs.map((b) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [b.lng, b.lat] },
      properties: { id: b.id, name: b.name, size: b.size, driftSpeed: b.driftSpeed },
    })),
  }), [filteredIcebergs])

  useEffect(() => {
    if (state.icebergs.length === 0) {
      useMapStore.getState().setIcebergTracker({ icebergs: SAMPLE_LOCATIONS })
    }
  }, [state.icebergs.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IcebergTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTrajectory', label: 'Drift Trajectory', icon: Navigation },
    { key: 'showSize', label: 'Size Classification', icon: Ruler },
    { key: 'showDrift', label: 'Drift Speed', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-slate-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <MountainSnowIcon3 className="h-4 w-4 text-cyan-400" />
              Iceberg Tracker Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Size Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Iceberg Size
            </Label>
            <Select
              value={state.sizeFilter}
              onValueChange={(v) =>
                setState({ sizeFilter: v as IcebergTrackerState['sizeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="giant">Giant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Icebergs</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalIcebergs}</div>
              <div className="text-[9px] text-cyan-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Drift Speed</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgDriftSpeed}</div>
              <div className="text-[9px] text-cyan-400/60">km/day</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Thickness</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.avgThickness}</div>
              <div className="text-[9px] text-cyan-400/60">meters</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Largest Size</div>
              <div className="text-sm font-semibold text-purple-400">{STATUS_COLORS[summary.largestSize].label}</div>
              <div className="text-[9px] text-cyan-400/60">class</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Iceberg List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
              Icebergs ({filteredIcebergs.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredIcebergs.map((iceberg) => {
                  const isActive = state.activeIcebergId === iceberg.id
                  const statusCfg = STATUS_COLORS[iceberg.size]
                  return (
                    <div
                      key={iceberg.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeIcebergId: isActive ? null : iceberg.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon size={iceberg.size} />
                          <span className="text-xs font-medium text-cyan-100">{iceberg.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showSize && (
                          <div>
                            Length:{' '}
                            <span className="text-cyan-100 font-medium">{iceberg.length}km</span>
                          </div>
                        )}
                        {state.showSize && (
                          <div>
                            Width:{' '}
                            <span className="text-cyan-100 font-medium">{iceberg.width}km</span>
                          </div>
                        )}
                        {state.showDrift && (
                          <div>
                            Drift:{' '}
                            <span className="text-cyan-100 font-medium">{iceberg.driftSpeed}km/day</span>
                          </div>
                        )}
                        {state.showTrajectory && (
                          <div>
                            Thickness:{' '}
                            <span className="text-cyan-100 font-medium">{iceberg.thickness}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredIcebergs.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No icebergs match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Iceberg Details */}
          {activeIceberg && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeIceberg.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeIceberg.size].bgClass}`}
                  >
                    {STATUS_COLORS[activeIceberg.size].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeIceberg.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeIceberg.lat.toFixed(1)}, {activeIceberg.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Length: </span>
                    <span className="font-medium text-cyan-100">{activeIceberg.length}km</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Width: </span>
                    <span className="font-medium text-cyan-100">{activeIceberg.width}km</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Drift Speed: </span>
                    <span className="font-medium text-cyan-200">{activeIceberg.driftSpeed}km/day</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Thickness: </span>
                    <span className="font-medium text-cyan-100">{activeIceberg.thickness}m</span>
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
