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
import { useMapStore, type OreGradeAssayState, type OreGradeAssayData } from '@/lib/map-store'
import { Gem as GemIcon5, X, TrendingDown, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: OreGradeAssayData[] = [
  {
    id: 'oga-kalgoorlie',
    name: 'Kalgoorlie Gold',
    lat: -30.7700,
    lng: 121.4900,
    metalGrade: 8.5,
    cutoffGrade: 1.5,
    recoveryRate: 92,
    status: 'high_grade',
    description: 'High-grade gold deposit in Western Australia',
  },
  {
    id: 'oga-chuquicamata',
    name: 'Chuquicamata Copper',
    lat: -22.3200,
    lng: -68.9300,
    metalGrade: 0.85,
    cutoffGrade: 0.3,
    recoveryRate: 88,
    status: 'economic',
    description: 'Major copper porphyry deposit',
  },
  {
    id: 'oga-witwatersrand',
    name: 'Witwatersrand Gold',
    lat: -26.2000,
    lng: 28.0400,
    metalGrade: 3.2,
    cutoffGrade: 2.5,
    recoveryRate: 95,
    status: 'marginal',
    description: 'Marginal deep-level gold ore',
  },
  {
    id: 'oga-carlin',
    name: 'Carlin Trend Gold',
    lat: 40.7100,
    lng: -116.3100,
    metalGrade: 0.8,
    cutoffGrade: 1.0,
    recoveryRate: 65,
    status: 'subeconomic',
    description: 'Low-grade refractory gold ore',
  },
]

const STATUS_COLORS: Record<OreGradeAssayData['status'], { label: string; color: string; bgClass: string }> = {
  high_grade: { label: 'High Grade', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  economic: { label: 'Economic', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  marginal: { label: 'Marginal', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  subeconomic: { label: 'Subeconomic', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: OreGradeAssayData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function OreGradeAssayMonitor() {
  const state = useMapStore((s) => s.oreGradeAssay)
  const setState = useMapStore((s) => s.setOreGradeAssay)

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
      return { totalPaths: 0, avgMetalGrade: 0, avgCutoffGrade: 0, avgRecoveryRate: 0 }
    }
    const avgMetalGrade = filteredItems.reduce((sum, e) => sum + e.metalGrade, 0) / filteredItems.length
    const avgCutoffGrade = filteredItems.reduce((sum, e) => sum + e.cutoffGrade, 0) / filteredItems.length
    const avgRecoveryRate = filteredItems.reduce((sum, e) => sum + e.recoveryRate, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgMetalGrade: Math.round(avgMetalGrade * 100) / 100,
      avgCutoffGrade: Math.round(avgCutoffGrade * 100) / 100,
      avgRecoveryRate: Math.round(avgRecoveryRate * 10) / 10,
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
      properties: { id: e.id, name: e.name, status: e.status, metalGrade: e.metalGrade },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setOreGradeAssay({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof OreGradeAssayState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showMetalGrade', label: 'Metal Grade', icon: GemIcon5 },
    { key: 'showCutoffGrade', label: 'Cutoff Grade', icon: TrendingDown },
    { key: 'showRecoveryRate', label: 'Recovery Rate', icon: TrendingUp },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-yellow-950/95 backdrop-blur-xl border border-amber-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <GemIcon5 className="h-4 w-4 text-amber-400" />
              Ore Grade Assay Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as OreGradeAssayState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="high_grade">High Grade</SelectItem>
                <SelectItem value="economic">Economic</SelectItem>
                <SelectItem value="marginal">Marginal</SelectItem>
                <SelectItem value="subeconomic">Subeconomic</SelectItem>
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
              <div className="text-[10px] text-amber-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Metal Grade</div>
              <div className="text-sm font-semibold text-yellow-400">{summary.avgMetalGrade}</div>
              <div className="text-[9px] text-amber-400/60">g/t</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Cutoff Grade</div>
              <div className="text-sm font-semibold text-amber-400">{summary.avgCutoffGrade}</div>
              <div className="text-[9px] text-amber-400/60">g/t</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Recovery</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgRecoveryRate}</div>
              <div className="text-[9px] text-amber-400/60">%</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
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
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-amber-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showMetalGrade && (
                          <div>
                            Metal Grade:{' '}
                            <span className="text-amber-100 font-medium">{e.metalGrade} g/t</span>
                          </div>
                        )}
                        {state.showCutoffGrade && (
                          <div>
                            Cutoff Grade:{' '}
                            <span className="text-amber-100 font-medium">{e.cutoffGrade} g/t</span>
                          </div>
                        )}
                        {state.showRecoveryRate && (
                          <div>
                            Recovery:{' '}
                            <span className="text-amber-100 font-medium">{e.recoveryRate}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
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
                    <span className="text-amber-400/70">Metal Grade: </span>
                    <span className="font-medium text-yellow-400">{activeItem.metalGrade} g/t</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Cutoff Grade: </span>
                    <span className="font-medium text-amber-400">{activeItem.cutoffGrade} g/t</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Recovery: </span>
                    <span className="font-medium text-green-400">{activeItem.recoveryRate}%</span>
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
