'use client'

import { useMemo } from 'react'
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
import { useMapStore, type DustStormTrackerState, type DustStormTrackerData } from '@/lib/map-store'
import { Wind as WindIcon7, X, Eye, Gauge, Cloud, MapPin, Filter } from 'lucide-react'

const DEMO_STORMS: DustStormTrackerData[] = [
  {
    id: 'dst-sahara',
    name: 'Sahara Saharan',
    lat: 23,
    lng: 5,
    aod: 3.5,
    windSpeed: 65,
    visibility: 200,
    pm10: 5000,
    duration: 72,
    status: 'severe',
    description: 'Major Saharan dust storm affecting West Africa and Atlantic',
  },
  {
    id: 'dst-gobi',
    name: 'Gobi Desert',
    lat: 42,
    lng: 105,
    aod: 2.5,
    windSpeed: 45,
    visibility: 500,
    pm10: 3000,
    duration: 48,
    status: 'heavy',
    description: 'Gobi dust storm impacting East Asia and Pacific',
  },
  {
    id: 'dst-arabian',
    name: 'Arabian Peninsula',
    lat: 22,
    lng: 50,
    aod: 2.8,
    windSpeed: 55,
    visibility: 300,
    pm10: 4000,
    duration: 60,
    status: 'severe',
    description: 'Intense Arabian dust storm affecting Middle East',
  },
  {
    id: 'dst-australian',
    name: 'Australian Outback',
    lat: -25,
    lng: 135,
    aod: 1.5,
    windSpeed: 35,
    visibility: 1000,
    pm10: 1500,
    duration: 24,
    status: 'moderate',
    description: 'Moderate dust storm in central Australian desert',
  },
  {
    id: 'dst-taklamakan',
    name: 'Taklamakan',
    lat: 39,
    lng: 82,
    aod: 4.0,
    windSpeed: 70,
    visibility: 100,
    pm10: 8000,
    duration: 96,
    status: 'catastrophic',
    description: 'Catastrophic dust storm in the Taklamakan Desert',
  },
  {
    id: 'dst-swusa',
    name: 'Southwest USA',
    lat: 33,
    lng: -110,
    aod: 1.0,
    windSpeed: 30,
    visibility: 2000,
    pm10: 800,
    duration: 12,
    status: 'light',
    description: 'Light haboob in the American Southwest',
  },
]

const STATUS_CONFIG: Record<
  DustStormTrackerData['status'],
  { label: string; color: string; bgClass: string }
> = {
  light: { label: 'Light', color: '#0ea5e9', bgClass: 'bg-sky-500/10 text-sky-600 border-sky-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  heavy: { label: 'Heavy', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  severe: { label: 'Severe', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  catastrophic: { label: 'Catastrophic', color: '#7f1d1d', bgClass: 'bg-destructive/10 text-destructive border-destructive/30' },
}

export function DustStormTrackerMonitor() {
  const state = useMapStore((s) => s.dustStormTracker)
  const setState = useMapStore((s) => s.setDustStormTracker)

  const storms = useMemo(
    () => (state.storms.length > 0 ? state.storms : DEMO_STORMS),
    [state.storms]
  )

  const filteredStorms = useMemo(() => {
    return storms.filter((s) => {
      if (state.severityFilter !== 'all' && s.status !== state.severityFilter) return false
      return true
    })
  }, [storms, state.severityFilter])

  const summary = useMemo(() => {
    if (filteredStorms.length === 0) {
      return { avgAOD: 0, avgPM10: 0, activeCount: 0 }
    }
    const avgAOD =
      filteredStorms.reduce((sum, s) => sum + s.aod, 0) / filteredStorms.length
    const avgPM10 =
      filteredStorms.reduce((sum, s) => sum + s.pm10, 0) / filteredStorms.length
    const activeCount = filteredStorms.filter(
      (s) => s.status === 'severe' || s.status === 'catastrophic'
    ).length
    return {
      avgAOD: Math.round(avgAOD * 10) / 10,
      avgPM10: Math.round(avgPM10),
      activeCount,
    }
  }, [filteredStorms])

  const activeStorm = useMemo(
    () => storms.find((s) => s.id === state.activeStormId) ?? null,
    [storms, state.activeStormId]
  )

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DustStormTrackerState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAOD', label: 'AOD', icon: Cloud },
    { key: 'showWindSpeed', label: 'Wind Speed', icon: Gauge },
    { key: 'showVisibility', label: 'Visibility', icon: Eye },
    { key: 'showPM10', label: 'PM10', icon: WindIcon7 },
  ]

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg shadow-amber-950/30 overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <WindIcon7 className="h-4 w-4 text-amber-400" />
              Dust Storm Tracker
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
          {/* Severity Filter */}
          <div>
            <Label className="text-xs text-amber-300 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Severity Level
            </Label>
            <Select
              value={state.severityFilter}
              onValueChange={(v) =>
                setState({
                  severityFilter: v as DustStormTrackerState['severityFilter'],
                })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="catastrophic">Catastrophic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">Display Options</Label>
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

          <Separator className="bg-amber-800/30" />

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg AOD</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgAOD}</div>
              <div className="text-[9px] text-amber-400">index</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Avg PM10</div>
              <div className="text-sm font-semibold text-amber-300">{summary.avgPM10}</div>
              <div className="text-[9px] text-amber-400">µg/m³</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400">Severe</div>
              <div className="text-sm font-semibold text-red-400">{summary.activeCount}</div>
              <div className="text-[9px] text-amber-400">storms</div>
            </div>
          </div>

          <Separator className="bg-amber-800/30" />

          {/* Storm List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300">
              Dust Storms ({filteredStorms.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredStorms.map((storm) => {
                  const isActive = state.activeStormId === storm.id
                  const statusCfg = STATUS_CONFIG[storm.status]
                  return (
                    <div
                      key={storm.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/60 bg-amber-800/30'
                          : 'border-amber-800/30 hover:border-amber-600/40 hover:bg-amber-900/20'
                      }`}
                      onClick={() =>
                        setState({
                          activeStormId: isActive ? null : storm.id,
                        })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusCfg.color }}
                          />
                          <span className="text-xs font-medium text-amber-100">{storm.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300">
                        {state.showAOD && (
                          <div>
                            AOD:{' '}
                            <span className="text-orange-400 font-medium">
                              {storm.aod}
                            </span>
                          </div>
                        )}
                        {state.showWindSpeed && (
                          <div>
                            Wind:{' '}
                            <span className="text-amber-100 font-medium">
                              {storm.windSpeed} km/h
                            </span>
                          </div>
                        )}
                        {state.showVisibility && (
                          <div>
                            Visibility:{' '}
                            <span className="text-amber-100 font-medium">
                              {storm.visibility} m
                            </span>
                          </div>
                        )}
                        {state.showPM10 && (
                          <div>
                            PM10:{' '}
                            <span className="text-red-400 font-medium">
                              {storm.pm10} µg/m³
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredStorms.length === 0 && (
                  <div className="text-center text-xs text-amber-400 py-4">
                    No storms match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Storm Details */}
          {activeStorm && (
            <>
              <Separator className="bg-amber-800/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-900/30 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-100">{activeStorm.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_CONFIG[activeStorm.status].bgClass}`}
                  >
                    {STATUS_CONFIG[activeStorm.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-amber-400">Coordinates: </span>
                    <span className="font-medium text-amber-100">
                      {activeStorm.lat.toFixed(1)}, {activeStorm.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-400">AOD: </span>
                    <span className="font-medium text-orange-400">{activeStorm.aod}</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Wind Speed: </span>
                    <span className="font-medium text-amber-200">{activeStorm.windSpeed} km/h</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Visibility: </span>
                    <span className="font-medium text-amber-200">{activeStorm.visibility} m</span>
                  </div>
                  <div>
                    <span className="text-amber-400">PM10: </span>
                    <span className="font-medium text-red-400">{activeStorm.pm10} µg/m³</span>
                  </div>
                  <div>
                    <span className="text-amber-400">Duration: </span>
                    <span className="font-medium text-amber-200">{activeStorm.duration} hrs</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-amber-400">Description: </span>
                    <span className="font-medium text-amber-200">{activeStorm.description}</span>
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
