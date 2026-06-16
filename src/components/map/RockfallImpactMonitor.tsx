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
import { useMapStore, type RockfallImpactState, type RockfallImpactData } from '@/lib/map-store'
import { Mountain as MountainIcon14, X, Zap, Box, Activity, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: RockfallImpactData[] = [
  {
    id: 'rf-yosemite',
    name: 'Yosemite El Capitan',
    lat: 37.7340,
    lng: -119.6330,
    impactEnergy: 45000,
    blockVolume: 12,
    frequency: 8,
    status: 'frequent',
    description: 'Frequent rockfall on SE face',
  },
  {
    id: 'rf-chamonix',
    name: 'Chamonix Aiguilles',
    lat: 45.9237,
    lng: 6.8694,
    impactEnergy: 22000,
    blockVolume: 5,
    frequency: 4,
    status: 'moderate',
    description: 'Moderate rockfall activity',
  },
  {
    id: 'rf-dolomites',
    name: 'Dolomites Cengio',
    lat: 46.4167,
    lng: 11.8333,
    impactEnergy: 8000,
    blockVolume: 2,
    frequency: 1,
    status: 'rare',
    description: 'Rare rockfall events observed',
  },
  {
    id: 'rf-gibraltar',
    name: 'Gibraltar Rock',
    lat: 36.1333,
    lng: -5.3500,
    impactEnergy: 1200,
    blockVolume: 0.5,
    frequency: 0,
    status: 'stable',
    description: 'Stable rock face monitored',
  },
]

const STATUS_COLORS: Record<RockfallImpactData['status'], { label: string; color: string; bgClass: string }> = {
  frequent: { label: 'Frequent', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  rare: { label: 'Rare', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  stable: { label: 'Stable', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
}

function TrendIcon({ status }: { status: RockfallImpactData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function RockfallImpactMonitor() {
  const state = useMapStore((s) => s.rockfallImpact)
  const setState = useMapStore((s) => s.setRockfallImpact)

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
      return { totalZones: 0, avgImpactEnergy: 0, avgBlockVolume: 0, frequentCount: 0 }
    }
    const avgImpactEnergy = filteredItems.reduce((sum, e) => sum + e.impactEnergy, 0) / filteredItems.length
    const avgBlockVolume = filteredItems.reduce((sum, e) => sum + e.blockVolume, 0) / filteredItems.length
    const frequentCount = filteredItems.filter((e) => e.status === 'frequent').length
    return {
      totalZones: filteredItems.length,
      avgImpactEnergy: Math.round(avgImpactEnergy * 10) / 10,
      avgBlockVolume: Math.round(avgBlockVolume * 10) / 10,
      frequentCount,
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
      properties: { id: e.id, name: e.name, status: e.status, impactEnergy: e.impactEnergy },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setRockfallImpact({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof RockfallImpactState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showImpactEnergy', label: 'Impact Energy', icon: Zap },
    { key: 'showBlockVolume', label: 'Block Volume', icon: Box },
    { key: 'showFrequency', label: 'Frequency', icon: Activity },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-slate-950/95 to-gray-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <MountainIcon14 className="h-4 w-4 text-slate-400" />
              Rockfall Impact Monitor
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
                setState({ statusFilter: v as RockfallImpactState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="frequent">Frequent</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-slate-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Zones</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalZones}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Impact</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgImpactEnergy}</div>
              <div className="text-[9px] text-slate-400/60">kJ</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Block Vol</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgBlockVolume}</div>
              <div className="text-[9px] text-slate-400/60">m3</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Frequent</div>
              <div className="text-sm font-semibold text-red-400">{summary.frequentCount}</div>
              <div className="text-[9px] text-slate-400/60">zones</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Zones ({filteredItems.length})
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
                        {state.showImpactEnergy && (
                          <div>
                            Impact:{' '}
                            <span className="text-slate-100 font-medium">{e.impactEnergy} kJ</span>
                          </div>
                        )}
                        {state.showBlockVolume && (
                          <div>
                            Block Vol:{' '}
                            <span className="text-slate-100 font-medium">{e.blockVolume} m3</span>
                          </div>
                        )}
                        {state.showFrequency && (
                          <div>
                            Freq:{' '}
                            <span className="text-slate-100 font-medium">{e.frequency}/mo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No zones match the current filter.
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
                    <span className="text-slate-400/70">Impact: </span>
                    <span className="font-medium text-orange-400">{activeItem.impactEnergy} kJ</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Block Vol: </span>
                    <span className="font-medium text-slate-400">{activeItem.blockVolume} m3</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Frequency: </span>
                    <span className="font-medium text-red-400">{activeItem.frequency}/mo</span>
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
