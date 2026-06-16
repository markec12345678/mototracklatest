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
import { useMapStore, type TropicalCurrentState, type TropicalCurrentData } from '@/lib/map-store'
import { Sun as SunIcon10, X, Wind, Thermometer, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: TropicalCurrentData[] = [
  {
    id: 'tc-equatorial',
    name: 'Pacific Equatorial Current',
    lat: 0.0000,
    lng: -150.0000,
    currentSpeed: 0.6,
    temperature: 28,
    freshwaterFlux: 2.5,
    status: 'surging',
    description: 'Surging equatorial current during La Nina',
  },
  {
    id: 'tc-northeq',
    name: 'North Equatorial Current',
    lat: 12.0000,
    lng: 140.0000,
    currentSpeed: 0.4,
    temperature: 27,
    freshwaterFlux: 1.8,
    status: 'flowing',
    description: 'Normal tropical current flow',
  },
  {
    id: 'tc-countereq',
    name: 'Equatorial Countercurrent',
    lat: 5.0000,
    lng: -120.0000,
    currentSpeed: 0.15,
    temperature: 26,
    freshwaterFlux: 0.5,
    status: 'slack',
    description: 'Slack countercurrent conditions',
  },
  {
    id: 'tc-indian',
    name: 'Indian Monsoon Current',
    lat: -5.0000,
    lng: 65.0000,
    currentSpeed: 0.8,
    temperature: 29,
    freshwaterFlux: 3.2,
    status: 'reversed',
    description: 'Reversed monsoon current direction',
  },
]

const STATUS_COLORS: Record<TropicalCurrentData['status'], { label: string; color: string; bgClass: string }> = {
  surging: { label: 'Surging', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  flowing: { label: 'Flowing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  slack: { label: 'Slack', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
  reversed: { label: 'Reversed', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
}

function TrendIcon({ status }: { status: TropicalCurrentData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function TropicalCurrentMonitor() {
  const state = useMapStore((s) => s.tropicalCurrent)
  const setState = useMapStore((s) => s.setTropicalCurrent)

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
      return { totalPaths: 0, avgCurrentSpeed: 0, avgTemperature: 0, avgFreshwaterFlux: 0 }
    }
    const avgCurrentSpeed = filteredItems.reduce((sum, e) => sum + e.currentSpeed, 0) / filteredItems.length
    const avgTemperature = filteredItems.reduce((sum, e) => sum + e.temperature, 0) / filteredItems.length
    const avgFreshwaterFlux = filteredItems.reduce((sum, e) => sum + e.freshwaterFlux, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgCurrentSpeed: Math.round(avgCurrentSpeed * 100) / 100,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      avgFreshwaterFlux: Math.round(avgFreshwaterFlux * 100) / 100,
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
      useMapStore.getState().setTropicalCurrent({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof TropicalCurrentState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCurrentSpeed', label: 'Current Speed', icon: Wind },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showFreshwaterFlux', label: 'Freshwater Flux', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-amber-950/95 backdrop-blur-xl border border-orange-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-orange-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-100">
              <SunIcon10 className="h-4 w-4 text-orange-400" />
              Tropical Current Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as TropicalCurrentState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-orange-900/40 border-orange-700/40 text-orange-100 hover:bg-orange-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="surging">Surging</SelectItem>
                <SelectItem value="flowing">Flowing</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
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
              <div className="text-[10px] text-orange-400/70">Total Currents</div>
              <div className="text-sm font-semibold text-orange-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-orange-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Speed</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgCurrentSpeed}</div>
              <div className="text-[9px] text-orange-400/60">m/s</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg Temp</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-orange-400/60">C</div>
            </div>
            <div className="rounded-lg border border-orange-700/30 bg-orange-900/30 p-2 text-center">
              <div className="text-[10px] text-orange-400/70">Avg FW Flux</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgFreshwaterFlux}</div>
              <div className="text-[9px] text-orange-400/60">m/yr</div>
            </div>
          </div>

          <Separator className="bg-orange-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-orange-300/80">
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
                          ? 'border-orange-500/50 bg-orange-800/30'
                          : 'border-orange-700/30 hover:border-orange-500/30 hover:bg-orange-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-orange-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-orange-300/60">
                        {state.showCurrentSpeed && (
                          <div>
                            Speed:{' '}
                            <span className="text-orange-100 font-medium">{e.currentSpeed} m/s</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-orange-100 font-medium">{e.temperature} C</span>
                          </div>
                        )}
                        {state.showFreshwaterFlux && (
                          <div>
                            FW Flux:{' '}
                            <span className="text-orange-100 font-medium">{e.freshwaterFlux} m/yr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-orange-400/50 py-4">
                    No currents match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
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
                    <span className="text-orange-400/70">Speed: </span>
                    <span className="font-medium text-amber-400">{activeItem.currentSpeed} m/s</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">Temperature: </span>
                    <span className="font-medium text-red-400">{activeItem.temperature} C</span>
                  </div>
                  <div>
                    <span className="text-orange-400/70">FW Flux: </span>
                    <span className="font-medium text-blue-400">{activeItem.freshwaterFlux} m/yr</span>
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
