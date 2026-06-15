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
import { useMapStore, type MangroveLossState, type MangroveLossData } from '@/lib/map-store'
import { TreePine as TreePineIcon6, X, Layers, Activity, TrendingDown, MapPin, Filter, AlertTriangle } from 'lucide-react'

const SAMPLE_LOCATIONS: MangroveLossData[] = [
  {
    id: 'ml-sundarbans',
    name: 'Sundarbans',
    lat: 21.9,
    lng: 89.2,
    lossRate: 0.8,
    recoveryRate: 0.2,
    biodiversityIndex: 0.85,
    area: 10000,
    status: 'declining',
    description: 'World largest mangrove forest under pressure',
  },
  {
    id: 'ml-rufiji',
    name: 'Rufiji Delta',
    lat: -7.8,
    lng: 39.3,
    lossRate: 1.5,
    recoveryRate: 0.1,
    biodiversityIndex: 0.72,
    area: 500,
    status: 'rapid_loss',
    description: 'Agricultural conversion hot spot',
  },
  {
    id: 'ml-florida-keys',
    name: 'Florida Keys',
    lat: 25.0,
    lng: -80.5,
    lossRate: 0.3,
    recoveryRate: 0.5,
    biodiversityIndex: 0.78,
    area: 200,
    status: 'stable',
    description: 'Protected mangrove restoration area',
  },
  {
    id: 'ml-mekong',
    name: 'Mekong Delta',
    lat: 9.5,
    lng: 106.0,
    lossRate: 2.1,
    recoveryRate: 0.1,
    biodiversityIndex: 0.65,
    area: 800,
    status: 'critical',
    description: 'Shrimp farming driven deforestation',
  },
]

const STATUS_COLORS: Record<MangroveLossData['status'], { label: string; color: string; bgClass: string }> = {
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  declining: { label: 'Declining', color: '#eab308', bgClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  rapid_loss: { label: 'Rapid Loss', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: MangroveLossData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MangroveLossMonitor() {
  const state = useMapStore((s) => s.mangroveLoss)
  const setState = useMapStore((s) => s.setMangroveLoss)

  const regions = useMemo(
    () => (state.regions.length > 0 ? state.regions : SAMPLE_LOCATIONS),
    [state.regions]
  )

  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      if (state.lossFilter !== 'all' && r.status !== state.lossFilter) return false
      return true
    })
  }, [regions, state.lossFilter])

  const summary = useMemo(() => {
    if (filteredRegions.length === 0) {
      return { totalArea: 0, avgLossRate: 0, avgRecoveryRate: 0, avgBiodiversity: 0 }
    }
    const totalArea = filteredRegions.reduce((sum, r) => sum + r.area, 0)
    const avgLossRate = filteredRegions.reduce((sum, r) => sum + r.lossRate, 0) / filteredRegions.length
    const avgRecoveryRate = filteredRegions.reduce((sum, r) => sum + r.recoveryRate, 0) / filteredRegions.length
    const avgBiodiversity = filteredRegions.reduce((sum, r) => sum + r.biodiversityIndex, 0) / filteredRegions.length
    return {
      totalArea: Math.round(totalArea),
      avgLossRate: Math.round(avgLossRate * 100) / 100,
      avgRecoveryRate: Math.round(avgRecoveryRate * 100) / 100,
      avgBiodiversity: Math.round(avgBiodiversity * 100) / 100,
    }
  }, [filteredRegions])

  const activeRegion = useMemo(
    () => regions.find((r) => r.id === state.activeRegionId) ?? null,
    [regions, state.activeRegionId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredRegions.map((r) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      properties: { id: r.id, name: r.name, status: r.status, area: r.area },
    })),
  }), [filteredRegions])

  useEffect(() => {
    if (state.regions.length === 0) {
      useMapStore.getState().setMangroveLoss({ regions: SAMPLE_LOCATIONS })
    }
  }, [state.regions.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MangroveLossState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showLossRate', label: 'Loss Rate', icon: TrendingDown },
    { key: 'showRecovery', label: 'Recovery Rate', icon: Activity },
    { key: 'showBiodiversity', label: 'Biodiversity Index', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-green-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <TreePineIcon6 className="h-4 w-4 text-emerald-400" />
              Mangrove Loss Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Loss Status
            </Label>
            <Select
              value={state.lossFilter}
              onValueChange={(v) =>
                setState({ lossFilter: v as MangroveLossState['lossFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="rapid_loss">Rapid Loss</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
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

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Area</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalArea.toLocaleString()}</div>
              <div className="text-[9px] text-emerald-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Loss Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgLossRate}%</div>
              <div className="text-[9px] text-emerald-400/60">per year</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Recovery Rate</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.avgRecoveryRate}%</div>
              <div className="text-[9px] text-emerald-400/60">per year</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Biodiversity Index</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.avgBiodiversity}</div>
              <div className="text-[9px] text-emerald-400/60">avg score</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Region List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
              Regions ({filteredRegions.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredRegions.map((region) => {
                  const isActive = state.activeRegionId === region.id
                  const statusCfg = STATUS_COLORS[region.status]
                  return (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeRegionId: isActive ? null : region.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={region.status} />
                          <span className="text-xs font-medium text-emerald-100">{region.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showLossRate && (
                          <div>
                            Loss Rate:{' '}
                            <span className="text-emerald-100 font-medium">{region.lossRate}%/yr</span>
                          </div>
                        )}
                        {state.showRecovery && (
                          <div>
                            Recovery:{' '}
                            <span className="text-emerald-100 font-medium">{region.recoveryRate}%/yr</span>
                          </div>
                        )}
                        {state.showBiodiversity && (
                          <div>
                            Biodiversity:{' '}
                            <span className="text-emerald-100 font-medium">{region.biodiversityIndex}</span>
                          </div>
                        )}
                        {state.showLossRate && (
                          <div>
                            Area:{' '}
                            <span className="text-emerald-100 font-medium">{region.area.toLocaleString()}km²</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredRegions.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No regions match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Region Details */}
          {activeRegion && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeRegion.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeRegion.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeRegion.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeRegion.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeRegion.lat.toFixed(1)}, {activeRegion.lng.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Area: </span>
                    <span className="font-medium text-emerald-100">{activeRegion.area.toLocaleString()}km²</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Loss Rate: </span>
                    <span className="font-medium text-orange-400">{activeRegion.lossRate}%/yr</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Recovery: </span>
                    <span className="font-medium text-emerald-100">{activeRegion.recoveryRate}%/yr</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Biodiversity: </span>
                    <span className="font-medium text-emerald-100">{activeRegion.biodiversityIndex}</span>
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
