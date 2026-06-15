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
import { useMapStore, type PermafrostCarbonPipelineState, type PermafrostCarbonPipelineData } from '@/lib/map-store'
import { AlertTriangle as AlertTriangleIcon2, X, Thermometer, ArrowDown, ShieldAlert, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: PermafrostCarbonPipelineData[] = [
  {
    id: 'pc-yamal-pipe',
    name: 'Yamal Gas Pipeline',
    lat: 70.0,
    lng: 70.0,
    carbonStock: 45,
    thawDepth: 2.5,
    pipelineRisk: 0.85,
    status: 'critical',
    description: 'Critical pipeline segment over degrading permafrost',
  },
  {
    id: 'pc-alska-taps',
    name: 'Alaska TAPS Section 4',
    lat: 69.0,
    lng: -148.0,
    carbonStock: 30,
    thawDepth: 1.8,
    pipelineRisk: 0.55,
    status: 'high_risk',
    description: 'High-risk segment of Trans-Alaska Pipeline',
  },
  {
    id: 'pc-siberia-east',
    name: 'Eastern Siberia Pipeline',
    lat: 62.0,
    lng: 120.0,
    carbonStock: 25,
    thawDepth: 1.2,
    pipelineRisk: 0.30,
    status: 'moderate',
    description: 'Moderate risk pipeline over discontinuous permafrost',
  },
  {
    id: 'pc-norway-svalbard',
    name: 'Svalbard Research Line',
    lat: 78.0,
    lng: 16.0,
    carbonStock: 10,
    thawDepth: 0.5,
    pipelineRisk: 0.05,
    status: 'safe',
    description: 'Low-risk research infrastructure on stable permafrost',
  },
]

const STATUS_COLORS: Record<PermafrostCarbonPipelineData['status'], { label: string; color: string; bgClass: string }> = {
  safe: { label: 'Safe', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  high_risk: { label: 'High Risk', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: PermafrostCarbonPipelineData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function PermafrostCarbonPipelineMonitor() {
  const state = useMapStore((s) => s.permafrostCarbonPipeline)
  const setState = useMapStore((s) => s.setPermafrostCarbonPipeline)

  const segments = useMemo(
    () => (state.segments.length > 0 ? state.segments : SAMPLE_LOCATIONS),
    [state.segments]
  )

  const filteredItems = useMemo(() => {
    return segments.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [segments, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalSegments: 0, avgCarbonStock: 0, maxRiskScore: 0, criticalHighCount: 0 }
    }
    const avgCarbonStock = filteredItems.reduce((sum, s) => sum + s.carbonStock, 0) / filteredItems.length
    const maxRiskScore = Math.max(...filteredItems.map((s) => s.pipelineRisk))
    const criticalHighCount = filteredItems.filter((s) => s.status === 'critical' || s.status === 'high_risk').length
    return {
      totalSegments: filteredItems.length,
      avgCarbonStock: Math.round(avgCarbonStock * 10) / 10,
      maxRiskScore: Math.round(maxRiskScore * 100) / 100,
      criticalHighCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => segments.find((s) => s.id === state.activeSegmentId) ?? null,
    [segments, state.activeSegmentId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, pipelineRisk: s.pipelineRisk },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.segments.length === 0) {
      useMapStore.getState().setPermafrostCarbonPipeline({ segments: SAMPLE_LOCATIONS })
    }
  }, [state.segments.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof PermafrostCarbonPipelineState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showCarbonStock', label: 'Carbon Stock', icon: Thermometer },
    { key: 'showThawDepth', label: 'Thaw Depth', icon: ArrowDown },
    { key: 'showPipelineRisk', label: 'Pipeline Risk', icon: ShieldAlert },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-red-950/95 to-stone-950/95 backdrop-blur-xl border border-red-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-red-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-red-100">
              <AlertTriangleIcon2 className="h-4 w-4 text-red-400" />
              Permafrost Carbon Pipeline Monitor
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
                setState({ statusFilter: v as PermafrostCarbonPipelineState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-red-900/40 border-red-700/40 text-red-100 hover:bg-red-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high_risk">High Risk</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
              <div className="text-[10px] text-red-400/70">Total Segments</div>
              <div className="text-sm font-semibold text-red-200">{summary.totalSegments}</div>
              <div className="text-[9px] text-red-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Avg Carbon Stock</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgCarbonStock}</div>
              <div className="text-[9px] text-red-400/60">Gt</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Max Risk Score</div>
              <div className="text-sm font-semibold text-orange-400">{summary.maxRiskScore}</div>
              <div className="text-[9px] text-red-400/60">risk index</div>
            </div>
            <div className="rounded-lg border border-red-700/30 bg-red-900/30 p-2 text-center">
              <div className="text-[10px] text-red-400/70">Critical+High</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalHighCount}</div>
              <div className="text-[9px] text-red-400/60">segments</div>
            </div>
          </div>

          <Separator className="bg-red-700/30" />

          {/* Segment List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-red-300/80">
              Segments ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeSegmentId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-red-500/50 bg-red-800/30'
                          : 'border-red-700/30 hover:border-red-500/30 hover:bg-red-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeSegmentId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-red-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-red-300/60">
                        {state.showCarbonStock && (
                          <div>
                            Carbon:{' '}
                            <span className="text-red-100 font-medium">{s.carbonStock} Gt</span>
                          </div>
                        )}
                        {state.showThawDepth && (
                          <div>
                            Thaw:{' '}
                            <span className="text-red-100 font-medium">{s.thawDepth}m</span>
                          </div>
                        )}
                        {state.showPipelineRisk && (
                          <div>
                            Risk:{' '}
                            <span className="text-red-100 font-medium">{(s.pipelineRisk * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-red-400/50 py-4">
                    No segments match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Segment Details */}
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
                    <span className="text-red-400/70">Carbon Stock: </span>
                    <span className="font-medium text-amber-400">{activeItem.carbonStock} Gt</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Thaw Depth: </span>
                    <span className="font-medium text-orange-400">{activeItem.thawDepth}m</span>
                  </div>
                  <div>
                    <span className="text-red-400/70">Pipeline Risk: </span>
                    <span className="font-medium text-red-400">{(activeItem.pipelineRisk * 100).toFixed(0)}%</span>
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
