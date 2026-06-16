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
import { useMapStore, type IrrigationEfficiencyState, type IrrigationEfficiencyData } from '@/lib/map-store'
import { Droplet as DropletIcon14, X, Activity, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IrrigationEfficiencyData[] = [
  {
    id: 'ie-centralvalley',
    name: 'Central Valley CA',
    lat: 36.720,
    lng: -119.780,
    applicationRate: 8.5,
    distributionPercent: 88,
    conveyancePercent: 72,
    overallEfficiency: 63,
    status: 'good',
    description: 'Drip and micro-sprinkler systems in almond and tomato fields',
  },
  {
    id: 'ie-ebro',
    name: 'Ebro Basin Spain',
    lat: 41.700,
    lng: -0.880,
    applicationRate: 12.3,
    distributionPercent: 72,
    conveyancePercent: 65,
    overallEfficiency: 47,
    status: 'fair',
    description: 'Mixed flood and sprinkler irrigation in Mediterranean crops',
  },
  {
    id: 'ie-indus',
    name: 'Indus Plain Pakistan',
    lat: 28.500,
    lng: 70.000,
    applicationRate: 18.7,
    distributionPercent: 45,
    conveyancePercent: 52,
    overallEfficiency: 28,
    status: 'poor',
    description: 'Traditional flood irrigation with high conveyance losses',
  },
  {
    id: 'ie-murray',
    name: 'Murray Irrigation Aus',
    lat: -35.400,
    lng: 145.600,
    applicationRate: 6.2,
    distributionPercent: 92,
    conveyancePercent: 85,
    overallEfficiency: 78,
    status: 'excellent',
    description: 'High-efficiency pivot and drip systems in cotton and cereals',
  },
]

const STATUS_COLORS: Record<IrrigationEfficiencyData['status'], { label: string; color: string; bgClass: string }> = {
  poor: { label: 'Poor', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  fair: { label: 'Fair', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  good: { label: 'Good', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  excellent: { label: 'Excellent', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

function TrendIcon({ status }: { status: IrrigationEfficiencyData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IrrigationEfficiencyMonitor() {
  const state = useMapStore((s) => s.irrigationEfficiency)
  const setState = useMapStore((s) => s.setIrrigationEfficiency)

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
      return { totalZones: 0, avgAppRate: 0, avgDist: 0, avgOverall: 0 }
    }
    const avgAppRate = filteredItems.reduce((sum, e) => sum + e.applicationRate, 0) / filteredItems.length
    const avgDist = filteredItems.reduce((sum, e) => sum + e.distributionPercent, 0) / filteredItems.length
    const avgOverall = filteredItems.reduce((sum, e) => sum + e.overallEfficiency, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgAppRate: avgAppRate.toFixed(1),
      avgDist: Math.round(avgDist),
      avgOverall: Math.round(avgOverall),
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
      properties: { id: e.id, name: e.name, status: e.status, overallEfficiency: e.overallEfficiency },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setIrrigationEfficiency({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IrrigationEfficiencyState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showApplicationRate', label: 'Application Rate', icon: Activity },
    { key: 'showDistributionPercent', label: 'Distribution %', icon: TrendingUp },
    { key: 'showConveyancePercent', label: 'Conveyance %', icon: DropletIcon14 },
    { key: 'showOverallEfficiency', label: 'Overall Eff.', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-sky-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <DropletIcon14 className="h-4 w-4 text-cyan-400" />
              Irrigation Efficiency Monitor
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
                setState({ statusFilter: v as IrrigationEfficiencyState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-cyan-600"
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
              <div className="text-[10px] text-slate-400/70">App Rate</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgAppRate}</div>
              <div className="text-[9px] text-slate-400/60">mm/h</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Distribution</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgDist}%</div>
              <div className="text-[9px] text-slate-400/60">uniformity</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Overall</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgOverall}%</div>
              <div className="text-[9px] text-slate-400/60">efficiency</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Irrigation Zones ({filteredItems.length})
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
                        {state.showApplicationRate && (
                          <div>
                            App Rate: <span className="text-slate-100 font-medium">{e.applicationRate} mm/h</span>
                          </div>
                        )}
                        {state.showDistributionPercent && (
                          <div>
                            Distribution: <span className="text-slate-100 font-medium">{e.distributionPercent}%</span>
                          </div>
                        )}
                        {state.showConveyancePercent && (
                          <div>
                            Conveyance: <span className="text-slate-100 font-medium">{e.conveyancePercent}%</span>
                          </div>
                        )}
                        {state.showOverallEfficiency && (
                          <div>
                            Overall: <span className="text-slate-100 font-medium">{e.overallEfficiency}%</span>
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
                    <span className="text-slate-400/70">App Rate: </span>
                    <span className="font-medium text-cyan-400">{activeItem.applicationRate} mm/h</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Distribution: </span>
                    <span className="font-medium text-sky-400">{activeItem.distributionPercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Overall: </span>
                    <span className="font-medium text-slate-200">{activeItem.overallEfficiency}%</span>
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
