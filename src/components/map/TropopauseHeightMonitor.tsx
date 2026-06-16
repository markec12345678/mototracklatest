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
import { useMapStore, type TropopauseHeightState, type TropopauseHeightData } from '@/lib/map-store'
import { ArrowUpFromLine as ArrowUpIcon6, X, ArrowUpFromLine, Thermometer, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TropopauseHeightData[] = [
  {
    id: 'th-tropical',
    name: 'Tropical Tropopause',
    lat: 10.0000,
    lng: 0.0000,
    tropopauseHeight: 17.5,
    temperatureLapse: -6.5,
    tropopausePressure: 95,
    status: 'elevated',
    description: 'Elevated tropical tropopause at 17.5km',
  },
  {
    id: 'th-midlat',
    name: 'Midlatitude Tropopause',
    lat: 45.0000,
    lng: -90.0000,
    tropopauseHeight: 12.0,
    temperatureLapse: -6.0,
    tropopausePressure: 200,
    status: 'normal',
    description: 'Normal midlatitude tropopause height',
  },
  {
    id: 'th-polar',
    name: 'Polar Tropopause',
    lat: 75.0000,
    lng: 20.0000,
    tropopauseHeight: 8.5,
    temperatureLapse: -4.5,
    tropopausePressure: 320,
    status: 'depressed',
    description: 'Depressed polar tropopause',
  },
  {
    id: 'th-fold',
    name: 'Tropopause Fold Region',
    lat: 50.0000,
    lng: -60.0000,
    tropopauseHeight: 5.0,
    temperatureLapse: -2.0,
    tropopausePressure: 450,
    status: 'folded',
    description: 'Stratospheric intrusion fold event',
  },
]

const STATUS_COLORS: Record<TropopauseHeightData['status'], { label: string; color: string; bgClass: string }> = {
  elevated: { label: 'Elevated', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  normal: { label: 'Normal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  depressed: { label: 'Depressed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  folded: { label: 'Folded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: TropopauseHeightData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TropopauseHeightMonitor() {
  const state = useMapStore((s) => s.tropopauseHeight)
  const setState = useMapStore((s) => s.setTropopauseHeight)

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
      return { totalPaths: 0, avgTropopauseHeight: 0, avgTemperatureLapse: 0, avgTropopausePressure: 0 }
    }
    const avgTropopauseHeight = filteredItems.reduce((sum, e) => sum + e.tropopauseHeight, 0) / filteredItems.length
    const avgTemperatureLapse = filteredItems.reduce((sum, e) => sum + e.temperatureLapse, 0) / filteredItems.length
    const avgTropopausePressure = filteredItems.reduce((sum, e) => sum + e.tropopausePressure, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgTropopauseHeight: Math.round(avgTropopauseHeight * 100) / 100,
      avgTemperatureLapse: Math.round(avgTemperatureLapse * 100) / 100,
      avgTropopausePressure: Math.round(avgTropopausePressure),
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
      properties: { id: e.id, name: e.name, status: e.status, tropopauseHeight: e.tropopauseHeight },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setTropopauseHeight({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TropopauseHeightState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTropopauseHeight', label: 'Tropopause Height', icon: ArrowUpFromLine },
    { key: 'showTemperatureLapse', label: 'Temperature Lapse', icon: Thermometer },
    { key: 'showTropopausePressure', label: 'Tropopause Pressure', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-slate-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ArrowUpIcon6 className="h-4 w-4 text-indigo-400" />
              Tropopause Height Monitor
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
                setState({ statusFilter: v as TropopauseHeightState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="depressed">Depressed</SelectItem>
                <SelectItem value="folded">Folded</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-indigo-600"
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
              <div className="text-[10px] text-slate-400/70">Avg Height</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgTropopauseHeight}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Lapse Rate</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgTemperatureLapse}</div>
              <div className="text-[9px] text-slate-400/60">C/km</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Pressure</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgTropopausePressure}</div>
              <div className="text-[9px] text-slate-400/60">hPa</div>
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
                        {state.showTropopauseHeight && (
                          <div>
                            Height:{' '}
                            <span className="text-slate-100 font-medium">{e.tropopauseHeight} km</span>
                          </div>
                        )}
                        {state.showTemperatureLapse && (
                          <div>
                            Lapse:{' '}
                            <span className="text-slate-100 font-medium">{e.temperatureLapse} C/km</span>
                          </div>
                        )}
                        {state.showTropopausePressure && (
                          <div>
                            Pressure:{' '}
                            <span className="text-slate-100 font-medium">{e.tropopausePressure} hPa</span>
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
                    <span className="text-slate-400/70">Height: </span>
                    <span className="font-medium text-indigo-400">{activeItem.tropopauseHeight} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Lapse: </span>
                    <span className="font-medium text-slate-400">{activeItem.temperatureLapse} C/km</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Pressure: </span>
                    <span className="font-medium text-slate-400">{activeItem.tropopausePressure} hPa</span>
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
