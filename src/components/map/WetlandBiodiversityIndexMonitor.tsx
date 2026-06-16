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
import { useMapStore, type WetlandBiodiversityIndexState, type WetlandBiodiversityIndexData } from '@/lib/map-store'
import { Droplets as DropletsIcon17, X, Bird, BarChart3, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: WetlandBiodiversityIndexData[] = [
  {
    id: 'wbi-okavango',
    name: 'Okavango Delta',
    lat: -19.5000,
    lng: 22.5000,
    speciesRichness: 1300,
    shannonIndex: 3.8,
    waterQuality: 92,
    status: 'pristine',
    description: 'Pristine inland delta ecosystem',
  },
  {
    id: 'wbi-everglades',
    name: 'Everglades',
    lat: 25.5000,
    lng: -81.0000,
    speciesRichness: 800,
    shannonIndex: 3.0,
    waterQuality: 65,
    status: 'good',
    description: 'Restoring subtropical wetland',
  },
  {
    id: 'wbi-mekong',
    name: 'Mekong Wetlands',
    lat: 12.0000,
    lng: 105.0000,
    speciesRichness: 500,
    shannonIndex: 2.2,
    waterQuality: 45,
    status: 'moderate',
    description: 'Moderate quality impacted wetland',
  },
  {
    id: 'wbi-aral',
    name: 'Aral Sea Remnant',
    lat: 45.0000,
    lng: 60.0000,
    speciesRichness: 50,
    shannonIndex: 0.8,
    waterQuality: 15,
    status: 'degraded',
    description: 'Severely degraded former wetland',
  },
]

const STATUS_COLORS: Record<WetlandBiodiversityIndexData['status'], { label: string; color: string; bgClass: string }> = {
  pristine: { label: 'Pristine', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  good: { label: 'Good', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  degraded: { label: 'Degraded', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: WetlandBiodiversityIndexData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function WetlandBiodiversityIndexMonitor() {
  const state = useMapStore((s) => s.wetlandBiodiversityIndex)
  const setState = useMapStore((s) => s.setWetlandBiodiversityIndex)

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
      return { totalPaths: 0, avgSpeciesRichness: 0, avgShannonIndex: 0, avgWaterQuality: 0 }
    }
    const avgSpeciesRichness = filteredItems.reduce((sum, e) => sum + e.speciesRichness, 0) / filteredItems.length
    const avgShannonIndex = filteredItems.reduce((sum, e) => sum + e.shannonIndex, 0) / filteredItems.length
    const avgWaterQuality = filteredItems.reduce((sum, e) => sum + e.waterQuality, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgSpeciesRichness: Math.round(avgSpeciesRichness * 100) / 100,
      avgShannonIndex: Math.round(avgShannonIndex * 100) / 100,
      avgWaterQuality: Math.round(avgWaterQuality * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, speciesRichness: e.speciesRichness },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setWetlandBiodiversityIndex({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof WetlandBiodiversityIndexState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSpeciesRichness', label: 'Bird', icon: Bird },
    { key: 'showShannonIndex', label: 'BarChart3', icon: BarChart3 },
    { key: 'showWaterQuality', label: 'Droplets', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-blue-950/95 to-cyan-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <DropletsIcon17 className="h-4 w-4 text-blue-400" />
              Wetland Biodiversity Index Monitor
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
                setState({ statusFilter: v as WetlandBiodiversityIndexState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-blue-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Wetlands</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Richness</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgSpeciesRichness}</div>
              <div className="text-[9px] text-slate-400/60">species</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Shannon</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgShannonIndex}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Water Quality</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgWaterQuality}</div>
              <div className="text-[9px] text-slate-400/60">score</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Wetlands ({filteredItems.length})
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
                        {state.showSpeciesRichness && (
                          <div>
                            Richness:{' '}
                            <span className="text-slate-100 font-medium">{e.speciesRichness}</span>
                          </div>
                        )}
                        {state.showShannonIndex && (
                          <div>
                            Shannon:{' '}
                            <span className="text-slate-100 font-medium">{e.shannonIndex}</span>
                          </div>
                        )}
                        {state.showWaterQuality && (
                          <div>
                            Water Quality:{' '}
                            <span className="text-slate-100 font-medium">{e.waterQuality}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No wetlands match the current filter.
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
                    <span className="text-slate-400/70">Richness: </span>
                    <span className="font-medium text-blue-400">{activeItem.speciesRichness}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Shannon: </span>
                    <span className="font-medium text-cyan-400">{activeItem.shannonIndex}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Water Quality: </span>
                    <span className="font-medium text-slate-400">{activeItem.waterQuality}</span>
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
