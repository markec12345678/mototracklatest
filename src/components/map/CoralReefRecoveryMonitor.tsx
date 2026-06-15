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
import { useMapStore, type CoralReefRecoveryState, type CoralReefRecoveryData } from '@/lib/map-store'
import { Fish as FishIcon6, X, Percent, TrendingUp, Thermometer, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: CoralReefRecoveryData[] = [
  {
    id: 'cr-gbr',
    name: 'Great Barrier Reef South',
    lat: -18.0,
    lng: 147.0,
    liveCoralCover: 35,
    recoveryRate: 2.5,
    bleachingHistory: 5,
    status: 'recovering',
    description: 'Recovering from mass bleaching events',
  },
  {
    id: 'cr-caribbean',
    name: 'Caribbean Mesoamerican Reef',
    lat: 17.0,
    lng: -87.0,
    liveCoralCover: 20,
    recoveryRate: 0.5,
    bleachingHistory: 8,
    status: 'declining',
    description: 'Continued decline from disease and warming',
  },
  {
    id: 'cr-maldives',
    name: 'Maldives Reef System',
    lat: 3.5,
    lng: 73.0,
    liveCoralCover: 55,
    recoveryRate: 4.0,
    bleachingHistory: 3,
    status: 'stable',
    description: 'Relatively stable reef system post-2016 recovery',
  },
  {
    id: 'cr-red-sea',
    name: 'Red Sea Coral',
    lat: 22.0,
    lng: 38.0,
    liveCoralCover: 5,
    recoveryRate: 0.1,
    bleachingHistory: 10,
    status: 'bleached',
    description: 'Severely bleached reef in warming Red Sea',
  },
]

const STATUS_COLORS: Record<CoralReefRecoveryData['status'], { label: string; color: string; bgClass: string }> = {
  recovering: { label: 'Recovering', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  declining: { label: 'Declining', color: '#f97316', bgClass: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  bleached: { label: 'Bleached', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: CoralReefRecoveryData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function CoralReefRecoveryMonitor() {
  const state = useMapStore((s) => s.coralReefRecovery)
  const setState = useMapStore((s) => s.setCoralReefRecovery)

  const reefs = useMemo(
    () => (state.reefs.length > 0 ? state.reefs : SAMPLE_LOCATIONS),
    [state.reefs]
  )

  const filteredItems = useMemo(() => {
    return reefs.filter((s) => {
      if (state.statusFilter !== 'all' && s.status !== state.statusFilter) return false
      return true
    })
  }, [reefs, state.statusFilter])

  const summary = useMemo(() => {
    if (filteredItems.length === 0) {
      return { totalReefs: 0, avgCoralCover: 0, avgRecovery: 0, recoveringCount: 0 }
    }
    const avgCoralCover = filteredItems.reduce((sum, s) => sum + s.liveCoralCover, 0) / filteredItems.length
    const avgRecovery = filteredItems.reduce((sum, s) => sum + s.recoveryRate, 0) / filteredItems.length
    const recoveringCount = filteredItems.filter((s) => s.status === 'recovering').length
    return {
      totalReefs: filteredItems.length,
      avgCoralCover: Math.round(avgCoralCover * 10) / 10,
      avgRecovery: Math.round(avgRecovery * 100) / 100,
      recoveringCount,
    }
  }, [filteredItems])

  const activeItem = useMemo(
    () => reefs.find((s) => s.id === state.activeReefId) ?? null,
    [reefs, state.activeReefId]
  )

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: filteredItems.map((s) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
      properties: { id: s.id, name: s.name, status: s.status, liveCoralCover: s.liveCoralCover },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.reefs.length === 0) {
      useMapStore.getState().setCoralReefRecovery({ reefs: SAMPLE_LOCATIONS })
    }
  }, [state.reefs.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof CoralReefRecoveryState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showLiveCoralCover', label: 'Live Coral Cover', icon: Percent },
    { key: 'showRecoveryRate', label: 'Recovery Rate', icon: TrendingUp },
    { key: 'showBleachingHistory', label: 'Bleaching History', icon: Thermometer },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-pink-950/95 to-rose-950/95 backdrop-blur-xl border border-pink-700/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-pink-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-pink-100">
              <FishIcon6 className="h-4 w-4 text-rose-400" />
              Coral Reef Recovery Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-pink-300 hover:text-pink-100 hover:bg-pink-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-pink-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-pink-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter}
              onValueChange={(v) =>
                setState({ statusFilter: v as CoralReefRecoveryState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-pink-900/40 border-pink-700/40 text-pink-100 hover:bg-pink-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
                <SelectItem value="bleached">Bleached</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-pink-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-pink-200">
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

          <Separator className="bg-pink-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Total Reefs</div>
              <div className="text-sm font-semibold text-pink-200">{summary.totalReefs}</div>
              <div className="text-[9px] text-pink-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Avg Coral Cover</div>
              <div className="text-sm font-semibold text-rose-400">{summary.avgCoralCover}</div>
              <div className="text-[9px] text-pink-400/60">%</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Avg Recovery</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgRecovery}</div>
              <div className="text-[9px] text-pink-400/60">%/yr</div>
            </div>
            <div className="rounded-lg border border-pink-700/30 bg-pink-900/30 p-2 text-center">
              <div className="text-[10px] text-pink-400/70">Recovering Count</div>
              <div className="text-sm font-semibold text-green-400">{summary.recoveringCount}</div>
              <div className="text-[9px] text-pink-400/60">reefs</div>
            </div>
          </div>

          <Separator className="bg-pink-700/30" />

          {/* Reefs List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-pink-300/80">
              Reefs ({filteredItems.length})
            </Label>
            <ScrollArea className="max-h-[260px]">
              <div className="space-y-2 pr-1">
                {filteredItems.map((s) => {
                  const isActive = state.activeReefId === s.id
                  const statusCfg = STATUS_COLORS[s.status]
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-2.5 cursor-pointer transition-all ${
                        isActive
                          ? 'border-pink-500/50 bg-pink-800/30'
                          : 'border-pink-700/30 hover:border-pink-500/30 hover:bg-pink-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeReefId: isActive ? null : s.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={s.status} />
                          <span className="text-xs font-medium text-pink-100">{s.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-pink-300/60">
                        {state.showLiveCoralCover && (
                          <div>
                            Coral Cover:{' '}
                            <span className="text-pink-100 font-medium">{s.liveCoralCover}%</span>
                          </div>
                        )}
                        {state.showRecoveryRate && (
                          <div>
                            Recovery:{' '}
                            <span className="text-pink-100 font-medium">{s.recoveryRate}%/yr</span>
                          </div>
                        )}
                        {state.showBleachingHistory && (
                          <div>
                            Bleaching Events:{' '}
                            <span className="text-pink-100 font-medium">{s.bleachingHistory}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-pink-400/50 py-4">
                    No reefs match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Reef Details */}
          {activeItem && (
            <>
              <Separator className="bg-pink-700/30" />
              <div className="space-y-2 rounded-lg border border-pink-600/30 bg-pink-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-pink-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-pink-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-pink-400/70">Coordinates: </span>
                    <span className="font-medium text-pink-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-pink-400/70">Live Coral Cover: </span>
                    <span className="font-medium text-rose-400">{activeItem.liveCoralCover}%</span>
                  </div>
                  <div>
                    <span className="text-pink-400/70">Recovery Rate: </span>
                    <span className="font-medium text-green-400">{activeItem.recoveryRate}%/yr</span>
                  </div>
                  <div>
                    <span className="text-pink-400/70">Bleaching History: </span>
                    <span className="font-medium text-red-400">{activeItem.bleachingHistory} events</span>
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
