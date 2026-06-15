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
import { useMapStore, type VolcanicDomeGrowthState, type VolcanicDomeGrowthData } from '@/lib/map-store'
import { Mountain as MountainIcon11, X, TrendingUp, Box, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: VolcanicDomeGrowthData[] = [
  {
    id: 'vd-soufriere',
    name: 'Soufrière Hills Dome',
    lat: 16.72,
    lng: -62.18,
    growthRate: 2.5,
    domeVolume: 80,
    temperature: 700,
    status: 'growing',
    description: 'Actively growing lava dome on Montserrat',
  },
  {
    id: 'vd-unzen',
    name: 'Unzen Dome',
    lat: 32.76,
    lng: 130.29,
    growthRate: 0.0,
    domeVolume: 25,
    temperature: 300,
    status: 'stable',
    description: 'Stabilized dome from 1991-95 eruption',
  },
  {
    id: 'vd-mt-st-helens',
    name: 'Mt. St. Helens Dome',
    lat: 46.20,
    lng: -122.18,
    growthRate: 0.0,
    domeVolume: 92,
    temperature: 200,
    status: 'stable',
    description: 'Dome formed in 2004-08 eruption phase',
  },
  {
    id: 'vd-merapi',
    name: 'Merapi Dome',
    lat: -7.54,
    lng: 110.44,
    growthRate: 5.0,
    domeVolume: 150,
    temperature: 900,
    status: 'collapsing',
    description: 'Periodic dome collapse generating pyroclastic flows',
  },
]

const STATUS_COLORS: Record<VolcanicDomeGrowthData['status'], { label: string; color: string; bgClass: string }> = {
  growing: { label: 'Growing', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  collapsing: { label: 'Collapsing', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  exploding: { label: 'Exploding', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: VolcanicDomeGrowthData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function VolcanicDomeGrowthMonitor() {
  const state = useMapStore((s) => s.volcanicDomeGrowth)
  const setState = useMapStore((s) => s.setVolcanicDomeGrowth)

  const domes = useMemo(
    () => (state.domes.length > 0 ? state.domes : SAMPLE_LOCATIONS),
    [state.domes]
  )

  const filteredItems = useMemo(() => {
    return domes.filter((d) => {
      if (state.statusFilter !== 'all' && d.status !== state.statusFilter) return false
      return true
    })
  }, [domes, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalDomes: 0, avgGrowthRate: 0, totalVolume: 0, growingCount: 0 }
    }
    const avgGrowthRate = filteredItems.reduce((sum, d) => sum + d.growthRate, 0) / filteredItems.length
    const totalVolume = filteredItems.reduce((sum, d) => sum + d.domeVolume, 0)
    const growingCount = filteredItems.filter((d) => d.status === 'growing').length
    return {
      totalDomes: filteredItems.length,
      avgGrowthRate: Math.round(avgGrowthRate * 10) / 10,
      totalVolume: Math.round(totalVolume),
      growingCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => domes.find((d) => d.id === state.activeDomeId) ?? null,
    [domes, state.activeDomeId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((d) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [d.lng, d.lat] },
      properties: { id: d.id, name: d.name, status: d.status, growthRate: d.growthRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.domes.length === 0) {
      useMapStore.getState().setVolcanicDomeGrowth({ domes: SAMPLE_LOCATIONS })
    }
  }, [state.domes.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof VolcanicDomeGrowthState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showGrowthRate', label: 'Growth Rate', icon: TrendingUp },
    { key: 'showDomeVolume', label: 'Dome Volume', icon: Box },
    { key: 'showTemperature', label: 'Temperature', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <MountainIcon11 className="h-4 w-4 text-amber-400" />
              Volcanic Dome Growth Monitor
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
                setState({ statusFilter: v as VolcanicDomeGrowthState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="growing">Growing</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="collapsing">Collapsing</SelectItem>
                <SelectItem value="exploding">Exploding</SelectItem>
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
              <div className="text-[10px] text-amber-400/70">Total Domes</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalDomes}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Growth Rate</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgGrowthRate}</div>
              <div className="text-[9px] text-amber-400/60">m³/s</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Volume</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.totalVolume}</div>
              <div className="text-[9px] text-amber-400/60">×10⁶ m³</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Growing Count</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.growingCount}</div>
              <div className="text-[9px] text-amber-400/60">domes</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Dome List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Domes ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((d) => {
                  const isActive = state.activeDomeId === d.id
                  const statusCfg = STATUS_COLORS[d.status]
                  return (
                    <div
                      key={d.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeDomeId: isActive ? null : d.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={d.status} />
                          <span className="text-xs font-medium text-amber-100">{d.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showGrowthRate && (
                          <div>
                            Growth Rate:{' '}
                            <span className="text-amber-100 font-medium">{d.growthRate} m³/s</span>
                          </div>
                        )}
                        {state.showDomeVolume && (
                          <div>
                            Volume:{' '}
                            <span className="text-amber-100 font-medium">{d.domeVolume} ×10⁶ m³</span>
                          </div>
                        )}
                        {state.showTemperature && (
                          <div>
                            Temperature:{' '}
                            <span className="text-amber-100 font-medium">{d.temperature}°C</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No domes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Dome Details */}
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
                    <span className="text-amber-400/70">Growth Rate: </span>
                    <span className="font-medium text-green-400">{activeItem.growthRate} m³/s</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Volume: </span>
                    <span className="font-medium text-yellow-400">{activeItem.domeVolume} ×10⁶ m³</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Temperature: </span>
                    <span className="font-medium text-red-400">{activeItem.temperature}°C</span>
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
