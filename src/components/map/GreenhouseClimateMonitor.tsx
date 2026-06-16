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
import { useMapStore, type GreenhouseClimateState, type GreenhouseClimateData } from '@/lib/map-store'
import { Thermometer as ThermometerIcon23, X, Activity, Droplets, Sun, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GreenhouseClimateData[] = [
  {
    id: 'gc-almeria',
    name: 'Almeria Spain',
    lat: 36.840,
    lng: -2.440,
    temperature: 28.5,
    humidity: 72,
    co2Level: 850,
    lightPAR: 680,
    status: 'normal',
    description: 'Large plastic greenhouse complex in Mediterranean climate zone',
  },
  {
    id: 'gc-netherlands',
    name: 'Netherlands Westland',
    lat: 51.990,
    lng: 4.190,
    temperature: 22.8,
    humidity: 65,
    co2Level: 1100,
    lightPAR: 420,
    status: 'optimal',
    description: 'High-tech glass greenhouse with precise climate and CO2 control',
  },
  {
    id: 'gc-israel',
    name: 'Israel Negev',
    lat: 31.250,
    lng: 34.780,
    temperature: 38.2,
    humidity: 35,
    co2Level: 620,
    lightPAR: 920,
    status: 'warning',
    description: 'Desert greenhouse requiring intensive cooling and humidification',
  },
  {
    id: 'gc-shandong',
    name: 'Shandong China',
    lat: 36.800,
    lng: 118.500,
    temperature: 42.5,
    humidity: 88,
    co2Level: 480,
    lightPAR: 280,
    status: 'critical',
    description: 'Solar greenhouse overheating with poor ventilation in summer',
  },
]

const STATUS_COLORS: Record<GreenhouseClimateData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  warning: { label: 'Warning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  normal: { label: 'Normal', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  optimal: { label: 'Optimal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

function TrendIcon({ status }: { status: GreenhouseClimateData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GreenhouseClimateMonitor() {
  const state = useMapStore((s) => s.greenhouseClimate)
  const setState = useMapStore((s) => s.setGreenhouseClimate)

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
      return { totalZones: 0, avgTemp: 0, avgHumidity: 0, avgCO2: 0 }
    }
    const avgTemp = filteredItems.reduce((sum, e) => sum + e.temperature, 0) / filteredItems.length
    const avgHumidity = filteredItems.reduce((sum, e) => sum + e.humidity, 0) / filteredItems.length
    const avgCO2 = filteredItems.reduce((sum, e) => sum + e.co2Level, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgTemp: avgTemp.toFixed(1),
      avgHumidity: Math.round(avgHumidity),
      avgCO2: Math.round(avgCO2),
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
      properties: { id: e.id, name: e.name, status: e.status, temperature: e.temperature },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setGreenhouseClimate({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GreenhouseClimateState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showTemperature', label: 'Temperature', icon: ThermometerIcon23 },
    { key: 'showHumidity', label: 'Humidity', icon: Droplets },
    { key: 'showCo2Level', label: 'CO2 Level', icon: Activity },
    { key: 'showLightPAR', label: 'Light PAR', icon: Sun },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ThermometerIcon23 className="h-4 w-4 text-emerald-400" />
              Greenhouse Climate Monitor
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
                setState({ statusFilter: v as GreenhouseClimateState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="optimal">Optimal</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-emerald-600"
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
              <div className="text-[10px] text-slate-400/70">Avg Temp</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgTemp}</div>
              <div className="text-[9px] text-slate-400/60">Celsius</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Humidity</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgHumidity}%</div>
              <div className="text-[9px] text-slate-400/60">relative</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg CO2</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgCO2} ppm</div>
              <div className="text-[9px] text-slate-400/60">level</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Greenhouse Zones ({filteredItems.length})
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
                        {state.showTemperature && (
                          <div>
                            Temp: <span className="text-slate-100 font-medium">{e.temperature} C</span>
                          </div>
                        )}
                        {state.showHumidity && (
                          <div>
                            Humidity: <span className="text-slate-100 font-medium">{e.humidity}%</span>
                          </div>
                        )}
                        {state.showCo2Level && (
                          <div>
                            CO2: <span className="text-slate-100 font-medium">{e.co2Level} ppm</span>
                          </div>
                        )}
                        {state.showLightPAR && (
                          <div>
                            PAR: <span className="text-slate-100 font-medium">{e.lightPAR} umol</span>
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
                    <span className="text-slate-400/70">Temp: </span>
                    <span className="font-medium text-emerald-400">{activeItem.temperature} C</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Humidity: </span>
                    <span className="font-medium text-green-400">{activeItem.humidity}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">CO2: </span>
                    <span className="font-medium text-slate-200">{activeItem.co2Level} ppm</span>
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
