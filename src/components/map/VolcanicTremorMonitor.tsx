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
import { useMapStore, type VolcanicTremorState, type VolcanicTremorData } from '@/lib/map-store'
import { Activity as ActivityIcon6, X, Waves, Clock, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: VolcanicTremorData[] = [
  {
    id: 'vt-etna',
    name: 'Etna Tremor Network',
    lat: 37.751,
    lng: 14.9934,
    amplitude: 12.5,
    frequency: 2.1,
    duration: 180,
    status: 'harmonic',
    description: 'Continuous harmonic tremor',
  },
  {
    id: 'vt-kilauea',
    name: 'Kīlauea Tremor Array',
    lat: 19.4069,
    lng: -155.2834,
    amplitude: 8.3,
    frequency: 0.7,
    duration: 45,
    status: 'spasmodic',
    description: 'Episodic burst tremor',
  },
  {
    id: 'vt-stromboli',
    name: 'Stromboli Tremor',
    lat: 38.7937,
    lng: 15.2131,
    amplitude: 15.2,
    frequency: 3.5,
    duration: 720,
    status: 'continuous',
    description: 'Persistent strombolian tremor',
  },
  {
    id: 'vt-redoubt',
    name: 'Redoubt Tremor',
    lat: 60.4852,
    lng: -152.7428,
    amplitude: 0.8,
    frequency: 0.3,
    duration: 0,
    status: 'tremor_free',
    description: 'Currently quiet',
  },
]

const STATUS_COLORS: Record<VolcanicTremorData['status'], { label: string; color: string; bgClass: string }> = {
  harmonic: { label: 'Harmonic', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  spasmodic: { label: 'Spasmodic', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  continuous: { label: 'Continuous', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  tremor_free: { label: 'Quiet', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
}

function TrendIcon({ status }: { status: VolcanicTremorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VolcanicTremorMonitor() {
  const state = useMapStore((s) => s.volcanicTremor)
  const setState = useMapStore((s) => s.setVolcanicTremor)

  const events = useMemo(
    () => (state.data.length > 0 ? state.data : SAMPLE_LOCATIONS),
    [state.data]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalStations: 0, avgAmplitude: 0, avgFrequency: 0, activeTremorCount: 0 }
    }
    const avgAmplitude = filteredItems.reduce((sum, e) => sum + e.amplitude, 0) / filteredItems.length
    const avgFrequency = filteredItems.reduce((sum, e) => sum + e.frequency, 0) / filteredItems.length
    const activeTremorCount = filteredItems.filter((e) => e.status === 'harmonic' || e.status === 'spasmodic' || e.status === 'continuous').length
    return {
      totalStations: filteredItems.length,
      avgAmplitude,
      avgFrequency,
      activeTremorCount,
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
      properties: { id: e.id, name: e.name, status: e.status, amplitude: e.amplitude },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setVolcanicTremor({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicTremorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAmplitude', label: 'Amplitude', icon: Waves },
    { key: 'showFrequency', label: 'Frequency', icon: ActivityIcon6 },
    { key: 'showDuration', label: 'Duration', icon: Clock },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-orange-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <ActivityIcon6 className="h-4 w-4 text-red-400" />
              Volcanic Tremor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as VolcanicTremorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="harmonic">Harmonic</SelectItem>
                <SelectItem value="spasmodic">Spasmodic</SelectItem>
                <SelectItem value="continuous">Continuous</SelectItem>
                <SelectItem value="tremor_free">Quiet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Stations</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalStations}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Amplitude</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgAmplitude.toFixed(1)}</div>
              <div className="text-[9px] text-red-400/60">μm/s</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Frequency</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgFrequency.toFixed(1)}</div>
              <div className="text-[9px] text-red-400/60">Hz</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Active Tremor</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeTremorCount}</div>
              <div className="text-[9px] text-red-400/60">stations</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Stations ({filteredItems.length})
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
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-red-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showAmplitude && (
                          <div>
                            Amplitude:{' '}
                            <span className="text-red-100 font-medium">{e.amplitude} μm/s</span>
                          </div>
                        )}
                        {state.showFrequency && (
                          <div>
                            Frequency:{' '}
                            <span className="text-red-100 font-medium">{e.frequency} Hz</span>
                          </div>
                        )}
                        {state.showDuration && (
                          <div>
                            Duration:{' '}
                            <span className="text-red-100 font-medium">{e.duration} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No stations match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Amplitude: </span>
                    <span className="font-medium text-orange-400">{activeItem.amplitude} μm/s</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Frequency: </span>
                    <span className="font-medium text-yellow-400">{activeItem.frequency} Hz</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Duration: </span>
                    <span className="font-medium text-red-400">{activeItem.duration} min</span>
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
