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
import { useMapStore, type SnowAvalancheTrackerState, type SnowAvalancheTrackerData } from '@/lib/map-store'
import { TriangleAlert as TriangleAlertIcon4, X, Mountain, Snowflake, Ruler, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SnowAvalancheTrackerData[] = [
  {
    id: 'sa-chamonix',
    name: 'Chamonix Avalanche Path',
    lat: 45.9237,
    lng: 6.8694,
    slopeAngle: 42,
    snowDepth: 280,
    avalancheSize: 4,
    status: 'recent',
    description: 'Recent size 4 avalanche',
  },
  {
    id: 'sa-whistler',
    name: 'Whistler Avalanche Zone',
    lat: 50.1167,
    lng: -122.95,
    slopeAngle: 38,
    snowDepth: 220,
    avalancheSize: 3,
    status: 'likely',
    description: 'High danger rating active',
  },
  {
    id: 'sa-jackson',
    name: 'Jackson Hole Path',
    lat: 43.5833,
    lng: -110.8167,
    slopeAngle: 35,
    snowDepth: 180,
    avalancheSize: 2,
    status: 'possible',
    description: 'Moderate hazard zone',
  },
  {
    id: 'sa-davos',
    name: 'Davos Avalanche Sector',
    lat: 46.8069,
    lng: 9.8383,
    slopeAngle: 30,
    snowDepth: 150,
    avalancheSize: 1,
    status: 'unlikely',
    description: 'Low hazard sector',
  },
]

const STATUS_COLORS: Record<SnowAvalancheTrackerData['status'], { label: string; color: string; bgClass: string }> = {
  recent: { label: 'Recent', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  likely: { label: 'Likely', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  possible: { label: 'Possible', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  unlikely: { label: 'Unlikely', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: SnowAvalancheTrackerData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SnowAvalancheTracker() {
  const state = useMapStore((s) => s.snowAvalancheTracker)
  const setState = useMapStore((s) => s.setSnowAvalancheTracker)

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
      return { totalPaths: 0, avgSlope: 0, avgSnowDepth: 0, recentLikelyCount: 0 }
    }
    const avgSlope = filteredItems.reduce((sum, e) => sum + e.slopeAngle, 0) / filteredItems.length
    const avgSnowDepth = filteredItems.reduce((sum, e) => sum + e.snowDepth, 0) / filteredItems.length
    const recentLikelyCount = filteredItems.filter((e) => e.status === 'recent' || e.status === 'likely').length
    return {
      totalPaths: filteredItems.length,
      avgSlope: Math.round(avgSlope * 10) / 10,
      avgSnowDepth: Math.round(avgSnowDepth * 10) / 10,
      recentLikelyCount,
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
      properties: { id: e.id, name: e.name, status: e.status, slopeAngle: e.slopeAngle },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSnowAvalancheTracker({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SnowAvalancheTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSlopeAngle', label: 'Slope Angle', icon: Mountain },
    { key: 'showSnowDepth', label: 'Snow Depth', icon: Snowflake },
    { key: 'showAvalancheSize', label: 'Avalanche Size', icon: Ruler },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-rose-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <TriangleAlertIcon4 className="h-4 w-4 text-red-400" />
              Snow Avalanche Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SnowAvalancheTrackerState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="likely">Likely</SelectItem>
                <SelectItem value="possible">Possible</SelectItem>
                <SelectItem value="unlikely">Unlikely</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Paths</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Slope</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSlope}</div>
              <div className="text-[9px] text-red-400/60">°</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Snow Depth</div>
              <div className="text-sm font-semibold text-rose-400">{summary.avgSnowDepth}</div>
              <div className="text-[9px] text-red-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Recent+Likely</div>
              <div className="text-sm font-semibold text-red-400">{summary.recentLikelyCount}</div>
              <div className="text-[9px] text-red-400/60">paths</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Paths ({filteredItems.length})
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
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-red-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showSlopeAngle && (
                          <div>
                            Slope:{' '}
                            <span className="text-red-100 font-medium">{e.slopeAngle}°</span>
                          </div>
                        )}
                        {state.showSnowDepth && (
                          <div>
                            Snow Depth:{' '}
                            <span className="text-red-100 font-medium">{e.snowDepth} cm</span>
                          </div>
                        )}
                        {state.showAvalancheSize && (
                          <div>
                            Size:{' '}
                            <span className="text-red-100 font-medium">{e.avalancheSize} (1-5)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No paths match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Slope: </span>
                    <span className="font-medium text-orange-400">{activeItem.slopeAngle}°</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Snow Depth: </span>
                    <span className="font-medium text-rose-400">{activeItem.snowDepth} cm</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Avalanche Size: </span>
                    <span className="font-medium text-red-400">{activeItem.avalancheSize} (1-5)</span>
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
