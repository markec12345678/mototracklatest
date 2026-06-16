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
import { useMapStore, type IceShelfThicknessState, type IceShelfThicknessData } from '@/lib/map-store'
import { MountainSnow as MountainSnowIcon6, X, Layers, Thermometer, TrendingDown, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: IceShelfThicknessData[] = [
  {
    id: 'ist-ross',
    name: 'Ross Ice Shelf',
    lat: -78,
    lng: -170,
    shelfThickness: 450,
    basalMeltRate: 2.8,
    riftLength: 25,
    status: 'thinning',
    description: 'Major Antarctic ice shelf showing thinning trends',
  },
  {
    id: 'ist-larsen',
    name: 'Larsen C',
    lat: -67,
    lng: -62,
    shelfThickness: 280,
    basalMeltRate: 4.5,
    riftLength: 180,
    status: 'fracturing',
    description: 'Larsen C with active rift propagation',
  },
  {
    id: 'ist-amery',
    name: 'Amery Ice Shelf',
    lat: -70,
    lng: 72,
    shelfThickness: 600,
    basalMeltRate: 1.2,
    riftLength: 5,
    status: 'stable',
    description: 'Large East Antarctic shelf relatively stable',
  },
  {
    id: 'ist-fimbul',
    name: 'Fimbul Ice Shelf',
    lat: -70,
    lng: 0,
    shelfThickness: 350,
    basalMeltRate: 0.5,
    riftLength: 0,
    status: 'thickening',
    description: 'Fimbul showing positive mass balance',
  },
]

const STATUS_COLORS: Record<IceShelfThicknessData['status'], { label: string; color: string; bgClass: string }> = {
  thickening: { label: 'Thickening', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  stable: { label: 'Stable', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  thinning: { label: 'Thinning', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  fracturing: { label: 'Fracturing', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: IceShelfThicknessData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function IceShelfThicknessMonitor() {
  const state = useMapStore((s) => s.iceShelfThickness)
  const setState = useMapStore((s) => s.setIceShelfThickness)

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
      return { totalShelves: 0, avgThickness: 0, avgMeltRate: 0, avgRiftLength: 0 }
    }
    const avgThickness = filteredItems.reduce((sum, e) => sum + e.shelfThickness, 0) / filteredItems.length
    const avgMeltRate = filteredItems.reduce((sum, e) => sum + e.basalMeltRate, 0) / filteredItems.length
    const avgRiftLength = filteredItems.reduce((sum, e) => sum + e.riftLength, 0) / filteredItems.length
    return {
      totalShelves: filteredItems.length,
      avgThickness: Math.round(avgThickness * 100) / 100,
      avgMeltRate: Math.round(avgMeltRate * 100) / 100,
      avgRiftLength: Math.round(avgRiftLength * 100) / 100,
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
      properties: { id: e.id, name: e.name, status: e.status, shelfThickness: e.shelfThickness },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setIceShelfThickness({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof IceShelfThicknessState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showShelfThickness', label: 'Shelf Thickness', icon: Layers },
    { key: 'showBasalMeltRate', label: 'Basal Melt Rate', icon: Thermometer },
    { key: 'showRiftLength', label: 'Rift Length', icon: TrendingDown },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-sky-950/95 to-blue-950/95 backdrop-blur-xl border border-slate-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-100">
              <MountainSnowIcon6 className="h-4 w-4 text-sky-400" />
              Ice Shelf Thickness Monitor
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
                setState({ statusFilter: v as IceShelfThicknessState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-slate-900/40 border-slate-700/40 text-slate-100 hover:bg-slate-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="thickening">Thickening</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="thinning">Thinning</SelectItem>
                <SelectItem value="fracturing">Fracturing</SelectItem>
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
                  className="scale-75 data-[state=checked]:bg-sky-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Total Shelves</div>
              <div className="text-sm font-semibold text-slate-200">{summary.totalShelves}</div>
              <div className="text-[9px] text-slate-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Thickness</div>
              <div className="text-sm font-semibold text-sky-400">{summary.avgThickness}</div>
              <div className="text-[9px] text-slate-400/60">m</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Melt Rate</div>
              <div className="text-sm font-semibold text-blue-400">{summary.avgMeltRate}</div>
              <div className="text-[9px] text-slate-400/60">m/year</div>
            </div>
            <div className="rounded-lg border border-slate-700/30 bg-slate-900/30 p-2 text-center">
              <div className="text-[10px] text-slate-400/70">Avg Rift Length</div>
              <div className="text-sm font-semibold text-slate-400">{summary.avgRiftLength}</div>
              <div className="text-[9px] text-slate-400/60">km</div>
            </div>
          </div>

          <Separator className="bg-slate-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-300/80">
              Ice Shelves ({filteredItems.length})
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
                        {state.showShelfThickness && (
                          <div>
                            Thickness:{' '}
                            <span className="text-slate-100 font-medium">{e.shelfThickness} m</span>
                          </div>
                        )}
                        {state.showBasalMeltRate && (
                          <div>
                            Melt Rate:{' '}
                            <span className="text-slate-100 font-medium">{e.basalMeltRate} m/yr</span>
                          </div>
                        )}
                        {state.showRiftLength && (
                          <div>
                            Rift:{' '}
                            <span className="text-slate-100 font-medium">{e.riftLength} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400/50 py-4">
                    No shelves match the current filter.
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
                    <span className="text-slate-400/70">Thickness: </span>
                    <span className="font-medium text-sky-400">{activeItem.shelfThickness} m</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Melt Rate: </span>
                    <span className="font-medium text-blue-400">{activeItem.basalMeltRate} m/year</span>
                  </div>
                  <div>
                    <span className="text-slate-400/70">Rift: </span>
                    <span className="font-medium text-slate-400">{activeItem.riftLength} km</span>
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
