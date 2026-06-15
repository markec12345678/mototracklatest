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
import { useMapStore, type KatabaticWindMonitorState, type KatabaticWindMonitorData } from '@/lib/map-store'
import { Snowflake as SnowflakeIcon12, X, Wind, Thermometer, Snowflake, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: KatabaticWindMonitorData[] = [
  {
    id: 'kw-adelie',
    name: 'Adélie Land Wind',
    lat: -66.6667,
    lng: 140.0,
    windSpeed: 240,
    temperature: -35,
    windChill: -62,
    status: 'gale',
    description: 'Fierce katabatic gale zone',
  },
  {
    id: 'kw-cape',
    name: 'Cape Denison Wind',
    lat: -67.0,
    lng: 142.6667,
    windSpeed: 180,
    temperature: -28,
    windChill: -52,
    status: 'strong',
    description: 'Strongest surface winds recorded',
  },
  {
    id: 'kw-terranova',
    name: 'Terra Nova Bay Wind',
    lat: -74.9167,
    lng: 164.0833,
    windSpeed: 95,
    temperature: -22,
    windChill: -40,
    status: 'moderate',
    description: 'Moderate drainage wind',
  },
  {
    id: 'kw-vestfold',
    name: 'Vestfold Hills Wind',
    lat: -68.5833,
    lng: 78.0,
    windSpeed: 25,
    temperature: -15,
    windChill: -28,
    status: 'calm',
    description: 'Sheltered katabatic zone',
  },
]

const STATUS_COLORS: Record<KatabaticWindMonitorData['status'], { label: string; color: string; bgClass: string }> = {
  gale: { label: 'Gale', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  strong: { label: 'Strong', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  calm: { label: 'Calm', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: KatabaticWindMonitorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function KatabaticWindMonitor() {
  const state = useMapStore((s) => s.katabaticWindMonitor)
  const setState = useMapStore((s) => s.setKatabaticWindMonitor)

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
      return { totalSites: 0, avgWindSpeed: 0, avgTemperature: 0, galeStrongCount: 0 }
    }
    const avgWindSpeed = filteredItems.reduce((sum, e) => sum + e.windSpeed, 0) / filteredItems.length
    const avgTemperature = filteredItems.reduce((sum, e) => sum + e.temperature, 0) / filteredItems.length
    const galeStrongCount = filteredItems.filter((e) => e.status === 'gale' || e.status === 'strong').length
    return {
      totalSites: filteredItems.length,
      avgWindSpeed: Math.round(avgWindSpeed * 10) / 10,
      avgTemperature: Math.round(avgTemperature * 10) / 10,
      galeStrongCount,
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
      properties: { id: e.id, name: e.name, status: e.status, windSpeed: e.windSpeed },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setKatabaticWindMonitor({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof KatabaticWindMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Wind },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
    { key: 'showWindChill', label: 'Wind Chill', icon: Snowflake },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-blue-950/95 backdrop-blur-xl border border-cyan-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-cyan-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-cyan-100">
              <SnowflakeIcon12 className="h-4 w-4 text-cyan-400" />
              Katabatic Wind Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-cyan-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-cyan-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as KatabaticWindMonitorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-cyan-900/40 border-cyan-700/40 text-cyan-100 hover:bg-cyan-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="gale">Gale</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="calm">Calm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-cyan-200">
                  <Icon className="h-3 w-3 text-cyan-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-cyan-200">{summary.totalSites}</div>
              <div className="text-[9px] text-cyan-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Wind Speed</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgWindSpeed}</div>
              <div className="text-[9px] text-cyan-400/60">km/h</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Avg Temperature</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgTemperature}</div>
              <div className="text-[9px] text-cyan-400/60">°C</div>
            </div>
            <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/30 p-2 text-center">
              <div className="text-[10px] text-cyan-400/70">Gale+Strong</div>
              <div className="text-sm font-semibold text-red-400">{summary.galeStrongCount}</div>
              <div className="text-[9px] text-cyan-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-cyan-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-cyan-300/80">
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
                          ? 'border-cyan-500/50 bg-cyan-800/30'
                          : 'border-cyan-700/30 hover:border-cyan-500/30 hover:bg-cyan-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-cyan-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-cyan-300/60">
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-cyan-100 font-medium">{e.windSpeed} km/h</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temp:{' '}
                            <span className="text-cyan-100 font-medium">{e.temperature} °C</span>
                          </div>
                        )}
                        {state.showWindChill && (
                          <div>
                            Chill:{' '}
                            <span className="text-cyan-100 font-medium">{e.windChill} °C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-cyan-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-cyan-700/30" />
              <div className="space-y-2 rounded-lg border border-cyan-600/30 bg-cyan-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-cyan-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-cyan-400/70">Coordinates: </span>
                    <span className="font-medium text-cyan-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Wind Speed: </span>
                    <span className="font-medium text-blue-400">{activeItem.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Temperature: </span>
                    <span className="font-medium text-sky-400">{activeItem.temperature} °C</span>
                  </div>
                  <div>
                    <span className="text-cyan-400/70">Wind Chill: </span>
                    <span className="font-medium text-cyan-400">{activeItem.windChill} °C</span>
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
