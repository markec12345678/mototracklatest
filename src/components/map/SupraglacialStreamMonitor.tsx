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
import { useMapStore, type SupraglacialStreamState, type SupraglacialStreamData } from '@/lib/map-store'
import { Droplet as DropletIcon6, X, Layers, Activity, MapPin, Filter, Thermometer } from 'lucide-react'

const SAMPLE_LOCATIONS: SupraglacialStreamData[] = [
  {
    id: 'ss-greenland-sw',
    name: 'Greenland SW-1',
    lat: 67.0,
    lng: -50.0,
    flowRate: 50,
    waterTemperature: 0.5,
    meltRate: 2.5,
    status: 'flowing',
    channelWidth: 15,
    description: 'Major supraglacial meltwater channel',
  },
  {
    id: 'ss-greenland-ne',
    name: 'Greenland NE',
    lat: 76.0,
    lng: -25.0,
    flowRate: 5,
    waterTemperature: -0.2,
    meltRate: 0.8,
    status: 'seasonal',
    channelWidth: 3,
    description: 'Seasonal high-latitude melt channel',
  },
  {
    id: 'ss-antarctica',
    name: 'Antarctica Dry Valleys',
    lat: -77.5,
    lng: 162.5,
    flowRate: 0.5,
    waterTemperature: 0.1,
    meltRate: 0.1,
    status: 'seasonal',
    channelWidth: 1,
    description: 'Onyx River supraglacial tributary',
  },
  {
    id: 'ss-iceland',
    name: 'Iceland Vatnajökull',
    lat: 64.4,
    lng: -16.8,
    flowRate: 30,
    waterTemperature: 1.2,
    meltRate: 1.8,
    status: 'draining',
    channelWidth: 10,
    description: 'Active moulin-draining stream system',
  },
]

const STATUS_COLORS: Record<SupraglacialStreamData['status'], { label: string; color: string; bgClass: string }> = {
  flowing: { label: 'Flowing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  seasonal: { label: 'Seasonal', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  frozen: { label: 'Frozen', color: '#94a3b8', bgClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  draining: { label: 'Draining', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
}

function TrendIcon({ status }: { status: SupraglacialStreamData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SupraglacialStreamMonitor() {
  const state = useMapStore((s) => s.supraglacialStream)
  const setState = useMapStore((s) => s.setSupraglacialStream)

  const streams = useMemo(
    () => (state.streams.length > 0 ? state.streams : SAMPLE_LOCATIONS),
    [state.streams]
  )

  const filteredStreams = useMemo(() => {
    return streams.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [streams, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredStreams.length === 0) {
      return { totalStreams: 0, avgFlowRate: 0, avgMeltRate: 0, activeStreams: 0 }
    }
    const avgFlowRate = filteredStreams.reduce((sum, s) => sum + s.flowRate, 0) / filteredStreams.length
    const avgMeltRate = filteredStreams.reduce((sum, s) => sum + s.meltRate, 0) / filteredStreams.length
    const activeStreams = filteredStreams.filter((s) => s.status === 'flowing' || s.status === 'draining').length
    return {
      totalStreams: filteredStreams.length,
      avgFlowRate: Math.round(avgFlowRate * 10) / 10,
      avgMeltRate: Math.round(avgMeltRate * 10) / 10,
      activeStreams,
    }
  }, [filteredStreams])

  const activeStream = useMemo(
    () => streams.find((s) => s.id === state.activeStreamId) ?? null,
    [streams, state.activeStreamId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredStreams.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, flowRate: s.flowRate },
    })),
  }), [filteredStreams])

  useEffect(() => {
    if (state.streams.length === 0) {
      useMapStore.getState().setSupraglacialStream({ streams: SAMPLE_LOCATIONS })
    }
  }, [state.streams.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SupraglacialStreamState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFlowRate', label: 'Flow Rate', icon: Layers },
    { key: 'showTemperature', label: 'Water Temperature', icon: Thermometer },
    { key: 'showMeltRate', label: 'Melt Rate', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-teal-950/95 to-cyan-950/95 backdrop-blur-xl border border-teal-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-teal-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-teal-100">
              <DropletIcon6 className="h-4 w-4 text-teal-400" />
              Supraglacial Stream Monitor
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
              Stream Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SupraglacialStreamState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-teal-900/40 border-teal-700/40 text-teal-100 hover:bg-teal-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="flowing">Flowing</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="draining">Draining</SelectItem>
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
              <div className="text-[10px] text-teal-400/70">Total Streams</div>
              <div className="text-sm font-semibold text-teal-200">{summary.totalStreams}</div>
              <div className="text-[9px] text-teal-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Flow Rate</div>
              <div className="text-sm font-semibold text-teal-200">{summary.avgFlowRate}</div>
              <div className="text-[9px] text-teal-400/60">m³/s</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Avg Melt Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgMeltRate}</div>
              <div className="text-[9px] text-teal-400/60">m/yr</div>
            </div>
            <div className="rounded-lg border border-teal-700/30 bg-teal-900/30 p-2 text-center">
              <div className="text-[10px] text-teal-400/70">Active Streams</div>
              <div className="text-sm font-semibold text-green-400">{summary.activeStreams}</div>
              <div className="text-[9px] text-teal-400/60">flowing/draining</div>
            </div>
          </div>

          <Separator className="bg-teal-700/30" />

          {/* Stream List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-teal-300/80">
              Streams ({filteredStreams.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStreams.map((stream) => {
                  const isActive = state.activeStreamId === stream.id
                  const statusCfg = STATUS_COLORS[stream.status]
                  return (
                    <div
                      key={stream.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-teal-500/50 bg-teal-800/30'
                          : 'border-teal-700/30 hover:border-teal-500/30 hover:bg-teal-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeStreamId: isActive ? null : stream.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={stream.status} />
                          <span className="text-xs font-medium text-teal-100">{stream.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-teal-300/60">
                        {state.showFlowRate && (
                          <div>
                            Flow Rate:{' '}
                            <span className="text-teal-100 font-medium">{stream.flowRate}m³/s</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Water Temp:{' '}
                            <span className="text-teal-100 font-medium">{stream.waterTemperature}°C</span>
                          </div>
                        )}
                        {state.showMeltRate && (
                          <div>
                            Melt Rate:{' '}
                            <span className="text-teal-100 font-medium">{stream.meltRate}m/yr</span>
                          </div>
                        )}
                        {state.showFlowRate && (
                          <div>
                            Channel Width:{' '}
                            <span className="text-teal-100 font-medium">{stream.channelWidth}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStreams.length === 0 && (
                  <div className="text-center text-xs text-teal-400/50 py-4">
                    No streams match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Stream Details */}
          {activeStream && (
            <>
              <Separator className="bg-teal-700/30" />
              <div className="space-y-2 rounded-lg border border-teal-600/30 bg-teal-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-100">{activeStream.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeStream.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeStream.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-teal-300/60 italic">{activeStream.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-teal-400/70">Coordinates: </span>
                    <span className="font-medium text-teal-100">
                      {activeStream.lat.toFixed(1)}, {activeStream.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Flow Rate: </span>
                    <span className="font-medium text-teal-100">{activeStream.flowRate}m³/s</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Water Temp: </span>
                    <span className="font-medium text-cyan-400">{activeStream.waterTemperature}°C</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Melt Rate: </span>
                    <span className="font-medium text-orange-400">{activeStream.meltRate}m/yr</span>
                  </div>
                  <div>
                    <span className="text-teal-400/70">Channel Width: </span>
                    <span className="font-medium text-teal-100">{activeStream.channelWidth}m</span>
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
