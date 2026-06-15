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
import { useMapStore, type HydroclimateExtremesState, type HydroclimateExtremesData } from '@/lib/map-store'
import { CloudRain as CloudRainIcon4, X, AlertTriangle, Clock, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: HydroclimateExtremesData[] = [
  {
    id: 'he-sahel-drought',
    name: 'Sahel Drought Zone',
    lat: 14.0,
    lng: 0.0,
    eventType: 'drought',
    severity: 8.5,
    duration: 180,
    description: 'Persistent multi-year drought in Sahel region',
  },
  {
    id: 'he-south-asia-flood',
    name: 'South Asia Monsoon Flood',
    lat: 25.0,
    lng: 85.0,
    eventType: 'flood',
    severity: 7.2,
    duration: 45,
    description: 'Intense monsoon flooding across Ganges basin',
  },
  {
    id: 'he-eu-heatwave',
    name: 'European Heatwave',
    lat: 48.0,
    lng: 2.0,
    eventType: 'heatwave',
    severity: 9.1,
    duration: 30,
    description: 'Record-breaking heatwave across Western Europe',
  },
  {
    id: 'he-siberia-cold',
    name: 'Siberian Cold Wave',
    lat: 62.0,
    lng: 100.0,
    eventType: 'coldwave',
    severity: 6.8,
    duration: 60,
    description: 'Extreme cold anomaly in central Siberia',
  },
]

const STATUS_COLORS: Record<HydroclimateExtremesData['eventType'], { label: string; color: string; bgClass: string }> = {
  drought: { label: 'Drought', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  flood: { label: 'Flood', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  heatwave: { label: 'Heatwave', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  coldwave: { label: 'Cold Wave', color: '#06b6d4', bgClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' },
}

function TrendIcon({ eventType }: { eventType: HydroclimateExtremesData['eventType'] }) {
  const cfg = STATUS_COLORS[eventType]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function HydroclimateExtremesMonitor() {
  const state = useMapStore((s) => s.hydroclimateExtremes)
  const setState = useMapStore((s) => s.setHydroclimateExtremes)

  const events = useMemo(
    () => (state.events.length > 0 ? state.events : SAMPLE_LOCATIONS),
    [state.events]
  )

  const filteredItems = useMemo(() => {
    return events.filter((e) => {
      if (state.typeFilter !== 'all' && e.eventType !== state.typeFilter) return false
      return true
    })
  }, [events, state.typeFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalEvents: 0, avgSeverity: 0, avgDuration: 0, activeAlerts: 0 }
    }
    const avgSeverity = filteredItems.reduce((sum, e) => sum + e.severity, 0) / filteredItems.length
    const avgDuration = filteredItems.reduce((sum, e) => sum + e.duration, 0) / filteredItems.length
    const activeAlerts = filteredItems.filter((e) => e.severity >= 7).length
    return {
      totalEvents: filteredItems.length,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      avgDuration: Math.round(avgDuration),
      activeAlerts,
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
      properties: { id: e.id, name: e.name, eventType: e.eventType, severity: e.severity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.events.length === 0) {
      useMapStore.getState().setHydroclimateExtremes({ events: SAMPLE_LOCATIONS })
    }
  }, [state.events.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof HydroclimateExtremesState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSeverity', label: 'Severity', icon: AlertTriangle },
    { key: 'showDuration', label: 'Duration', icon: Clock },
    { key: 'showTrend', label: 'Trend', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-violet-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-violet-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-violet-100">
              <CloudRainIcon4 className="h-4 w-4 text-violet-400" />
              Hydroclimate Extremes Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-violet-300 hover:text-violet-100 hover:bg-violet-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-violet-100">
          {/* Type Filter */}
          <div>
            <Label className="text-xs text-violet-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Event Type
            </Label>
            <Select
              value={state.typeFilter}
              onValueChange={(v) =>
                setState({ typeFilter: v as HydroclimateExtremesState['typeFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-violet-900/40 border-violet-700/40 text-violet-100 hover:bg-violet-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="drought">Drought</SelectItem>
                <SelectItem value="flood">Flood</SelectItem>
                <SelectItem value="heatwave">Heatwave</SelectItem>
                <SelectItem value="coldwave">Cold Wave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-violet-200">
                  <Icon className="h-3 w-3 text-violet-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Total Events</div>
              <div className="text-sm font-semibold text-violet-200">{summary.totalEvents}</div>
              <div className="text-[9px] text-violet-400/60">tracked</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Severity</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgSeverity}</div>
              <div className="text-[9px] text-violet-400/60">index</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Avg Duration</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgDuration}</div>
              <div className="text-[9px] text-violet-400/60">days</div>
            </div>
            <div className="rounded-lg border border-violet-700/30 bg-violet-900/30 p-2 text-center">
              <div className="text-[10px] text-violet-400/70">Active Alerts</div>
              <div className="text-sm font-semibold text-amber-400">{summary.activeAlerts}</div>
              <div className="text-[9px] text-violet-400/60">high severity</div>
            </div>
          </div>

          <Separator className="bg-violet-700/30" />

          {/* Event List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-violet-300/80">
              Climate Events ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeEventId === e.id
                  const statusCfg = STATUS_COLORS[e.eventType]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-violet-500/50 bg-violet-800/30'
                          : 'border-violet-700/30 hover:border-violet-500/30 hover:bg-violet-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeEventId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon eventType={e.eventType} />
                          <span className="text-xs font-medium text-violet-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-violet-300/60">
                        {state.showSeverity && (
                          <div>
                            Severity:{' '}
                            <span className="text-violet-100 font-medium">{e.severity}</span>
                          </div>
                        )}
                        {state.showDuration && (
                          <div>
                            Duration:{' '}
                            <span className="text-violet-100 font-medium">{e.duration} days</span>
                          </div>
                        )}
                        {state.showTrend && (
                          <div>
                            Type:{' '}
                            <span className="text-violet-100 font-medium">{e.eventType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-violet-400/50 py-4">
                    No events match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Event Details */}
          {activeItem && (
            <>
              <Separator className="bg-violet-700/30" />
              <div className="space-y-2 rounded-lg border border-violet-600/30 bg-violet-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.eventType].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.eventType].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-violet-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-violet-400/70">Coordinates: </span>
                    <span className="font-medium text-violet-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Severity: </span>
                    <span className="font-medium text-red-400">{activeItem.severity}</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Duration: </span>
                    <span className="font-medium text-purple-400">{activeItem.duration} days</span>
                  </div>
                  <div>
                    <span className="text-violet-400/70">Type: </span>
                    <span className="font-medium text-violet-200">{activeItem.eventType}</span>
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
