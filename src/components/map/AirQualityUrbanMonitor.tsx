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
import { useMapStore, type AirQualityUrbanState, type AirQualityUrbanData } from '@/lib/map-store'
import { Wind as WindIcon16, X, Cloud, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AirQualityUrbanData[] = [
  {
    id: 'aq-beijing',
    name: 'Beijing CBD',
    lat: 39.904,
    lng: 116.407,
    aqiIndex: 245,
    pm25Level: 185,
    no2Level: 68,
    o3Level: 42,
    status: 'hazardous',
    description: 'Hazardous air quality from winter coal heating and industrial emissions',
  },
  {
    id: 'aq-delhi',
    name: 'Delhi Metro',
    lat: 28.614,
    lng: 77.209,
    aqiIndex: 178,
    pm25Level: 125,
    no2Level: 52,
    o3Level: 38,
    status: 'unhealthy',
    description: 'Unhealthy air quality from vehicular exhaust and crop burning',
  },
  {
    id: 'aq-la',
    name: 'Los Angeles Basin',
    lat: 34.052,
    lng: -118.244,
    aqiIndex: 95,
    pm25Level: 35,
    no2Level: 45,
    o3Level: 72,
    status: 'moderate',
    description: 'Moderate air quality with elevated ozone from photochemical smog',
  },
  {
    id: 'aq-mexicocity',
    name: 'Mexico City Valley',
    lat: 19.432,
    lng: -99.133,
    aqiIndex: 42,
    pm25Level: 12,
    no2Level: 18,
    o3Level: 28,
    status: 'good',
    description: 'Good air quality following rain and improved ventilation in valley',
  },
]

const STATUS_COLORS: Record<AirQualityUrbanData['status'], { label: string; color: string; bgClass: string }> = {
  hazardous: { label: 'Hazardous', color: '#7f1d1d', bgClass: 'bg-red-900/10 text-red-800 border-red-900/30' },
  unhealthy: { label: 'Unhealthy', color: '#dc2626', bgClass: 'bg-red-600/10 text-red-700 border-red-600/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: AirQualityUrbanData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AirQualityUrbanMonitor() {
  const state = useMapStore((s) => s.airQualityUrban)
  const setState = useMapStore((s) => s.setAirQualityUrban)

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
      return { totalStations: 0, avgAqi: 0, avgPm25: 0, avgNo2: 0 }
    }
    const avgAqi = filteredItems.reduce((sum, e) => sum + e.aqiIndex, 0) / filteredItems.length
    const avgPm25 = filteredItems.reduce((sum, e) => sum + e.pm25Level, 0) / filteredItems.length
    const avgNo2 = filteredItems.reduce((sum, e) => sum + e.no2Level, 0) / filteredItems.length
    return {
      totalStations: filteredItems.length,
      avgAqi: Math.round(avgAqi),
      avgPm25: Math.round(avgPm25),
      avgNo2: Math.round(avgNo2),
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
      properties: { id: e.id, name: e.name, status: e.status, aqiIndex: e.aqiIndex },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setAirQualityUrban({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AirQualityUrbanState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAqiIndex', label: 'AQI Index', icon: Gauge },
    { key: 'showPm25Level', label: 'PM2.5 Level', icon: Cloud },
    { key: 'showNo2Level', label: 'NO2 Level', icon: WindIcon16 },
    { key: 'showO3Level', label: 'O3 Level', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-gray-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <WindIcon16 className="h-4 w-4 text-slate-400" />
              Air Quality Urban Monitor
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
                setState({ statusFilter: v as AirQualityUrbanState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="hazardous">Hazardous</SelectItem>
                <SelectItem value="unhealthy">Unhealthy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="good">Good</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-slate-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Stations</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalStations}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg AQI</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgAqi}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg PM2.5</div>
              <div className="text-sm font-semibold text-gray-400">{summary.avgPm25}</div>
              <div className="text-[9px] text-slate-400/60">ug/m3</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg NO2</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgNo2}</div>
              <div className="text-[9px] text-slate-400/60">ppb</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Air Quality Stations ({filteredItems.length})
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
                        {state.showAqiIndex && (
                          <div>
                            AQI:{' '}
                            <span className="text-slate-100 font-medium">{e.aqiIndex}</span>
                          </div>
                        )}
                        {state.showPm25Level && (
                          <div>
                            PM2.5:{' '}
                            <span className="text-slate-100 font-medium">{e.pm25Level} ug/m3</span>
                          </div>
                        )}
                        {state.showNo2Level && (
                          <div>
                            NO2:{' '}
                            <span className="text-slate-100 font-medium">{e.no2Level} ppb</span>
                          </div>
                        )}
                        {state.showO3Level && (
                          <div>
                            O3:{' '}
                            <span className="text-slate-100 font-medium">{e.o3Level} ppb</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No stations match the current filter.
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
                    <span className="text-slate-400/70">AQI: </span>
                    <span className="font-medium text-slate-400">{activeItem.aqiIndex}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">PM2.5: </span>
                    <span className="font-medium text-gray-400">{activeItem.pm25Level} ug/m3</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">NO2: </span>
                    <span className="font-medium text-slate-200">{activeItem.no2Level} ppb</span>
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
