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
import { useMapStore, type NoiseLevelMapperState, type NoiseLevelMapperData } from '@/lib/map-store'
import { Volume2 as Volume2Icon2, X, Ear, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: NoiseLevelMapperData[] = [
  {
    id: 'nl-heathrow',
    name: 'Heathrow Zone',
    lat: 51.470,
    lng: -0.462,
    avgDecibels: 82,
    peakLevel: 105,
    quietZonePercent: 8,
    nightLevel: 68,
    status: 'extreme',
    description: 'Extreme noise levels from aircraft operations at Heathrow Airport',
  },
  {
    id: 'nl-shinjuku',
    name: 'Shinjuku District',
    lat: 35.694,
    lng: 139.703,
    avgDecibels: 75,
    peakLevel: 92,
    quietZonePercent: 15,
    nightLevel: 58,
    status: 'high',
    description: 'High noise from entertainment district and railway hub activity',
  },
  {
    id: 'nl-midtown',
    name: 'Manhattan Midtown',
    lat: 40.754,
    lng: -73.987,
    avgDecibels: 68,
    peakLevel: 85,
    quietZonePercent: 22,
    nightLevel: 52,
    status: 'moderate',
    description: 'Moderate urban noise from traffic, construction, and commercial activity',
  },
  {
    id: 'nl-lasramblas',
    name: 'Las Ramblas BCN',
    lat: 41.379,
    lng: 2.174,
    avgDecibels: 55,
    peakLevel: 72,
    quietZonePercent: 45,
    nightLevel: 38,
    status: 'quiet',
    description: 'Relatively quiet pedestrian boulevard with limited vehicular access',
  },
]

const STATUS_COLORS: Record<NoiseLevelMapperData['status'], { label: string; color: string; bgClass: string }> = {
  extreme: { label: 'Extreme', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  high: { label: 'High', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  quiet: { label: 'Quiet', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: NoiseLevelMapperData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function NoiseLevelMapperMonitor() {
  const state = useMapStore((s) => s.noiseLevelMapper)
  const setState = useMapStore((s) => s.setNoiseLevelMapper)

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
      return { totalZones: 0, avgDb: 0, avgPeak: 0, avgQuiet: 0 }
    }
    const avgDb = filteredItems.reduce((sum, e) => sum + e.avgDecibels, 0) / filteredItems.length
    const avgPeak = filteredItems.reduce((sum, e) => sum + e.peakLevel, 0) / filteredItems.length
    const avgQuiet = filteredItems.reduce((sum, e) => sum + e.quietZonePercent, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgDb: Math.round(avgDb),
      avgPeak: Math.round(avgPeak),
      avgQuiet: Math.round(avgQuiet),
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
      properties: { id: e.id, name: e.name, status: e.status, avgDecibels: e.avgDecibels },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setNoiseLevelMapper({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof NoiseLevelMapperState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAvgDecibels', label: 'Avg Decibels', icon: Ear },
    { key: 'showPeakLevel', label: 'Peak Level', icon: Gauge },
    { key: 'showQuietZonePercent', label: 'Quiet Zone %', icon: Volume2Icon2 },
    { key: 'showNightLevel', label: 'Night Level', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-violet-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <Volume2Icon2 className="h-4 w-4 text-purple-400" />
              Noise Level Mapper Monitor
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
                setState({ statusFilter: v as NoiseLevelMapperState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="extreme">Extreme</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="quiet">Quiet</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-purple-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Decibels</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgDb}</div>
              <div className="text-[9px] text-slate-400/60">dB</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Peak</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgPeak}</div>
              <div className="text-[9px] text-slate-400/60">dB</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Quiet Zone</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgQuiet}%</div>
              <div className="text-[9px] text-slate-400/60">avg</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Noise Zones ({filteredItems.length})
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
                        {state.showAvgDecibels && (
                          <div>
                            Avg dB:{' '}
                            <span className="text-slate-100 font-medium">{e.avgDecibels} dB</span>
                          </div>
                        )}
                        {state.showPeakLevel && (
                          <div>
                            Peak:{' '}
                            <span className="text-slate-100 font-medium">{e.peakLevel} dB</span>
                          </div>
                        )}
                        {state.showQuietZonePercent && (
                          <div>
                            Quiet Zone:{' '}
                            <span className="text-slate-100 font-medium">{e.quietZonePercent}%</span>
                          </div>
                        )}
                        {state.showNightLevel && (
                          <div>
                            Night:{' '}
                            <span className="text-slate-100 font-medium">{e.nightLevel} dB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
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
                    <span className="text-slate-400/70">Avg dB: </span>
                    <span className="font-medium text-purple-400">{activeItem.avgDecibels} dB</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Peak: </span>
                    <span className="font-medium text-violet-400">{activeItem.peakLevel} dB</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Night: </span>
                    <span className="font-medium text-slate-200">{activeItem.nightLevel} dB</span>
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
