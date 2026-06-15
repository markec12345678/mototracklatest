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
import { useMapStore, type SeicheWaveOscillationState, type SeicheWaveOscillationData } from '@/lib/map-store'
import { Waves as WavesIcon16, X, Activity, Clock, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SeicheWaveOscillationData[] = [
  {
    id: 'sw-geneva',
    name: 'Lake Geneva Seiche',
    lat: 46.4512,
    lng: 6.5944,
    waveAmplitude: 75,
    oscillationPeriod: 74,
    waterLevelChange: 40,
    status: 'active',
    description: 'Classic seiche observations',
  },
  {
    id: 'sw-erie',
    name: 'Lake Erie Seiche',
    lat: 42.1667,
    lng: -81.0,
    waveAmplitude: 150,
    oscillationPeriod: 14,
    waterLevelChange: 80,
    status: 'subsiding',
    description: 'Wind-driven seiches',
  },
  {
    id: 'sw-baikal',
    name: 'Lake Baikal Seiche',
    lat: 53.5,
    lng: 108.0,
    waveAmplitude: 20,
    oscillationPeriod: 270,
    waterLevelChange: 10,
    status: 'standing',
    description: 'Deep water oscillations',
  },
  {
    id: 'sw-nagasaki',
    name: 'Nagasaki Bay Seiche',
    lat: 32.75,
    lng: 129.8667,
    waveAmplitude: 5,
    oscillationPeriod: 30,
    waterLevelChange: 3,
    status: 'calm',
    description: 'Tsunami-triggered seiches',
  },
]

const STATUS_COLORS: Record<SeicheWaveOscillationData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  subsiding: { label: 'Subsiding', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  standing: { label: 'Standing', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  calm: { label: 'Calm', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: SeicheWaveOscillationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SeicheWaveOscillationMonitor() {
  const state = useMapStore((s) => s.seicheWaveOscillation)
  const setState = useMapStore((s) => s.setSeicheWaveOscillation)

  const oscillations = useMemo(
    () => (state.oscillations.length > 0 ? state.oscillations : SAMPLE_LOCATIONS),
    [state.oscillations]
  )

  const filteredItems = useMemo(() => {
    return oscillations.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [oscillations, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSites: 0, maxAmplitude: 0, avgPeriod: 0, activeCount: 0 }
    }
    const maxAmplitude = Math.max(...filteredItems.map((e) => e.waveAmplitude))
    const avgPeriod = Math.round(filteredItems.reduce((sum, e) => sum + e.oscillationPeriod, 0) / filteredItems.length)
    const activeCount = filteredItems.filter((e) => e.status === 'active').length
    return {
      totalSites: filteredItems.length,
      maxAmplitude,
      avgPeriod,
      activeCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => oscillations.find((e) => e.id === state.activeOscillationId) ?? null,
    [oscillations, state.activeOscillationId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, waveAmplitude: e.waveAmplitude },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.oscillations.length === 0) {
      useMapStore.getState().setSeicheWaveOscillation({ oscillations: SAMPLE_LOCATIONS })
    }
  }, [state.oscillations.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SeicheWaveOscillationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaveAmplitude', label: 'Wave Amplitude', icon: Activity },
    { key: 'showOscillationPeriod', label: 'Oscillation Period', icon: Clock },
    { key: 'showWaterLevelChange', label: 'Water Level Change', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <WavesIcon16 className="h-4 w-4 text-teal-400" />
              Seiche Wave Oscillation
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
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SeicheWaveOscillationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="subsiding">Subsiding</SelectItem>
                <SelectItem value="standing">Standing</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
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
              <div className="text-[10px] text-teal-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalSites}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Max Amplitude</div>
              <div className="text-sm font-semibold text-orange-400">{summary.maxAmplitude}</div>
              <div className="text-[9px] text-teal-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Period</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgPeriod}</div>
              <div className="text-[9px] text-teal-400/60">min</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Active</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-teal-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Oscillation List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Oscillations ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeOscillationId === e.id
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
                        setState({ activeOscillationId: isActive ? null : e.id })
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
                        {state.showWaveAmplitude && (
                          <div>
                            Amplitude:{' '}
                            <span className="text-teal-100 font-medium">{e.waveAmplitude} cm</span>
                          </div>
                        )}
                        {state.showOscillationPeriod && (
                          <div>
                            Period:{' '}
                            <span className="text-teal-100 font-medium">{e.oscillationPeriod} min</span>
                          </div>
                        )}
                        {state.showWaterLevelChange && (
                          <div>
                            Water Level:{' '}
                            <span className="text-teal-100 font-medium">{e.waterLevelChange} cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No oscillations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Oscillation Details */}
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
                    <span className="text-teal-400/70">Amplitude: </span>
                    <span className="font-medium text-orange-400">{activeItem.waveAmplitude} cm</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Period: </span>
                    <span className="font-medium text-yellow-400">{activeItem.oscillationPeriod} min</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Water Level: </span>
                    <span className="font-medium text-teal-400">{activeItem.waterLevelChange} cm</span>
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
