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
import { useMapStore, type SpeciesMigrationRouteState, type SpeciesMigrationRouteData } from '@/lib/map-store'
import { Bird as BirdIcon5, X, Users, Clock, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SpeciesMigrationRouteData[] = [
  {
    id: 'smr-arctictern',
    name: 'Arctic Tern Route',
    lat: 72.0000,
    lng: -20.0000,
    migratoryDistance: 70000,
    populationSize: 2500000,
    timingShift: 5,
    status: 'active',
    description: 'Longest migration route on Earth',
  },
  {
    id: 'smr-wildebeest',
    name: 'Wildebeest Migration',
    lat: -2.0000,
    lng: 35.0000,
    migratoryDistance: 3000,
    populationSize: 1500000,
    timingShift: 12,
    status: 'delayed',
    description: 'Serengeti circular migration delayed by drought',
  },
  {
    id: 'smr-monarch',
    name: 'Monarch Butterfly',
    lat: 19.0000,
    lng: -100.0000,
    migratoryDistance: 4500,
    populationSize: 60000000,
    timingShift: 18,
    status: 'disrupted',
    description: 'Habitat loss disrupting monarch migration',
  },
  {
    id: 'smr-caribou',
    name: 'Porcupine Caribou Herd',
    lat: 68.0000,
    lng: -140.0000,
    migratoryDistance: 2500,
    populationSize: 200000,
    timingShift: 0,
    status: 'collapsed',
    description: 'Migration route severed by pipeline corridor',
  },
]

const STATUS_COLORS: Record<SpeciesMigrationRouteData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  delayed: { label: 'Delayed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  disrupted: { label: 'Disrupted', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: SpeciesMigrationRouteData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SpeciesMigrationRouteMonitor() {
  const state = useMapStore((s) => s.speciesMigrationRoute)
  const setState = useMapStore((s) => s.setSpeciesMigrationRoute)

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
      return { totalPaths: 0, avgMigratoryDistance: 0, avgPopulationSize: 0, avgTimingShift: 0 }
    }
    const avgMigratoryDistance = filteredItems.reduce((sum, e) => sum + e.migratoryDistance, 0) / filteredItems.length
    const avgPopulationSize = filteredItems.reduce((sum, e) => sum + e.populationSize, 0) / filteredItems.length
    const avgTimingShift = filteredItems.reduce((sum, e) => sum + e.timingShift, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgMigratoryDistance: Math.round(avgMigratoryDistance * 100) / 100,
      avgPopulationSize: Math.round(avgPopulationSize * 100) / 100,
      avgTimingShift: Math.round(avgTimingShift * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, migratoryDistance: e.migratoryDistance },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSpeciesMigrationRoute({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SpeciesMigrationRouteState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMigratoryDistance', label: 'Route', icon: Users },
    { key: 'showPopulationSize', label: 'Users', icon: Clock },
    { key: 'showTimingShift', label: 'Clock', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-emerald-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <BirdIcon5 className="h-4 w-4 text-green-400" />
              Species Migration Route Monitor
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
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-slate-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as SpeciesMigrationRouteState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="disrupted">Disrupted</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-green-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Routes</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Distance</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgMigratoryDistance}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Population</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgPopulationSize}</div>
              <div className="text-[9px] text-slate-400/60">individuals</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Timing Shift</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgTimingShift}</div>
              <div className="text-[9px] text-slate-400/60">days</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Routes ({filteredItems.length})
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
                          ? 'border-slate-500/50 bg-slate-800/30'
                          : 'border-slate-700/30 hover:border-slate-500/30 hover:bg-slate-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-slate-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-300/60">
                        {state.showMigratoryDistance && (
                          <div>
                            Distance:{' '}
                            <span className="text-slate-100 font-medium">{e.migratoryDistance} km</span>
                          </div>
                        )}
                        {state.showPopulationSize && (
                          <div>
                            Population:{' '}
                            <span className="text-slate-100 font-medium">{e.populationSize.toLocaleString()}</span>
                          </div>
                        )}
                        {state.showTimingShift && (
                          <div>
                            Timing Shift:{' '}
                            <span className="text-slate-100 font-medium">{e.timingShift} days</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No routes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-slate-700/30" />
              <div className="space-y-2 rounded-lg border border-slate-600/30 bg-slate-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400/70">Coordinates: </span>
                    <span className="font-medium text-slate-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Distance: </span>
                    <span className="font-medium text-green-400">{activeItem.migratoryDistance} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Population: </span>
                    <span className="font-medium text-emerald-400">{activeItem.populationSize.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Timing Shift: </span>
                    <span className="font-medium text-slate-400">{activeItem.timingShift} days</span>
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
