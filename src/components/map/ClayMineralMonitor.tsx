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
import { useMapStore, type ClayMineralState, type ClayMineralData } from '@/lib/map-store'
import { Gem as GemIcon4, X, TrendingUp, Gauge, ArrowDown, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: ClayMineralData[] = [
  {
    id: 'cm-texas',
    name: 'Texas Montmorillonite',
    lat: 32.0000,
    lng: -97.0000,
    swellPotential: 85,
    plasticityIndex: 45,
    shrinkageLimit: 8,
    status: 'expansive',
    description: 'Highly expansive smectite clay',
  },
  {
    id: 'cm-india',
    name: 'Indian Black Cotton',
    lat: 20.0000,
    lng: 78.0000,
    swellPotential: 55,
    plasticityIndex: 30,
    shrinkageLimit: 12,
    status: 'moderate',
    description: 'Moderate swell Vertisol',
  },
  {
    id: 'cm-italy',
    name: 'Italian Terra Rossa',
    lat: 42.0000,
    lng: 13.0000,
    swellPotential: 15,
    plasticityIndex: 12,
    shrinkageLimit: 22,
    status: 'low',
    description: 'Low swell kaolinitic clay',
  },
  {
    id: 'cm-sahara',
    name: 'Saharan Illite Clay',
    lat: 25.0000,
    lng: 10.0000,
    swellPotential: 3,
    plasticityIndex: 5,
    shrinkageLimit: 30,
    status: 'stable',
    description: 'Stable desert illite clay',
  },
]

const STATUS_COLORS: Record<ClayMineralData['status'], { label: string; color: string; bgClass: string }> = {
  expansive: { label: 'Expansive', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  low: { label: 'Low', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: ClayMineralData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function ClayMineralMonitor() {
  const state = useMapStore((s) => s.clayMineral)
  const setState = useMapStore((s) => s.setClayMineral)

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
      return { totalPaths: 0, avgSwellPotential: 0, avgPlasticityIndex: 0, expansiveModerateCount: 0 }
    }
    const avgSwellPotential = filteredItems.reduce((sum, e) => sum + e.swellPotential, 0) / filteredItems.length
    const avgPlasticityIndex = filteredItems.reduce((sum, e) => sum + e.plasticityIndex, 0) / filteredItems.length
    const expansiveModerateCount = filteredItems.filter((e) => e.status === 'expansive' || e.status === 'moderate').length
    return {
      totalPaths: filteredItems.length,
      avgSwellPotential: Math.round(avgSwellPotential * 10) / 10,
      avgPlasticityIndex: Math.round(avgPlasticityIndex * 10) / 10,
      expansiveModerateCount,
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
      properties: { id: e.id, name: e.name, status: e.status, swellPotential: e.swellPotential },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setClayMineral({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof ClayMineralState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showSwellPotential', label: 'Swell Potential', icon: TrendingUp },
    { key: 'showPlasticityIndex', label: 'Plasticity Index', icon: Gauge },
    { key: 'showShrinkageLimit', label: 'Shrinkage Limit', icon: ArrowDown },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-rose-950/95 to-pink-950/95 backdrop-blur-xl border border-rose-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-100">
              <GemIcon4 className="h-4 w-4 text-rose-400" />
              Clay Mineral Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-300 hover:text-rose-100 hover:bg-rose-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-rose-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-rose-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as ClayMineralState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-rose-900/40 border-rose-700/40 text-rose-100 hover:bg-rose-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="expansive">Expansive</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-rose-200">
                  <Icon className="h-3 w-3 text-rose-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-rose-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-rose-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-rose-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Swell Pot.</div>
              <div className="text-sm font-semibold text-pink-400">{summary.avgSwellPotential}%</div>
              <div className="text-[9px] text-rose-400/60">potential</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Avg Plasticity</div>
              <div className="text-sm font-semibold text-rose-400">{summary.avgPlasticityIndex}</div>
              <div className="text-[9px] text-rose-400/60">index</div>
            </div>
            <div className="rounded-lg border border-rose-700/30 bg-rose-900/30 p-2 text-center">
              <div className="text-[10px] text-rose-400/70">Expansive+Moderate</div>
              <div className="text-sm font-semibold text-red-400">{summary.expansiveModerateCount}</div>
              <div className="text-[9px] text-rose-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-rose-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-rose-300/80">
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
                          ? 'border-rose-500/50 bg-rose-800/30'
                          : 'border-rose-700/30 hover:border-rose-500/30 hover:bg-rose-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-rose-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-rose-300/60">
                        {state.showSwellPotential && (
                          <div>
                            Swell Pot.:{' '}
                            <span className="text-rose-100 font-medium">{e.swellPotential}%</span>
                          </div>
                        )}
                        {state.showPlasticityIndex && (
                          <div>
                            Plasticity:{' '}
                            <span className="text-rose-100 font-medium">{e.plasticityIndex}</span>
                          </div>
                        )}
                        {state.showShrinkageLimit && (
                          <div>
                            Shrinkage Lim.:{' '}
                            <span className="text-rose-100 font-medium">{e.shrinkageLimit}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-rose-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-rose-700/30" />
              <div className="space-y-2 rounded-lg border border-rose-600/30 bg-rose-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-rose-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-rose-400/70">Coordinates: </span>
                    <span className="font-medium text-rose-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Swell Pot.: </span>
                    <span className="font-medium text-pink-400">{activeItem.swellPotential}%</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Plasticity: </span>
                    <span className="font-medium text-rose-400">{activeItem.plasticityIndex}</span>
                  </div>
                  <div>
                    <span className="text-rose-400/70">Shrinkage: </span>
                    <span className="font-medium text-red-400">{activeItem.shrinkageLimit}%</span>
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
