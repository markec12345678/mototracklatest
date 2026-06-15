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
import { useMapStore, type LimnicEruptionMonitorState, type LimnicEruptionMonitorData } from '@/lib/map-store'
import { Siren as SirenIcon2, X, Waves, Wind, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: LimnicEruptionMonitorData[] = [
  {
    id: 'le-nyos',
    name: 'Lake Nyos',
    lat: 6.4417,
    lng: 10.2983,
    co2Concentration: 85000,
    gasReleaseRate: 120,
    waterDepth: 208,
    status: 'critical',
    description: 'Historic CO₂ eruption 1986',
  },
  {
    id: 'le-monoun',
    name: 'Lake Monoun',
    lat: 5.5833,
    lng: 10.5833,
    co2Concentration: 42000,
    gasReleaseRate: 65,
    waterDepth: 95,
    status: 'elevated',
    description: '1984 limnic eruption',
  },
  {
    id: 'le-kivu',
    name: 'Lake Kivu',
    lat: -2.0,
    lng: 28.9167,
    co2Concentration: 25000,
    gasReleaseRate: 35,
    waterDepth: 485,
    status: 'monitoring',
    description: 'Dissolved CO₂+methane lake',
  },
  {
    id: 'le-albert',
    name: 'Lake Albert',
    lat: 1.6667,
    lng: 30.9167,
    co2Concentration: 5000,
    gasReleaseRate: 8,
    waterDepth: 58,
    status: 'stable',
    description: 'Lower risk stratified lake',
  },
]

const STATUS_COLORS: Record<LimnicEruptionMonitorData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  elevated: { label: 'Elevated', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  monitoring: { label: 'Monitoring', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: LimnicEruptionMonitorData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function LimnicEruptionMonitor() {
  const state = useMapStore((s) => s.limnicEruptionMonitor)
  const setState = useMapStore((s) => s.setLimnicEruptionMonitor)

  const lakes = useMemo(
    () => (state.lakes.length > 0 ? state.lakes : SAMPLE_LOCATIONS),
    [state.lakes]
  )

  const filteredItems = useMemo(() => {
    return lakes.filter((e) => {
      if (state.statusFilter !== 'all' && e.status !== state.statusFilter) return false
      return true
    })
  }, [lakes, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalLakes: 0, maxCo2: 0, avgGasRate: 0, criticalElevatedCount: 0 }
    }
    const maxCo2 = Math.max(...filteredItems.map((e) => e.co2Concentration))
    const avgGasRate = filteredItems.reduce((sum, e) => sum + e.gasReleaseRate, 0) / filteredItems.length
    const criticalElevatedCount = filteredItems.filter((e) => e.status === 'critical' || e.status === 'elevated').length
    return {
      totalLakes: filteredItems.length,
      maxCo2,
      avgGasRate,
      criticalElevatedCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => lakes.find((e) => e.id === state.activeLakeId) ?? null,
    [lakes, state.activeLakeId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((e) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng, e.lat] },
      properties: { id: e.id, name: e.name, status: e.status, co2Concentration: e.co2Concentration },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.lakes.length === 0) {
      useMapStore.getState().setLimnicEruptionMonitor({ lakes: SAMPLE_LOCATIONS })
    }
  }, [state.lakes.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof LimnicEruptionMonitorState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCO2Concentration', label: 'CO₂ Concentration', icon: Wind },
    { key: 'showGasReleaseRate', label: 'Gas Release Rate', icon: Waves },
    { key: 'showWaterDepth', label: 'Water Depth', icon: Filter },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-rose-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <SirenIcon2 className="h-4 w-4 text-red-400" />
              Limnic Eruption Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-300 hover:text-red-100 hover:bg-red-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-red-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-red-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as LimnicEruptionMonitorState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-red-200">
                  <Icon className="h-3 w-3 text-red-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-red-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-red-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Total Lakes</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalLakes}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Max CO₂</div>
              <div className="text-sm font-semibold text-orange-400">{summary.maxCo2.toLocaleString()}</div>
              <div className="text-[9px] text-red-400/60">ppm</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Gas Rate</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgGasRate.toFixed(1)}</div>
              <div className="text-[9px] text-red-400/60">m³/hr</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Critical+Elevated</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalElevatedCount}</div>
              <div className="text-[9px] text-red-400/60">lakes</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Lake List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Lakes ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((e) => {
                  const isActive = state.activeLakeId === e.id
                  const statusCfg = STATUS_COLORS[e.status]
                  return (
                    <div
                      key={e.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeLakeId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-red-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showCO2Concentration && (
                          <div>
                            CO₂:{' '}
                            <span className="text-red-100 font-medium">{e.co2Concentration.toLocaleString()} ppm</span>
                          </div>
                        )}
                        {state.showGasReleaseRate && (
                          <div>
                            Gas Rate:{' '}
                            <span className="text-red-100 font-medium">{e.gasReleaseRate} m³/hr</span>
                          </div>
                        )}
                        {state.showWaterDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-red-100 font-medium">{e.waterDepth} m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No lakes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Lake Details */}
          {activeItem && (
            <>
              <Separator className="bg-red-700/30" />
              <div className="space-y-2 rounded-lg border border-red-600/30 bg-red-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-red-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-red-400/70">Coordinates: </span>
                    <span className="font-medium text-red-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-400/70">CO₂: </span>
                    <span className="font-medium text-orange-400">{activeItem.co2Concentration.toLocaleString()} ppm</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Gas Rate: </span>
                    <span className="font-medium text-amber-400">{activeItem.gasReleaseRate} m³/hr</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Water Depth: </span>
                    <span className="font-medium text-red-400">{activeItem.waterDepth} m</span>
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
