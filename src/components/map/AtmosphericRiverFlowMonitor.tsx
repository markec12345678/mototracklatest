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
import { useMapStore, type AtmosphericRiverFlowState, type AtmosphericRiverFlowData } from '@/lib/map-store'
import { CloudRain as CloudRainIcon7, X, Droplets, Cloud, Wind, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AtmosphericRiverFlowData[] = [
  {
    id: 'arf-pineapple',
    name: 'Pineapple Express',
    lat: 38.0000,
    lng: -135.0000,
    moistureFlux: 850,
    integratedVapor: 4.5,
    windSpeed: 28,
    status: 'extreme',
    description: 'Extreme moisture transport to California',
  },
  {
    id: 'arf-uk',
    name: 'UK AR Landfall',
    lat: 52.0000,
    lng: -8.0000,
    moistureFlux: 500,
    integratedVapor: 3.0,
    windSpeed: 22,
    status: 'strong',
    description: 'Strong atmospheric river hitting UK',
  },
  {
    id: 'arf-norway',
    name: 'Norwegian AR',
    lat: 62.0000,
    lng: 8.0000,
    moistureFlux: 300,
    integratedVapor: 2.0,
    windSpeed: 18,
    status: 'moderate',
    description: 'Moderate AR impacting Scandinavia',
  },
  {
    id: 'arf-japan',
    name: 'Japan AR Weak',
    lat: 35.0000,
    lng: 138.0000,
    moistureFlux: 120,
    integratedVapor: 1.0,
    windSpeed: 10,
    status: 'weak',
    description: 'Weak atmospheric river over Japan',
  },
]

const STATUS_COLORS: Record<AtmosphericRiverFlowData['status'], { label: string; color: string; bgClass: string }> = {
  extreme: { label: 'Extreme', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-600 border-red-600/30' },
  strong: { label: 'Strong', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  weak: { label: 'Weak', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: AtmosphericRiverFlowData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AtmosphericRiverFlowMonitor() {
  const state = useMapStore((s) => s.atmosphericRiverFlow)
  const setState = useMapStore((s) => s.setAtmosphericRiverFlow)

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
      return { totalPaths: 0, avgMoistureFlux: 0, avgIntegratedVapor: 0, avgWindSpeed: 0 }
    }
    const avgMoistureFlux = filteredItems.reduce((sum, e) => sum + e.moistureFlux, 0) / filteredItems.length
    const avgIntegratedVapor = filteredItems.reduce((sum, e) => sum + e.integratedVapor, 0) / filteredItems.length
    const avgWindSpeed = filteredItems.reduce((sum, e) => sum + e.windSpeed, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgMoistureFlux: Math.round(avgMoistureFlux),
      avgIntegratedVapor: Math.round(avgIntegratedVapor * 100) / 100,
      avgWindSpeed: Math.round(avgWindSpeed * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, moistureFlux: e.moistureFlux },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setAtmosphericRiverFlow({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AtmosphericRiverFlowState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMoistureFlux', label: 'Moisture Flux', icon: Droplets },
    { key: 'showIntegratedVapor', label: 'Integrated Vapor', icon: Cloud },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-teal-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <CloudRainIcon7 className="h-4 w-4 text-blue-400" />
              Atmospheric River Flow Monitor
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
                setState({ statusFilter: v as AtmosphericRiverFlowState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Rivers</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Moisture</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgMoistureFlux}</div>
              <div className="text-[9px] text-slate-400/60">kg/m/s</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg IV</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgIntegratedVapor}</div>
              <div className="text-[9px] text-slate-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Wind</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-slate-400/60">m/s</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Rivers ({filteredItems.length})
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
                        {state.showMoistureFlux && (
                          <div>
                            Flux:{' '}
                            <span className="text-slate-100 font-medium">{e.moistureFlux} kg/m/s</span>
                          </div>
                        )}
                        {state.showIntegratedVapor && (
                          <div>
                            IV:{' '}
                            <span className="text-slate-100 font-medium">{e.integratedVapor} cm</span>
                          </div>
                        )}
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-slate-100 font-medium">{e.windSpeed} m/s</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No rivers match the current filter.
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
                    <span className="text-slate-400/70">Moisture Flux: </span>
                    <span className="font-medium text-blue-400">{activeItem.moistureFlux} kg/m/s</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">IV: </span>
                    <span className="font-medium text-teal-400">{activeItem.integratedVapor} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Wind: </span>
                    <span className="font-medium text-slate-400">{activeItem.windSpeed} m/s</span>
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
