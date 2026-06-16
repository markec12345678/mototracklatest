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
import { useMapStore, type MineralVeinThicknessState, type MineralVeinThicknessData } from '@/lib/map-store'
import { Drill as DrillIcon2, X, Ruler, Gem, ArrowDown, MapPin, Filter } from 'lucide-react'

const SAMPLE_LOCATIONS: MineralVeinThicknessData[] = [
  {
    id: 'mvt-witwatersrand',
    name: 'Witwatersrand Reef',
    lat: -26.1500,
    lng: 28.0500,
    veinWidth: 120,
    oreMineral: 85,
    depthExtent: 3500,
    status: 'thick',
    description: 'Thick conglomerate reef vein',
  },
  {
    id: 'mvt-cornwall',
    name: 'Cornwall Tin Lode',
    lat: 50.4500,
    lng: -4.8000,
    veinWidth: 45,
    oreMineral: 42,
    depthExtent: 800,
    status: 'moderate',
    description: 'Moderate width cassiterite lode',
  },
  {
    id: 'mvt-kolar',
    name: 'Kolar Gold Vein',
    lat: 12.9700,
    lng: 78.2800,
    veinWidth: 15,
    oreMineral: 28,
    depthExtent: 3200,
    status: 'thin',
    description: 'Deep thin gold quartz vein',
  },
  {
    id: 'mvt-broken',
    name: 'Broken Hill Lode',
    lat: -31.9500,
    lng: 141.4700,
    veinWidth: 5,
    oreMineral: 8,
    depthExtent: 150,
    status: 'pinching',
    description: 'Pinching lode at depth',
  },
]

const STATUS_COLORS: Record<MineralVeinThicknessData['status'], { label: string; color: string; bgClass: string }> = {
  thick: { label: 'Thick', color: '#22c55e', bgClass: 'bg-green-500/10 text-green-600 border-green-500/30' },
  moderate: { label: 'Moderate', color: '#3b82f6', bgClass: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  thin: { label: 'Thin', color: '#f59e0b', bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  pinching: { label: 'Pinching', color: '#ef4444', bgClass: 'bg-red-500/10 text-red-600 border-red-500/30' },
}

function TrendIcon({ status }: { status: MineralVeinThicknessData['status'] }) {
  const cfg = STATUS_COLORS[status]
  return (
    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
  )
}

export function MineralVeinThicknessMonitor() {
  const state = useMapStore((s) => s.mineralVeinThickness)
  const setState = useMapStore((s) => s.setMineralVeinThickness)

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
      return { totalPaths: 0, avgVeinWidth: 0, avgOreMineral: 0, avgDepthExtent: 0 }
    }
    const avgVeinWidth = filteredItems.reduce((sum, e) => sum + e.veinWidth, 0) / filteredItems.length
    const avgOreMineral = filteredItems.reduce((sum, e) => sum + e.oreMineral, 0) / filteredItems.length
    const avgDepthExtent = filteredItems.reduce((sum, e) => sum + e.depthExtent, 0) / filteredItems.length
    return {
      totalPaths: filteredItems.length,
      avgVeinWidth: Math.round(avgVeinWidth * 10) / 10,
      avgOreMineral: Math.round(avgOreMineral * 10) / 10,
      avgDepthExtent: Math.round(avgDepthExtent),
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
      properties: { id: e.id, name: e.name, status: e.status, veinWidth: e.veinWidth },
    })),
  }), [filteredItems])

  useEffect(() => {
    if (state.data.length === 0) {
      useMapStore.getState().setMineralVeinThickness({ data: SAMPLE_LOCATIONS })
    }
  }, [state.data.length])

  if (typeof window === 'undefined') return null
  if (!state.open) return null

  const overlayToggles: { key: keyof MineralVeinThicknessState; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'showVeinWidth', label: 'Vein Width', icon: Ruler },
    { key: 'showOreMineral', label: 'Ore Mineral', icon: Gem },
    { key: 'showDepthExtent', label: 'Depth Extent', icon: ArrowDown },
  ]

  void geojson

  return (
    <div className="fixed right-4 top-16 z-[60] w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)]">
      <Card className="bg-gradient-to-br from-emerald-950/95 to-teal-950/95 backdrop-blur-xl border border-emerald-800/40 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-3 border-b border-emerald-700/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-100">
              <DrillIcon2 className="h-4 w-4 text-emerald-400" />
              Mineral Vein Thickness Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/30"
              onClick={() => setState({ open: false })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 text-emerald-100">
          {/* Status Filter */}
          <div>
            <Label className="text-xs text-emerald-300/80 flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              Status
            </Label>
            <Select
              value={state.statusFilter || 'all'}
              onValueChange={(v) =>
                setState({ statusFilter: v as MineralVeinThicknessState['statusFilter'] })
              }
            >
              <SelectTrigger className="h-8 text-xs mt-1 bg-emerald-900/40 border-emerald-700/40 text-emerald-100 hover:bg-emerald-900/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="thick">Thick</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="pinching">Pinching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Overlay Toggles */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">Display Options</Label>
            {overlayToggles.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Icon className="h-3 w-3 text-emerald-400" />
                  <span>{label}</span>
                </div>
                <Switch
                  checked={state[key] as boolean}
                  onCheckedChange={(checked) => setState({ [key]: checked })}
                  className="scale-75 data-[state=checked]:bg-emerald-600"
                />
              </div>
            ))}
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Total Sites</div>
              <div className="text-sm font-semibold text-emerald-200">{summary.totalPaths}</div>
              <div className="text-[9px] text-emerald-400/60">monitored</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Vein Width</div>
              <div className="text-sm font-semibold text-teal-400">{summary.avgVeinWidth}</div>
              <div className="text-[9px] text-emerald-400/60">cm</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Ore Mineral</div>
              <div className="text-sm font-semibold text-emerald-400">{summary.avgOreMineral}</div>
              <div className="text-[9px] text-emerald-400/60">%</div>
            </div>
            <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/30 p-2 text-center">
              <div className="text-[10px] text-emerald-400/70">Avg Depth</div>
              <div className="text-sm font-semibold text-green-400">{summary.avgDepthExtent}</div>
              <div className="text-[9px] text-emerald-400/60">m</div>
            </div>
          </div>

          <Separator className="bg-emerald-700/30" />

          {/* Location List */}
          <div className="space-y-1.5">
            <Label className="text-xs text-emerald-300/80">
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
                          ? 'border-emerald-500/50 bg-emerald-800/30'
                          : 'border-emerald-700/30 hover:border-emerald-500/30 hover:bg-emerald-800/20'
                      }`}
                      onClick={() =>
                        setState({ activeItemId: isActive ? null : e.id })
                      }
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <TrendIcon status={e.status} />
                          <span className="text-xs font-medium text-emerald-100">{e.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] h-5 ${statusCfg.bgClass}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-emerald-300/60">
                        {state.showVeinWidth && (
                          <div>
                            Vein Width:{' '}
                            <span className="text-emerald-100 font-medium">{e.veinWidth} cm</span>
                          </div>
                        )}
                        {state.showOreMineral && (
                          <div>
                            Ore Mineral:{' '}
                            <span className="text-emerald-100 font-medium">{e.oreMineral}%</span>
                          </div>
                        )}
                        {state.showDepthExtent && (
                          <div>
                            Depth:{' '}
                            <span className="text-emerald-100 font-medium">{e.depthExtent} m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredItems.length === 0 && (
                  <div className="text-center text-xs text-emerald-400/50 py-4">
                    No sites match the current filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Active Item Details */}
          {activeItem && (
            <>
              <Separator className="bg-emerald-700/30" />
              <div className="space-y-2 rounded-lg border border-emerald-600/30 bg-emerald-800/20 p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-100">{activeItem.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ml-auto ${STATUS_COLORS[activeItem.status].bgClass}`}
                  >
                    {STATUS_COLORS[activeItem.status].label}
                  </Badge>
                </div>
                <p className="text-[10px] text-emerald-300/60 italic">{activeItem.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-emerald-400/70">Coordinates: </span>
                    <span className="font-medium text-emerald-100">
                      {activeItem.lat.toFixed(2)}, {activeItem.lng.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Vein Width: </span>
                    <span className="font-medium text-teal-400">{activeItem.veinWidth} cm</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Ore Mineral: </span>
                    <span className="font-medium text-emerald-400">{activeItem.oreMineral}%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400/70">Depth Extent: </span>
                    <span className="font-medium text-green-400">{activeItem.depthExtent} m</span>
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
