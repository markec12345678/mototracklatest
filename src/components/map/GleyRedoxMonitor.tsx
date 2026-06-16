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
import { useMapStore, type GleyRedoxState, type GleyRedoxData } from '@/lib/map-store'
import { Droplet as DropletIcon11, X, Gauge, ArrowDown, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GleyRedoxData[] = [
  {
    id: 'gr-netherlands',
    name: 'Dutch Polder Gley',
    lat: 52.5000,
    lng: 4.8000,
    redoxPotential: -150,
    waterTableDepth: 25,
    ironReduction: 85,
    status: 'reduced',
    description: 'Strongly reduced waterlogged soil',
  },
  {
    id: 'gr-bangladesh',
    name: 'Bangladesh Rice Gley',
    lat: 24.0000,
    lng: 90.0000,
    redoxPotential: -50,
    waterTableDepth: 45,
    ironReduction: 55,
    status: 'transitional',
    description: 'Transitional redox in rice paddy',
  },
  {
    id: 'gr-denmark',
    name: 'Denmark Drain Gley',
    lat: 55.5000,
    lng: 9.5000,
    redoxPotential: 200,
    waterTableDepth: 120,
    ironReduction: 10,
    status: 'oxidized',
    description: 'Oxidized well-drained gley soil',
  },
  {
    id: 'gr-louisiana',
    name: 'Louisiana Marsh Gley',
    lat: 30.0000,
    lng: -90.0000,
    redoxPotential: 50,
    waterTableDepth: 65,
    ironReduction: 40,
    status: 'fluctuating',
    description: 'Fluctuating redox in coastal marsh',
  },
]

const STATUS_COLORS: Record<GleyRedoxData['status'], { label: string; color: string; bgClass: string }> = {
  reduced: { label: 'Reduced', color: '#7c3aed', bgClass: 'bg-violet-500/10 text-violet-600 border-violet-500/30' },
  transitional: { label: 'Transitional', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  oxidized: { label: 'Oxidized', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  fluctuating: { label: 'Fluctuating', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: GleyRedoxData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GleyRedoxMonitor() {
  const state = useMapStore((s) => s.gleyRedox)
  const setState = useMapStore((s) => s.setGleyRedox)

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
      return { totalPaths: 0, avgRedoxPotential: 0, avgWaterTableDepth: 0, reducedTransitionalCount: 0 }
    }
    const avgRedoxPotential = filteredItems.reduce((sum, e) => sum + e.redoxPotential, 0) / filteredItems.length
    const avgWaterTableDepth = filteredItems.reduce((sum, e) => sum + e.waterTableDepth, 0) / filteredItems.length
    const reducedTransitionalCount = filteredItems.filter((e) => e.status === 'reduced' || e.status === 'transitional').length
    return {
      totalPaths: filteredItems.length,
      avgRedoxPotential: Math.round(avgRedoxPotential * 10) / 10,
      avgWaterTableDepth: Math.round(avgWaterTableDepth * 10) / 10,
      reducedTransitionalCount,
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
      properties: { id: e.id, name: e.name, status: e.status, redoxPotential: e.redoxPotential },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setGleyRedox({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GleyRedoxState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRedoxPotential', label: 'Redox Potential', icon: Gauge },
    { key: 'showWaterTableDepth', label: 'Water Table Depth', icon: ArrowDown },
    { key: 'showIronReduction', label: 'Iron Reduction', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-purple-950/95 to-violet-950/95 backdrop-blur-xl border border-purple-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-100">
              <DropletIcon11 className="h-4 w-4 text-purple-400" />
              Gley Redox Monitor
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
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as GleyRedoxState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-purple-900/40 border-purple-700/40 text-purple-100 hover:bg-purple-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="reduced">Reduced</SelectItem>
                <SelectItem value="transitional">Transitional</SelectItem>
                <SelectItem value="oxidized">Oxidized</SelectItem>
                <SelectItem value="fluctuating">Fluctuating</SelectItem>
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
              <div className="text-[10px] text-purple-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-purple-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-purple-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Avg Redox</div>
              <div className="text-sm font-semibold text-violet-400">{summary.avgRedoxPotential}</div>
              <div className="text-[9px] text-purple-400/60">mV</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Avg Water Table</div>
              <div className="text-sm font-semibold text-purple-400">{summary.avgWaterTableDepth}</div>
              <div className="text-[9px] text-purple-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-purple-700/30 bg-purple-900/30 p-2 text-center">
              <div className="text-[10px] text-purple-400/70">Reduced+Transitional</div>
              <div className="text-sm font-semibold text-red-400">{summary.reducedTransitionalCount}</div>
              <div className="text-[9px] text-purple-400/60">sites</div>
            </div>
          </div>

          <Separator className="bg-purple-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-purple-300/80">
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
                          ? 'border-purple-500/50 bg-purple-800/30'
                          : 'border-purple-700/30 hover:border-purple-500/30 hover:bg-purple-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-purple-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-purple-300/60">
                        {state.showRedoxPotential && (
                          <div>
                            Redox:{' '}
                            <span className="text-purple-100 font-medium">{e.redoxPotential} mV</span>
                          </div>
                        )}
                        {state.showWaterTableDepth && (
                          <div>
                            Water Table:{' '}
                            <span className="text-purple-100 font-medium">{e.waterTableDepth} cm</span>
                          </div>
                        )}
                        {state.showIronReduction && (
                          <div>
                            Iron Red.:{' '}
                            <span className="text-purple-100 font-medium">{e.ironReduction}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-purple-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
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
                    <span className="text-purple-400/70">Redox: </span>
                    <span className="font-medium text-violet-400">{activeItem.redoxPotential} mV</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Water Table: </span>
                    <span className="font-medium text-purple-400">{activeItem.waterTableDepth} cm</span>
                  </div>
                  <div>
                    <span className="text-purple-400/70">Iron Red.: </span>
                    <span className="font-medium text-red-400">{activeItem.ironReduction}%</span>
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
