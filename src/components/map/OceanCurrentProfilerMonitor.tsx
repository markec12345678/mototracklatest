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
import { useMapStore, type OceanCurrentProfilerState, type OceanCurrentProfilerData } from '@/lib/map-store'
import { Compass as CompassIcon4, X, Gauge, Navigation, Waves, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: OceanCurrentProfilerData[] = [
  {
    id: 'oc-gulf-stream',
    name: 'Gulf Stream Profile',
    lat: 35.0,
    lng: -70.0,
    currentSpeed: 2.5,
    direction: 45,
    depth: 200,
    status: 'strong',
    description: 'Powerful western boundary current off US East Coast',
  },
  {
    id: 'oc-agulhas',
    name: 'Agulhas Current',
    lat: -30.0,
    lng: 32.0,
    currentSpeed: 1.8,
    direction: 180,
    depth: 300,
    status: 'moderate',
    description: 'Weakening Agulhas retroflection current',
  },
  {
    id: 'oc-kuroshio',
    name: 'Kuroshio Extension',
    lat: 35.0,
    lng: 145.0,
    currentSpeed: 0.5,
    direction: 90,
    depth: 500,
    status: 'weak',
    description: 'Diminished Kuroshio extension east of Japan',
  },
  {
    id: 'oc-antarctic',
    name: 'Antarctic Circumpolar',
    lat: -55.0,
    lng: 0.0,
    currentSpeed: 0.3,
    direction: 270,
    depth: 1000,
    status: 'reversed',
    description: 'Localized flow reversal in ACC eddy field',
  },
]

const STATUS_COLORS: Record<OceanCurrentProfilerData['status'], { label: string; color: string; bgClass: string }> = {
  strong: { label: 'Strong', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weak: { label: 'Weak', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  reversed: { label: 'Reversed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: OceanCurrentProfilerData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function OceanCurrentProfilerMonitor() {
  const state = useMapStore((s) => s.oceanCurrentProfiler)
  const setState = useMapStore((s) => s.setOceanCurrentProfiler)

  const profiles = useMemo(
    () => (state.profiles.length > 0 ? state.profiles : SAMPLE_LOCATIONS),
    [state.profiles]
  )

  const filteredItems = useMemo(() => {
    return profiles.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [profiles, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalProfiles: 0, avgSpeed: 0, avgDirection: 0, strongCount: 0 }
    }
    const avgSpeed = filteredItems.reduce((sum, s) => sum + s.currentSpeed, 0) / filteredItems.length
    const avgDirection = filteredItems.reduce((sum, s) => sum + s.direction, 0) / filteredItems.length
    const strongCount = filteredItems.filter((s) => s.status === 'strong').length
    return {
      totalProfiles: filteredItems.length,
      avgSpeed: Math.round(avgSpeed * 100) / 100,
      avgDirection: Math.round(avgDirection),
      strongCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => profiles.find((s) => s.id === state.activeProfileId) ?? null,
    [profiles, state.activeProfileId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, currentSpeed: s.currentSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.profiles.length === 0) {
      useMapStore.getState().setOceanCurrentProfiler({ profiles: SAMPLE_LOCATIONS })
    }
  }, [state.profiles.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OceanCurrentProfilerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: Gauge },
    { key: 'showDirection', label: 'Direction', icon: Navigation },
    { key: 'showDepth', label: 'Depth', icon: Waves },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-blue-950/95 backdrop-blur-xl border border-indigo-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-indigo-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-100">
              <CompassIcon4 className="h-4 w-4 text-blue-400" />
              Ocean Current Profiler Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-indigo-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-indigo-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as OceanCurrentProfilerState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-indigo-900/40 border-indigo-700/40 text-indigo-100 hover:bg-indigo-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-indigo-200">
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

          <Separator className="bg-indigo-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Total Profiles</div>
              <div className="text-sm font-semibold text-indigo-200">{summary.totalProfiles}</div>
              <div className="text-[9px] text-indigo-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgSpeed}</div>
              <div className="text-[9px] text-indigo-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Avg Direction</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgDirection}</div>
              <div className="text-[9px] text-indigo-400/60">°</div>
            </div>
            <div className="rounded-lg border border-indigo-700/30 bg-indigo-900/30 p-2 text-center">
              <div className="text-[10px] text-indigo-400/70">Strong Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.strongCount}</div>
              <div className="text-[9px] text-indigo-400/60">profiles</div>
            </div>
          </div>

          <Separator className="bg-indigo-700/30" />

          {/* Profiles List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-indigo-300/80">
              Profiles ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeProfileId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-indigo-500/50 bg-indigo-800/30'
                          : 'border-indigo-700/30 hover:border-indigo-500/30 hover:bg-indigo-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeProfileId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-indigo-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-indigo-300/60">
                        {state.showCurrentSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-indigo-100 font-medium">{s.currentSpeed}m/s</span>
                          </div>
                        )}
                        {state.showDirection && (
                          <div>
                            Direction:{' '}
                            <span className="text-indigo-100 font-medium">{s.direction}°</span>
                          </div>
                        )}
                        {state.showDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-indigo-100 font-medium">{s.depth}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-indigo-400/50 py-4">
                    No profiles match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Profile Details */}
          {activeItem && (
            <>
              <Separator className="bg-indigo-700/30" />
              <div className="space-y-2 rounded-lg border border-indigo-600/30 bg-indigo-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-indigo-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-indigo-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-indigo-400/70">Coordinates: </span>
                    <span className="font-medium text-indigo-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Current Speed: </span>
                    <span className="font-medium text-blue-400">{activeItem.currentSpeed}m/s</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Direction: </span>
                    <span className="font-medium text-indigo-300">{activeItem.direction}°</span>
                  </div>
                  <div>
                    <span className="text-indigo-400/70">Depth: </span>
                    <span className="font-medium text-cyan-400">{activeItem.depth}m</span>
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
