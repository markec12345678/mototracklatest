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
import { useMapStore, type CoastalWetlandLossState, type CoastalWetlandLossData } from '@/lib/map-store'
import { Waves as WavesIcon14, X, TrendingDown, Map, Activity, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CoastalWetlandLossData[] = [
  {
    id: 'cw-mississippi',
    name: 'Mississippi Delta',
    lat: 29.5,
    lng: -89.5,
    areaLost: 4800,
    remainingArea: 12000,
    lossRate: 75,
    status: 'degrading',
    description: 'Severe wetland loss from subsidence and canal dredging',
  },
  {
    id: 'cw-sundarbans',
    name: 'Sundarbans Mangrove',
    lat: 22.0,
    lng: 89.0,
    areaLost: 210,
    remainingArea: 10000,
    lossRate: 15,
    status: 'intact',
    description: 'Largest mangrove forest still largely intact',
  },
  {
    id: 'cw-venice',
    name: 'Venice Lagoon',
    lat: 45.4,
    lng: 12.3,
    areaLost: 120,
    remainingArea: 550,
    lossRate: 3,
    status: 'restored',
    description: 'Partially restored through MOSE project',
  },
  {
    id: 'cw-niger',
    name: 'Niger Delta',
    lat: 4.5,
    lng: 7.0,
    areaLost: 950,
    remainingArea: 3000,
    lossRate: 40,
    status: 'critical',
    description: 'Oil spill and erosion devastated delta wetlands',
  },
]

const STATUS_COLORS: Record<CoastalWetlandLossData['status'], { label: string; color: string; bgClass: string }> = {
  intact: { label: 'Intact', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  degrading: { label: 'Degrading', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  critical: { label: 'Critical', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  restored: { label: 'Restored', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: CoastalWetlandLossData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CoastalWetlandLossMonitor() {
  const state = useMapStore((s) => s.coastalWetlandLoss)
  const setState = useMapStore((s) => s.setCoastalWetlandLoss)

  const wetlands = useMemo(
    () => (state.wetlands.length > 0 ? state.wetlands : SAMPLE_LOCATIONS),
    [state.wetlands]
  )

  const filteredItems = useMemo(() => {
    return wetlands.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [wetlands, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalWetlands: 0, totalAreaLost: 0, avgLossRate: 0, criticalCount: 0 }
    }
    const totalAreaLost = filteredItems.reduce((sum, s) => sum + s.areaLost, 0)
    const avgLossRate = filteredItems.reduce((sum, s) => sum + s.lossRate, 0) / filteredItems.length
    const criticalCount = filteredItems.filter((s) => s.status === 'critical').length
    return {
      totalWetlands: filteredItems.length,
      totalAreaLost,
      avgLossRate: Math.round(avgLossRate * 10) / 10,
      criticalCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => wetlands.find((s) => s.id === state.activeWetlandId) ?? null,
    [wetlands, state.activeWetlandId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, areaLost: s.areaLost },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.wetlands.length === 0) {
      useMapStore.getState().setCoastalWetlandLoss({ wetlands: SAMPLE_LOCATIONS })
    }
  }, [state.wetlands.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoastalWetlandLossState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showAreaLost', label: 'Area Lost', icon: TrendingDown },
    { key: 'showRemainingArea', label: 'Remaining Area', icon: Map },
    { key: 'showLossRate', label: 'Loss Rate', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-green-950/95 to-emerald-950/95 backdrop-blur-xl border border-green-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-green-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-100">
              <WavesIcon14 className="h-4 w-4 text-green-400" />
              Coastal Wetland Loss Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-300 hover:text-green-100 hover:bg-green-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-green-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-green-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as CoastalWetlandLossState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-green-900/40 border-green-700/40 text-green-100 hover:bg-green-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="intact">Intact</SelectItem>
                <SelectItem value="degrading">Degrading</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="restored">Restored</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-green-200">
                  <Icon className="h-3 w-3 text-green-400" />
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

          <Separator className="bg-green-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Total Wetlands</div>
              <div className="text-sm font-semibold text-green-200">{summary.totalWetlands}</div>
              <div className="text-[9px] text-green-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Total Area Lost</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.totalAreaLost.toLocaleString()}</div>
              <div className="text-[9px] text-green-400/60">km²</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Avg Loss Rate</div>
              <div className="text-sm font-semibold text-lime-400">{summary.avgLossRate}</div>
              <div className="text-[9px] text-green-400/60">km²/yr</div>
            </div>
            <div className="rounded-lg border border-green-700/30 bg-green-900/30 p-2 text-center">
              <div className="text-[10px] text-green-400/70">Critical Count</div>
              <div className="text-sm font-semibold text-red-400">{summary.criticalCount}</div>
              <div className="text-[9px] text-green-400/60">wetlands</div>
            </div>
          </div>

          <Separator className="bg-green-700/30" />

          {/* Wetland List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-green-300/80">
              Wetlands ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeWetlandId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-green-500/50 bg-green-800/30'
                          : 'border-green-700/30 hover:border-green-500/30 hover:bg-green-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeWetlandId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-green-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-green-300/60">
                        {state.showAreaLost && (
                          <div>
                            Area Lost:{' '}
                            <span className="text-green-100 font-medium">{s.areaLost.toLocaleString()} km²</span>
                          </div>
                        )}
                        {state.showRemainingArea && (
                          <div>
                            Remaining:{' '}
                            <span className="text-green-100 font-medium">{s.remainingArea.toLocaleString()} km²</span>
                          </div>
                        )}
                        {state.showLossRate && (
                          <div>
                            Loss Rate:{' '}
                            <span className="text-green-100 font-medium">{s.lossRate} km²/yr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-green-400/50 py-4">
                    No wetlands match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Wetland Details */}
          {activeItem && (
            <>
              <Separator className="bg-green-700/30" />
              <div className="space-y-2 rounded-lg border border-green-600/30 bg-green-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-xs font-semibold text-green-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-green-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-green-400/70">Coordinates: </span>
                    <span className="font-medium text-green-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Area Lost: </span>
                    <span className="font-medium text-emerald-400">{activeItem.areaLost.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Remaining: </span>
                    <span className="font-medium text-lime-400">{activeItem.remainingArea.toLocaleString()} km²</span>
                  </div>
                  <div>
                    <span className="text-green-400/70">Loss Rate: </span>
                    <span className="font-medium text-teal-400">{activeItem.lossRate} km²/yr</span>
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
