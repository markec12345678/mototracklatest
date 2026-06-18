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
import { useMapStore, type SolarFluxIndexState, type SolarFluxIndexData } from '@/lib/map-store'
import { Sun as SunIcon11, X, Gauge, CircleDot, RotateCw, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SolarFluxIndexData[] = [
  {
    id: 'sf-cycle25peak',
    name: 'Cycle 25 Peak',
    lat: 0,
    lng: 0,
    f107Index: 200,
    sunspotNumber: 180,
    solarCyclePhase: 0.8,
    status: 'solar_max',
    description: 'Solar maximum conditions for Cycle 25',
  },
  {
    id: 'sf-rising',
    name: 'Rising Phase',
    lat: 0,
    lng: 90,
    f107Index: 120,
    sunspotNumber: 80,
    solarCyclePhase: 0.5,
    status: 'rising',
    description: 'Rising phase of solar activity cycle',
  },
  {
    id: 'sf-declining',
    name: 'Declining Phase',
    lat: 0,
    lng: 180,
    f107Index: 85,
    sunspotNumber: 40,
    solarCyclePhase: 0.6,
    status: 'declining',
    description: 'Declining phase toward solar minimum',
  },
  {
    id: 'sf-min',
    name: 'Solar Minimum',
    lat: 0,
    lng: -90,
    f107Index: 68,
    sunspotNumber: 5,
    solarCyclePhase: 0.0,
    status: 'solar_min',
    description: 'Quiet Sun at solar minimum',
  },
]

const STATUS_COLORS: Record<SolarFluxIndexData['status'], { label: string; color: string; bgClass: string }> = {
  solar_max: { label: 'Solar Max', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  rising: { label: 'Rising', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  declining: { label: 'Declining', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  solar_min: { label: 'Solar Min', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: SolarFluxIndexData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SolarFluxIndexMonitor() {
  const state = useMapStore((s) => s.solarFluxIndex)
  const setState = useMapStore((s) => s.setSolarFluxIndex)

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
      return { totalPhases: 0, avgF107: 0, avgSpots: 0, avgPhase: 0 }
    }
    const avgF107 = Math.round(filteredItems.reduce((sum, e) => sum + e.f107Index, 0) / filteredItems.length)
    const avgSpots = Math.round(filteredItems.reduce((sum, e) => sum + e.sunspotNumber, 0) / filteredItems.length)
    const avgPhase = (filteredItems.reduce((sum, e) => sum + e.solarCyclePhase, 0) / filteredItems.length).toFixed(2)
    return { totalPhases: filteredItems.length, avgF107, avgSpots, avgPhase }
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
      properties: { id: e.id, name: e.name, status: e.status, f107Index: e.f107Index },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setSolarFluxIndex({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SolarFluxIndexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showF107Index', label: 'F10.7 Index', icon: Gauge },
    { key: 'showSunspotNumber', label: 'Sunspot Number', icon: CircleDot },
    { key: 'showSolarCyclePhase', label: 'Solar Cycle Phase', icon: RotateCw },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-orange-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <SunIcon11 className="h-4 w-4 text-amber-400" />
              Solar Flux Index Monitor
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
                setState({ statusFilter: v as SolarFluxIndexState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="solar_max">Solar Max</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="solar_min">Solar Min</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-amber-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Phases</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPhases}</div>
              <div className="text-[9px] text-slate-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg F10.7</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgF107}</div>
              <div className="text-[9px] text-slate-400/60">sfu</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Spots</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgSpots}</div>
              <div className="text-[9px] text-slate-400/60">number</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Phase</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgPhase}</div>
              <div className="text-[9px] text-slate-400/60">cycle</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Solar Phases ({filteredItems.length})
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
                        {state.showF107Index && (
                          <div>
                            F10.7:{' '}
                            <span className="text-slate-100 font-medium">{e.f107Index} sfu</span>
                          </div>
                        )}
                        {state.showSunspotNumber && (
                          <div>
                            Spots:{' '}
                            <span className="text-slate-100 font-medium">{e.sunspotNumber}</span>
                          </div>
                        )}
                        {state.showSolarCyclePhase && (
                          <div>
                            Phase:{' '}
                            <span className="text-slate-100 font-medium">{e.solarCyclePhase}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No phases match the current filter.
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
                    <span className="text-slate-400/70">F10.7: </span>
                    <span className="font-medium text-amber-400">{activeItem.f107Index} sfu</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Sunspots: </span>
                    <span className="font-medium text-orange-400">{activeItem.sunspotNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Phase: </span>
                    <span className="font-medium text-slate-200">{activeItem.solarCyclePhase}</span>
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
