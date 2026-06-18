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
import { useMapStore, type AuroraOvalPositionState, type AuroraOvalPositionData } from '@/lib/map-store'
import { Sparkles as SparklesIcon9, X, Compass, Gauge, Eye, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AuroraOvalPositionData[] = [
  {
    id: 'ao-tromso',
    name: 'Tromso',
    lat: 69.6,
    lng: 19,
    ovalLatitude: 65,
    kpIndex: 5,
    visibilityProbability: 85,
    status: 'active',
    description: 'Active aurora zone in northern Norway',
  },
  {
    id: 'ao-fairbanks',
    name: 'Fairbanks',
    lat: 64.8,
    lng: -147,
    ovalLatitude: 63,
    kpIndex: 7,
    visibilityProbability: 95,
    status: 'storm',
    description: 'Storm-level aurora activity over interior Alaska',
  },
  {
    id: 'ao-edinburgh',
    name: 'Edinburgh',
    lat: 55.9,
    lng: -3,
    ovalLatitude: 58,
    kpIndex: 4,
    visibilityProbability: 45,
    status: 'quiet',
    description: 'Quiet aurora conditions at mid-latitude Scotland',
  },
  {
    id: 'ao-oslo',
    name: 'Oslo',
    lat: 59.9,
    lng: 10.7,
    ovalLatitude: 60,
    kpIndex: 6,
    visibilityProbability: 72,
    status: 'substorm',
    description: 'Substorm aurora expansion over southern Norway',
  },
]

const STATUS_COLORS: Record<AuroraOvalPositionData['status'], { label: string; color: string; bgClass: string }> = {
  storm: { label: 'Storm', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  quiet: { label: 'Quiet', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  substorm: { label: 'Substorm', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
}

function TrendIcon({ status }: { status: AuroraOvalPositionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AuroraOvalPositionMonitor() {
  const state = useMapStore((s) => s.auroraOvalPosition)
  const setState = useMapStore((s) => s.setAuroraOvalPosition)

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
      return { totalStations: 0, avgOvalLat: 0, avgKp: 0, avgProb: 0 }
    }
    const avgOvalLat = filteredItems.reduce((sum, e) => sum + e.ovalLatitude, 0) / filteredItems.length
    const avgKp = filteredItems.reduce((sum, e) => sum + e.kpIndex, 0) / filteredItems.length
    const avgProb = filteredItems.reduce((sum, e) => sum + e.visibilityProbability, 0) / filteredItems.length
    return {
      totalStations: filteredItems.length,
      avgOvalLat: Math.round(avgOvalLat),
      avgKp: avgKp.toFixed(1),
      avgProb: Math.round(avgProb),
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
      properties: { id: e.id, name: e.name, status: e.status, ovalLatitude: e.ovalLatitude },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setAuroraOvalPosition({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AuroraOvalPositionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOvalLatitude', label: 'Oval Latitude', icon: Compass },
    { key: 'showKpIndex', label: 'Kp Index', icon: Gauge },
    { key: 'showVisibilityProbability', label: 'Visibility Probability', icon: Eye },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-purple-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SparklesIcon9 className="h-4 w-4 text-green-400" />
              Aurora Oval Position Monitor
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
                setState({ statusFilter: v as AuroraOvalPositionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="storm">Storm</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="quiet">Quiet</SelectItem>
                <SelectItem value="substorm">Substorm</SelectItem>
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
              <div className="text-[10px] text-slate-400/70">Stations</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalStations}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Oval Lat</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgOvalLat}</div>
              <div className="text-[9px] text-slate-400/60">deg</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Kp</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgKp}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Prob</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgProb}%</div>
              <div className="text-[9px] text-slate-400/60">visibility</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Aurora Stations ({filteredItems.length})
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
                        {state.showOvalLatitude && (
                          <div>
                            Oval Lat:{' '}
                            <span className="text-slate-100 font-medium">{e.ovalLatitude} deg</span>
                          </div>
                        )}
                        {state.showKpIndex && (
                          <div>
                            Kp:{' '}
                            <span className="text-slate-100 font-medium">{e.kpIndex}</span>
                          </div>
                        )}
                        {state.showVisibilityProbability && (
                          <div>
                            Visibility:{' '}
                            <span className="text-slate-100 font-medium">{e.visibilityProbability}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No stations match the current filter.
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
                    <span className="text-slate-400/70">Oval Lat: </span>
                    <span className="font-medium text-green-400">{activeItem.ovalLatitude} deg</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Kp Index: </span>
                    <span className="font-medium text-purple-400">{activeItem.kpIndex}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Visibility: </span>
                    <span className="font-medium text-slate-200">{activeItem.visibilityProbability}%</span>
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
