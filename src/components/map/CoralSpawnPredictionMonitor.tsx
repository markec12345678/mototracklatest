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
import { useMapStore, type CoralSpawnPredictionState, type CoralSpawnPredictionData } from '@/lib/map-store'
import { Sparkles as SparklesIcon6, X, Calendar, Thermometer, Moon, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CoralSpawnPredictionData[] = [
  {
    id: 'cp-gbr-heron',
    name: 'Heron Island Reef',
    lat: -23.4,
    lng: 151.9,
    spawnDate: 'Nov 15-17',
    waterTemperature: 26.5,
    moonPhase: 'Full Moon',
    status: 'predicted',
    description: 'Predicted mass spawning event on Great Barrier Reef',
  },
  {
    id: 'cp-okinawa',
    name: 'Okinawa Reef',
    lat: 26.3,
    lng: 127.8,
    spawnDate: 'Jun 20-22',
    waterTemperature: 28.0,
    moonPhase: 'Waning Gibbous',
    status: 'spawning',
    description: 'Active spawning observed at Okinawa main reef',
  },
  {
    id: 'cp-florida',
    name: 'Florida Keys Reef',
    lat: 24.7,
    lng: -81.0,
    spawnDate: 'Aug 5-8',
    waterTemperature: 30.5,
    moonPhase: 'New Moon',
    status: 'post_spawn',
    description: 'Post-spawn recovery phase in Florida Keys',
  },
  {
    id: 'cp-maldives-p',
    name: 'Maldives Atoll Reef',
    lat: 4.2,
    lng: 73.5,
    spawnDate: 'Apr 10-12',
    waterTemperature: 31.0,
    moonPhase: 'First Quarter',
    status: 'delayed',
    description: 'Delayed spawning due to thermal stress',
  },
]

const STATUS_COLORS: Record<CoralSpawnPredictionData['status'], { label: string; color: string; bgClass: string }> = {
  predicted: { label: 'Predicted', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  spawning: { label: 'Spawning', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  post_spawn: { label: 'Post Spawn', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  delayed: { label: 'Delayed', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: CoralSpawnPredictionData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CoralSpawnPredictionMonitor() {
  const state = useMapStore((s) => s.coralSpawnPrediction)
  const setState = useMapStore((s) => s.setCoralSpawnPrediction)

  const predictions = useMemo(
    () => (state.predictions.length > 0 ? state.predictions : SAMPLE_LOCATIONS),
    [state.predictions]
  )

  const filteredItems = useMemo(() => {
    return predictions.filter((p) => {
      if (state.statusFilter !== 'all' && p.status !== state.statusFilter) return false
      return true
    })
  }, [predictions, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalPredictions: 0, spawningCount: 0, avgWaterTemp: 0, delayedCount: 0 }
    }
    const avgWaterTemp = filteredItems.reduce((sum, p) => sum + p.waterTemperature, 0) / filteredItems.length
    const spawningCount = filteredItems.filter((p) => p.status === 'spawning').length
    const delayedCount = filteredItems.filter((p) => p.status === 'delayed').length
    return {
      totalPredictions: filteredItems.length,
      spawningCount,
      avgWaterTemp: Math.round(avgWaterTemp * 10) / 10,
      delayedCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => predictions.find((p) => p.id === state.activePredictionId) ?? null,
    [predictions, state.activePredictionId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      properties: { id: p.id, name: p.name, status: p.status, waterTemperature: p.waterTemperature },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.predictions.length === 0) {
      useMapStore.getState().setCoralSpawnPrediction({ predictions: SAMPLE_LOCATIONS })
    }
  }, [state.predictions.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoralSpawnPredictionState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpawnDate', label: 'Spawn Date', icon: Calendar },
    { key: 'showWaterTemperature', label: 'Water Temperature', icon: Thermometer },
    { key: 'showMoonPhase', label: 'Moon Phase', icon: Moon },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-pink-950/95 to-fuchsia-950/95 backdrop-blur-xl border border-pink-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-pink-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-pink-100">
              <SparklesIcon6 className="h-4 w-4 text-pink-400" />
              Coral Spawn Prediction Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-pink-300 hover:text-pink-100 hover:bg-pink-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-pink-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-pink-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as CoralSpawnPredictionState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-pink-900/40 border-pink-700/40 text-pink-100 hover:bg-pink-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="predicted">Predicted</SelectItem>
                <SelectItem value="spawning">Spawning</SelectItem>
                <SelectItem value="post_spawn">Post Spawn</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-pink-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-pink-200">
                  <Icon className="h-3 w-3 text-pink-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-pink-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-pink-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Total Predictions</div>
              <div className="text-sm font-semibold text-pink-200">{summary.totalPredictions}</div>
              <div className="text-[9px] text-pink-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Spawning Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.spawningCount}</div>
              <div className="text-[9px] text-pink-400/60">active</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Avg Water Temp</div>
              <div className="text-sm font-semibold text-fuchsia-400">{summary.avgWaterTemp}</div>
              <div className="text-[9px] text-pink-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Delayed Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.delayedCount}</div>
              <div className="text-[9px] text-pink-400/60">predictions</div>
            </div>
          </div>

          <Separator className="bg-pink-700/30" />

          {/* Prediction List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300/80">
              Predictions ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((p) => {
                  const isActive = state.activePredictionId === p.id
                  const statusCfg = STATUS_COLORS[p.status]
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-pink-500/50 bg-pink-800/30'
                          : 'border-pink-700/30 hover:border-pink-500/30 hover:bg-pink-800/20'
                      }`}
                      onClick={() =>
                        setState({ activePredictionId: isActive ? null : p.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={p.status} />
                          <span className="text-xs font-medium text-pink-100">{p.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-pink-300/60">
                        {state.showSpawnDate && (
                          <div>
                            Spawn Date:{' '}
                            <span className="text-pink-100 font-medium">{p.spawnDate}</span>
                          </div>
                        )}
                        {state.showWaterTemperature && (
                          <div>
                            Water Temp:{' '}
                            <span className="text-pink-100 font-medium">{p.waterTemperature}°C</span>
                          </div>
                        )}
                        {state.showMoonPhase && (
                          <div>
                            Moon Phase:{' '}
                            <span className="text-pink-100 font-medium">{p.moonPhase}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-pink-400/50 py-4">
                    No predictions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Prediction Details */}
          {activeItem && (
            <>
              <Separator className="bg-pink-700/30" />
              <div className="space-y-2 rounded-lg border border-pink-600/30 bg-pink-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-pink-400" />
                  <span className="text-xs font-semibold text-pink-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-pink-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-pink-400/70">Coordinates: </span>
                    <span className="font-medium text-pink-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-pink-400/70">Spawn Date: </span>
                    <span className="font-medium text-blue-400">{activeItem.spawnDate}</span>
                  </div>
                  <div>
                    <span className="text-pink-400/70">Water Temp: </span>
                    <span className="font-medium text-fuchsia-400">{activeItem.waterTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-pink-400/70">Moon Phase: </span>
                    <span className="font-medium text-amber-400">{activeItem.moonPhase}</span>
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
