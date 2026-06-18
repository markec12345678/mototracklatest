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
import { useMapStore, type BridgeStructuralHealthState, type BridgeStructuralHealthData } from '@/lib/map-store'
import { Construction as ConstructionIcon, X, Activity, Shield, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: BridgeStructuralHealthData[] = [
  {
    id: 'bs-goldengate',
    name: 'Golden Gate Bridge',
    lat: 37.820,
    lng: -122.478,
    structuralStress: 185,
    vibrationLevel: 4.2,
    loadCapacity: 45000,
    corrosionIndex: 28,
    status: 'stable',
    description: 'Stable structural condition with moderate corrosion monitoring needed',
  },
  {
    id: 'bs-brooklyn',
    name: 'Brooklyn Bridge',
    lat: 40.706,
    lng: -73.997,
    structuralStress: 210,
    vibrationLevel: 6.8,
    loadCapacity: 38000,
    corrosionIndex: 45,
    status: 'warning',
    description: 'Warning level vibrations detected during peak traffic periods',
  },
  {
    id: 'bs-tower',
    name: 'Tower Bridge',
    lat: 51.506,
    lng: -0.076,
    structuralStress: 155,
    vibrationLevel: 2.1,
    loadCapacity: 52000,
    corrosionIndex: 15,
    status: 'optimal',
    description: 'Optimal structural health after recent maintenance and inspection',
  },
  {
    id: 'bs-akashi',
    name: 'Akashi Kaikyo Bridge',
    lat: 34.617,
    lng: 135.015,
    structuralStress: 280,
    vibrationLevel: 9.5,
    loadCapacity: 32000,
    corrosionIndex: 62,
    status: 'critical',
    description: 'Critical stress levels from seismic activity and saltwater corrosion',
  },
]

const STATUS_COLORS: Record<BridgeStructuralHealthData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  optimal: { label: 'Optimal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: BridgeStructuralHealthData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function BridgeStructuralHealthMonitor() {
  const state = useMapStore((s) => s.bridgeStructuralHealth)
  const setState = useMapStore((s) => s.setBridgeStructuralHealth)

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
      return { totalBridges: 0, avgStress: 0, avgVibration: 0, avgCorrosion: 0 }
    }
    const avgStress = filteredItems.reduce((sum, e) => sum + e.structuralStress, 0) / filteredItems.length
    const avgVibration = filteredItems.reduce((sum, e) => sum + e.vibrationLevel, 0) / filteredItems.length
    const avgCorrosion = filteredItems.reduce((sum, e) => sum + e.corrosionIndex, 0) / filteredItems.length
    return {
      totalBridges: filteredItems.length,
      avgStress: Math.round(avgStress),
      avgVibration: avgVibration.toFixed(1),
      avgCorrosion: Math.round(avgCorrosion),
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
      properties: { id: e.id, name: e.name, status: e.status, structuralStress: e.structuralStress },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setBridgeStructuralHealth({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof BridgeStructuralHealthState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showStructuralStress', label: 'Structural Stress', icon: Activity },
    { key: 'showVibrationLevel', label: 'Vibration Level', icon: Shield },
    { key: 'showLoadCapacity', label: 'Load Capacity', icon: ConstructionIcon },
    { key: 'showCorrosionIndex', label: 'Corrosion Index', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-stone-950/95 to-zinc-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ConstructionIcon className="h-4 w-4 text-stone-400" />
              Bridge Structural Health Monitor
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
                setState({ statusFilter: v as BridgeStructuralHealthState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-stone-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Bridges</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalBridges}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Stress</div>
              <div className="text-sm font-semibold text-stone-400">{summary.avgStress}</div>
              <div className="text-[9px] text-slate-400/60">MPa</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Vibration</div>
              <div className="text-sm font-semibold text-zinc-400">{summary.avgVibration}</div>
              <div className="text-[9px] text-slate-400/60">mm/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Corrosion</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgCorrosion}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Bridge Locations ({filteredItems.length})
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
                        {state.showStructuralStress && (
                          <div>
                            Stress:{' '}
                            <span className="text-slate-100 font-medium">{e.structuralStress} MPa</span>
                          </div>
                        )}
                        {state.showVibrationLevel && (
                          <div>
                            Vibration:{' '}
                            <span className="text-slate-100 font-medium">{e.vibrationLevel} mm/s</span>
                          </div>
                        )}
                        {state.showLoadCapacity && (
                          <div>
                            Load Cap:{' '}
                            <span className="text-slate-100 font-medium">{e.loadCapacity} t</span>
                          </div>
                        )}
                        {state.showCorrosionIndex && (
                          <div>
                            Corrosion:{' '}
                            <span className="text-slate-100 font-medium">{e.corrosionIndex}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No bridges match the current filter.
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
                    <span className="text-slate-400/70">Stress: </span>
                    <span className="font-medium text-stone-400">{activeItem.structuralStress} MPa</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Vibration: </span>
                    <span className="font-medium text-zinc-400">{activeItem.vibrationLevel} mm/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Corrosion: </span>
                    <span className="font-medium text-slate-200">{activeItem.corrosionIndex}</span>
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
