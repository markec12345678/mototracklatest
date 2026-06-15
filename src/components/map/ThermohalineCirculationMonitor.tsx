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
import { useMapStore, type ThermohalineCirculationState, type ThermohalineCirculationData } from '@/lib/map-store'
import { Waves as WavesIcon13, X, Thermometer, Droplets, MapPin, Filter, TrendingUp } from 'lucide-react'

const SAMPLE_LOCATIONS: ThermohalineCirculationData[] = [
  {
    id: 'th-amoc',
    name: 'AMOC North Atlantic',
    lat: 50.0,
    lng: -30.0,
    waterMass: 'NADW',
    temperature: 3.5,
    salinity: 34.9,
    velocity: 1.2,
    status: 'weakening',
    description: 'Atlantic Meridional Overturning Circulation weakening trend',
  },
  {
    id: 'th-aabw',
    name: 'Antarctic Bottom Water',
    lat: -60.0,
    lng: 0.0,
    waterMass: 'AABW',
    temperature: -0.8,
    salinity: 34.65,
    velocity: 0.3,
    status: 'strong',
    description: 'Dense bottom water formation in Weddell Sea',
  },
  {
    id: 'th-nadw',
    name: 'NADW Formation Zone',
    lat: 65.0,
    lng: -20.0,
    waterMass: 'NADW',
    temperature: 2.0,
    salinity: 35.0,
    velocity: 0.8,
    status: 'weakening',
    description: 'Deep water formation in Nordic Seas',
  },
  {
    id: 'th-indian',
    name: 'Indian Ocean Overturning',
    lat: -20.0,
    lng: 70.0,
    waterMass: 'IDW',
    temperature: 5.2,
    salinity: 34.8,
    velocity: 0.5,
    status: 'stalled',
    description: 'Stagnant deep water circulation in Indian Ocean',
  },
]

const STATUS_COLORS: Record<ThermohalineCirculationData['status'], { label: string; color: string; bgClass: string }> = {
  strong: { label: 'Strong', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  weakening: { label: 'Weakening', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stalled: { label: 'Stalled', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: ThermohalineCirculationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function ThermohalineCirculationMonitor() {
  const state = useMapStore((s) => s.thermohalineCirculation)
  const setState = useMapStore((s) => s.setThermohalineCirculation)

  const currents = useMemo(
    () => (state.currents.length > 0 ? state.currents : SAMPLE_LOCATIONS),
    [state.currents]
  )

  const filteredCurrents = useMemo(() => {
    return currents.filter((c) => {
      if (state.statusFilter !== 'all' && c.status !== state.statusFilter) return false
      return true
    })
  }, [currents, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredCurrents.length === 0) {
      return { totalCurrents: 0, avgTemperature: 0, avgSalinity: 0, weakeningCount: 0 }
    }
    const avgTemperature = filteredCurrents.reduce((sum, c) => sum + c.temperature, 0) / filteredCurrents.length
    const avgSalinity = filteredCurrents.reduce((sum, c) => sum + c.salinity, 0) / filteredCurrents.length
    const weakeningCount = filteredCurrents.filter((c) => c.status === 'weakening').length
    return {
      totalCurrents: filteredCurrents.length,
      avgTemperature: Math.round(avgTemperature * 100) / 100,
      avgSalinity: Math.round(avgSalinity * 100) / 100,
      weakeningCount,
    }
  }, [filteredCurrents])

  const activeItem = useMemo(
    () => currents.find((c) => c.id === state.activeCurrentId) ?? null,
    [currents, state.activeCurrentId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredCurrents.map((c) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [c.lng, c.lat] },
      properties: { id: c.id, name: c.name, status: c.status, temperature: c.temperature },
    })),
  }), [filteredCurrents])

  useEffect(() => {
    if (state.currents.length === 0) {
      useMapStore.getState().setThermohalineCirculation({ currents: SAMPLE_LOCATIONS })
    }
  }, [state.currents.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ThermohalineCirculationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
    { key: 'showVelocity', label: 'Velocity', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-indigo-950/95 backdrop-blur-xl border border-blue-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <WavesIcon13 className="h-4 w-4 text-blue-400" />
              Thermohaline Circulation Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-blue-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-blue-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Circulation Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as ThermohalineCirculationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="weakening">Weakening</SelectItem>
                <SelectItem value="stalled">Stalled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-200">
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

          <Separator className="bg-blue-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Total Currents</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalCurrents}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-blue-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Salinity</div>
              <div className="text-sm font-semibold text-indigo-300">{summary.avgSalinity}</div>
              <div className="text-[9px] text-blue-400/60">PSU</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Weakening Count</div>
              <div className="text-sm font-semibold text-amber-400">{summary.weakeningCount}</div>
              <div className="text-[9px] text-blue-400/60">currents</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Current List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
              Ocean Currents ({filteredCurrents.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredCurrents.map((current) => {
                  const isActive = state.activeCurrentId === current.id
                  const statusCfg = STATUS_COLORS[current.status]
                  return (
                    <div
                      key={current.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeCurrentId: isActive ? null : current.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={current.status} />
                          <span className="text-xs font-medium text-blue-100">{current.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-blue-100 font-medium">{current.temperature}°C</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-blue-100 font-medium">{current.salinity}PSU</span>
                          </div>
                        )}
                        {state.showVelocity && (
                          <div>
                            Velocity:{' '}
                            <span className="text-blue-100 font-medium">{current.velocity}m/s</span>
                          </div>
                        )}
                        <div>
                          Water Mass:{' '}
                          <span className="text-blue-100 font-medium">{current.waterMass}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredCurrents.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No currents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Current Details */}
          {activeItem && (
            <>
              <Separator className="bg-blue-700/30" />
              <div className="space-y-2 rounded-lg border border-blue-600/30 bg-blue-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-blue-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-blue-400/70">Coordinates: </span>
                    <span className="font-medium text-blue-100">
                      {activeItem.lat.toFixed(1)}, {activeItem.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Temperature: </span>
                    <span className="font-medium text-cyan-400">{activeItem.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Salinity: </span>
                    <span className="font-medium text-indigo-300">{activeItem.salinity}PSU</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Velocity: </span>
                    <span className="font-medium text-blue-200">{activeItem.velocity}m/s</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Water Mass: </span>
                    <span className="font-medium text-blue-200">{activeItem.waterMass}</span>
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
