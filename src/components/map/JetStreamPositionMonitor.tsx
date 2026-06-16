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
import { useMapStore, type JetStreamPositionState, type JetStreamPositionData } from '@/lib/map-store'
import { Wind as WindIcon15, X, MapPin, Wind, Activity, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: JetStreamPositionData[] = [
  {
    id: 'jsp-northatlantic',
    name: 'North Atlantic Jet',
    lat: 52.0000,
    lng: -30.0000,
    latitudePosition: 55,
    windSpeed: 65,
    meanderIndex: 4.5,
    status: 'amplified',
    description: 'Highly amplified meridional jet pattern',
  },
  {
    id: 'jsp-pacific',
    name: 'North Pacific Jet',
    lat: 42.0000,
    lng: -170.0000,
    latitudePosition: 42,
    windSpeed: 50,
    meanderIndex: 1.2,
    status: 'zonal',
    description: 'Strong zonal flow across Pacific',
  },
  {
    id: 'jsp-europe',
    name: 'European Blocking Jet',
    lat: 58.0000,
    lng: 15.0000,
    latitudePosition: 62,
    windSpeed: 25,
    meanderIndex: 6.8,
    status: 'blocked',
    description: 'Omega blocking pattern over Europe',
  },
  {
    id: 'jsp-asia',
    name: 'East Asian Split Jet',
    lat: 40.0000,
    lng: 100.0000,
    latitudePosition: 38,
    windSpeed: 35,
    meanderIndex: 3.0,
    status: 'split',
    description: 'Bifurcated subtropical/polar jet',
  },
]

const STATUS_COLORS: Record<JetStreamPositionData['status'], { label: string; color: string; bgClass: string }> = {
  amplified: { label: 'Amplified', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  zonal: { label: 'Zonal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  blocked: { label: 'Blocked', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  split: { label: 'Split', color: '#a855f7', bgClass: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
}

function TrendIcon({ status }: { status: JetStreamPositionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function JetStreamPositionMonitor() {
  const state = useMapStore((s) => s.jetStreamPosition)
  const setState = useMapStore((s) => s.setJetStreamPosition)

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
      return { totalPaths: 0, avgLatitudePosition: 0, avgWindSpeed: 0, avgMeanderIndex: 0 }
    }
    const avgLatitudePosition = filteredItems.reduce((sum, e) => sum + e.latitudePosition, 0) / filteredItems.length
    const avgWindSpeed = filteredItems.reduce((sum, e) => sum + e.windSpeed, 0) / filteredItems.length
    const avgMeanderIndex = filteredItems.reduce((sum, e) => sum + e.meanderIndex, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgLatitudePosition: Math.round(avgLatitudePosition * 100) / 100,
      avgWindSpeed: Math.round(avgWindSpeed * 100) / 100,
      avgMeanderIndex: Math.round(avgMeanderIndex * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, latitudePosition: e.latitudePosition },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setJetStreamPosition({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof JetStreamPositionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showLatitudePosition', label: 'Latitude Position', icon: MapPin },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showMeanderIndex', label: 'Meander Index', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WindIcon15 className="h-4 w-4 text-sky-400" />
              Jet Stream Position Monitor
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
                setState({ statusFilter: v as JetStreamPositionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="amplified">Amplified</SelectItem>
                <SelectItem value="zonal">Zonal</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="split">Split</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Lat Position</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgLatitudePosition}</div>
              <div className="text-[9px] text-slate-400/60">deg N</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-slate-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Meander</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgMeanderIndex}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Sites ({filteredItems.length})
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
                        {state.showLatitudePosition && (
                          <div>
                            Lat Pos:{' '}
                            <span className="text-slate-100 font-medium">{e.latitudePosition} deg N</span>
                          </div>
                        )}
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-slate-100 font-medium">{e.windSpeed} m/s</span>
                          </div>
                        )}
                        {state.showMeanderIndex && (
                          <div>
                            Meander:{' '}
                            <span className="text-slate-100 font-medium">{e.meanderIndex}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-slate-400/70">Lat Position: </span>
                    <span className="font-medium text-sky-400">{activeItem.latitudePosition} deg N</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Wind Speed: </span>
                    <span className="font-medium text-blue-400">{activeItem.windSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Meander: </span>
                    <span className="font-medium text-slate-400">{activeItem.meanderIndex}</span>
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
