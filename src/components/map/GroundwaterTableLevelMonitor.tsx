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
import { useMapStore, type GroundwaterTableLevelState, type GroundwaterTableLevelData } from '@/lib/map-store'
import { ArrowDown as ArrowDownIcon7, X, TrendingDown, Layers, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: GroundwaterTableLevelData[] = [
  {
    id: 'gtl-rajasthan',
    name: 'Rajasthan Groundwater',
    lat: 27.0000,
    lng: 72.0000,
    waterLevel: 85,
    trendRate: -1.5,
    aquiferType: 1,
    status: 'critical',
    description: 'Critical decline in semi-arid aquifer',
  },
  {
    id: 'gtl-florida',
    name: 'Floridan Aquifer',
    lat: 30.0000,
    lng: -83.0000,
    waterLevel: 15,
    trendRate: 0.2,
    aquiferType: 2,
    status: 'stable',
    description: 'Stable karst aquifer levels',
  },
  {
    id: 'gtl-denmark',
    name: 'Danish Groundwater',
    lat: 56.0000,
    lng: 10.0000,
    waterLevel: 8,
    trendRate: 0.5,
    aquiferType: 3,
    status: 'rising',
    description: 'Rising levels from reduced extraction',
  },
  {
    id: 'gtl-sahel',
    name: 'Sahel Groundwater',
    lat: 14.0000,
    lng: 2.0000,
    waterLevel: 55,
    trendRate: -0.8,
    aquiferType: 1,
    status: 'declining',
    description: 'Gradual decline in Sahel aquifer',
  },
]

const STATUS_COLORS: Record<GroundwaterTableLevelData['status'], { label: string; color: string; bgClass: string }> = {
  rising: { label: 'Rising', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  declining: { label: 'Declining', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: GroundwaterTableLevelData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function GroundwaterTableLevelMonitor() {
  const state = useMapStore((s) => s.groundwaterTableLevel)
  const setState = useMapStore((s) => s.setGroundwaterTableLevel)

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
      return { totalPaths: 0, avgWaterLevel: 0, avgTrendRate: 0, avgAquiferType: 0 }
    }
    const avgWaterLevel = filteredItems.reduce((sum, e) => sum + e.waterLevel, 0) / filteredItems.length
    const avgTrendRate = filteredItems.reduce((sum, e) => sum + e.trendRate, 0) / filteredItems.length
    const avgAquiferType = filteredItems.reduce((sum, e) => sum + e.aquiferType, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgWaterLevel: Math.round(avgWaterLevel * 100) / 100,
      avgTrendRate: Math.round(avgTrendRate * 100) / 100,
      avgAquiferType: Math.round(avgAquiferType * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, waterLevel: e.waterLevel },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setGroundwaterTableLevel({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof GroundwaterTableLevelState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showWaterLevel', label: 'Water Level', icon: ArrowDownIcon7 },
    { key: 'showTrendRate', label: 'Trend Rate', icon: TrendingDown },
    { key: 'showAquiferType', label: 'Aquifer Type', icon: Layers },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-indigo-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ArrowDownIcon7 className="h-4 w-4 text-indigo-400" />
              Groundwater Table Level Monitor
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
                setState({ statusFilter: v as GroundwaterTableLevelState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-indigo-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Wells</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Level</div>
              <div className="text-sm font-semibold text-indigo-400">{summary.avgWaterLevel}</div>
              <div className="text-[9px] text-slate-400/60">m</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Trend</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgTrendRate}</div>
              <div className="text-[9px] text-slate-400/60">m/yr</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Type</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgAquiferType}</div>
              <div className="text-[9px] text-slate-400/60">class</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Wells ({filteredItems.length})
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
                        {state.showWaterLevel && (
                          <div>
                            Level:{' '}
                            <span className="text-slate-100 font-medium">{e.waterLevel} m</span>
                          </div>
                        )}
                        {state.showTrendRate && (
                          <div>
                            Trend:{' '}
                            <span className="text-slate-100 font-medium">{e.trendRate} m/yr</span>
                          </div>
                        )}
                        {state.showAquiferType && (
                          <div>
                            Type:{' '}
                            <span className="text-slate-100 font-medium">{e.aquiferType}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No wells match the current filter.
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
                    <span className="text-slate-400/70">Level: </span>
                    <span className="font-medium text-indigo-400">{activeItem.waterLevel} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Trend: </span>
                    <span className="font-medium text-blue-400">{activeItem.trendRate} m/yr</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Type: </span>
                    <span className="font-medium text-slate-400">{activeItem.aquiferType}</span>
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
