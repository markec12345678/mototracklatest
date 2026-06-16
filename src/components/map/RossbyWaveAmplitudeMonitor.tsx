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
import { useMapStore, type RossbyWaveAmplitudeState, type RossbyWaveAmplitudeData } from '@/lib/map-store'
import { Activity as ActivityIcon7, X, Activity, Wind, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: RossbyWaveAmplitudeData[] = [
  {
    id: 'rwa-wavenumber3',
    name: 'Wavenumber-3 Pattern',
    lat: 55.0000,
    lng: -90.0000,
    waveAmplitude: 25,
    wavenumber: 3,
    phaseSpeed: 5,
    status: 'amplified',
    description: 'Large-amplitude wavenumber 3 pattern',
  },
  {
    id: 'rwa-wavenumber5',
    name: 'Wavenumber-5 Propagation',
    lat: 50.0000,
    lng: 30.0000,
    waveAmplitude: 12,
    wavenumber: 5,
    phaseSpeed: 8,
    status: 'propagating',
    description: 'Eastward-propagating Rossby wave',
  },
  {
    id: 'rwa-damped',
    name: 'Damped Atlantic Wave',
    lat: 45.0000,
    lng: -30.0000,
    waveAmplitude: 5,
    wavenumber: 6,
    phaseSpeed: 3,
    status: 'damped',
    description: 'Dissipating Rossby wave train',
  },
  {
    id: 'rwa-stationary',
    name: 'Stationary Ridge',
    lat: 60.0000,
    lng: 120.0000,
    waveAmplitude: 18,
    wavenumber: 2,
    phaseSpeed: 0,
    status: 'stationary',
    description: 'Quasi-stationary blocking ridge',
  },
]

const STATUS_COLORS: Record<RossbyWaveAmplitudeData['status'], { label: string; color: string; bgClass: string }> = {
  amplified: { label: 'Amplified', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  propagating: { label: 'Propagating', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  damped: { label: 'Damped', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stationary: { label: 'Stationary', color: '#78716c', bgClass: 'bg-stone-500/10 text-stone-600 border-stone-500/30' },
}

function TrendIcon({ status }: { status: RossbyWaveAmplitudeData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RossbyWaveAmplitudeMonitor() {
  const state = useMapStore((s) => s.rossbyWaveAmplitude)
  const setState = useMapStore((s) => s.setRossbyWaveAmplitude)

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
      return { totalPaths: 0, avgWaveAmplitude: 0, avgWavenumber: 0, avgPhaseSpeed: 0 }
    }
    const avgWaveAmplitude = filteredItems.reduce((sum, e) => sum + e.waveAmplitude, 0) / filteredItems.length
    const avgWavenumber = filteredItems.reduce((sum, e) => sum + e.wavenumber, 0) / filteredItems.length
    const avgPhaseSpeed = filteredItems.reduce((sum, e) => sum + e.phaseSpeed, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgWaveAmplitude: Math.round(avgWaveAmplitude * 100) / 100,
      avgWavenumber: Math.round(avgWavenumber * 100) / 100,
      avgPhaseSpeed: Math.round(avgPhaseSpeed * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, waveAmplitude: e.waveAmplitude },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setRossbyWaveAmplitude({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RossbyWaveAmplitudeState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaveAmplitude', label: 'Wave Amplitude', icon: Activity },
    { key: 'showWavenumber', label: 'Wavenumber', icon: ActivityIcon7 },
    { key: 'showPhaseSpeed', label: 'Phase Speed', icon: Wind },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-red-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ActivityIcon7 className="h-4 w-4 text-rose-400" />
              Rossby Wave Amplitude Monitor
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
                setState({ statusFilter: v as RossbyWaveAmplitudeState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="amplified">Amplified</SelectItem>
                <SelectItem value="propagating">Propagating</SelectItem>
                <SelectItem value="damped">Damped</SelectItem>
                <SelectItem value="stationary">Stationary</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-rose-600"
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
              <div className="text-[10px] text-slate-400/70">Avg Amplitude</div>
              <div className="text-sm font-semibold text-rose-400">{summary.avgWaveAmplitude}</div>
              <div className="text-[9px] text-slate-400/60">deg lat</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Wavenumber</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgWavenumber}</div>
              <div className="text-[9px] text-slate-400/60">k</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Phase Speed</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgPhaseSpeed}</div>
              <div className="text-[9px] text-slate-400/60">m/s</div>
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
                        {state.showWaveAmplitude && (
                          <div>
                            Amplitude:{' '}
                            <span className="text-slate-100 font-medium">{e.waveAmplitude} deg lat</span>
                          </div>
                        )}
                        {state.showWavenumber && (
                          <div>
                            Wavenumber:{' '}
                            <span className="text-slate-100 font-medium">{e.wavenumber}</span>
                          </div>
                        )}
                        {state.showPhaseSpeed && (
                          <div>
                            Phase Speed:{' '}
                            <span className="text-slate-100 font-medium">{e.phaseSpeed} m/s</span>
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
                    <span className="text-slate-400/70">Amplitude: </span>
                    <span className="font-medium text-rose-400">{activeItem.waveAmplitude} deg lat</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Wavenumber: </span>
                    <span className="font-medium text-red-400">{activeItem.wavenumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Phase Speed: </span>
                    <span className="font-medium text-slate-400">{activeItem.phaseSpeed} m/s</span>
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
