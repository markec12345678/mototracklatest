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
import { useMapStore, type DesertFlashFloodState, type DesertFlashFloodData } from '@/lib/map-store'
import { CloudRain as CloudRainIcon5, X, Droplets, Waves, Mountain, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: DesertFlashFloodData[] = [
  {
    id: 'df-sahara',
    name: 'Sahara Souf Valley',
    lat: 33.0,
    lng: 6.0,
    rainfallIntensity: 85,
    floodVolume: 12000,
    catchmentArea: 350,
    status: 'watch',
    description: 'Flash flood watch for Saharan oasis region',
  },
  {
    id: 'df-negev',
    name: 'Negev Desert Wadi',
    lat: 30.5,
    lng: 34.8,
    rainfallIntensity: 120,
    floodVolume: 8500,
    catchmentArea: 180,
    status: 'warning',
    description: 'Warning issued for Negev desert wadi system',
  },
  {
    id: 'df-death-valley',
    name: 'Death Valley Wash',
    lat: 36.5,
    lng: -117.0,
    rainfallIntensity: 200,
    floodVolume: 25000,
    catchmentArea: 500,
    status: 'active',
    description: 'Active flash flooding in Death Valley alluvial fans',
  },
  {
    id: 'df-atacama',
    name: 'Atacama Dry Wash',
    lat: -23.5,
    lng: -68.0,
    rainfallIntensity: 45,
    floodVolume: 3000,
    catchmentArea: 200,
    status: 'receding',
    description: 'Receding flood waters after rare Atacama rainfall',
  },
]

const STATUS_COLORS: Record<DesertFlashFloodData['status'], { label: string; color: string; bgClass: string }> = {
  watch: { label: 'Watch', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  receding: { label: 'Receding', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: DesertFlashFloodData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DesertFlashFloodMonitor() {
  const state = useMapStore((s) => s.desertFlashFlood)
  const setState = useMapStore((s) => s.setDesertFlashFlood)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : SAMPLE_LOCATIONS),
    [state.events]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [events, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalEvents: 0, maxRainfall: 0, totalFloodVolume: 0, activeWarningCount: 0 }
    }
    const maxRainfall = Math.max(...filteredItems.map((e) => e.rainfallIntensity))
    const totalFloodVolume = filteredItems.reduce((sum, e) => sum + e.floodVolume, 0)
    const activeWarningCount = filteredItems.filter((e) => e.status === 'active' || e.status === 'warning').length
    return {
      totalEvents: filteredItems.length,
      maxRainfall,
      totalFloodVolume,
      activeWarningCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => events.find((e) => e.id === state.activeEventId) ?? null,
    [events, state.activeEventId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, rainfallIntensity: e.rainfallIntensity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.events.length === 0) {
      useMapStore.getState().setDesertFlashFlood({ events: SAMPLE_LOCATIONS })
    }
  }, [state.events.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DesertFlashFloodState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRainfallIntensity', label: 'Rainfall Intensity', icon: Droplets },
    { key: 'showFloodVolume', label: 'Flood Volume', icon: Waves },
    { key: 'showCatchmentArea', label: 'Catchment Area', icon: Mountain },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-stone-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <CloudRainIcon5 className="h-4 w-4 text-amber-400" />
              Desert Flash Flood Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-300 hover:text-amber-100 hover:bg-amber-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-amber-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-amber-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as DesertFlashFloodState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="watch">Watch</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="receding">Receding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-200">
                  <Icon className="h-3 w-3 text-amber-400" />
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

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Events</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalEvents}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Max Rainfall</div>
              <div className="text-sm font-semibold text-orange-400">{summary.maxRainfall}</div>
              <div className="text-[9px] text-amber-400/60">mm/hr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Flood Volume</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.totalFloodVolume.toLocaleString()}</div>
              <div className="text-[9px] text-amber-400/60">m³</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Active+Warning</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeWarningCount}</div>
              <div className="text-[9px] text-amber-400/60">events</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Events ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeEventId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-amber-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showRainfallIntensity && (
                          <div>
                            Rainfall:{' '}
                            <span className="text-amber-100 font-medium">{e.rainfallIntensity} mm/hr</span>
                          </div>
                        )}
                        {state.showFloodVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-amber-100 font-medium">{e.floodVolume.toLocaleString()} m³</span>
                          </div>
                        )}
                        {state.showCatchmentArea && (
                          <div>
                            Catchment:{' '}
                            <span className="text-amber-100 font-medium">{e.catchmentArea} km²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeItem && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-amber-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400/70">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Rainfall: </span>
                    <span className="font-medium text-orange-400">{activeItem.rainfallIntensity} mm/hr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Flood Volume: </span>
                    <span className="font-medium text-yellow-400">{activeItem.floodVolume.toLocaleString()} m³</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Catchment: </span>
                    <span className="font-medium text-amber-400">{activeItem.catchmentArea} km²</span>
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
