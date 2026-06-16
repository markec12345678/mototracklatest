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
import { useMapStore, type KeystonePopulationState, type KeystonePopulationData } from '@/lib/map-store'
import { Bug as BugIcon4, X, Users, TrendingUp, Gauge, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: KeystonePopulationData[] = [
  {
    id: 'kp-seaotter',
    name: 'Sea Otter Population',
    lat: 58.0000,
    lng: -150.0000,
    populationDensity: 12,
    reproductionRate: 0.8,
    ecosystemImpact: 0.9,
    status: 'thriving',
    description: 'Thriving keystone predator in kelp forests',
  },
  {
    id: 'kp-elephant',
    name: 'African Elephant',
    lat: -2.5000,
    lng: 35.0000,
    populationDensity: 0.5,
    reproductionRate: 0.15,
    ecosystemImpact: 0.95,
    status: 'stable',
    description: 'Stable savanna elephant population',
  },
  {
    id: 'kp-wolf',
    name: 'Gray Wolf Pack',
    lat: 45.0000,
    lng: -110.0000,
    populationDensity: 3,
    reproductionRate: 0.4,
    ecosystemImpact: 0.85,
    status: 'declining',
    description: 'Declining wolf population from conflict',
  },
  {
    id: 'kp-bee',
    name: 'Honeybee Colony',
    lat: 40.0000,
    lng: -80.0000,
    populationDensity: 0,
    reproductionRate: 0,
    ecosystemImpact: 0.92,
    status: 'critical',
    description: 'Critical colony collapse disorder area',
  },
]

const STATUS_COLORS: Record<KeystonePopulationData['status'], { label: string; color: string; bgClass: string }> = {
  thriving: { label: 'Thriving', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  declining: { label: 'Declining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: KeystonePopulationData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function KeystonePopulationMonitor() {
  const state = useMapStore((s) => s.keystonePopulation)
  const setState = useMapStore((s) => s.setKeystonePopulation)

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
      return { totalPaths: 0, avgPopulationDensity: 0, avgReproductionRate: 0, avgEcosystemImpact: 0 }
    }
    const avgPopulationDensity = filteredItems.reduce((sum, e) => sum + e.populationDensity, 0) / filteredItems.length
    const avgReproductionRate = filteredItems.reduce((sum, e) => sum + e.reproductionRate, 0) / filteredItems.length
    const avgEcosystemImpact = filteredItems.reduce((sum, e) => sum + e.ecosystemImpact, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgPopulationDensity: Math.round(avgPopulationDensity * 100) / 100,
      avgReproductionRate: Math.round(avgReproductionRate * 100) / 100,
      avgEcosystemImpact: Math.round(avgEcosystemImpact * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, populationDensity: e.populationDensity },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setKeystonePopulation({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof KeystonePopulationState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showPopulationDensity', label: 'Users', icon: Users },
    { key: 'showReproductionRate', label: 'TrendingUp', icon: TrendingUp },
    { key: 'showEcosystemImpact', label: 'Gauge', icon: Gauge },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-violet-950/95 to-purple-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <BugIcon4 className="h-4 w-4 text-violet-400" />
              Keystone Population Monitor
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
                setState({ statusFilter: v as KeystonePopulationState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="thriving">Thriving</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-violet-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Populations</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Density</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgPopulationDensity}</div>
              <div className="text-[9px] text-slate-400/60">per km2</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Reproduction</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgReproductionRate}</div>
              <div className="text-[9px] text-slate-400/60">rate</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Impact</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgEcosystemImpact}</div>
              <div className="text-[9px] text-slate-400/60">index</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Populations ({filteredItems.length})
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
                        {state.showPopulationDensity && (
                          <div>
                            Density:{' '}
                            <span className="text-slate-100 font-medium">{e.populationDensity}/km2</span>
                          </div>
                        )}
                        {state.showReproductionRate && (
                          <div>
                            Reproduction:{' '}
                            <span className="text-slate-100 font-medium">{e.reproductionRate}</span>
                          </div>
                        )}
                        {state.showEcosystemImpact && (
                          <div>
                            Impact:{' '}
                            <span className="text-slate-100 font-medium">{e.ecosystemImpact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No populations match the current filter.
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
                    <span className="text-slate-400/70">Density: </span>
                    <span className="font-medium text-violet-400">{activeItem.populationDensity}/km2</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Reproduction: </span>
                    <span className="font-medium text-purple-400">{activeItem.reproductionRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Impact: </span>
                    <span className="font-medium text-slate-400">{activeItem.ecosystemImpact}</span>
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
