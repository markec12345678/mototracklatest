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
import { useMapStore, type CropHealthIndexState, type CropHealthIndexData } from '@/lib/map-store'
import { Leaf as LeafIcon9, X, Activity, TrendingUp, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CropHealthIndexData[] = [
  {
    id: 'chi-iowa',
    name: 'Iowa Corn Belt',
    lat: 41.878,
    lng: -93.098,
    ndviIndex: 0.72,
    cropStress: 28,
    growthStage: 8,
    coveragePercent: 85,
    status: 'healthy',
    description: 'Corn fields showing strong vegetative growth in mid-summer season',
  },
  {
    id: 'chi-punjab',
    name: 'Punjab Wheat',
    lat: 30.900,
    lng: 75.850,
    ndviIndex: 0.45,
    cropStress: 62,
    growthStage: 5,
    coveragePercent: 55,
    status: 'stressed',
    description: 'Wheat crop under heat stress during late grain filling period',
  },
  {
    id: 'chi-mato',
    name: 'Mato Grosso Soybeans',
    lat: -15.600,
    lng: -56.100,
    ndviIndex: 0.81,
    cropStress: 12,
    growthStage: 10,
    coveragePercent: 92,
    status: 'optimal',
    description: 'Soybean fields at peak canopy development with excellent conditions',
  },
  {
    id: 'chi-nile',
    name: 'Nile Delta',
    lat: 30.750,
    lng: 31.250,
    ndviIndex: 0.31,
    cropStress: 78,
    growthStage: 3,
    coveragePercent: 38,
    status: 'critical',
    description: 'Severe water shortage causing significant crop stress in delta region',
  },
]

const STATUS_COLORS: Record<CropHealthIndexData['status'], { label: string; color: string; bgClass: string }> = {
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  stressed: { label: 'Stressed', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  healthy: { label: 'Healthy', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  optimal: { label: 'Optimal', color: '#10b981', bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
}

function TrendIcon({ status }: { status: CropHealthIndexData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CropHealthIndexMonitor() {
  const state = useMapStore((s) => s.cropHealthIndex)
  const setState = useMapStore((s) => s.setCropHealthIndex)

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
      return { totalZones: 0, avgNdvi: 0, avgStress: 0, avgCoverage: 0 }
    }
    const avgNdvi = filteredItems.reduce((sum, e) => sum + e.ndviIndex, 0) / filteredItems.length
    const avgStress = filteredItems.reduce((sum, e) => sum + e.cropStress, 0) / filteredItems.length
    const avgCoverage = filteredItems.reduce((sum, e) => sum + e.coveragePercent, 0) / filteredItems.length
    return {
      totalZones: filteredItems.length,
      avgNdvi: avgNdvi.toFixed(2),
      avgStress: Math.round(avgStress),
      avgCoverage: Math.round(avgCoverage),
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
      properties: { id: e.id, name: e.name, status: e.status, ndviIndex: e.ndviIndex },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setCropHealthIndex({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CropHealthIndexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showNdviIndex', label: 'NDVI Index', icon: Activity },
    { key: 'showCropStress', label: 'Crop Stress', icon: TrendingUp },
    { key: 'showGrowthStage', label: 'Growth Stage', icon: LeafIcon9 },
    { key: 'showCoveragePercent', label: 'Coverage %', icon: MapPin },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-lime-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <LeafIcon9 className="h-4 w-4 text-green-400" />
              Crop Health Index Monitor
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
                setState({ statusFilter: v as CropHealthIndexState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="stressed">Stressed</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-green-600"
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
              <div className="text-[10px] text-slate-400/70">Avg NDVI</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgNdvi}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Stress</div>
              <div className="text-sm font-semibold text-lime-400">{summary.avgStress}</div>
              <div className="text-[9px] text-slate-400/60">/ 100</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Coverage</div>
              <div className="text-sm font-semibold text-slate-200">{summary.avgCoverage}%</div>
              <div className="text-[9px] text-slate-400/60">canopy</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Crop Zones ({filteredItems.length})
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
                        {state.showNdviIndex && (
                          <div>
                            NDVI: <span className="text-slate-100 font-medium">{e.ndviIndex.toFixed(2)}</span>
                          </div>
                        )}
                        {state.showCropStress && (
                          <div>
                            Stress: <span className="text-slate-100 font-medium">{e.cropStress}%</span>
                          </div>
                        )}
                        {state.showGrowthStage && (
                          <div>
                            Growth: <span className="text-slate-100 font-medium">Stage {e.growthStage}</span>
                          </div>
                        )}
                        {state.showCoveragePercent && (
                          <div>
                            Coverage: <span className="text-slate-100 font-medium">{e.coveragePercent}%</span>
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
                    <span className="text-slate-400/70">NDVI: </span>
                    <span className="font-medium text-green-400">{activeItem.ndviIndex.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Stress: </span>
                    <span className="font-medium text-lime-400">{activeItem.cropStress}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Growth: </span>
                    <span className="font-medium text-slate-200">Stage {activeItem.growthStage}</span>
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
