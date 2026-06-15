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
import { useMapStore, type DesertificationFrontState, type DesertificationFrontData } from '@/lib/map-store'
import { Sun as SunIcon8, X, TrendingUp, Leaf, Droplets, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: DesertificationFrontData[] = [
  {
    id: 'df-sahel',
    name: 'Sahel Desertification Front',
    lat: 14.0,
    lng: 0.0,
    advanceRate: 0.6,
    vegetationIndex: 0.15,
    soilMoisture: 8,
    status: 'advancing',
    description: 'Southward Sahara desertification front',
  },
  {
    id: 'df-gobi',
    name: 'Gobi Desert Front',
    lat: 42.0,
    lng: 105.0,
    advanceRate: 0.0,
    vegetationIndex: 0.25,
    soilMoisture: 15,
    status: 'stable',
    description: 'Stabilized front from reforestation efforts',
  },
  {
    id: 'df-thar',
    name: 'Thar Desert Front',
    lat: 27.0,
    lng: 71.0,
    advanceRate: -0.2,
    vegetationIndex: 0.30,
    soilMoisture: 20,
    status: 'retreating',
    description: 'Retreating front due to irrigation projects',
  },
  {
    id: 'df-atacama',
    name: 'Atacama Desert Expansion',
    lat: -24.0,
    lng: -70.0,
    advanceRate: 1.2,
    vegetationIndex: 0.05,
    soilMoisture: 2,
    status: 'severe',
    description: 'Severe hyper-arid expansion into marginal lands',
  },
]

const STATUS_COLORS: Record<DesertificationFrontData['status'], { label: string; color: string; bgClass: string }> = {
  advancing: { label: 'Advancing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  stable: { label: 'Stable', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  retreating: { label: 'Retreating', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  severe: { label: 'Severe', color: '#6b7280', bgClass: 'bg-gray-500/10 text-gray-600 border-gray-500/30' },
}

function TrendIcon({ status }: { status: DesertificationFrontData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function DesertificationFrontMonitor() {
  const state = useMapStore((s) => s.desertificationFront)
  const setState = useMapStore((s) => s.setDesertificationFront)

  const fronts = useMemo(
    () => (state.fronts.length > 0 ? state.fronts : SAMPLE_LOCATIONS),
    [state.fronts]
  )

  const filteredItems = useMemo(() => {
    return fronts.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [fronts, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalFronts: 0, avgAdvanceRate: 0, avgNDVI: 0, advancingSevereCount: 0 }
    }
    const avgAdvanceRate = filteredItems.reduce((sum, s) => sum + s.advanceRate, 0) / filteredItems.length
    const avgNDVI = filteredItems.reduce((sum, s) => sum + s.vegetationIndex, 0) / filteredItems.length
    const advancingSevereCount = filteredItems.filter((s) => s.status === 'advancing' || s.status === 'severe').length
    return {
      totalFronts: filteredItems.length,
      avgAdvanceRate: Math.round(avgAdvanceRate * 100) / 100,
      avgNDVI: Math.round(avgNDVI * 1000) / 1000,
      advancingSevereCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => fronts.find((s) => s.id === state.activeFrontId) ?? null,
    [fronts, state.activeFrontId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, advanceRate: s.advanceRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.fronts.length === 0) {
      useMapStore.getState().setDesertificationFront({ fronts: SAMPLE_LOCATIONS })
    }
  }, [state.fronts.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof DesertificationFrontState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAdvanceRate', label: 'Advance Rate', icon: TrendingUp },
    { key: 'showVegetationIndex', label: 'Vegetation Index', icon: Leaf },
    { key: 'showSoilMoisture', label: 'Soil Moisture', icon: Droplets },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-amber-950/95 to-orange-950/95 backdrop-blur-xl border border-amber-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-amber-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-100">
              <SunIcon8 className="h-4 w-4 text-orange-400" />
              Desertification Front Monitor
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
                setState({ statusFilter: v as DesertificationFrontState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-amber-900/40 border-amber-700/40 text-amber-100 hover:bg-amber-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="advancing">Advancing</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="retreating">Retreating</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
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
                  <Icon className="h-3 w-3 text-orange-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Total Fronts</div>
              <div className="text-sm font-semibold text-amber-200">{summary.totalFronts}</div>
              <div className="text-[9px] text-amber-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg Advance Rate</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgAdvanceRate}</div>
              <div className="text-[9px] text-amber-400/60">km/yr</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Avg NDVI</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgNDVI}</div>
              <div className="text-[9px] text-amber-400/60">index</div>
            </div>
            <div className="rounded-lg border border-amber-700/30 bg-amber-900/30 p-2 text-center">
              <div className="text-[10px] text-amber-400/70">Advancing+Severe</div>
              <div className="text-sm font-semibold text-red-400">{summary.advancingSevereCount}</div>
              <div className="text-[9px] text-amber-400/60">fronts</div>
            </div>
          </div>

          <Separator className="bg-amber-700/30" />

          {/* Fronts List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-amber-300/80">
              Fronts ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeFrontId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-800/30'
                          : 'border-amber-700/30 hover:border-amber-500/30 hover:bg-amber-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeFrontId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-amber-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-amber-300/60">
                        {state.showAdvanceRate && (
                          <div>
                            Advance Rate:{' '}
                            <span className="text-amber-100 font-medium">{s.advanceRate}km/yr</span>
                          </div>
                        )}
                        {state.showVegetationIndex && (
                          <div>
                            NDVI:{' '}
                            <span className="text-amber-100 font-medium">{s.vegetationIndex}</span>
                          </div>
                        )}
                        {state.showSoilMoisture && (
                          <div>
                            Soil Moisture:{' '}
                            <span className="text-amber-100 font-medium">{s.soilMoisture}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-amber-400/50 py-4">
                    No fronts match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Front Details */}
          {activeItem && (
            <>
              <Separator className="bg-amber-700/30" />
              <div className="space-y-2 rounded-lg border border-amber-600/30 bg-amber-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-orange-400" />
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
                    <span className="text-amber-400/70">Advance Rate: </span>
                    <span className="font-medium text-orange-400">{activeItem.advanceRate}km/yr</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">NDVI: </span>
                    <span className="font-medium text-green-400">{activeItem.vegetationIndex}</span>
                  </div>
                  <div>
                    <span className="text-amber-400/70">Soil Moisture: </span>
                    <span className="font-medium text-cyan-400">{activeItem.soilMoisture}%</span>
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
