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
import { useMapStore, type AtmosphericPressureCellState, type AtmosphericPressureCellData } from '@/lib/map-store'
import { Gauge as GaugeIcon2, X, Gauge, Ruler, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AtmosphericPressureCellData[] = [
  {
    id: 'apc-azores',
    name: 'Azores High',
    lat: 35.0000,
    lng: -30.0000,
    centralPressure: 1035,
    cellDiameter: 5000,
    pressureGradient: 8,
    status: 'intense',
    description: 'Intense subtropical high pressure cell',
  },
  {
    id: 'apc-icelandic',
    name: 'Icelandic Low',
    lat: 63.0000,
    lng: -20.0000,
    centralPressure: 990,
    cellDiameter: 3000,
    pressureGradient: 15,
    status: 'moderate',
    description: 'Moderate subpolar low pressure',
  },
  {
    id: 'apc-siberian',
    name: 'Siberian High',
    lat: 55.0000,
    lng: 80.0000,
    centralPressure: 1025,
    cellDiameter: 4000,
    pressureGradient: 5,
    status: 'weak',
    description: 'Weakening continental anticyclone',
  },
  {
    id: 'apc-aleutian',
    name: 'Aleutian Low',
    lat: 52.0000,
    lng: -175.0000,
    centralPressure: 975,
    cellDiameter: 2500,
    pressureGradient: 4,
    status: 'dissipating',
    description: 'Dissipating North Pacific low',
  },
]

const STATUS_COLORS: Record<AtmosphericPressureCellData['status'], { label: string; color: string; bgClass: string }> = {
  intense: { label: 'Intense', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weak: { label: 'Weak', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  dissipating: { label: 'Dissipating', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: AtmosphericPressureCellData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AtmosphericPressureCellMonitor() {
  const state = useMapStore((s) => s.atmosphericPressureCell)
  const setState = useMapStore((s) => s.setAtmosphericPressureCell)

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
      return { totalPaths: 0, avgCentralPressure: 0, avgCellDiameter: 0, avgPressureGradient: 0 }
    }
    const avgCentralPressure = filteredItems.reduce((sum, e) => sum + e.centralPressure, 0) / filteredItems.length
    const avgCellDiameter = filteredItems.reduce((sum, e) => sum + e.cellDiameter, 0) / filteredItems.length
    const avgPressureGradient = filteredItems.reduce((sum, e) => sum + e.pressureGradient, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgCentralPressure: Math.round(avgCentralPressure),
      avgCellDiameter: Math.round(avgCellDiameter),
      avgPressureGradient: Math.round(avgPressureGradient * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, centralPressure: e.centralPressure },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setAtmosphericPressureCell({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AtmosphericPressureCellState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCentralPressure', label: 'Central Pressure', icon: Gauge },
    { key: 'showCellDiameter', label: 'Cell Diameter', icon: Ruler },
    { key: 'showPressureGradient', label: 'Pressure Gradient', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-violet-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <GaugeIcon2 className="h-4 w-4 text-purple-400" />
              Atmospheric Pressure Cell Monitor
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
                setState({ statusFilter: v as AtmosphericPressureCellState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="dissipating">Dissipating</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-purple-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Cells</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Pressure</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgCentralPressure}</div>
              <div className="text-[9px] text-slate-400/60">hPa</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Diameter</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgCellDiameter}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Gradient</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgPressureGradient}</div>
              <div className="text-[9px] text-slate-400/60">hPa/1000km</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Cells ({filteredItems.length})
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
                        {state.showCentralPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-slate-100 font-medium">{e.centralPressure} hPa</span>
                          </div>
                        )}
                        {state.showCellDiameter && (
                          <div>
                            Diameter:{' '}
                            <span className="text-slate-100 font-medium">{e.cellDiameter} km</span>
                          </div>
                        )}
                        {state.showPressureGradient && (
                          <div>
                            Gradient:{' '}
                            <span className="text-slate-100 font-medium">{e.pressureGradient} hPa/1000km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No cells match the current filter.
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
                    <span className="text-slate-400/70">Pressure: </span>
                    <span className="font-medium text-purple-400">{activeItem.centralPressure} hPa</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Diameter: </span>
                    <span className="font-medium text-violet-400">{activeItem.cellDiameter} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Gradient: </span>
                    <span className="font-medium text-slate-400">{activeItem.pressureGradient} hPa/1000km</span>
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
