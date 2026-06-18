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
import { useMapStore, type AquiferRechargeRateState, type AquiferRechargeRateData } from '@/lib/map-store'
import { Droplet as DropletIcon13, X, Droplets, ArrowDown, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: AquiferRechargeRateData[] = [
  {
    id: 'arr-ogallala',
    name: 'Ogallala Aquifer',
    lat: 38.0000,
    lng: -102.0000,
    rechargeRate: 15,
    waterTableDepth: 45,
    permeability: 12,
    status: 'deficit',
    description: 'Major depletion in High Plains aquifer',
  },
  {
    id: 'arr-gab',
    name: 'Great Artesian Basin',
    lat: -25.0000,
    lng: 140.0000,
    rechargeRate: 50,
    waterTableDepth: 120,
    permeability: 8,
    status: 'balanced',
    description: 'Balanced Australian artesian basin',
  },
  {
    id: 'arr-sahara',
    name: 'Nubian Sandstone',
    lat: 22.0000,
    lng: 25.0000,
    rechargeRate: 2,
    waterTableDepth: 200,
    permeability: 3,
    status: 'depleted',
    description: 'Fossil water with minimal recharge',
  },
  {
    id: 'arr-danube',
    name: 'Danube Alluvial',
    lat: 48.0000,
    lng: 18.0000,
    rechargeRate: 180,
    waterTableDepth: 5,
    permeability: 45,
    status: 'surplus',
    description: 'Active recharge in floodplain aquifer',
  },
]

const STATUS_COLORS: Record<AquiferRechargeRateData['status'], { label: string; color: string; bgClass: string }> = {
  surplus: { label: 'Surplus', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  balanced: { label: 'Balanced', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  deficit: { label: 'Deficit', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  depleted: { label: 'Depleted', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: AquiferRechargeRateData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function AquiferRechargeRateMonitor() {
  const state = useMapStore((s) => s.aquiferRechargeRate)
  const setState = useMapStore((s) => s.setAquiferRechargeRate)

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
      return { totalPaths: 0, avgRechargeRate: 0, avgWaterTableDepth: 0, avgPermeability: 0 }
    }
    const avgRechargeRate = filteredItems.reduce((sum, e) => sum + e.rechargeRate, 0) / filteredItems.length
    const avgWaterTableDepth = filteredItems.reduce((sum, e) => sum + e.waterTableDepth, 0) / filteredItems.length
    const avgPermeability = filteredItems.reduce((sum, e) => sum + e.permeability, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgRechargeRate: Math.round(avgRechargeRate * 100) / 100,
      avgWaterTableDepth: Math.round(avgWaterTableDepth * 100) / 100,
      avgPermeability: Math.round(avgPermeability * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, rechargeRate: e.rechargeRate },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setAquiferRechargeRate({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof AquiferRechargeRateState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showRechargeRate', label: 'Recharge Rate', icon: Droplets },
    { key: 'showWaterTableDepth', label: 'Water Table Depth', icon: ArrowDown },
    { key: 'showPermeability', label: 'Permeability', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-cyan-950/95 to-teal-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <DropletIcon13 className="h-4 w-4 text-cyan-400" />
              Aquifer Recharge Rate Monitor
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
                setState({ statusFilter: v as AquiferRechargeRateState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="surplus">Surplus</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="deficit">Deficit</SelectItem>
                <SelectItem value="depleted">Depleted</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-cyan-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Aquifers</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Recharge</div>
              <div className="text-sm font-semibold text-cyan-400">{summary.avgRechargeRate}</div>
              <div className="text-[9px] text-slate-400/60">mm/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgWaterTableDepth}</div>
              <div className="text-[9px] text-slate-400/60">m</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Permeability</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgPermeability}</div>
              <div className="text-[9px] text-slate-400/60">m/day</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Aquifers ({filteredItems.length})
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
                        {state.showRechargeRate && (
                          <div>
                            Recharge:{' '}
                            <span className="text-slate-100 font-medium">{e.rechargeRate} mm/yr</span>
                          </div>
                        )}
                        {state.showWaterTableDepth && (
                          <div>
                            Depth:{' '}
                            <span className="text-slate-100 font-medium">{e.waterTableDepth} m</span>
                          </div>
                        )}
                        {state.showPermeability && (
                          <div>
                            Permeability:{' '}
                            <span className="text-slate-100 font-medium">{e.permeability} m/day</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No aquifers match the current filter.
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
                    <span className="text-slate-400/70">Recharge: </span>
                    <span className="font-medium text-cyan-400">{activeItem.rechargeRate} mm/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Depth: </span>
                    <span className="font-medium text-teal-400">{activeItem.waterTableDepth} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Permeability: </span>
                    <span className="font-medium text-slate-400">{activeItem.permeability} m/day</span>
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
