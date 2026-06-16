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
import { useMapStore, type AirPollutionHealthState, type AirPollutionHealthData } from '@/lib/map-store'
import { CloudCog as CloudCogIcon3, X, Activity, Heart, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AirPollutionHealthData[] = [
  {
    id: 'aph-delhi',
    name: 'Delhi NCR',
    lat: 28.614,
    lng: 77.209,
    aqiValue: 342,
    pm25Concentration: 185,
    respiratoryRisk: 88,
    cardiovascularImpact: 72,
    status: 'hazardous',
    description: 'Severe air pollution in Delhi NCR with hazardous PM2.5 levels year-round',
  },
  {
    id: 'aph-beijing',
    name: 'Beijing Metro',
    lat: 39.904,
    lng: 116.407,
    aqiValue: 198,
    pm25Concentration: 92,
    respiratoryRisk: 65,
    cardiovascularImpact: 58,
    status: 'unhealthy',
    description: 'Beijing experiencing unhealthy air quality from industrial and vehicular emissions',
  },
  {
    id: 'aph-cairo',
    name: 'Cairo Urban',
    lat: 30.044,
    lng: 31.236,
    aqiValue: 135,
    pm25Concentration: 68,
    respiratoryRisk: 52,
    cardiovascularImpact: 45,
    status: 'moderate',
    description: 'Cairo urban area with moderate pollution from traffic and open burning',
  },
  {
    id: 'aph-lahore',
    name: 'Lahore City',
    lat: 31.550,
    lng: 74.350,
    aqiValue: 285,
    pm25Concentration: 148,
    respiratoryRisk: 82,
    cardiovascularImpact: 68,
    status: 'hazardous',
    description: 'Lahore among the most polluted cities with severe smog episodes in winter',
  },
]

const STATUS_COLORS: Record<AirPollutionHealthData['status'], { label: string; color: string; bgClass: string }> = {
  hazardous: { label: 'Hazardous', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  unhealthy: { label: 'Unhealthy', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  moderate: { label: 'Moderate', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: AirPollutionHealthData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AirPollutionHealthMonitor() {
  const state = useMapStore((s) => s.airPollutionHealth)
  const setState = useMapStore((s) => s.setAirPollutionHealth)

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
      return { totalCities: 0, avgAqi: 0, avgResp: 0, avgCardio: 0 }
    }
    const avgAqi = filteredItems.reduce((sum, e) => sum + e.aqiValue, 0) / filteredItems.length
    const avgResp = filteredItems.reduce((sum, e) => sum + e.respiratoryRisk, 0) / filteredItems.length
    const avgCardio = filteredItems.reduce((sum, e) => sum + e.cardiovascularImpact, 0) / filteredItems.length
    return {
      totalCities: filteredItems.length,
      avgAqi: Math.round(avgAqi),
      avgResp: Math.round(avgResp),
      avgCardio: Math.round(avgCardio),
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
      properties: { id: e.id, name: e.name, status: e.status, aqiValue: e.aqiValue },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setAirPollutionHealth({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AirPollutionHealthState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAqiValue', label: 'DALY Rate', icon: Activity },
    { key: 'showPm25Concentration', label: 'PM2.5 Exposure', icon: CloudCogIcon3 },
    { key: 'showRespiratoryRisk', label: 'Resp Cases', icon: Heart },
    { key: 'showCardiovascularImpact', label: 'Cardio Cases', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-gray-950/95 to-slate-950/95 backdrop-blur-xl border border-gray-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-gray-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-100">
              <CloudCogIcon3 className="h-4 w-4 text-gray-400" />
              Air Pollution Health Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:text-gray-100 hover:bg-gray-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-gray-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-gray-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as AirPollutionHealthState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-gray-900/40 border-gray-700/40 text-gray-100 hover:bg-gray-900/60">
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

          <Separator className="bg-gray-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-200">
                  <Icon className="h-3 w-3 text-gray-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-gray-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-gray-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-gray-700/30 bg-gray-900/30 p-2 text-center">
              <div className="text-[10px] text-gray-400/70">DALY Rate</div>
              <div className="text-sm font-semibold text-gray-300">{summary.avgAqi}</div>
              <div className="text-[9px] text-gray-400/60">avg AQI</div>
            </div>
            <div className="rounded-lg border border-gray-700/30 bg-gray-900/30 p-2 text-center">
              <div className="text-[10px] text-gray-400/70">PM2.5 Exposure</div>
              <div className="text-sm font-semibold text-slate-300">{summary.avgAqi > 0 ? Math.round(summary.avgAqi * 0.52) : 0} ug/m3</div>
              <div className="text-[9px] text-gray-400/60">estimated</div>
            </div>
            <div className="rounded-lg border border-gray-700/30 bg-gray-900/30 p-2 text-center">
              <div className="text-[10px] text-gray-400/70">Resp Cases</div>
              <div className="text-sm font-semibold text-red-400">{summary.avgResp}%</div>
              <div className="text-[9px] text-gray-400/60">risk index</div>
            </div>
            <div className="rounded-lg border border-gray-700/30 bg-gray-900/30 p-2 text-center">
              <div className="text-[10px] text-gray-400/70">Cities</div>
              <div className="text-sm font-semibold text-gray-200">{summary.totalCities}</div>
              <div className="text-[9px] text-gray-400/60">monitored</div>
            </div>
          </div>

          <Separator className="bg-gray-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300/80">
              Pollution Zones ({filteredItems.length})
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
                          ? 'border-gray-500/50 bg-gray-800/30'
                          : 'border-gray-700/30 hover:border-gray-500/30 hover:bg-gray-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-gray-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-gray-300/60">
                        {state.showAqiValue && (
                          <div>
                            AQI:{' '}
                            <span className="text-gray-100 font-medium">{e.aqiValue}</span>
                          </div>
                        )}
                        {state.showPm25Concentration && (
                          <div>
                            PM2.5:{' '}
                            <span className="text-gray-100 font-medium">{e.pm25Concentration} ug/m3</span>
                          </div>
                        )}
                        {state.showRespiratoryRisk && (
                          <div>
                            Resp Risk:{' '}
                            <span className="text-gray-100 font-medium">{e.respiratoryRisk}%</span>
                          </div>
                        )}
                        {state.showCardiovascularImpact && (
                          <div>
                            Cardio:{' '}
                            <span className="text-gray-100 font-medium">{e.cardiovascularImpact}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-gray-400/50 py-4">
                    No zones match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-gray-700/30" />
              <div className="space-y-2 rounded-lg border border-gray-600/30 bg-gray-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-gray-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400/70">Coordinates: </span>
                    <span className="font-medium text-gray-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400/70">AQI: </span>
                    <span className="font-medium text-gray-300">{activeItem.aqiValue}</span>
                  </div>
                  <div>
                    <span className="text-gray-400/70">PM2.5: </span>
                    <span className="font-medium text-slate-300">{activeItem.pm25Concentration} ug/m3</span>
                  </div>
                  <div>
                    <span className="text-gray-400/70">Resp Risk: </span>
                    <span className="font-medium text-red-400">{activeItem.respiratoryRisk}%</span>
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
