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
import { useMapStore, type FrostThawCycleState, type FrostThawCycleData } from '@/lib/map-store'
import { ThermometerSun as ThermometerSunIcon2, X, RotateCw, ArrowDown, MoveVertical, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: FrostThawCycleData[] = [
  {
    id: 'ftc-quebec',
    name: 'Quebec',
    lat: 47,
    lng: -72,
    freezeThawCycles: 85,
    frostDepth: 180,
    heaveMagnitude: 25,
    status: 'frequent',
    description: 'High freeze-thaw frequency in southern Quebec',
  },
  {
    id: 'ftc-norway',
    name: 'Norway',
    lat: 63,
    lng: 10,
    freezeThawCycles: 45,
    frostDepth: 120,
    heaveMagnitude: 12,
    status: 'moderate',
    description: 'Moderate frost cycling in coastal Norway',
  },
  {
    id: 'ftc-england',
    name: 'England',
    lat: 52,
    lng: -1,
    freezeThawCycles: 15,
    frostDepth: 30,
    heaveMagnitude: 3,
    status: 'rare',
    description: 'Rare frost events in lowland England',
  },
  {
    id: 'ftc-svalbard',
    name: 'Svalbard',
    lat: 78,
    lng: 16,
    freezeThawCycles: 0,
    frostDepth: 350,
    heaveMagnitude: 0,
    status: 'permafrost',
    description: 'Continuous permafrost with no active cycling',
  },
]

const STATUS_COLORS: Record<FrostThawCycleData['status'], { label: string; color: string; bgClass: string }> = {
  frequent: { label: 'Frequent', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
  moderate: { label: 'Moderate', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  rare: { label: 'Rare', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  permafrost: { label: 'Permafrost', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
}

function TrendIcon({ status }: { status: FrostThawCycleData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function FrostThawCycleMonitor() {
  const state = useMapStore((s) => s.frostThawCycle)
  const setState = useMapStore((s) => s.setFrostThawCycle)

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
      return { totalSites: 0, avgCycles: 0, avgFrostDepth: 0, avgHeave: 0 }
    }
    const avgCycles = filteredItems.reduce((sum, e) => sum + e.freezeThawCycles, 0) / filteredItems.length
    const avgFrostDepth = filteredItems.reduce((sum, e) => sum + e.frostDepth, 0) / filteredItems.length
    const avgHeave = filteredItems.reduce((sum, e) => sum + e.heaveMagnitude, 0) / filteredItems.length
    return {
      totalSites: filteredItems.length,
      avgCycles: Math.round(avgCycles * 100) / 100,
      avgFrostDepth: Math.round(avgFrostDepth * 100) / 100,
      avgHeave: Math.round(avgHeave * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, freezeThawCycles: e.freezeThawCycles },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setFrostThawCycle({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof FrostThawCycleState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showFreezeThawCycles', label: 'Freeze-Thaw Cycles', icon: RotateCw },
    { key: 'showFrostDepth', label: 'Frost Depth', icon: ArrowDown },
    { key: 'showHeaveMagnitude', label: 'Heave Magnitude', icon: MoveVertical },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-orange-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <ThermometerSunIcon2 className="h-4 w-4 text-orange-400" />
              Frost-Thaw Cycle Monitor
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
                setState({ statusFilter: v as FrostThawCycleState['statusFilter'] })
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
                <SelectItem value="permafrost">Permafrost</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalSites}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Cycles</div>
              <div className="text-sm font-semibold text-orange-400">{summary.avgCycles}</div>
              <div className="text-[9px] text-slate-400/60">per year</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Frost Depth</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgFrostDepth}</div>
              <div className="text-[9px] text-slate-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Heave</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgHeave}</div>
              <div className="text-[9px] text-slate-400/60">mm</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
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
                        {state.showFreezeThawCycles && (
                          <div>
                            Cycles:{' '}
                            <span className="text-slate-100 font-medium">{e.freezeThawCycles}/yr</span>
                          </div>
                        )}
                        {state.showFrostDepth && (
                          <div>
                            Frost Depth:{' '}
                            <span className="text-slate-100 font-medium">{e.frostDepth} cm</span>
                          </div>
                        )}
                        {state.showHeaveMagnitude && (
                          <div>
                            Heave:{' '}
                            <span className="text-slate-100 font-medium">{e.heaveMagnitude} mm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No sites match the current filter.
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
                    <span className="text-slate-400/70">Cycles: </span>
                    <span className="font-medium text-orange-400">{activeItem.freezeThawCycles}/year</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Frost Depth: </span>
                    <span className="font-medium text-blue-400">{activeItem.frostDepth} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Heave: </span>
                    <span className="font-medium text-slate-400">{activeItem.heaveMagnitude} mm</span>
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
