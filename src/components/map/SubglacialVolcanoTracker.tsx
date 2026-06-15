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
import { useMapStore, type SubglacialVolcanoState, type SubglacialVolcanoData } from '@/lib/map-store'
import { Flame as FlameIcon16, X, Mountain, Thermometer, Activity, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: SubglacialVolcanoData[] = [
  {
    id: 'sv-grimsvotn',
    name: 'Grímsvötn',
    lat: 64.4,
    lng: -17.3,
    iceThickness: 250,
    heatFlux: 3500,
    eruptionProbability: 0.65,
    status: 'unrest',
    description: 'Icelands most active subglacial volcano showing unrest',
  },
  {
    id: 'sv-bardarbunga',
    name: 'Bárðarbunga',
    lat: 64.6,
    lng: -17.5,
    iceThickness: 500,
    heatFlux: 2800,
    eruptionProbability: 0.35,
    status: 'monitoring',
    description: 'Caldera volcano under Vatnajökull ice cap',
  },
  {
    id: 'sv-westdahl',
    name: 'Westdahl Peak',
    lat: 54.5,
    lng: -164.5,
    iceThickness: 180,
    heatFlux: 1200,
    eruptionProbability: 0.20,
    status: 'dormant',
    description: 'Alaska Peninsula subglacial volcano',
  },
  {
    id: 'sv-erebus',
    name: 'Mount Erebus',
    lat: -77.6,
    lng: 167.2,
    iceThickness: 50,
    heatFlux: 5000,
    eruptionProbability: 0.85,
    status: 'active',
    description: 'Active Antarctic subglacial lava lake volcano',
  },
]

const STATUS_COLORS: Record<SubglacialVolcanoData['status'], { label: string; color: string; bgClass: string }> = {
  active: { label: 'Active', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  unrest: { label: 'Unrest', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  dormant: { label: 'Dormant', color: '#64748b', bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
  monitoring: { label: 'Monitoring', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: SubglacialVolcanoData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function SubglacialVolcanoTracker() {
  const state = useMapStore((s) => s.subglacialVolcano)
  const setState = useMapStore((s) => s.setSubglacialVolcano)

  const volcanoes = useMemo(
    () => (state.volcanoes.length > 0 ? state.volcanoes : SAMPLE_LOCATIONS),
    [state.volcanoes]
  )

  const filteredItems = useMemo(() => {
    return volcanoes.filter((v) => {
      if (state.statusFilter !== 'all' && v.status !== state.statusFilter) return false
      return true
    })
  }, [volcanoes, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalVolcanoes: 0, avgIceThickness: 0, maxEruptionProb: 0, activeUnrestCount: 0 }
    }
    const avgIceThickness = filteredItems.reduce((sum, v) => sum + v.iceThickness, 0) / filteredItems.length
    const maxEruptionProb = Math.max(...filteredItems.map((v) => v.eruptionProbability))
    const activeUnrestCount = filteredItems.filter((v) => v.status === 'active' || v.status === 'unrest').length
    return {
      totalVolcanoes: filteredItems.length,
      avgIceThickness: Math.round(avgIceThickness),
      maxEruptionProb: Math.round(maxEruptionProb * 100),
      activeUnrestCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => volcanoes.find((v) => v.id === state.activeVolcanoId) ?? null,
    [volcanoes, state.activeVolcanoId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((v) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [v.lng, v.lat] },
      properties: { id: v.id, name: v.name, status: v.status, iceThickness: v.iceThickness },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.volcanoes.length === 0) {
      useMapStore.getState().setSubglacialVolcano({ volcanoes: SAMPLE_LOCATIONS })
    }
  }, [state.volcanoes.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof SubglacialVolcanoState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showIceThickness', label: 'Ice Thickness', icon: Mountain },
    { key: 'showHeatFlux', label: 'Heat Flux', icon: Thermometer },
    { key: 'showEruptionProbability', label: 'Eruption Probability', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-red-950/95 backdrop-blur-xl border border-purple-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
              <FlameIcon16 className="h-4 w-4 text-purple-400" />
              Subglacial Volcano Tracker
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-purple-300 hover:text-purple-100 hover:bg-purple-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-purple-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-purple-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as SubglacialVolcanoState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-purple-900/40 border-purple-700/40 text-purple-100 hover:bg-purple-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="unrest">Unrest</SelectItem>
                <SelectItem value="dormant">Dormant</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-purple-200">
                  <Icon className="h-3 w-3 text-purple-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-purple-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Total Volcanoes</div>
              <div className="text-sm font-semibold text-purple-200">{summary.totalVolcanoes}</div>
              <div className="text-[9px] text-purple-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Avg Ice Thickness</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgIceThickness}</div>
              <div className="text-[9px] text-purple-400/60">m</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Max Eruption Prob</div>
              <div className="text-sm font-semibold text-red-400">{summary.maxEruptionProb}</div>
              <div className="text-[9px] text-purple-400/60">%</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Active+Unrest</div>
              <div className="text-sm font-semibold text-orange-400">{summary.activeUnrestCount}</div>
              <div className="text-[9px] text-purple-400/60">volcanoes</div>
            </div>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Volcano List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">
              Volcanoes ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((v) => {
                  const isActive = state.activeVolcanoId === v.id
                  const statusCfg = STATUS_COLORS[v.status]
                  return (
                    <div
                      key={v.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-purple-500/50 bg-purple-800/30'
                          : 'border-purple-700/30 hover:border-purple-500/30 hover:bg-purple-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeVolcanoId: isActive ? null : v.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={v.status} />
                          <span className="text-xs font-medium text-purple-100">{v.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-purple-300/60">
                        {state.showIceThickness && (
                          <div>
                            Ice Thickness:{' '}
                            <span className="text-purple-100 font-medium">{v.iceThickness}m</span>
                          </div>
                        )}
                        {state.showHeatFlux && (
                          <div>
                            Heat Flux:{' '}
                            <span className="text-purple-100 font-medium">{v.heatFlux} W/m²</span>
                          </div>
                        )}
                        {state.showEruptionProbability && (
                          <div>
                            Eruption Prob:{' '}
                            <span className="text-purple-100 font-medium">{(v.eruptionProbability * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-purple-400/50 py-4">
                    No volcanoes match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Volcano Details */}
          {activeItem && (
            <>
              <Separator className="bg-purple-700/30" />
              <div className="space-y-2 rounded-lg border border-purple-600/30 bg-purple-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-purple-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-purple-400/70">Coordinates: </span>
                    <span className="font-medium text-purple-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Ice Thickness: </span>
                    <span className="font-medium text-blue-400">{activeItem.iceThickness}m</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Heat Flux: </span>
                    <span className="font-medium text-red-400">{activeItem.heatFlux} W/m²</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Eruption Prob: </span>
                    <span className="font-medium text-orange-400">{(activeItem.eruptionProbability * 100).toFixed(0)}%</span>
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
