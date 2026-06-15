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
import { useMapStore, type VolcanicFumaroleState, type VolcanicFumaroleData } from '@/lib/map-store'
import { Flame as FlameIcon13, X, Thermometer, Gauge, MapPin, Filter, CloudCog as CloudGas } from 'lucide-react'

const SAMPLE_LOCATIONS: VolcanicFumaroleData[] = [
  {
    id: 'vf-etna',
    name: 'Etna NE Crater',
    lat: 37.76,
    lng: 15.01,
    temperature: 450,
    gasComposition: 'SO2-rich',
    pressure: 180,
    status: 'active',
    description: 'High-temperature fumarolic field on Etna',
  },
  {
    id: 'vf-vesuvius',
    name: 'Vesuvius Solfatara',
    lat: 40.83,
    lng: 14.14,
    temperature: 160,
    gasComposition: 'H2S-dominant',
    pressure: 85,
    status: 'dormant',
    description: 'Low-temperature degassing at Solfatara crater',
  },
  {
    id: 'vf-kilauea',
    name: 'Kilauea Halemaʻumaʻu',
    lat: 19.41,
    lng: -155.29,
    temperature: 620,
    gasComposition: 'CO2-rich',
    pressure: 250,
    status: 'intensifying',
    description: 'Intensifying gas emission from summit vent',
  },
  {
    id: 'vf-whakaari',
    name: 'Whakaari/White Island',
    lat: -37.52,
    lng: 177.18,
    temperature: 380,
    gasComposition: 'SO2/HCl',
    pressure: 150,
    status: 'active',
    description: 'Active volcanic island fumarole system',
  },
]

const STATUS_COLORS: Record<VolcanicFumaroleData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  intensifying: { label: 'Intensifying', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
}

function TrendIcon({ status }: { status: VolcanicFumaroleData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VolcanicFumaroleMonitor() {
  const state = useMapStore((s) => s.volcanicFumarole)
  const setState = useMapStore((s) => s.setVolcanicFumarole)

  const fumaroles = useMemo(
    () => (state.fumaroles.length > 0 ? state.fumaroles : SAMPLE_LOCATIONS),
    [state.fumaroles]
  )

  const filteredItems = useMemo(() => {
    return fumaroles.filter((f) => {
      if (state.statusFilter !== 'all' && f.status !== state.statusFilter) return false
      return true
    })
  }, [fumaroles, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFumaroles: 0, avgTemperature: 0, avgPressure: 0, activeCount: 0 }
    }
    const avgTemperature = filteredItems.reduce((sum, f) => sum + f.temperature, 0) / filteredItems.length
    const avgPressure = filteredItems.reduce((sum, f) => sum + f.pressure, 0) / filteredItems.length
    const activeCount = filteredItems.filter((f) => f.status === 'active').length
    return {
      totalFumaroles: filteredItems.length,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgPressure: Math.round(avgPressure * 10) / 10,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => fumaroles.find((f) => f.id === state.activeFumaroleId) ?? null,
    [fumaroles, state.activeFumaroleId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((f) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [f.lng, f.lat] },
      properties: { id: f.id, name: f.name, status: f.status, temperature: f.temperature },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.fumaroles.length === 0) {
      useMapStore.getState().setVolcanicFumarole({ fumaroles: SAMPLE_LOCATIONS })
    }
  }, [state.fumaroles.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicFumaroleState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showGasComposition', label: 'Gas Composition', icon: CloudGas },
    { key: 'showPressure', label: 'Pressure', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <FlameIcon13 className="h-4 w-4 text-orange-400" />
              Volcanic Fumarole Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-orange-300 hover:text-orange-100 hover:bg-orange-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-orange-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-orange-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as VolcanicFumaroleState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="intensifying">Intensifying</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Total Fumaroles</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalFumaroles}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-orange-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Pressure</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgPressure}</div>
              <div className="text-[9px] text-orange-400/60">kPa</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Active Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeCount}</div>
              <div className="text-[9px] text-orange-400/60">fumaroles</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Fumarole List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
              Fumaroles ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((f) => {
                  const isActive = state.activeFumaroleId === f.id
                  const statusCfg = STATUS_COLORS[f.status]
                  return (
                    <div
                      key={f.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFumaroleId: isActive ? null : f.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={f.status} />
                          <span className="text-xs font-medium text-orange-100">{f.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-orange-100 font-medium">{f.temperature}°C</span>
                          </div>
                        )}
                        {state.showGasComposition && (
                          <div>
                            Gas:{' '}
                            <span className="text-orange-100 font-medium">{f.gasComposition}</span>
                          </div>
                        )}
                        {state.showPressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-orange-100 font-medium">{f.pressure}kPa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No fumaroles match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Fumarole Details */}
          {activeItem && (
            <>
              <Separator className="bg-orange-700/30" />
              <div className="space-y-2 rounded-lg border border-orange-600/30 bg-orange-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-orange-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-orange-400/70">Coordinates: </span>
                    <span className="font-medium text-orange-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Temperature: </span>
                    <span className="font-medium text-red-400">{activeItem.temperature}°C</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Pressure: </span>
                    <span className="font-medium text-amber-400">{activeItem.pressure}kPa</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Gas: </span>
                    <span className="font-medium text-orange-200">{activeItem.gasComposition}</span>
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
