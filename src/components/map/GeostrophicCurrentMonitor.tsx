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
import { useMapStore, type GeostrophicCurrentState, type GeostrophicCurrentData } from '@/lib/map-store'
import { Compass as CompassIcon5, X, Wind, Gauge, Compass, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GeostrophicCurrentData[] = [
  {
    id: 'gc-gulf',
    name: 'Gulf Stream Core',
    lat: 38.0000,
    lng: -65.0000,
    currentSpeed: 2.5,
    pressureGradient: 0.85,
    coriolisEffect: 9.2,
    status: 'intense',
    description: 'Intense western boundary current',
  },
  {
    id: 'gc-kuroshio',
    name: 'Kuroshio Extension',
    lat: 35.0000,
    lng: 145.0000,
    currentSpeed: 1.8,
    pressureGradient: 0.55,
    coriolisEffect: 8.5,
    status: 'moderate',
    description: 'Moderate geostrophic flow',
  },
  {
    id: 'gc-southatlantic',
    name: 'South Atlantic Current',
    lat: -40.0000,
    lng: -15.0000,
    currentSpeed: 0.3,
    pressureGradient: 0.08,
    coriolisEffect: 7.8,
    status: 'weak',
    description: 'Weak geostrophic current',
  },
  {
    id: 'gc-sargasso',
    name: 'Sargasso Sea Interior',
    lat: 30.0000,
    lng: -60.0000,
    currentSpeed: 0.02,
    pressureGradient: 0.01,
    coriolisEffect: 7.3,
    status: 'stagnant',
    description: 'Near-stagnant gyre interior',
  },
]

const STATUS_COLORS: Record<GeostrophicCurrentData['status'], { label: string; color: string; bgClass: string }> = {
  intense: { label: 'Intense', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weak: { label: 'Weak', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stagnant: { label: 'Stagnant', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: GeostrophicCurrentData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GeostrophicCurrentMonitor() {
  const state = useMapStore((s) => s.geostrophicCurrent)
  const setState = useMapStore((s) => s.setGeostrophicCurrent)

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
      return { totalPaths: 0, avgCurrentSpeed: 0, avgPressureGradient: 0, avgCoriolisEffect: 0 }
    }
    const avgCurrentSpeed = filteredItems.reduce((sum, e) => sum + e.currentSpeed, 0) / filteredItems.length
    const avgPressureGradient = filteredItems.reduce((sum, e) => sum + e.pressureGradient, 0) / filteredItems.length
    const avgCoriolisEffect = filteredItems.reduce((sum, e) => sum + e.coriolisEffect, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgCurrentSpeed: Math.round(avgCurrentSpeed * 100) / 100,
      avgPressureGradient: Math.round(avgPressureGradient * 100) / 100,
      avgCoriolisEffect: Math.round(avgCoriolisEffect * 100) / 100,
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
      useMapStore.getState().setGeostrophicCurrent({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GeostrophicCurrentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: Wind },
    { key: 'showPressureGradient', label: 'Pressure Gradient', icon: Gauge },
    { key: 'showCoriolisEffect', label: 'Coriolis Effect', icon: Compass },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-emerald-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <CompassIcon5 className="h-4 w-4 text-teal-400" />
              Geostrophic Current Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-teal-300 hover:text-teal-100 hover:bg-teal-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-teal-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-teal-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as GeostrophicCurrentState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
                <SelectItem value="stagnant">Stagnant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-teal-200">
                  <Icon className="h-3 w-3 text-teal-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-teal-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Total Currents</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Current Speed</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgCurrentSpeed}</div>
              <div className="text-[9px] text-teal-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Pressure Grad</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgPressureGradient}</div>
              <div className="text-[9px] text-teal-400/60">Pa/km</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Coriolis</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgCoriolisEffect}</div>
              <div className="text-[9px] text-teal-400/60">10^-4 s^-1</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Currents ({filteredItems.length})
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
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-teal-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showCurrentSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-teal-100 font-medium">{e.currentSpeed} m/s</span>
                          </div>
                        )}
                        {state.showPressureGradient && (
                          <div>
                            Pressure:{' '}
                            <span className="text-teal-100 font-medium">{e.pressureGradient} Pa/km</span>
                          </div>
                        )}
                        {state.showCoriolisEffect && (
                          <div>
                            Coriolis:{' '}
                            <span className="text-teal-100 font-medium">{e.coriolisEffect} 10^-4 s^-1</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No currents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Speed: </span>
                    <span className="font-medium text-cyan-400">{activeItem.currentSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Pressure Grad: </span>
                    <span className="font-medium text-teal-400">{activeItem.pressureGradient} Pa/km</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Coriolis: </span>
                    <span className="font-medium text-emerald-400">{activeItem.coriolisEffect} 10^-4 s^-1</span>
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
