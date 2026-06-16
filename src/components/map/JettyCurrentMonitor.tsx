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
import { useMapStore, type JettyCurrentState, type JettyCurrentData } from '@/lib/map-store'
import { Anchor as AnchorIcon3, X, Wind, RotateCcw, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: JettyCurrentData[] = [
  {
    id: 'jc-columbia',
    name: 'Columbia River Jetty',
    lat: 46.25,
    lng: -124.05,
    currentSpeed: 4.5,
    eddyIntensity: 78,
    sedimentDeposition: 15000,
    status: 'dangerous',
    description: 'Dangerous currents at river mouth',
  },
  {
    id: 'jc-venice',
    name: 'Venice Lagoon Jetty',
    lat: 45.4,
    lng: 12.35,
    currentSpeed: 2.8,
    eddyIntensity: 55,
    sedimentDeposition: 8000,
    status: 'moderate',
    description: 'Moderate tidal currents at lagoon',
  },
  {
    id: 'jc-sydney',
    name: 'Sydney Heads Jetty',
    lat: -33.83,
    lng: 151.28,
    currentSpeed: 1.2,
    eddyIntensity: 22,
    sedimentDeposition: 2000,
    status: 'calm',
    description: 'Calm harbor conditions',
  },
  {
    id: 'jc-rotterdam',
    name: 'Rotterdam Europort',
    lat: 51.92,
    lng: 4.05,
    currentSpeed: 0.8,
    eddyIntensity: 10,
    sedimentDeposition: 500,
    status: 'navigable',
    description: 'Well-maintained navigable channel',
  },
]

const STATUS_COLORS: Record<JettyCurrentData['status'], { label: string; color: string; bgClass: string }> = {
  dangerous: { label: 'Dangerous', color: '#dc2626', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  calm: { label: 'Calm', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  navigable: { label: 'Navigable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: JettyCurrentData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function JettyCurrentMonitor() {
  const state = useMapStore((s) => s.jettyCurrent)
  const setState = useMapStore((s) => s.setJettyCurrent)

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
      return { totalPaths: 0, avgCurrentSpeed: 0, avgEddyIntensity: 0, dangerousCount: 0 }
    }
    const avgCurrentSpeed = filteredItems.reduce((sum, e) => sum + e.currentSpeed, 0) / filteredItems.length
    const avgEddyIntensity = filteredItems.reduce((sum, e) => sum + e.eddyIntensity, 0) / filteredItems.length
    const dangerousCount = filteredItems.filter((e) => e.status === 'dangerous').length
    return {
      totalPaths: filteredItems.length,
      avgCurrentSpeed: Math.round(avgCurrentSpeed * 10) / 10,
      avgEddyIntensity: Math.round(avgEddyIntensity * 10) / 10,
      dangerousCount,
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
      properties: { id: e.id, name: e.name, status: e.status, currentSpeed: e.currentSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setJettyCurrent({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof JettyCurrentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: Wind },
    { key: 'showEddyIntensity', label: 'Eddy Intensity', icon: RotateCcw },
    { key: 'showSedimentDeposition', label: 'Sediment Deposition', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-sky-700/30 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-sky-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-100">
              <AnchorIcon3 className="h-4 w-4 text-sky-400" />
              Jetty Current Monitor
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
                setState({ statusFilter: v as JettyCurrentState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-sky-900/40 border-sky-700/40 text-sky-100 hover:bg-sky-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="dangerous">Dangerous</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
                <SelectItem value="navigable">Navigable</SelectItem>
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
              <div className="text-[10px] text-sky-400/70">Total Jetties</div>
              <div className="text-sm font-semibold text-sky-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-sky-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Current Speed</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgCurrentSpeed}</div>
              <div className="text-[9px] text-sky-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Avg Eddy Intensity</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgEddyIntensity}</div>
              <div className="text-[9px] text-sky-400/60">%</div>
            </div>
            <div className="rounded-lg border border-sky-700/30 bg-sky-900/30 p-2 text-center">
              <div className="text-[10px] text-sky-400/70">Dangerous</div>
              <div className="text-sm font-semibold text-red-400">{summary.dangerousCount}</div>
              <div className="text-[9px] text-sky-400/60">channels</div>
            </div>
          </div>

          <Separator className="bg-sky-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-sky-300/80">
              Jetties ({filteredItems.length})
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
                        {state.showCurrentSpeed && (
                          <div>
                            Current:{' '}
                            <span className="text-sky-100 font-medium">{e.currentSpeed} m/s</span>
                          </div>
                        )}
                        {state.showEddyIntensity && (
                          <div>
                            Eddy:{' '}
                            <span className="text-sky-100 font-medium">{e.eddyIntensity}%</span>
                          </div>
                        )}
                        {state.showSedimentDeposition && (
                          <div>
                            Sediment:{' '}
                            <span className="text-sky-100 font-medium">{e.sedimentDeposition} m3</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-sky-400/50 py-4">
                    No jetties match the current filter.
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
                    <span className="text-sky-400/70">Current Speed: </span>
                    <span className="font-medium text-blue-400">{activeItem.currentSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Eddy Intensity: </span>
                    <span className="font-medium text-sky-400">{activeItem.eddyIntensity}%</span>
                  </div>
                  <div>
                    <span className="text-sky-400/70">Sediment: </span>
                    <span className="font-medium text-red-400">{activeItem.sedimentDeposition} m3</span>
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
