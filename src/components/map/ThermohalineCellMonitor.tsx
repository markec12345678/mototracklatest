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
import { useMapStore, type ThermohalineCellState, type ThermohalineCellData } from '@/lib/map-store'
import { Waves as WavesIcon21, X, Waves, Thermometer, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: ThermohalineCellData[] = [
  {
    id: 'thc-nadw',
    name: 'North Atlantic Deep Water',
    lat: 58.0000,
    lng: -30.0000,
    overturningRate: 17,
    temperature: 3.5,
    salinity: 34.9,
    status: 'strong',
    description: 'Strong AMOC overturning cell',
  },
  {
    id: 'thc-aabw',
    name: 'Antarctic Bottom Water',
    lat: -65.0000,
    lng: 0.0000,
    overturningRate: 8,
    temperature: -0.8,
    salinity: 34.6,
    status: 'moderate',
    description: 'Moderate AABW formation rate',
  },
  {
    id: 'thc-indian',
    name: 'Indian Ocean Cell',
    lat: -35.0000,
    lng: 55.0000,
    overturningRate: 4,
    temperature: 5.2,
    salinity: 35.1,
    status: 'weakening',
    description: 'Weakening thermohaline circulation',
  },
  {
    id: 'thc-pacific',
    name: 'Pacific Deep Water',
    lat: 45.0000,
    lng: -160.0000,
    overturningRate: 1,
    temperature: 1.8,
    salinity: 34.7,
    status: 'collapsed',
    description: 'Collapsed deep water formation',
  },
]

const STATUS_COLORS: Record<ThermohalineCellData['status'], { label: string; color: string; bgClass: string }> = {
  strong: { label: 'Strong', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weakening: { label: 'Weakening', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  collapsed: { label: 'Collapsed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: ThermohalineCellData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function ThermohalineCellMonitor() {
  const state = useMapStore((s) => s.thermohalineCell)
  const setState = useMapStore((s) => s.setThermohalineCell)

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
      return { totalPaths: 0, avgOverturningRate: 0, avgTemperature: 0, avgSalinity: 0 }
    }
    const avgOverturningRate = filteredItems.reduce((sum, e) => sum + e.overturningRate, 0) / filteredItems.length
    const avgTemperature = filteredItems.reduce((sum, e) => sum + e.temperature, 0) / filteredItems.length
    const avgSalinity = filteredItems.reduce((sum, e) => sum + e.salinity, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgOverturningRate: Math.round(avgOverturningRate * 100) / 100,
      avgTemperature: Math.round(avgTemperature * 100) / 100,
      avgSalinity: Math.round(avgSalinity * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, overturningRate: e.overturningRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setThermohalineCell({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ThermohalineCellState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showOverturningRate', label: 'Overturning Rate', icon: Waves },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showSalinity', label: 'Salinity', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-slate-950/95 backdrop-blur-xl border border-blue-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-100">
              <WavesIcon21 className="h-4 w-4 text-blue-400" />
              Thermohaline Cell Monitor
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
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as ThermohalineCellState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-blue-900/40 border-blue-700/40 text-blue-100 hover:bg-blue-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="weakening">Weakening</SelectItem>
                <SelectItem value="collapsed">Collapsed</SelectItem>
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
              <div className="text-[10px] text-blue-400/70">Total Cells</div>
              <div className="text-sm font-semibold text-blue-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-blue-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Overturning</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgOverturningRate}</div>
              <div className="text-[9px] text-blue-400/60">Sv</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-blue-400/60">C</div>
            </div>
            <div className="rounded-lg border border-blue-700/30 bg-blue-900/30 p-2 text-center">
              <div className="text-[10px] text-blue-400/70">Avg Salinity</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgSalinity}</div>
              <div className="text-[9px] text-blue-400/60">PSU</div>
            </div>
          </div>

          <Separator className="bg-blue-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-blue-300/80">
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
                          ? 'border-blue-500/50 bg-blue-800/30'
                          : 'border-blue-700/30 hover:border-blue-500/30 hover:bg-blue-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-blue-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-blue-300/60">
                        {state.showOverturningRate && (
                          <div>
                            Overturning:{' '}
                            <span className="text-blue-100 font-medium">{e.overturningRate} Sv</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-blue-100 font-medium">{e.temperature} C</span>
                          </div>
                        )}
                        {state.showSalinity && (
                          <div>
                            Salinity:{' '}
                            <span className="text-blue-100 font-medium">{e.salinity} PSU</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-blue-400/50 py-4">
                    No cells match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
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
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Overturning: </span>
                    <span className="font-medium text-cyan-400">{activeItem.overturningRate} Sv</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Temperature: </span>
                    <span className="font-medium text-blue-400">{activeItem.temperature} C</span>
                  </div>
                  <div>
                    <span className="text-blue-400/70">Salinity: </span>
                    <span className="font-medium text-green-400">{activeItem.salinity} PSU</span>
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
